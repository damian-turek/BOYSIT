import { getQuestionsPageData } from '@/parsers/getQuestionsPageData'
import { LangProps } from '@/types/lang'
import { Metadata } from 'next'

import { DesktopFilters, Search } from '@/components/organisms/Filters'
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
  const { QUESTIONS_DATA, dbCategories, dbTechnologies } = await getQuestionsPageData(filters)

  return (
    <>
      <Search categories={dbCategories} technologies={dbTechnologies} />
      <main className="dashboard-container">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <DesktopFilters categories={dbCategories} technologies={dbTechnologies} />

          <div className="flex-1 w-full">
            <Questions {...QUESTIONS_DATA} />
          </div>
        </div>
      </main>
    </>
  )
}
