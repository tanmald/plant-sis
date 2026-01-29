import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import Anthropic from "https://esm.sh/@anthropic-ai/sdk@0.20.0"
import { buildPrompt, parseAIResponse } from "./prompt.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client for auth verification
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    // Parse request body first (we need userId as fallback)
    const { imageUrl, imageBase64, mediaType, plantData, analysisType, userId: bodyUserId } = await req.json()

    // Get authorization header
    const authHeader = req.headers.get('Authorization')

    let userId: string

    if (authHeader) {
      console.log('Verifying JWT...')

      // Create Supabase client with the user's Authorization header
      const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
        global: {
          headers: { Authorization: authHeader },
        },
      })

      // Try to verify JWT and get user
      const { data: { user }, error: authError } = await supabaseClient.auth.getUser()

      if (user) {
        userId = user.id
        console.log('✅ User authenticated via JWT:', userId)
      } else {
        // JWT verification failed, use userId from body as fallback
        console.log('JWT verification failed, using userId from body:', authError?.message)
        if (!bodyUserId) {
          return new Response(
            JSON.stringify({ code: 401, message: 'Authentication failed and no userId provided' }),
            { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        userId = bodyUserId
        console.log('Using userId from request body:', userId)
      }
    } else {
      // No auth header, use userId from body
      if (!bodyUserId) {
        return new Response(
          JSON.stringify({ code: 401, message: 'No authorization header or userId provided' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      userId = bodyUserId
      console.log('No auth header, using userId from body:', userId)
    }

    console.log('Analyzing plant photo:', {
      hasImageUrl: !!imageUrl,
      hasBase64: !!imageBase64,
      mediaType,
      analysisType,
      plantId: plantData?.plant_id
    })

    // Validate inputs - need either imageUrl or imageBase64
    const hasImage = imageUrl || (imageBase64 && mediaType)
    if (!hasImage || !analysisType) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: (imageUrl OR imageBase64+mediaType), analysisType' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Initialize Supabase admin client for database operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Check AI quota before proceeding
    const { data: canUse, error: quotaError } = await supabase.rpc('can_use_ai_feature', {
      p_user_id: userId
    })

    if (quotaError) {
      console.error('Quota check error:', quotaError)
      return new Response(
        JSON.stringify({ error: 'Failed to check AI quota' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!canUse) {
      return new Response(
        JSON.stringify({
          error: 'AI quota exceeded',
          message: 'You have reached your monthly AI analysis limit. Upgrade to Pro for unlimited access!'
        }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Initialize Anthropic client
    const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY')
    if (!anthropicApiKey) {
      console.error('ANTHROPIC_API_KEY not configured')
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const anthropic = new Anthropic({ apiKey: anthropicApiKey })

    // Determine model based on user tier
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('subscription_tier')
      .eq('id', userId)
      .single()

    const model = profile?.subscription_tier === 'pro'
      ? 'claude-sonnet-4-20250514'    // Better accuracy for pro users
      : 'claude-3-5-haiku-20241022'   // Faster and cheaper for free users

    // Build prompt based on analysis type
    const systemPrompt = buildPrompt(analysisType, plantData)

    console.log('Calling Anthropic API with model:', model)
    const startTime = Date.now()

    // Build image source - use base64 if provided, otherwise URL
    const imageSource = imageBase64 && mediaType
      ? {
          type: "base64" as const,
          media_type: mediaType,
          data: imageBase64,
        }
      : {
          type: "url" as const,
          url: imageUrl!,
        }

    // Call Claude with vision - wrap in try-catch for better error handling
    let message
    try {
      message = await anthropic.messages.create({
        model,
        max_tokens: 1024,
        messages: [{
          role: "user",
          content: [
            {
              type: "image",
              source: imageSource,
            },
            {
              type: "text",
              text: systemPrompt
            }
          ],
        }],
      })
    } catch (apiError: any) {
      console.error('Anthropic API error:', apiError)

      const errorMessage = apiError.message || apiError.toString()

      // Check for credit/billing issues
      if (errorMessage.includes('credit balance') || errorMessage.includes('billing') || errorMessage.includes('purchase credits')) {
        // Create admin notification for credit issues
        await supabase.from('notifications').insert({
          user_id: userId,
          notification_type: 'system_alert',
          title: 'AI Service Issue: Credits Exhausted',
          body: 'The Anthropic API credits have been exhausted. Please add more credits.',
          trigger_reason: {
            type: 'api_credit_exhausted',
            error: errorMessage,
            timestamp: new Date().toISOString()
          }
        })

        return new Response(
          JSON.stringify({
            error: 'AI_SERVICE_UNAVAILABLE',
            message: 'Our AI service is temporarily unavailable. Please try again later.'
          }),
          { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      if (errorMessage.includes('rate limit')) {
        return new Response(
          JSON.stringify({
            error: 'AI_RATE_LIMITED',
            message: 'Too many requests. Please wait a moment and try again.'
          }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Generic API error
      return new Response(
        JSON.stringify({
          error: 'AI_ANALYSIS_FAILED',
          message: 'Unable to analyze your plant photo. Please try again.'
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const processingTime = Date.now() - startTime
    console.log(`AI analysis completed in ${processingTime}ms`)

    // Parse AI response
    const analysis = parseAIResponse(message.content)

    // Calculate tokens used (for cost tracking)
    const tokensUsed = message.usage.input_tokens + message.usage.output_tokens

    // Save analysis to database
    const { data: savedAnalysis, error: saveError } = await supabase
      .from('ai_plant_analyses')
      .insert({
        plant_id: plantData?.plant_id,
        photo_id: null, // TODO: Link to photo_id if available
        analysis_type: analysisType,
        identified_species: analysis.species,
        confidence_score: analysis.confidence,
        health_status: analysis.healthStatus,
        insights: analysis.insights,
        recommendations: analysis.recommendations,
        risk_flags: analysis.riskFlags,
        ai_model_used: model,
        tokens_used: tokensUsed,
        processing_time_ms: processingTime
      })
      .select()
      .single()

    if (saveError) {
      console.error('Failed to save analysis:', saveError)
      // Continue even if save fails
    }

    // Increment AI usage counter
    await supabase.rpc('increment_ai_usage', { p_user_id: userId })

    // Update check-in schedule if this is an identification or health check
    if (plantData?.plant_id && (analysisType === 'initial_identification' || analysisType === 'health_monitoring')) {
      const nextCheckInDays = analysis.nextCheckInDays || 7

      await supabase
        .from('check_in_schedules')
        .upsert({
          plant_id: plantData.plant_id,
          next_check_in_date: new Date(Date.now() + nextCheckInDays * 24 * 60 * 60 * 1000).toISOString(),
          check_in_frequency_days: nextCheckInDays,
          last_calculated_at: new Date().toISOString(),
          calculation_factors: {
            ai_model: model,
            health_status: analysis.healthStatus,
            species: analysis.species,
            risk_flags: analysis.riskFlags
          }
        })
    }

    // Create notification if health risks detected
    if (analysis.riskFlags.length > 0 && plantData?.plant_id) {
      await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          plant_id: plantData.plant_id,
          notification_type: 'health_alert',
          title: `${plantData.custom_name || 'Your plant'} needs attention`,
          body: analysis.riskFlags[0], // First risk flag as notification body
          trigger_reason: {
            type: 'ai_health_alert',
            analysis_id: savedAnalysis?.id,
            risk_flags: analysis.riskFlags
          }
        })
    }

    console.log('Analysis completed successfully:', {
      species: analysis.species,
      confidence: analysis.confidence,
      healthStatus: analysis.healthStatus,
      tokensUsed
    })

    return new Response(
      JSON.stringify({
        ...analysis,
        analysisId: savedAnalysis?.id,
        tokensUsed,
        processingTimeMs: processingTime
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in analyze-plant-photo:', error)
    return new Response(
      JSON.stringify({
        error: error.message || 'Internal server error',
        details: error.toString()
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
