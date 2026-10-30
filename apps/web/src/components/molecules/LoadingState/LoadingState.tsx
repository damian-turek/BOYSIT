import type { ReactNode } from 'react'

import { cn } from '@/utils/cn'

type LoadingStateProps = {
  label: string
  children: ReactNode
  className?: string
}

export const LoadingState = ({ label, children, className }: LoadingStateProps) => (
  <div
    role="status"
    aria-live="polite"
    aria-atomic="true"
    data-slot="loading-state"
    className={cn('space-y-5', className)}
  >
    <p className="flex items-center gap-2.5 body-small text-gray-60">
      <span
        aria-hidden="true"
        className="size-4 shrink-0 rounded-full border-2 border-gray-10 border-t-primary motion-safe:animate-spin"
      />
      {label}
    </p>
    <div aria-hidden="true">{children}</div>
  </div>
)
