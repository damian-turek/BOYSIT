import { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { getQuestionData, getQuestionSlugs } from '@/parsers/getQuestionData'

import { QuestionDetail } from '@/components/organisms/QuestionDetail'

type PageProps = {
  params: Promise<{
    locale: string
    questionId: string
  }>
}

export const generateStaticParams = () =>
  getQuestionSlugs().flatMap((questionId) => [
    { locale: 'en', questionId },
    { locale: 'pl', questionId },
  ])

export const generateMetadata = async ({ params }: PageProps): Promise<Metadata> => {
  const { questionId } = await params
  const data = getQuestionData(questionId)

  if (!data) {
    return { title: 'Question not found' }
  }

  return {
    title: `${data.question.text} | Questions`,
    description: `${data.question.grade} ${data.question.domain} interview question from ${data.question.company}.`,
  }
}

export default async function QuestionPage({ params }: PageProps) {
  const { questionId } = await params
  const data = getQuestionData(questionId)

  if (!data) notFound()

  return <QuestionDetail {...data} />
}
