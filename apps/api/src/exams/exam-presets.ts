import { AccessLevel, Difficulty, QuestionType } from 'database'

export type ExamPresetSlug =
  | 'frontend-basics'
  | 'javascript'
  | 'react'
  | 'backend'
  | 'system-design'

export type ExamCategory = 'mixed' | 'frontend' | 'backend' | 'system_design'
export type ExamDisplayDifficulty = 'introductory' | 'intermediate' | 'advanced'
export type ExamTopic =
  | 'javascript'
  | 'typescript'
  | 'react'
  | 'node'
  | 'databases'
  | 'architecture'

export type ExamQuestionFilter = {
  categorySlugs?: readonly string[]
  technologySlugs?: readonly string[]
  difficulties?: readonly Difficulty[]
  questionTypes?: readonly QuestionType[]
}

export type ExamPreset = {
  slug: ExamPresetSlug
  category: ExamCategory
  access: AccessLevel
  displayDifficulty: ExamDisplayDifficulty
  questionCountOptions: readonly number[]
  topics: readonly ExamTopic[]
  questionFilter: ExamQuestionFilter
}

export const FREE_PREVIEW_CARD_COUNT = 20
export const PRO_CARD_COUNT_OPTIONS = [20, 30, 50] as const

export const EXAM_PRESETS = [
  {
    slug: 'frontend-basics',
    category: 'frontend',
    access: AccessLevel.free,
    displayDifficulty: 'introductory',
    questionCountOptions: [FREE_PREVIEW_CARD_COUNT],
    topics: ['javascript', 'typescript', 'react'],
    questionFilter: {
      categorySlugs: ['frontend'],
      difficulties: [Difficulty.junior],
    },
  },
  {
    slug: 'javascript',
    category: 'frontend',
    access: AccessLevel.pro,
    displayDifficulty: 'intermediate',
    questionCountOptions: PRO_CARD_COUNT_OPTIONS,
    topics: ['javascript', 'typescript'],
    questionFilter: {
      technologySlugs: ['javascript', 'typescript'],
      difficulties: [Difficulty.middle],
    },
  },
  {
    slug: 'react',
    category: 'frontend',
    access: AccessLevel.pro,
    displayDifficulty: 'intermediate',
    questionCountOptions: PRO_CARD_COUNT_OPTIONS,
    topics: ['react', 'javascript', 'typescript'],
    questionFilter: {
      technologySlugs: ['react'],
      difficulties: [Difficulty.middle],
    },
  },
  {
    slug: 'backend',
    category: 'backend',
    access: AccessLevel.pro,
    displayDifficulty: 'intermediate',
    questionCountOptions: PRO_CARD_COUNT_OPTIONS,
    topics: ['node', 'databases', 'architecture'],
    questionFilter: {
      categorySlugs: ['backend', 'databases'],
      difficulties: [Difficulty.middle],
    },
  },
  {
    slug: 'system-design',
    category: 'system_design',
    access: AccessLevel.pro,
    displayDifficulty: 'advanced',
    questionCountOptions: PRO_CARD_COUNT_OPTIONS,
    topics: ['architecture', 'databases'],
    questionFilter: {
      difficulties: [Difficulty.senior],
      questionTypes: [QuestionType.system_design],
    },
  },
] as const satisfies readonly ExamPreset[]

export const getExamPreset = (slug: string) => EXAM_PRESETS.find((preset) => preset.slug === slug)

export const getAllowedQuestionAccessLevels = (preset: ExamPreset) =>
  preset.access === AccessLevel.free
    ? ([AccessLevel.free] as const)
    : ([AccessLevel.free, AccessLevel.pro] as const)
