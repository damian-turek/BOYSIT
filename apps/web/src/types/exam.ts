export type ExamSlug =
  | 'warmup'
  | 'frontend-basics'
  | 'javascript'
  | 'react'
  | 'backend'
  | 'system-design'

export type ExamCategory = 'mixed' | 'frontend' | 'backend' | 'system_design'
export type ExamAccess = 'free' | 'pro'
export type ExamDisplayDifficulty = 'introductory' | 'intermediate' | 'advanced'
export type ExamTopic =
  | 'javascript'
  | 'typescript'
  | 'react'
  | 'node'
  | 'databases'
  | 'architecture'
export type ExamLockReason = 'pro_required' | 'insufficient_questions' | null
export type ExamSessionStatus = 'in_progress' | 'review' | 'completed' | 'expired'
export type ExamAssessment = 'know' | 'partial' | 'dont_know'

export type ExamCatalogItem = {
  slug: ExamSlug
  category: ExamCategory
  access: ExamAccess
  displayDifficulty: ExamDisplayDifficulty
  questionCount: number
  durationMinutes: number
  topics: ExamTopic[]
  availableQuestionCount: number
  activeSessionId: string | null
  canStart: boolean
  lockReason: ExamLockReason
}

export type ExamTaxonomyItem = {
  id: string
  name: string
  slug: string
}

export type ExamSessionQuestion = {
  id: string
  position: number
  title: string
  questionText: string
  difficulty: 'junior' | 'middle' | 'senior'
  questionType: 'theory' | 'practical' | 'code' | 'system_design' | 'troubleshooting'
  category: ExamTaxonomyItem | null
  technology: ExamTaxonomyItem | null
  userAnswer: string | null
  savedAt: string | null
  assessment: ExamAssessment | null
  answerText?: string | null
  explanation?: string | null
  codeSnippet?: string | null
}

export type ExamSession = {
  id: string
  examSlug: ExamSlug
  status: ExamSessionStatus
  questionCount: number
  durationMinutes: number
  startedAt: string
  expiresAt: string
  submittedAt: string | null
  completedAt: string | null
  questions: ExamSessionQuestion[]
}

export type ExamResultSummary = {
  total: number
  answered: number
  assessed: number
  know: number
  partial: number
  dontKnow: number
}

export type ExamResult = {
  id: string
  examSlug: ExamSlug
  status: ExamSessionStatus
  startedAt: string
  submittedAt: string | null
  completedAt: string | null
  summary: ExamResultSummary
  questions: ExamSessionQuestion[]
}

export type StartedExamSession = {
  sessionId: string
  status: ExamSessionStatus
  expiresAt: string
  resumed: boolean
}
