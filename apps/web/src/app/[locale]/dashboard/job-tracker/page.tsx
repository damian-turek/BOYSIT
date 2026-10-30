import { Suspense } from 'react'

import { Metadata } from 'next'
import { useTranslations } from 'next-intl'

import { LoadingState } from '@/components/molecules/LoadingState'
import { JobTracker } from '@/components/organisms/JobTracker'
import { JobTrackerSkeleton } from '@/components/organisms/PageLoading/PageSkeletons'

export const metadata: Metadata = {
  title: 'Job tracker',
}

export default function JobTrackerPage() {
  const t = useTranslations('Loading')

  return (
    <main className="dashboard-container max-w-[1040px]">
      <Suspense
        fallback={
          <LoadingState label={t('jobTracker')}>
            <JobTrackerSkeleton />
          </LoadingState>
        }
      >
        <JobTracker />
      </Suspense>
    </main>
  )
}
