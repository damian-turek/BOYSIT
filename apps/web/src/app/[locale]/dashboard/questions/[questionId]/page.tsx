import { notFound } from 'next/navigation'

import { getQuestionsSinglePageData } from '@/parsers/getSingleQuestionData'
import { Metadata } from 'next'

import { SingleQuestion } from '@/components/organisms/SingleQuestion'

type PageProps = {
  params: Promise<{
    locale: string
    questionId: string
  }>
}

export const dynamic = 'force-dynamic'

export const generateMetadata = async ({ params }: PageProps): Promise<Metadata> => {
  const { questionId } = await params

  try {
    const { SINGLE_QUESTION_DATA } = await getQuestionsSinglePageData(questionId)

    return {
      title: `${SINGLE_QUESTION_DATA.question} | Questions`,
      description: SINGLE_QUESTION_DATA.category + `interview question.`,
    }
  } catch {
    return { title: 'Question not found' }
  }
}

export default async function QuestionPage({ params }: PageProps) {
  const { questionId } = await params

  try {
    const { SINGLE_QUESTION_DATA } = await getQuestionsSinglePageData(questionId)

    if (!SINGLE_QUESTION_DATA.question) {
      notFound()
    }

    return (
      <main>
        <SingleQuestion {...SINGLE_QUESTION_DATA} />
      </main>
    )
  } catch {
    notFound()
  }
}
