import { getDashboardData } from '@/parsers/getDashboardData'
import { LangProps } from '@/types/lang'

import { WelcomeSection } from '@/components/organisms/WelcomeSection'

type PageProps = {
  params: Promise<{ locale: LangProps }>
}
export default async function CodingPage({ params }: PageProps) {
  const { locale } = await params
  const { WELCOME_SECTION_DATA } = getDashboardData()

  return <main className="dashboard-container">x</main>
}
