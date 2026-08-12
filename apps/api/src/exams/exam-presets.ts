import { AccessLevel, Difficulty, QuestionType } from 'database'

export type ExamPresetSlug =
  | 'warmup'
  | 'frontend-basics'
  | 'javascript'
  | 'react'
  | 'backend'
  | 'system-design'

export type ExamCategory = 'mixed' | 'frontend' | 'backend' | 'system_design'
export type ExamDisplayDifficulty = 'introductory' | 'intermediate' | 'advanced'

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
  questionCount: number
  durationMinutes: number
  questionFilter: ExamQuestionFilter
}

export const EXAM_PRESETS = [
  {
    slug: 'warmup',
    category: 'mixed',
    access: AccessLevel.free,
    displayDifficulty: 'introductory',
    questionCount: 8,
    durationMinutes: 10,
    questionFilter: {
      difficulties: [Difficulty.junior],
    },
  },
  {
    slug: 'frontend-basics',
    category: 'frontend',
    access: AccessLevel.free,
    displayDifficulty: 'introductory',
    questionCount: 10,
    durationMinutes: 15,
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
    questionCount: 25,
    durationMinutes: 35,
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
    questionCount: 20,
    durationMinutes: 30,
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
    questionCount: 25,
    durationMinutes: 40,
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
    questionCount: 15,
    durationMinutes: 45,
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
