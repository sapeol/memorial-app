import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { type Memorial } from '@/types/memorial'

/**
 * Custom hook to fetch and manage the list of memorials the user has access to.
 * Includes loading, error, and refresh capabilities.
 */
export function useMemorials() {
  const [memorials, setMemorials] = useState<Memorial[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const supabase = createClient()

  const fetchMemorials = useCallback(async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setMemorials([])
        return
      }

      // Query memorials where user is owner or participant
      const { data, error } = await supabase
        .from('memorials')
        .select(`
          *,
          memorial_participants!inner (
            access_level
          )
        `)
        .or(`owner_id.eq.${user.id},memorial_participants.user_id.eq.${user.id}`)
        .order('created_at', { ascending: false })

      if (error) throw error
      setMemorials(data || [])
    } catch (err: any) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchMemorials()
  }, [fetchMemorials])

  return { memorials, loading, error, refresh: fetchMemorials }
}

/**
 * Custom hook to fetch details for a single memorial by ID.
 * Performs access checks via RLS and manual filtering.
 */
export function useMemorial(id: string | null) {
  const [memorial, setMemorial] = useState<Memorial | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const supabase = createClient()

  const fetchMemorial = useCallback(async () => {
    if (!id) return
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('memorials')
        .select(`
          *,
          memorial_participants!inner (
            access_level
          )
        `)
        .eq('id', id)
        .or(`owner_id.eq.${user.id},memorial_participants.user_id.eq.${user.id}`)
        .single()

      if (error) throw error
      setMemorial(data)
    } catch (err: any) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [id, supabase])

  useEffect(() => {
    fetchMemorial()
  }, [fetchMemorial])

  return { memorial, loading, error, refresh: fetchMemorial }
}
