import { createApiUrl } from '@/config/api'
import { getSupabaseClient } from '@/services/supabaseClient'

type ApiErrorResponse = {
  error?: {
    code?: string
    message?: string
  }
  message?: string | string[]
}

export class ApiClientError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
  ) {
    super(message)
    this.name = 'ApiClientError'
  }
}

export const requestAuthenticatedApi = async (
  path: string,
  init: RequestInit = {},
): Promise<Response> => {
  const supabase = getSupabaseClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const response = await fetch(createApiUrl(path), {
    ...init,
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...init.headers,
      ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
    },
  })

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as ApiErrorResponse
    const fallbackMessage = Array.isArray(body.message) ? body.message.join(', ') : body.message

    throw new ApiClientError(
      body.error?.message ?? fallbackMessage ?? 'The request could not be completed',
      response.status,
      body.error?.code,
    )
  }

  return response
}
