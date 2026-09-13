import { requestAuthenticatedApi } from '@/services/apiClient'

export type SearchQuestionResult = {
  id: string
  title: string
  difficulty: 'junior' | 'middle' | 'senior'
  locked: boolean
  category: { name: string } | null
}

type SearchQuestionsResponse = {
  data: SearchQuestionResult[]
  meta: { total: number }
}

export const searchQuestions = async (
  query: string,
  limit = 6,
): Promise<SearchQuestionsResponse> => {
  const params = new URLSearchParams({ search: query, limit: String(limit) })
  const response = await requestAuthenticatedApi(`/api/v1/questions?${params.toString()}`)

  return (await response.json()) as SearchQuestionsResponse
}
