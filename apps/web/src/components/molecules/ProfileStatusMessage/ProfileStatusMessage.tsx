import { CheckCircle2, CircleAlert } from 'lucide-react'

import { cn } from '@/utils/cn'

type ProfileStatusMessageProps = {
  message?: string
  tone?: 'success' | 'info'
}

export const ProfileStatusMessage = ({
  message,
  tone = 'info',
}: ProfileStatusMessageProps) => {
  if (!message) return null

  const Icon = tone === 'success' ? CheckCircle2 : CircleAlert

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'flex items-start gap-2 rounded-xl border px-3 py-2.5 body-small',
        tone === 'success' &&
          'border-success-50/25 bg-success-50/10 text-success-100',
        tone === 'info' &&
          'border-primary/20 bg-primary/5 text-gray-60',
      )}
    >
      <Icon size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
      {message}
    </div>
  )
}
