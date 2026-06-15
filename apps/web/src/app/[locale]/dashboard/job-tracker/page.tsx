import { getDashboardData } from '@/parsers/getDashboardData'
import { LangProps } from '@/types/lang'
import { Metadata } from 'next'

type PageProps = {
  params: Promise<{ locale: LangProps }>
}

export const metadata: Metadata = {
  title: 'Job tracker',
}

export default async function JobTrackerPage({ params }: PageProps) {
  const { locale } = await params
  const { WELCOME_SECTION_DATA } = getDashboardData()

  return <main className="dashboard-container">x</main>
}
