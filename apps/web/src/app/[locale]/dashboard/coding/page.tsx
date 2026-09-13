import { getDashboardData } from '@/parsers/getDashboardData'
import { LangProps } from '@/types/lang'
import { Metadata } from 'next'

type PageProps = {
  params: Promise<{ locale: LangProps }>
}

export const metadata: Metadata = {
  title: 'Coding',
}

export default async function CodingPage({ params }: PageProps) {
  const { locale } = await params
  const { WELCOME_SECTION_DATA } = await getDashboardData()

  return <main className="dashboard-container">x</main>
}
