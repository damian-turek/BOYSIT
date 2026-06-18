import { getHomePageData } from '@/parsers/getQuestionsPageData'
import { LangProps } from '@/types/lang'
import { Metadata } from 'next'

import { Search } from '@/components/organisms/Filters'
import { Questions } from '@/components/organisms/Questions'

type PageProps = {
  params: Promise<{ locale: LangProps }>
}

export const metadata: Metadata = {
  title: 'Questions',
}

export default async function QuestionsPage({ params }: PageProps) {
  const { QUESTIONS_DATA } = getHomePageData()

  return (
    <>
      <Search />
      <main className="dashboard-container">
        <Questions {...QUESTIONS_DATA} />
      </main>
    </>
  )
}
