import { Skeleton } from '@/components/atoms/Skeleton'

const TextLines = ({ count = 3 }: { count?: number }) => (
  <div className="space-y-2.5">
    {Array.from({ length: count }, (_, index) => (
      <Skeleton key={index} className="h-3.5 w-full last:w-4/5" />
    ))}
  </div>
)

const PageHeading = ({ action = false }: { action?: boolean }) => (
  <div className="flex flex-wrap items-start justify-between gap-4">
    <div className="w-full max-w-md space-y-3">
      <Skeleton className="h-8 w-2/3" />
      <Skeleton className="w-full" />
    </div>
    {action && <Skeleton className="h-11 w-36 rounded-xl" />}
  </div>
)

const ListSkeleton = ({ rows = 3 }: { rows?: number }) => (
  <div className="surface-card p-5">
    <Skeleton className="mb-5 h-5 w-36" />
    <div className="divide-y divide-gray-10">
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="flex items-center gap-3 py-4 first:pt-0 last:pb-0">
          <Skeleton className="size-10 shrink-0 rounded-xl" />
          <div className="min-w-0 flex-1 space-y-2.5">
            <Skeleton className="w-4/5" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  </div>
)

export const DashboardSkeleton = () => (
  <div className="space-y-6">
    <PageHeading />
    <Skeleton className="h-11 w-full max-w-xl rounded-xl" />
    <div className="grid items-start gap-6 lg:grid-cols-[2fr_1fr]">
      <div className="space-y-6">
        <div className="surface-card space-y-5 p-5">
          <div className="flex items-center gap-3">
            <Skeleton className="size-12 rounded-xl" />
            <div className="flex-1 space-y-2.5">
              <Skeleton className="h-5 w-1/2" />
              <Skeleton className="w-3/4" />
            </div>
          </div>
          <TextLines count={2} />
          <Skeleton className="h-12 w-48 max-w-full rounded-xl" />
          <div className="flex gap-2">
            {[0, 1, 2].map((item) => (
              <Skeleton key={item} className="h-6 w-20" />
            ))}
          </div>
        </div>
        <ListSkeleton rows={3} />
        <ListSkeleton rows={3} />
      </div>
      <div className="space-y-6">
        <ListSkeleton rows={4} />
        <div className="surface-card space-y-5 p-5">
          <Skeleton className="h-5 w-32" />
          <div className="grid grid-cols-2 gap-3">
            {[0, 1, 2, 3].map((item) => (
              <Skeleton key={item} className="h-20 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
)

export const QuestionsSkeleton = () => (
  <div className="flex items-start gap-8">
    <div className="hidden w-65 shrink-0 space-y-7 lg:block">
      <Skeleton className="h-11 w-full rounded-xl" />
      {[0, 1, 2].map((group) => (
        <div key={group} className="space-y-4">
          <Skeleton className="w-24" />
          <TextLines count={4} />
        </div>
      ))}
    </div>
    <div className="min-w-0 flex-1 space-y-5">
      <PageHeading />
      <Skeleton className="h-10 w-28 rounded-xl lg:hidden" />
      {[0, 1, 2, 3].map((card) => (
        <div key={card} className="surface-card space-y-4 p-4 sm:p-5">
          <div className="flex gap-3">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-24" />
          </div>
          <div className="flex items-start gap-5">
            <div className="min-w-0 flex-1">
              <TextLines count={2} />
            </div>
            <Skeleton className="size-9 shrink-0 rounded-lg" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-24" />
          </div>
        </div>
      ))}
    </div>
  </div>
)

export const QuestionSkeleton = () => (
  <div className="space-y-6">
    <Skeleton className="h-5 w-36" />
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_14rem]">
      <div className="min-w-0 space-y-6">
        <div className="surface-panel space-y-6 p-5 sm:p-8">
          <Skeleton className="h-3 w-36" />
          <Skeleton className="h-9 w-5/6" />
          <TextLines count={2} />
          <div className="flex gap-3 border-t border-gray-10 pt-5">
            <Skeleton className="h-10 w-32 rounded-xl" />
            <Skeleton className="h-10 w-28 rounded-xl" />
          </div>
        </div>
        <div className="surface-panel space-y-6 p-5 sm:p-8">
          <Skeleton className="h-5 w-28" />
          <TextLines count={5} />
          <Skeleton className="h-36 w-full rounded-xl" />
        </div>
      </div>
      <div className="surface-card hidden space-y-6 p-5 lg:block">
        <Skeleton className="h-5 w-28" />
        <TextLines count={6} />
      </div>
    </div>
  </div>
)

export const ProfileSkeleton = () => (
  <div className="mx-auto max-w-4xl space-y-6">
    <PageHeading />
    <div className="flex gap-3 border-b border-gray-10 pb-3">
      {[0, 1, 2].map((tab) => (
        <Skeleton key={tab} className="h-9 w-24 rounded-lg" />
      ))}
    </div>
    <div className="surface-card space-y-5 p-5 sm:p-6">
      <div className="space-y-3 border-b border-gray-10 pb-4">
        <Skeleton className="h-5 w-36" />
        <Skeleton className="w-3/4" />
      </div>
      {[0, 1, 2].map((field) => (
        <div key={field} className="space-y-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-11 w-full rounded-xl" />
        </div>
      ))}
      <Skeleton className="h-10 w-32 rounded-xl" />
    </div>
    <ListSkeleton rows={2} />
  </div>
)

export const ExamCardsSkeleton = () => (
  <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
    {Array.from({ length: 6 }, (_, index) => (
      <div key={index} className="surface-card flex min-h-80 flex-col gap-5 p-5">
        <div className="flex gap-3">
          <Skeleton className="size-10 shrink-0 rounded-lg" />
          <div className="flex-1 space-y-2.5">
            <Skeleton className="h-5 w-3/4" />
            <TextLines count={2} />
          </div>
        </div>
        <div className="border-y border-gray-10 py-4">
          <TextLines count={2} />
        </div>
        <TextLines count={2} />
        <Skeleton className="mt-auto h-10 w-full rounded-xl" />
      </div>
    ))}
  </div>
)

export const ExamsSkeleton = () => (
  <div className="space-y-7">
    <PageHeading />
    <div className="surface-inset space-y-3 p-5">
      <TextLines count={2} />
    </div>
    <Skeleton className="h-8 w-40" />
    <ExamCardsSkeleton />
  </div>
)

export const ExamSessionSkeleton = () => (
  <div className="space-y-6">
    <div className="surface-card space-y-5 p-5">
      <PageHeading action />
      <Skeleton className="h-1.5 w-full rounded-full" />
    </div>
    <div className="surface-panel flex min-h-[430px] flex-col items-center justify-center gap-8 p-6 sm:p-8">
      <Skeleton className="h-6 w-24" />
      <div className="w-full max-w-lg">
        <TextLines count={3} />
      </div>
      <Skeleton className="h-11 w-36 rounded-xl" />
    </div>
    <div className="grid grid-cols-3 gap-3">
      {[0, 1, 2].map((action) => (
        <Skeleton key={action} className="h-12 rounded-xl" />
      ))}
    </div>
  </div>
)

export const ExamResultsSkeleton = () => (
  <div className="space-y-6">
    <div className="surface-card p-6">
      <PageHeading action />
    </div>
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {[0, 1, 2, 3].map((stat) => (
        <Skeleton key={stat} className="h-24 rounded-2xl" />
      ))}
    </div>
    <ListSkeleton rows={4} />
  </div>
)

export const JobCardsSkeleton = () => (
  <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
    {Array.from({ length: 4 }, (_, index) => (
      <div key={index} className="surface-card space-y-5 p-5">
        <div className="flex items-center gap-3">
          <Skeleton className="size-10 shrink-0 rounded-xl" />
          <div className="flex-1 space-y-2.5">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="w-1/2" />
          </div>
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-7 w-24" />
          <Skeleton className="h-7 w-20" />
        </div>
        <TextLines count={2} />
        <Skeleton className="h-16 w-full rounded-xl" />
        <Skeleton className="w-32" />
      </div>
    ))}
  </div>
)

export const JobStatsSkeleton = () => (
  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
    {Array.from({ length: 6 }, (_, index) => (
      <Skeleton key={index} className="h-[86px] rounded-2xl" />
    ))}
  </div>
)

export const JobTrackerSkeleton = () => (
  <div className="space-y-6">
    <PageHeading action />
    <JobStatsSkeleton />
    <div className="grid gap-3 lg:grid-cols-[1fr_170px_190px]">
      {[0, 1, 2].map((field) => (
        <Skeleton key={field} className="h-11 rounded-xl" />
      ))}
    </div>
    <JobCardsSkeleton />
  </div>
)
