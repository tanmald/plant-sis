import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

interface AuthContextType {
  user: User | null
  session: Session | null
  isLoading: boolean
  isOnboarded: boolean
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signUp: (email: string, password: string) => Promise<{ error?: string }>
  signOut: () => Promise<void>
  completeOnboarding: (displayName: string, identityPreference: string, experienceLevel: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isOnboarded, setIsOnboarded] = useState(false)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)

      if (session?.user) {
        checkOnboardingStatus(session.user.id)
      } else {
        setIsLoading(false)
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)

      if (session?.user) {
        checkOnboardingStatus(session.user.id)
      } else {
        setIsOnboarded(false)
        setIsLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const checkOnboardingStatus = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('onboarded_at')
        .eq('id', userId)
        .single()

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = no rows returned, which is expected for new users
        // Silently handle error - fallback to not onboarded
      }

      setIsOnboarded(!!data?.onboarded_at)
    } catch (err) {
      // Silently handle error - fallback to not onboarded
      setIsOnboarded(false)
    } finally {
      setIsLoading(false)
    }
  }

  const signIn = async (email: string, password: string): Promise<{ error?: string }> => {
    try {
      setIsLoading(true)

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { error: error.message }
      }

      if (data.user) {
        await checkOnboardingStatus(data.user.id)
      }

      return {}
    } catch (err) {
      return { error: 'An unexpected error occurred' }
    } finally {
      setIsLoading(false)
    }
  }

  const signUp = async (email: string, password: string): Promise<{ error?: string }> => {
    try {
      setIsLoading(true)

      const { error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        return { error: error.message }
      }

      // After signup, user needs to complete onboarding
      setIsOnboarded(false)

      return {}
    } catch (err) {
      return { error: 'An unexpected error occurred' }
    } finally {
      setIsLoading(false)
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setIsOnboarded(false)
  }

  const completeOnboarding = async (displayName: string, identityPreference: string, experienceLevel: string) => {
    if (!user) return

    // Upsert user profile with onboarding data
    const { error } = await supabase
      .from('user_profiles')
      .upsert({
        id: user.id,
        display_name: displayName,
        identity_preference: identityPreference,
        experience_level: experienceLevel,
        onboarded_at: new Date().toISOString(),
      })

    if (error) throw error

    setIsOnboarded(true)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        isOnboarded,
        signIn,
        signUp,
        signOut,
        completeOnboarding,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
