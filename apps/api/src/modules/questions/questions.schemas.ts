import type { AccessLevel, Difficulty, QuestionType } from 'database'

export type QuestionsQuery = {
  categorySlug?: string
  technologySlug?: string
  difficulty?: Difficulty
  questionType?: QuestionType
  accessLevel?: AccessLevel
  tag?: string
  search?: string
  page?: number
  pageSize?: number
}

export type QuestionParams = {
  slug: string
}

export const questionsQuerySchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    categorySlug: {
      type: 'string',
      minLength: 1,
      maxLength: 300,
    },
    technologySlug: {
      type: 'string',
      minLength: 1,
      maxLength: 300,
    },
    difficulty: {
      type: 'string',
      enum: ['junior', 'middle', 'senior'],
    },
    questionType: {
      type: 'string',
      enum: ['theory', 'practical', 'code', 'system_design', 'troubleshooting'],
    },
    accessLevel: {
      type: 'string',
      enum: ['free', 'pro'],
    },
    tag: {
      type: 'string',
      minLength: 1,
      maxLength: 300,
    },
    search: {
      type: 'string',
      minLength: 1,
      maxLength: 200,
    },
    page: {
      type: 'integer',
      minimum: 1,
      default: 1,
    },
    pageSize: {
      type: 'integer',
      minimum: 1,
      maximum: 100,
      default: 20,
    },
  },
} as const

export const questionParamsSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['slug'],
  properties: {
    slug: {
      type: 'string',
      minLength: 1,
      maxLength: 200,
      pattern: '^[a-z0-9]+(?:-[a-z0-9]+)*$',
    },
  },
} as const
