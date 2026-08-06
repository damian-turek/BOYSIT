import { Suspense } from 'react'

import { Metadata } from 'next'

import { JobTracker } from '@/components/organisms/JobTracker'

export const metadata: Metadata = {
  title: 'Job tracker',
}

export default function JobTrackerPage() {
  return (
    <main className="dashboard-container max-w-[1040px]">
      <Suspense fallback={<div className="h-96 animate-pulse rounded-xl bg-gray-60/5" />}>
        <JobTracker />
      </Suspense>
    </main>
  )
}
