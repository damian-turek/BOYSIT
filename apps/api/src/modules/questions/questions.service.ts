import { questionsRepository } from './questions.repository.js'
import type { QuestionsQuery } from './questions.schemas.js'
import type { CurrentUser } from '../users/users.types.js'

type QuestionDetailSource = NonNullable<
  Awaited<ReturnType<typeof questionsRepository.findBySlug>>
>

const mapTags = (
  questionTags: {
    tag: {
      id: string
      name: string
      slug: string
    }
  }[],
) => questionTags.map(({ tag }) => tag)

const canAccessQuestion = (
  currentUser: CurrentUser | null | undefined,
  accessLevel: 'free' | 'pro',
) => {
  if (accessLevel === 'free') {
    return true
  }

  return currentUser?.plan === 'pro' || currentUser?.plan === 'admin'
}

export const serializeQuestionDetail = (
  question: QuestionDetailSource,
  currentUser: CurrentUser | null = null,
) => {
  const { questionTags, ...fields } = question
  const hasAccess = canAccessQuestion(currentUser, question.accessLevel)
  const base = {
    ...fields,
    tags: mapTags(questionTags),
    locked: !hasAccess,
  }

  if (base.locked) {
    const {
      answerText: _answerText,
      codeSnippet: _codeSnippet,
      explanation: _explanation,
      questionText: _questionText,
      ...lockedQuestion
    } = base

    return lockedQuestion
  }

  return base
}

export const questionsService = {
  async list(query: QuestionsQuery, currentUser: CurrentUser | null = null) {
    const { questions, pagination } = await questionsRepository.findMany(query)

    return {
      data: questions.map(({ questionTags, ...question }) => ({
        ...question,
        tags: mapTags(questionTags),
        locked: !canAccessQuestion(currentUser, question.accessLevel),
      })),
      pagination,
    }
  },

  async detail(slug: string, currentUser: CurrentUser | null = null) {
    const question = await questionsRepository.findBySlug(slug)

    if (!question) return null

    return serializeQuestionDetail(question, currentUser)
  },
}
