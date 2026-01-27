import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import type { UserProfile } from '@/types/database.types'

/**
 * Hook to fetch and manage user profile data
 * Includes identity preference for personalized messaging
 */
export function useUserProfile() {
  const { user } = useAuth()

  const { data: profile, isLoading, error, refetch } = useQuery<UserProfile | null>({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) throw error
      return data
    },
    enabled: !!user,
  })

  const updateIdentityPreference = async (identityPreference: string) => {
    if (!user) return

    const { error } = await supabase
      .from('user_profiles')
      .update({ identity_preference: identityPreference })
      .eq('id', user.id)

    if (error) throw error
    await refetch()
  }

  return {
    profile,
    isLoading,
    error,
    refetch,
    updateIdentityPreference,
  }
}
