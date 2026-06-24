import { getSupabaseClient } from './supabase'

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
}

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'

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

export const fetchCurrentUser = async (
  signal?: AbortSignal,
): Promise<AuthUserProfile> => {
  const supabase = getSupabaseClient()
  const { data } = await supabase.auth.getSession()

  const response = await fetch(`${apiBaseUrl}/api/v1/me`, {
    headers: {
      Accept: 'application/json',
      ...(data.session?.access_token
        ? { Authorization: `Bearer ${data.session.access_token}` }
        : {}),
    },
    signal,
  })

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as ErrorResponse

    throw new AuthApiError(
      body.error?.message ?? 'Unable to load the current user',
      response.status,
      body.error?.code,
    )
  }

  const body = (await response.json()) as CurrentUserResponse
  return body.data
}
