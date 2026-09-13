import { requestAuthenticatedApi } from '@/services/apiClient'

export type ExamDifficulty = 'junior' | 'middle' | 'senior'

export type ExamQuestion = {
  id: string
  title: string
  questionText: string
  answerText: string | null
  explanation: string | null
  codeSnippet: string | null
  category: string | null
  technology: string | null
}

export type StartExamResponse = {
  difficulty: ExamDifficulty
  totalAvailable: number
  totalQuestions: number
  questions: ExamQuestion[]
}

export type SubmitExamResponse = {
  difficulty: ExamDifficulty
  totalQuestions: number
  correctCount: number
  scorePercentage: number
  durationSeconds: number
}

export const startExam = async (
  difficulty: ExamDifficulty,
  questionCount = 10,
): Promise<StartExamResponse> => {
  const response = await requestAuthenticatedApi('/api/v1/exam/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ difficulty, questionCount }),
  })

  return (await response.json()) as StartExamResponse
}

export const submitExam = async (payload: {
  difficulty: ExamDifficulty
  answers: { questionId: string; knewIt: boolean }[]
  durationSeconds: number
}): Promise<SubmitExamResponse> => {
  const response = await requestAuthenticatedApi('/api/v1/exam/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  return (await response.json()) as SubmitExamResponse
}
