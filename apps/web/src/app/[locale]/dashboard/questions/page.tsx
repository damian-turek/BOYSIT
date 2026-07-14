import { getQuestionsPageData } from '@/parsers/getQuestionsPageData'
import { LangProps } from '@/types/lang'
import { Metadata } from 'next'

import { Search } from '@/components/organisms/Filters'
import { Questions } from '@/components/organisms/Questions'

type PageProps = {
  params: Promise<{ locale: LangProps }>
  searchParams: Promise<{ [key: string]: string | undefined }>
}

export const metadata: Metadata = {
  title: 'Questions',
  description:
    'Browse and filter technical interview questions by level, category, and technology.',
}

export default async function QuestionsPage({ params, searchParams }: PageProps) {
  const filters = await searchParams
  const { QUESTIONS_DATA } = await getQuestionsPageData(filters)

  return (
    <>
      <Search />
      <main className="dashboard-container">
        <Questions {...QUESTIONS_DATA} />
      </main>
    </>
  )
}
