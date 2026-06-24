'use client'

import { useEffect } from 'react'

import type { AuthChangeEvent, Session } from '@supabase/supabase-js'

import { AuthApiError, fetchCurrentUser } from '@/services/authApi'
import { getSupabaseClient } from '@/services/supabase'
import { useAuthSessionStore } from '@/store/useAuthSessionStore'

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const setLoading = useAuthSessionStore((state) => state.setLoading)
  const setSession = useAuthSessionStore((state) => state.setSession)
  const setProfile = useAuthSessionStore((state) => state.setProfile)
  const markInitialized = useAuthSessionStore((state) => state.markInitialized)
  const clear = useAuthSessionStore((state) => state.clear)

  useEffect(() => {
    let active = true

    const syncSession = async () => {
      setLoading(true)
      const supabase = getSupabaseClient()

      try {
        const { data } = await supabase.auth.getSession()

        if (!active) return

        setSession(data.session ?? null)

        if (!data.session) {
          setProfile(null)
          markInitialized()
          return
        }

        const profile = await fetchCurrentUser()

        if (!active) return

        setProfile(profile)
        markInitialized()
      } catch (error) {
        if (error instanceof AuthApiError && error.status === 401) {
          await supabase.auth.signOut()
          clear()
          return
        }

        console.error('Auth session sync failed', error)
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void syncSession()

    const supabase = getSupabaseClient()
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event: AuthChangeEvent, session: Session | null) => {
        setSession(session)

        if (!session) {
          setProfile(null)
          markInitialized()
          setLoading(false)
          return
        }

        try {
          const profile = await fetchCurrentUser()
          setProfile(profile)
        } catch (error) {
          if (error instanceof AuthApiError && error.status === 401) {
            await supabase.auth.signOut()
            clear()
            return
          }

          console.error('Auth session refresh failed', error)
        } finally {
          markInitialized()
          setLoading(false)
        }
      },
    )

    return () => {
      active = false
      authListener.subscription.unsubscribe()
    }
  }, [clear, markInitialized, setLoading, setProfile, setSession])

  return <>{children}</>
}
