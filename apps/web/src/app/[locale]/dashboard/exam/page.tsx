import type { Metadata } from 'next'

import { ExamHub } from '@/components/organisms/ExamHub'

export const metadata: Metadata = {
  title: 'Exam simulator',
}

export default function ExamPage() {
  return (
    <main className="dashboard-container max-w-[1120px]">
      <ExamHub />
    </main>
  )
}
