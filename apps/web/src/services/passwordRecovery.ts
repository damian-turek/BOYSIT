import { getSupabaseClient } from '@/services/supabaseClient'
import type { Session } from '@supabase/supabase-js'

export class PasswordRecoveryError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly code?: string,
  ) {
    super(message)
    this.name = 'PasswordRecoveryError'
  }
}

const toPasswordRecoveryError = (error: {
  message: string
  status?: number
  code?: string
}): PasswordRecoveryError => new PasswordRecoveryError(error.message, error.status, error.code)

export const requestPasswordRecoveryOtp = async (email: string): Promise<void> => {
  const supabase = getSupabaseClient()
  const { error } = await supabase.auth.resetPasswordForEmail(email)

  if (error) {
    throw toPasswordRecoveryError(error)
  }
}

export const verifyPasswordRecoveryOtp = async (email: string, token: string): Promise<Session> => {
  const supabase = getSupabaseClient()
  const verification = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'recovery',
  })

  if (verification.error) {
    throw toPasswordRecoveryError(verification.error)
  }

  let session = verification.data.session

  if (!session) {
    const refreshedSession = await supabase.auth.refreshSession()

    if (refreshedSession.error) {
      throw toPasswordRecoveryError(refreshedSession.error)
    }

    session = refreshedSession.data.session
  }

  if (!session) {
    throw new PasswordRecoveryError(
      'Supabase did not return a password recovery session',
      401,
      'session_not_found',
    )
  }

  return session
}

export type PasswordUpdateResult = {
  otherSessionsRevoked: boolean
}

export const updateRecoveredPassword = async (password: string): Promise<PasswordUpdateResult> => {
  const supabase = getSupabaseClient()
  const update = await supabase.auth.updateUser({ password })

  if (update.error) {
    throw toPasswordRecoveryError(update.error)
  }

  const signOut = await supabase.auth.signOut({ scope: 'others' })

  return {
    otherSessionsRevoked: !signOut.error,
  }
}
