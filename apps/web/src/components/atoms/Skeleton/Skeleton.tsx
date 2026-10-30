import { cn } from '@/utils/cn'

export const Skeleton = ({ className }: { className?: string }) => (
  <div
    aria-hidden="true"
    data-slot="skeleton"
    className={cn('h-4 rounded-md bg-gray-10 motion-safe:animate-pulse', className)}
  />
)
