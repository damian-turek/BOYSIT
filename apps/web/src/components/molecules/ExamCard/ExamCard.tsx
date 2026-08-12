'use client'

import type { LucideIcon } from 'lucide-react'
import { Clock3, Gauge, LoaderCircle, LockKeyhole, Play, ShieldCheck } from 'lucide-react'
import { motion } from 'motion/react'

import { cn } from '@/utils/cn'

import { Button } from '@/components/atoms/Button'
import { Tag } from '@/components/atoms/Tag'

export type ExamCardTone = 'blue' | 'purple' | 'amber' | 'green'

export type ExamCardProps = {
  title: string
  description: string
  accessLabel: string
  questionPoolLabel: string
  questionCountLabel: string
  durationLabel: string
  difficultyLabel: string
  actionLabel: string
  topics: string[]
  availabilityLabel?: string
  icon: LucideIcon
  tone: ExamCardTone
  isLocked: boolean
  isBusy?: boolean
  onStart: () => void
}

const toneClassNames: Record<
  ExamCardTone,
  { icon: string; iconBackground: string; border: string }
> = {
  blue: {
    icon: 'text-[#2563EB] dark:text-[#93C5FD]',
    iconBackground: 'bg-[#DBEAFE] dark:bg-[#2563EB]/25',
    border: 'hover:border-[#93C5FD] dark:hover:border-[#60A5FA]/45',
  },
  purple: {
    icon: 'text-[#7C3AED] dark:text-[#C4B5FD]',
    iconBackground: 'bg-[#EDE9FE] dark:bg-[#7C3AED]/25',
    border: 'hover:border-[#C4B5FD] dark:hover:border-[#A78BFA]/45',
  },
  amber: {
    icon: 'text-[#D97706] dark:text-[#FDBA74]',
    iconBackground: 'bg-[#FEF3C7] dark:bg-[#F59E0B]/25',
    border: 'hover:border-[#FDE68A] dark:hover:border-[#FDBA74]/45',
  },
  green: {
    icon: 'text-[#059669] dark:text-[#6EE7B7]',
    iconBackground: 'bg-[#D1FAE5] dark:bg-[#10B981]/25',
    border: 'hover:border-[#A7F3D0] dark:hover:border-[#6EE7B7]/45',
  },
}

export const ExamCard = ({
  title,
  description,
  accessLabel,
  questionPoolLabel,
  questionCountLabel,
  durationLabel,
  difficultyLabel,
  actionLabel,
  topics,
  availabilityLabel,
  icon: Icon,
  tone,
  isLocked,
  isBusy = false,
  onStart,
}: ExamCardProps) => {
  const toneClasses = toneClassNames[tone]

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={isLocked ? undefined : { y: -3 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      aria-busy={isBusy}
      className={cn(
        'relative flex h-full flex-col overflow-hidden rounded-xl border border-[var(--color-gray-10)] bg-gray-05 p-5 transition-colors',
        toneClasses.border,
        isLocked && 'opacity-80',
      )}
    >
      {isLocked && (
        <span className="absolute right-4 top-4 flex size-8 items-center justify-center rounded-xl bg-gray-60/10 text-gray-60">
          <LockKeyhole size={15} aria-hidden="true" />
        </span>
      )}

      <div className="mb-4 flex items-start gap-3 pr-9">
        <span
          className={cn(
            'flex size-11 shrink-0 items-center justify-center rounded-xl',
            toneClasses.iconBackground,
          )}
        >
          <Icon size={20} className={toneClasses.icon} aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <div className="mb-1.5 flex flex-wrap items-center gap-2">
            <h2 className="text-[17px] leading-6 font-bold text-gray-100">{title}</h2>
            <Tag
              text={accessLabel}
              className={cn(
                'rounded-md px-2 py-0.5',
                isLocked
                  ? 'border-gray-60/20 bg-gray-60/10 text-gray-60'
                  : 'border-primary/25 bg-primary/10 text-primary',
              )}
            />
          </div>
          <p className="body-medium text-gray-60">{description}</p>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-3 gap-2 rounded-xl border border-[var(--color-gray-10)] bg-white/60 p-3 dark:bg-white/5">
        <ExamMeta icon={ShieldCheck} label={questionCountLabel} />
        <ExamMeta icon={Clock3} label={durationLabel} />
        <ExamMeta icon={Gauge} label={difficultyLabel} />
      </div>

      <p className="mb-3 inline-flex w-fit items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/5 px-2.5 py-1 body-small font-semibold text-primary">
        <ShieldCheck size={13} aria-hidden="true" />
        {questionPoolLabel}
      </p>

      <div className="mb-5 flex flex-wrap gap-1.5">
        {topics.map((topic) => (
          <Tag
            key={topic}
            text={topic}
            className="rounded-lg border-gray-60/20 bg-white px-2.5 py-1 text-gray-60 dark:bg-white/5"
          />
        ))}
      </div>

      {availabilityLabel && (
        <p className="mb-3 body-small font-medium text-gray-60">{availabilityLabel}</p>
      )}

      <Button
        className="mt-auto w-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        variant={isLocked ? 'secondary' : 'primary'}
        icon={isBusy ? LoaderCircle : isLocked ? LockKeyhole : Play}
        disabled={isLocked || isBusy}
        onClick={onStart}
      >
        {actionLabel}
      </Button>
    </motion.article>
  )
}

const ExamMeta = ({ icon: Icon, label }: { icon: LucideIcon; label: string }) => (
  <span className="flex min-w-0 flex-col items-center gap-1 text-center body-small text-gray-60">
    <Icon size={14} aria-hidden="true" />
    <span className="line-clamp-2">{label}</span>
  </span>
)
