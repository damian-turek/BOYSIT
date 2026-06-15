import { getDashboardData } from '@/parsers/getDashboardData'
import { LangProps } from '@/types/lang'
import { Metadata } from 'next'

type PageProps = {
  params: Promise<{ locale: LangProps }>
}

export const metadata: Metadata = {
  title: 'Profile',
}

export default async function ProfiledPage({ params }: PageProps) {
  const { locale } = await params
  const { WELCOME_SECTION_DATA } = getDashboardData()

  return <main className="dashboard-container">x</main>
}
