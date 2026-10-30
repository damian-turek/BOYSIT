import { useTranslations } from 'next-intl'

import { cn } from '@/utils/cn'

import { LoadingState } from '@/components/molecules/LoadingState'

import {
  DashboardSkeleton,
  ExamSessionSkeleton,
  ExamsSkeleton,
  JobTrackerSkeleton,
  ProfileSkeleton,
  QuestionSkeleton,
  QuestionsSkeleton,
} from './PageSkeletons'

const skeletons = {
  dashboard: DashboardSkeleton,
  questions: QuestionsSkeleton,
  question: QuestionSkeleton,
  profile: ProfileSkeleton,
  exams: ExamsSkeleton,
  examSession: ExamSessionSkeleton,
  jobTracker: JobTrackerSkeleton,
}

type PageLoadingProps = {
  page: keyof typeof skeletons
}

export const PageLoading = ({ page }: PageLoadingProps) => {
  const t = useTranslations('Loading')
  const Content = skeletons[page]

  return (
    <main
      className={cn(
        'dashboard-container',
        page === 'exams' && 'max-w-[1120px]',
        page === 'examSession' && 'max-w-[1180px]',
        page === 'jobTracker' && 'max-w-[1040px]',
      )}
    >
      <LoadingState label={t(page)}>
        <Content />
      </LoadingState>
    </main>
  )
}
