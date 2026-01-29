import { supabase } from './supabase'

/**
 * AI Analysis Request Types
 */
export interface AIAnalysisRequest {
  imageUrl?: string  // For existing HTTPS URLs
  imageBase64?: string  // For local file uploads
  mediaType?: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp'
  plantData?: {
    plant_id?: string
    custom_name?: string
    species?: string
    location?: string
  }
  analysisType: 'initial_identification' | 'check_in_photo' | 'health_monitoring'
}

/**
 * AI Analysis Response Types
 */
export interface AIAnalysisResponse {
  species?: string
  confidence?: number
  healthStatus: 'thriving' | 'good' | 'at_risk' | 'critical'
  insights: string[]
  recommendations: string[]
  riskFlags: string[]
  nextCheckInDays: number
  analysisId?: string
  tokensUsed?: number
  processingTimeMs?: number
}

/**
 * AI Quota Information
 */
export interface AIQuota {
  analyses_used_this_month: number
  check_ins_used_this_month: number
  subscription_tier: 'free' | 'pro'
  can_use_ai: boolean
  remaining_analyses: number
  reset_date: Date
}

/**
 * AI Plant Service
 * Handles all AI-related operations for plant analysis
 */
export class AIPlantService {
  /**
   * Analyze a plant photo using AI
   */
  async analyzePhoto(request: AIAnalysisRequest, userId: string): Promise<AIAnalysisResponse> {
    console.log('Calling AI analysis:', {
      analysisType: request.analysisType,
      hasImage: !!request.imageUrl,
      plantId: request.plantData?.plant_id,
      userId
    })

    // Use native fetch with explicit headers
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    const functionUrl = `${supabaseUrl}/functions/v1/analyze-plant-photo`

    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY
      },
      body: JSON.stringify({
        ...request,
        userId  // Edge function will use this for auth
      })
    })

    console.log('Edge function response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Edge function error:', errorText)

      // Handle quota exceeded
      if (errorText.includes('quota') || response.status === 429) {
        throw new Error('AI_QUOTA_EXCEEDED')
      }

      throw new Error(`Edge function error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    console.log('Edge function response:', data)

    // Check if the response contains an error property
    if (data.error) {
      if (data.error.includes('quota')) {
        throw new Error('AI_QUOTA_EXCEEDED')
      }
      throw new Error(data.error)
    }

    return data as AIAnalysisResponse
  }

  /**
   * Get AI quota information for a user
   */
  async getQuota(userId: string): Promise<AIQuota> {
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('ai_analyses_used_this_month, check_ins_used_this_month, subscription_tier')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Failed to fetch quota:', error)
      throw new Error('Failed to fetch AI quota')
    }

    const tier = profile?.subscription_tier || 'free'
    const used = profile?.ai_analyses_used_this_month || 0
    const checkInsUsed = profile?.check_ins_used_this_month || 0

    const limits = {
      free: 3,
      pro: Infinity
    }

    const limit = limits[tier]
    const canUse = tier === 'pro' || used < limit
    const remaining = tier === 'pro' ? Infinity : Math.max(0, limit - used)

    // Calculate reset date (first of next month)
    const resetDate = new Date()
    resetDate.setMonth(resetDate.getMonth() + 1)
    resetDate.setDate(1)
    resetDate.setHours(0, 0, 0, 0)

    return {
      analyses_used_this_month: used,
      check_ins_used_this_month: checkInsUsed,
      subscription_tier: tier,
      can_use_ai: canUse,
      remaining_analyses: remaining,
      reset_date: resetDate
    }
  }

  /**
   * Check if user should be prompted to check in on a plant
   */
  async shouldPromptCheckIn(plantId: string): Promise<boolean> {
    // Query check-in schedule
    const { data: schedule } = await supabase
      .from('check_in_schedules')
      .select('next_check_in_date, snoozed_until')
      .eq('plant_id', plantId)
      .single()

    if (!schedule) return false

    const now = new Date()

    // Check if snoozed
    if (schedule.snoozed_until) {
      const snoozedUntil = new Date(schedule.snoozed_until)
      if (now < snoozedUntil) {
        return false // Still snoozed
      }
    }

    // Check if due
    const nextCheckIn = new Date(schedule.next_check_in_date)
    return now >= nextCheckIn
  }

  /**
   * Snooze check-in reminder for a plant
   */
  async snoozeCheckIn(plantId: string, days: number = 3): Promise<void> {
    const snoozedUntil = new Date()
    snoozedUntil.setDate(snoozedUntil.getDate() + days)

    const { error } = await supabase
      .from('check_in_schedules')
      .update({ snoozed_until: snoozedUntil.toISOString() })
      .eq('plant_id', plantId)

    if (error) {
      console.error('Failed to snooze check-in:', error)
      throw new Error('Failed to snooze check-in')
    }
  }

  /**
   * Get recent AI analyses for a plant
   */
  async getPlantAnalyses(plantId: string, limit: number = 5) {
    const { data, error } = await supabase
      .from('ai_plant_analyses')
      .select('*')
      .eq('plant_id', plantId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Failed to fetch analyses:', error)
      throw new Error('Failed to fetch plant analyses')
    }

    return data || []
  }

  /**
   * Get latest health status for a plant
   */
  async getLatestHealthStatus(plantId: string): Promise<{
    status: 'thriving' | 'good' | 'at_risk' | 'critical' | 'unknown'
    lastAnalyzed?: Date
    riskFlags?: string[]
  }> {
    const { data } = await supabase
      .from('ai_plant_analyses')
      .select('health_status, created_at, risk_flags')
      .eq('plant_id', plantId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (!data) {
      return { status: 'unknown' }
    }

    return {
      status: data.health_status as any,
      lastAnalyzed: new Date(data.created_at),
      riskFlags: data.risk_flags as string[] || []
    }
  }
}

// Export singleton instance
export const aiService = new AIPlantService()
