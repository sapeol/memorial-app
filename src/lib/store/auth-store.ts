import { create } from 'zustand'
import { type User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

/**
 * Global authentication state and actions.
 * Provides a single source of truth for the user session.
 */
interface AuthState {
  user: User | null
  initialized: boolean
  
  // Basic State Setters
  setUser: (user: User | null) => void
  setInitialized: (initialized: boolean) => void
  
  // Auth Actions
  signOut: () => Promise<void>
  signInWithGoogle: () => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, name: string) => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  initialized: false,

  setUser: (user) => set({ user }),
  setInitialized: (initialized) => set({ initialized }),

  signOut: async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    set({ user: null })
  },

  signInWithGoogle: async () => {
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) throw error
  },

  signIn: async (email, password) => {
    const supabase = createClient()
    const { error, data } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    if (data.user) set({ user: data.user })
  },

  signUp: async (email, password, name) => {
    const supabase = createClient()
    const { error, data } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        },
      },
    })
    if (error) throw error
    if (data.user) set({ user: data.user })
  }
}))