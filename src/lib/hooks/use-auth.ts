import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/lib/store/auth-store'

/**
 * Custom hook to manage and sync authentication state with Supabase.
 * Centralizes auth listeners and user state management.
 */
export function useAuthSync() {
  const { setUser, setInitialized } = useAuthStore()
  const supabase = createClient()

  useEffect(() => {
    // Initial fetch of the current user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      setInitialized(true)
    })

    // Subscribe to auth state changes (sign in, sign out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
      }
    )

    return () => subscription.unsubscribe()
  }, [setUser, setInitialized, supabase])
}
