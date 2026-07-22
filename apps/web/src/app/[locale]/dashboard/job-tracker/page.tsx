import { Metadata } from 'next'

import { JobTracker } from '@/components/organisms/JobTracker'

export const metadata: Metadata = {
  title: 'Job tracker',
}

export default function JobTrackerPage() {
  return (
    <main className="dashboard-container max-w-[1040px]">
      <JobTracker />
    </main>
  )
}
