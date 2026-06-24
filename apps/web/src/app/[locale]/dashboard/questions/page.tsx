import { Metadata } from 'next'

import { QuestionsBrowse } from '@/components/organisms/QuestionsBrowse'

export const metadata: Metadata = {
  title: 'Questions',
  description:
    'Browse and filter technical interview questions by level, category, and technology.',
}

export default function QuestionsPage() {
  return <QuestionsBrowse />
}
