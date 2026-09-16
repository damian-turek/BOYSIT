import { requestAuthenticatedApi } from '@/services/apiClient'
import type {
  ExamAssessment,
  ExamCatalogItem,
  ExamResult,
  ExamSession,
  StartedExamSession,
} from '@/types/exam'

type DataResponse<T> = {
  data: T
}

const jsonHeaders = { 'Content-Type': 'application/json' }

const readData = async <T>(response: Response): Promise<T> => {
  const body = (await response.json()) as DataResponse<T>
  return body.data
}

export const fetchExamCatalog = async (signal?: AbortSignal): Promise<ExamCatalogItem[]> => {
  const response = await requestAuthenticatedApi('/api/v1/exams', { signal })
  return readData<ExamCatalogItem[]>(response)
}

export const startExam = async (
  slug: string,
  questionCount: number,
): Promise<StartedExamSession> => {
  const response = await requestAuthenticatedApi(`/api/v1/exams/${slug}/sessions`, {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify({ questionCount }),
  })
  return readData<StartedExamSession>(response)
}

export const fetchExamSession = async (
  sessionId: string,
  signal?: AbortSignal,
): Promise<ExamSession> => {
  const response = await requestAuthenticatedApi(`/api/v1/exam-sessions/${sessionId}`, { signal })
  return readData<ExamSession>(response)
}

export const fetchExamResult = async (
  sessionId: string,
  signal?: AbortSignal,
): Promise<ExamResult> => {
  const response = await requestAuthenticatedApi(`/api/v1/exam-sessions/${sessionId}/result`, {
    signal,
  })
  return readData<ExamResult>(response)
}

export const submitExamAssessment = async (
  sessionId: string,
  questionId: string,
  assessment: ExamAssessment,
): Promise<{ questionId: string; assessment: ExamAssessment; assessedAt: string }> => {
  const response = await requestAuthenticatedApi(
    `/api/v1/exam-sessions/${sessionId}/questions/${questionId}/assessment`,
    {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify({ assessment }),
    },
  )
  return readData(response)
}

export const completeExamReview = async (sessionId: string): Promise<ExamResult> => {
  const response = await requestAuthenticatedApi(`/api/v1/exam-sessions/${sessionId}/complete`, {
    method: 'POST',
  })
  return readData<ExamResult>(response)
}
