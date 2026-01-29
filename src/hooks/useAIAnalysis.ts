import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { aiService, type AIAnalysisRequest, type AIAnalysisResponse } from '@/lib/ai-service'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

/**
 * Hook to trigger AI plant photo analysis
 */
export function useAIAnalysis() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (request: AIAnalysisRequest): Promise<AIAnalysisResponse> => {
      if (!user?.id) {
        throw new Error('User not authenticated')
      }

      return aiService.analyzePhoto(request, user.id)
    },
    onSuccess: (data, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['ai-quota', user?.id] })

      if (variables.plantData?.plant_id) {
        queryClient.invalidateQueries({ queryKey: ['plant', variables.plantData.plant_id] })
        queryClient.invalidateQueries({ queryKey: ['plant-analyses', variables.plantData.plant_id] })
        queryClient.invalidateQueries({ queryKey: ['check-in-schedule', variables.plantData.plant_id] })
      }

      // Show success toast with personality
      if (data.healthStatus === 'thriving') {
        toast.success('Looking amazing! 🌟', {
          description: data.insights[0] || 'Your plant is thriving!'
        })
      } else if (data.healthStatus === 'good') {
        toast.success('Analysis complete! ✨', {
          description: data.insights[0] || 'Your plant looks healthy!'
        })
      } else if (data.healthStatus === 'at_risk') {
        toast.warning('Heads up! ⚠️', {
          description: data.riskFlags[0] || 'Your plant needs some attention'
        })
      } else if (data.healthStatus === 'critical') {
        toast.error('Urgent attention needed! 🚨', {
          description: data.riskFlags[0] || 'Your plant needs immediate care'
        })
      }
    },
    onError: (error: Error) => {
      console.error('AI analysis failed:', error)

      // Handle specific error cases with user-friendly messages
      if (error.message === 'AI_QUOTA_EXCEEDED') {
        toast.error('AI limit reached', {
          description: "You've used all your free AI analyses this month.",
          action: {
            label: 'Upgrade',
            onClick: () => {
              // TODO: Navigate to upgrade page
              console.log('Navigate to upgrade page')
            }
          }
        })
      } else if (error.message.includes('AI_SERVICE_UNAVAILABLE')) {
        toast.error('Service temporarily unavailable', {
          description: 'Our AI service is experiencing issues. Please try again later.'
        })
      } else if (error.message.includes('AI_RATE_LIMITED')) {
        toast.warning('Slow down!', {
          description: 'Too many requests. Please wait a moment and try again.'
        })
      } else if (error.message.includes('AI_ANALYSIS_FAILED')) {
        toast.error('Analysis failed', {
          description: 'Unable to analyze your plant photo. Please try again.'
        })
      } else {
        toast.error('Something went wrong', {
          description: 'Unable to analyze photo. Please try again.'
        })
      }
    }
  })
}

/**
 * Hook to get plant analyses history
 */
export function usePlantAnalyses(plantId: string | undefined, limit: number = 5) {
  return useQuery({
    queryKey: ['plant-analyses', plantId, limit],
    queryFn: async () => {
      if (!plantId) {
        return []
      }
      return aiService.getPlantAnalyses(plantId, limit)
    },
    enabled: !!plantId
  })
}

/**
 * Hook to get latest health status for a plant
 */
export function usePlantHealthStatus(plantId: string | undefined) {
  return useQuery({
    queryKey: ['plant-health-status', plantId],
    queryFn: async () => {
      if (!plantId) {
        return { status: 'unknown' as const }
      }
      return aiService.getLatestHealthStatus(plantId)
    },
    enabled: !!plantId,
    staleTime: 1000 * 60 * 10 // 10 minutes
  })
}

/**
 * Hook to check if plant needs check-in
 */
export function useCheckInPrompt(plantId: string | undefined) {
  return useQuery({
    queryKey: ['check-in-prompt', plantId],
    queryFn: async () => {
      if (!plantId) {
        return false
      }
      return aiService.shouldPromptCheckIn(plantId)
    },
    enabled: !!plantId,
    refetchInterval: 1000 * 60 * 60 // Refetch every hour
  })
}

/**
 * Hook to snooze check-in reminder
 */
export function useSnoozeCheckIn() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ plantId, days }: { plantId: string; days?: number }) => {
      return aiService.snoozeCheckIn(plantId, days)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['check-in-prompt', variables.plantId] })
      toast.success('Check-in snoozed', {
        description: `I'll remind you again in ${variables.days || 3} days`
      })
    },
    onError: (error: Error) => {
      toast.error('Failed to snooze', {
        description: error.message
      })
    }
  })
}
