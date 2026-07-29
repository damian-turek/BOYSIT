const defaultApiBaseUrl = 'http://localhost:4000'

const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL?.trim() || defaultApiBaseUrl).replace(
  /\/+$/,
  '',
)

export const createApiUrl = (path: string): string => `${apiBaseUrl}/${path.replace(/^\/+/, '')}`
