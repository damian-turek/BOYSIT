import { Metadata } from 'next'

import { getQuestionsData } from '@/parsers/getQuestionData'

import { QuestionsBrowse } from '@/components/organisms/QuestionsBrowse'

export const metadata: Metadata = {
  title: 'Questions',
  description: 'Browse and filter technical interview questions by level, domain, and company.',
}

export default function QuestionsPage() {
  return <QuestionsBrowse questions={getQuestionsData()} />
}
