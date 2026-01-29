import { useQuery } from '@tanstack/react-query'
import { aiService, type AIQuota } from '@/lib/ai-service'
import { useAuth } from '@/contexts/AuthContext'

/**
 * Hook to get AI quota information for the current user
 */
export function useAIQuota() {
  const { user } = useAuth()

  return useQuery<AIQuota>({
    queryKey: ['ai-quota', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        throw new Error('User not authenticated')
      }
      return aiService.getQuota(user.id)
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: true
  })
}

/**
 * Check if user can use AI feature (quota check)
 */
export function useCanUseAI(): {
  canUse: boolean
  isLoading: boolean
  quota?: AIQuota
  error?: Error | null
} {
  const { data: quota, isLoading, error } = useAIQuota()

  return {
    canUse: quota?.can_use_ai ?? false,
    isLoading,
    quota,
    error
  }
}
