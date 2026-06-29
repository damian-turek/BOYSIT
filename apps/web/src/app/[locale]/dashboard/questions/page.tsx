import { Suspense } from 'react'
import { getHomePageData } from '@/parsers/getQuestionsPageData'
import { LangProps } from '@/types/lang'
import { Metadata } from 'next'

import { Search } from '@/components/organisms/Filters'
import { Questions } from '@/components/organisms/Questions'
import { SidebarFilters } from '@/components/organisms/Filters/SidebarFilters'

type PageProps = {
  params: Promise<{ locale: LangProps }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export const metadata: Metadata = {
  title: 'Questions',
}

export default async function QuestionsPage({ params, searchParams }: PageProps) {
  const { QUESTIONS_DATA } = getHomePageData()
  const resolvedSearchParams = await searchParams

  const selectedSeniority = resolvedSearchParams.seniority as string | undefined
  const selectedDomains = typeof resolvedSearchParams.domain === 'string'
    ? [resolvedSearchParams.domain]
    : (resolvedSearchParams.domain || [])
  const selectedCompanies = typeof resolvedSearchParams.company === 'string'
    ? [resolvedSearchParams.company]
    : (resolvedSearchParams.company || [])

  const filteredQuestions = QUESTIONS_DATA.questions.filter((q) => {
    const matchSeniority = !selectedSeniority || selectedSeniority === 'All levels' || q.level === selectedSeniority
    const matchDomain = selectedDomains.length === 0 || selectedDomains.includes(q.category.name)
    const matchCompany = selectedCompanies.length === 0 || (q.company && selectedCompanies.includes(q.company))

    return matchSeniority && matchDomain && matchCompany
  })

  const filteredData = {
    ...QUESTIONS_DATA,
    questions: filteredQuestions,
    questionsCount: filteredQuestions.length
  }

  return (
    <>
      <Search />
      
      <main className="dashboard-container">
        <div className="flex items-start gap-8 w-full mt-40 md:mt-20 relative z-0">
          
          <div className="hidden md:block shrink-0 w-[240px]">
            <Suspense fallback={null}>
              <SidebarFilters />
            </Suspense>
          </div>

          <div className="flex-1 min-w-0">
            <Questions {...filteredData} />
          </div>

        </div>
      </main>
    </>
  )
}