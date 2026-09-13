import { Suspense } from 'react'

import { Metadata } from 'next'

import { ExamExperience } from '@/components/organisms/ExamExperience'

export const metadata: Metadata = {
  title: 'Exam',
}

export default function ExamPage() {
  return (
    <main className="dashboard-container max-w-[840px]">
      <Suspense fallback={<div className="h-96 animate-pulse rounded-xl bg-gray-60/5" />}>
        <ExamExperience />
      </Suspense>
    </main>
  )
}
