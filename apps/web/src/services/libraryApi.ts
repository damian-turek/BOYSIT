import { requestAuthenticatedApi } from '@/services/apiClient'

export const toggleBookmarkOnServer = async (questionId: string): Promise<{ bookmarked: boolean }> => {
  const response = await requestAuthenticatedApi(`/api/v1/bookmarks/${questionId}`, {
    method: 'POST',
  })
  return (await response.json()) as { bookmarked: boolean }
}
