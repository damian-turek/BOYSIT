'use client'

import { useEffect } from 'react'

import { AuthApiError, fetchCurrentUser } from '@/services/authApi'
import { getSupabaseClient } from '@/services/supabaseClient'
import type { AuthChangeEvent, Session } from '@supabase/supabase-js'

import { useAuthSessionStore } from '@/store/useAuthSessionStore'

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const setLoading = useAuthSessionStore((state) => state.setLoading)
  const setSession = useAuthSessionStore((state) => state.setSession)
  const setProfile = useAuthSessionStore((state) => state.setProfile)
  const markInitialized = useAuthSessionStore((state) => state.markInitialized)
  const clear = useAuthSessionStore((state) => state.clear)

  useEffect(() => {
    let active = true
    const supabase = getSupabaseClient()

    const syncSession = async () => {
      setLoading(true)

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
        console.error('Auth session sync failed', error)

        if (error instanceof AuthApiError && error.status === 401) {
          await supabase.auth.signOut()
          clear()
        } else {
          setProfile(null)
          markInitialized()
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void syncSession()

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        if (!active) return

        setSession(session)

        if (!session) {
          setProfile(null)
          markInitialized()
          setLoading(false)
          return
        }

        void (async () => {
          try {
            setLoading(true)
            const profile = await fetchCurrentUser()

            if (!active) return

            setProfile(profile)
          } catch (error) {
            console.error('Auth session refresh failed', error)

            if (error instanceof AuthApiError && error.status === 401) {
              await supabase.auth.signOut()
              clear()
            } else {
              setProfile(null)
            }
          } finally {
            if (active) {
              markInitialized()
              setLoading(false)
            }
          }
        })()
      },
    )

    return () => {
      active = false
      authListener.subscription.unsubscribe()
    }
  }, [clear, markInitialized, setLoading, setProfile, setSession])

  return <>{children}</>
}
