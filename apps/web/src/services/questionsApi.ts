import { getSupabaseClient } from './supabase'

export type QuestionDifficulty = 'junior' | 'middle' | 'senior'
export type QuestionType =
  | 'theory'
  | 'practical'
  | 'code'
  | 'system_design'
  | 'troubleshooting'
export type AccessLevel = 'free' | 'pro'

export type Taxonomy = {
  id: string
  name: string
  slug: string
}

export type Category = Taxonomy & {
  description: string | null
}

export type Technology = Taxonomy & {
  description: string | null
  category: Taxonomy | null
}

export type QuestionPreview = {
  id: string
  slug: string
  title: string
  excerpt: string | null
  difficulty: QuestionDifficulty
  questionType: QuestionType
  accessLevel: AccessLevel
  category: Taxonomy | null
  technology: Taxonomy | null
  tags: Taxonomy[]
  locked: boolean
}

export type QuestionDetailData = QuestionPreview & {
  questionText?: string
  answerText?: string | null
  explanation?: string | null
  codeSnippet?: string | null
}

export type QuestionsFilters = {
  categorySlugs?: string[]
  technologySlugs?: string[]
  difficulty?: QuestionDifficulty
  questionType?: QuestionType
  accessLevel?: AccessLevel
  tags?: string[]
  search?: string
  page?: number
  pageSize?: number
}

export type Pagination = {
  page: number
  pageSize: number
  total: number
}

type ListResponse<T> = {
  data: T[]
}

type QuestionsResponse = ListResponse<QuestionPreview> & {
  pagination: Pagination
}

type ObjectResponse<T> = {
  data: T
}

type ErrorResponse = {
  error?: {
    code?: string
    message?: string
  }
}

type SessionResponse = {
  data: {
    id: string
    email: string
    name: string | null
    plan: 'free' | 'pro' | 'admin'
    proUntil: string | null
  }
}

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'

export class ApiRequestError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
  ) {
    super(message)
    this.name = 'ApiRequestError'
  }
}

const request = async <T>(path: string, signal?: AbortSignal): Promise<T> => {
  const supabase = getSupabaseClient()
  const { data: sessionData } = await supabase.auth.getSession()

  const response = await fetch(`${apiBaseUrl}${path}`, {
    headers: {
      Accept: 'application/json',
      ...(sessionData.session?.access_token
        ? {
            Authorization: `Bearer ${sessionData.session.access_token}`,
          }
        : {}),
    },
    signal,
  })

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as ErrorResponse

    throw new ApiRequestError(
      body.error?.message ?? 'The API request failed',
      response.status,
      body.error?.code,
    )
  }

  return response.json() as Promise<T>
}

export const fetchCategories = async (signal?: AbortSignal) => {
  const response = await request<ListResponse<Category>>('/api/v1/categories', signal)
  return response.data
}

export const fetchTechnologies = async (signal?: AbortSignal) => {
  const response = await request<ListResponse<Technology>>('/api/v1/technologies', signal)
  return response.data
}

export const fetchQuestions = async (
  filters: QuestionsFilters = {},
  signal?: AbortSignal,
): Promise<QuestionsResponse> => {
  const params = new URLSearchParams()

  if (filters.categorySlugs?.length) {
    params.set('categorySlug', filters.categorySlugs.join(','))
  }
  if (filters.technologySlugs?.length) {
    params.set('technologySlug', filters.technologySlugs.join(','))
  }
  if (filters.difficulty) params.set('difficulty', filters.difficulty)
  if (filters.questionType) params.set('questionType', filters.questionType)
  if (filters.accessLevel) params.set('accessLevel', filters.accessLevel)
  if (filters.tags?.length) params.set('tag', filters.tags.join(','))
  if (filters.search?.trim()) params.set('search', filters.search.trim())
  if (filters.page) params.set('page', String(filters.page))
  if (filters.pageSize) params.set('pageSize', String(filters.pageSize))

  const query = params.toString()

  return request<QuestionsResponse>(`/api/v1/questions${query ? `?${query}` : ''}`, signal)
}

export const fetchQuestion = async (slug: string, signal?: AbortSignal) => {
  const response = await request<ObjectResponse<QuestionDetailData>>(
    `/api/v1/questions/${encodeURIComponent(slug)}`,
    signal,
  )

  return response.data
}

export const fetchCurrentUser = async (signal?: AbortSignal) => {
  const response = await request<SessionResponse>('/api/v1/me', signal)
  return response.data
}
