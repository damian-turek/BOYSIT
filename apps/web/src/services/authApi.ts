import { createApiUrl } from '@/config/api'
import { getSupabaseClient } from '@/services/supabaseClient'

export type AuthUserProfile = {
  id: string
  email: string
  name: string | null
  plan: 'free' | 'pro' | 'admin'
  proUntil: string | null
}

type CurrentUserResponse = {
  data: AuthUserProfile
}

type ErrorResponse = {
  error?: {
    code?: string
    message?: string
  }
  message?: string | string[]
}

export class AuthApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
  ) {
    super(message)
    this.name = 'AuthApiError'
  }
}

type UpdateCurrentUserProfileInput = {
  name: string
}

const requestCurrentUser = async (init: RequestInit = {}): Promise<AuthUserProfile> => {
  const supabase = getSupabaseClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const response = await fetch(createApiUrl('/api/v1/me'), {
    ...init,
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...init.headers,
      ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
    },
  })

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as ErrorResponse
    const fallbackMessage = Array.isArray(body.message) ? body.message.join(', ') : body.message

    throw new AuthApiError(
      body.error?.message ?? fallbackMessage ?? 'Unable to load the current user',
      response.status,
      body.error?.code,
    )
  }

  const body = (await response.json()) as CurrentUserResponse
  return body.data
}

export const fetchCurrentUser = (signal?: AbortSignal): Promise<AuthUserProfile> =>
  requestCurrentUser({ signal })

export const updateCurrentUserProfile = (
  profile: UpdateCurrentUserProfileInput,
  signal?: AbortSignal,
): Promise<AuthUserProfile> =>
  requestCurrentUser({
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(profile),
    signal,
  })
