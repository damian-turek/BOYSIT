import { Metadata } from 'next'

import { JobTracker } from '@/components/organisms/JobTracker'

export const metadata: Metadata = {
  title: 'Job tracker',
}

export default function JobTrackerPage() {
  return <JobTracker />
}
