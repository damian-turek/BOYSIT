import type { Metadata } from 'next'

import { ExamSession } from '@/components/organisms/ExamSession'

export const metadata: Metadata = {
  title: 'Exam session',
}

type ExamSessionPageProps = {
  params: Promise<{ sessionId: string }>
}

export default async function ExamSessionPage({ params }: ExamSessionPageProps) {
  const { sessionId } = await params

  return (
    <main className="dashboard-container max-w-[1180px]">
      <ExamSession sessionId={sessionId} />
    </main>
  )
}
