import { createApiUrl } from '@/config/api'
import { Level } from '@/types/question'

import { SingleQuestionProps } from '@/components/organisms/SingleQuestion'

type QuestionTag = {
  tag: {
    id: string
    name: string
    slug: string
  }
}

export async function getQuestionsSinglePageData(searchParams?: string) {
  const res = await fetch(createApiUrl(`/api/v1/questions/${searchParams}`), {})

  if (!res.ok) {
    const errorBody = await res.text()
    console.error('Backend responded with error:', res.status, errorBody)
    throw new Error(`Failed to fetch data from backend api: ${res.status} ${errorBody}`)
  }

  const result = await res.json()
  const question = result?.data

  if (!question) {
    throw new Error('Question payload is missing "data" field')
  }

  const normalizeLevel = (rawLevel?: string): Level => {
    const value = rawLevel?.toLowerCase()
    if (value === 'junior') return 'Junior'
    if (value === 'middle') return 'Middle'
    if (value === 'senior') return 'Senior'

    return 'Junior'
  }

  const SINGLE_QUESTION_DATA = {
    index: question?.id,
    level: normalizeLevel(question?.difficulty),
    technologies:
      question?.questionTags?.map((item: QuestionTag) => item.tag?.name).filter(Boolean) ?? [],
    category: {
      name: question?.category?.name ?? 'Unknown',
    },
    question: question?.questionText ?? '',
    answer: question?.answerText ?? '',
    nextQuestion: {
      id: result?.nextQuestion?.id ?? '',
      name: result?.nextQuestion?.title ?? '',
    },
  } satisfies SingleQuestionProps

  return {
    SINGLE_QUESTION_DATA,
  }
}
