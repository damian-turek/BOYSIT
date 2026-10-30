import type { ExamResult, ExamSession, ExamSessionQuestion } from '@/types/exam'
import type { JobApplication } from '@/types/job-tracker'
import type { Question } from '@/types/question'

export type FeaturePreviewKind = 'questions' | 'exams' | 'jobs' | 'filters' | 'progress'

// Public examples for the real UI components; never read a visitor's private account data.
export const previewQuestions = [
  {
    index: 'preview-closures',
    level: 'Junior',
    technologies: ['JavaScript'],
    category: { name: 'Frontend' },
    question: 'Explain closures in JavaScript.',
    answer: 'A closure retains access to its surrounding lexical scope.',
  },
  {
    index: 'preview-event-loop',
    level: 'Middle',
    technologies: ['JavaScript', 'Node.js'],
    category: { name: 'JavaScript/TypeScript' },
    question: 'How does the JavaScript event loop work?',
    answer: 'The event loop coordinates queued tasks with the call stack.',
  },
  {
    index: 'preview-react',
    level: 'Middle',
    technologies: ['React', 'TypeScript'],
    category: { name: 'Frontend' },
    question: 'When would you use React.memo?',
    answer: 'To skip re-rendering a component when its props have not changed.',
  },
] satisfies Question[]

const examQuestions: ExamSessionQuestion[] = previewQuestions.map((question, index) => ({
  id: question.index,
  position: index + 1,
  title: question.question,
  questionText: question.question,
  difficulty: index === 0 ? 'junior' : 'middle',
  questionType: 'theory',
  category: { id: 'frontend', name: 'Frontend', slug: 'frontend' },
  technology: { id: 'javascript', name: 'JavaScript', slug: 'javascript' },
  assessment: index === 0 ? 'know' : null,
  answerText: question.answer,
  explanation: null,
  codeSnippet: null,
}))

export const previewSession: ExamSession = {
  id: 'preview-session',
  examSlug: 'frontend-basics',
  access: 'free',
  status: 'in_progress',
  questionCount: examQuestions.length,
  startedAt: '2026-10-30T09:00:00Z',
  submittedAt: null,
  completedAt: null,
  questions: examQuestions,
}

export const previewResult: ExamResult = {
  id: 'preview-result',
  examSlug: 'frontend-basics',
  status: 'completed',
  startedAt: '2026-10-30T09:00:00Z',
  submittedAt: null,
  completedAt: null,
  summary: { total: 3, assessed: 3, know: 1, partial: 1, dontKnow: 1 },
  questions: examQuestions.map((question, index) => ({
    ...question,
    assessment: index === 0 ? 'know' : index === 1 ? 'partial' : 'dont_know',
  })),
}

export const previewJobs = [
  {
    id: 'preview-job-1',
    company: 'Example Studio',
    role: 'Frontend Developer',
    status: 'technical',
  },
  { id: 'preview-job-2', company: 'Example Team', role: 'React Developer', status: 'applied' },
].map(
  (job): JobApplication => ({
    ...job,
    status: job.status === 'technical' ? 'technical' : 'applied',
    location: null,
    salary: null,
    appliedAt: null,
    followUpAt: null,
    jobUrl: null,
    note: null,
    technologies: [{ id: 'react', name: 'React', slug: 'react' }],
    customTechnologies: ['TypeScript'],
    createdAt: '2026-10-30T09:00:00Z',
    updatedAt: '2026-10-30T09:00:00Z',
  }),
)
