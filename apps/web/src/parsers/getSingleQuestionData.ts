import { cookies } from 'next/headers'

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
  const cookieStore = await cookies()
  const cookieHeader = cookieStore.toString()

  const res = await fetch(createApiUrl(`/api/v1/questions/${searchParams}`), {
    headers: {
      Cookie: cookieHeader,
    },
    cache: 'no-store',
  })

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
    title: question?.title ?? '',
    locked: question?.locked ?? false,
    level: normalizeLevel(question?.difficulty),
    technologies: Array.from(
      new Set<string>([
        ...(question?.technology?.name ? [question.technology.name] : []),
        ...(question?.questionTags?.map((item: QuestionTag) => item.tag?.name).filter(Boolean) ??
          []),
      ]),
    ),
    category: {
      name: question?.category?.name ?? 'Unknown',
    },
    question: question?.questionText ?? '',
    answer: question?.answerText ?? '',
    explanation: question?.explanation ?? null,
    codeSnippet: question?.codeSnippet ?? null,
    nextQuestion: result?.nextQuestion?.id
      ? {
          id: result?.nextQuestion?.id ?? '',
          name: result?.nextQuestion?.title ?? '',
        }
      : null,
  } satisfies SingleQuestionProps

  return {
    SINGLE_QUESTION_DATA,
  }
}
