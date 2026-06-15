import { getDashboardData } from '@/parsers/getDashboardData'
import { Metadata } from 'next'

import { DashboardContent } from '@/components/organisms/DashboardContent'
import { WelcomeSection } from '@/components/organisms/WelcomeSection'

export const metadata: Metadata = {
  title: 'Dashboard',
}

export default async function DashboardPage() {
  const { WELCOME_SECTION_DATA, DASHBOARD_CONTENT_DATA } = getDashboardData()

  return (
    <main className="dashboard-container flex flex-col gap-6">
      <WelcomeSection {...WELCOME_SECTION_DATA} />
      <DashboardContent {...DASHBOARD_CONTENT_DATA} />
    </main>
  )
}
