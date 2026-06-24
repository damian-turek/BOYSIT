import { create } from 'zustand'

import type { Session } from '@supabase/supabase-js'

import type { AuthUserProfile } from '@/services/authApi'

type AuthSessionState = {
  initialized: boolean
  loading: boolean
  accessToken: string | null
  session: Session | null
  profile: AuthUserProfile | null
  setLoading: (loading: boolean) => void
  setSession: (session: Session | null) => void
  setProfile: (profile: AuthUserProfile | null) => void
  markInitialized: () => void
  clear: () => void
}

export const useAuthSessionStore = create<AuthSessionState>((set) => ({
  initialized: false,
  loading: false,
  accessToken: null,
  session: null,
  profile: null,
  setLoading: (loading) => set({ loading }),
  setSession: (session) =>
    set({
      session,
      accessToken: session?.access_token ?? null,
    }),
  setProfile: (profile) => set({ profile }),
  markInitialized: () => set({ initialized: true }),
  clear: () =>
    set({
      session: null,
      profile: null,
      accessToken: null,
      loading: false,
      initialized: true,
    }),
}))
