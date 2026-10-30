'use client'

import type { LucideIcon } from 'lucide-react'
import { Gauge, Layers3, LoaderCircle, LockKeyhole, Play, ShieldCheck } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'

import { cn } from '@/utils/cn'

import { Button } from '@/components/atoms/Button'

export type ExamCardTone = 'blue' | 'purple' | 'amber' | 'green'

export type ExamCardProps = {
  title: string
  description: string
  accessLabel: string
  questionPoolLabel: string
  questionCountLabel: string
  cardCountLabel: string
  cardCountOptions: number[]
  selectedCardCount: number
  difficultyLabel: string
  actionLabel: string
  topics: string[]
  icon: LucideIcon
  tone: ExamCardTone
  isLocked: boolean
  isBusy?: boolean
  onCardCountChange: (count: number) => void
  onStart: () => void
}

const toneClassNames: Record<ExamCardTone, { icon: string; iconBackground: string }> = {
  blue: {
    icon: 'text-[#2563EB] dark:text-[#93C5FD]',
    iconBackground: 'bg-[#DBEAFE] dark:bg-[#2563EB]/25',
  },
  purple: {
    icon: 'text-[#7C3AED] dark:text-[#C4B5FD]',
    iconBackground: 'bg-[#EDE9FE] dark:bg-[#7C3AED]/25',
  },
  amber: {
    icon: 'text-[#D97706] dark:text-[#FDBA74]',
    iconBackground: 'bg-[#FEF3C7] dark:bg-[#F59E0B]/25',
  },
  green: {
    icon: 'text-[#059669] dark:text-[#6EE7B7]',
    iconBackground: 'bg-[#D1FAE5] dark:bg-[#10B981]/25',
  },
}

export const ExamCard = ({
  title,
  description,
  accessLabel,
  questionPoolLabel,
  questionCountLabel,
  cardCountLabel,
  cardCountOptions,
  selectedCardCount,
  difficultyLabel,
  actionLabel,
  topics,
  icon: Icon,
  tone,
  isLocked,
  isBusy = false,
  onCardCountChange,
  onStart,
}: ExamCardProps) => {
  const toneClasses = toneClassNames[tone]
  const reduceMotion = useReducedMotion()

  return (
    <motion.article
      layout={!reduceMotion}
      initial={reduceMotion ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      aria-busy={isBusy}
      className={cn('surface-card relative flex h-full flex-col p-5')}
    >
      <div className="mb-4 flex items-start gap-3">
        <span
          className={cn(
            'flex size-10 shrink-0 items-center justify-center rounded-lg',
            toneClasses.iconBackground,
          )}
        >
          <Icon size={19} className={toneClasses.icon} aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-[17px] leading-6 font-bold text-gray-100">{title}</h2>
            <span
              className={cn(
                'inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-0.5 body-small font-semibold',
                isLocked ? 'bg-gray-60/10 text-gray-60' : 'bg-primary/10 text-primary',
              )}
            >
              {isLocked && <LockKeyhole size={12} aria-hidden="true" />}
              {accessLabel}
            </span>
          </div>
          <p className="mt-1 line-clamp-3 body-medium text-gray-60">{description}</p>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-y border-[var(--color-gray-10)] py-3">
        <ExamMeta icon={ShieldCheck} label={questionCountLabel} />
        <ExamMeta icon={Gauge} label={difficultyLabel} />
      </div>

      {cardCountOptions.length > 1 && !isLocked && (
        <label className="mb-4 flex items-center justify-between gap-3 body-small font-semibold text-gray-100">
          <span className="inline-flex items-center gap-1.5">
            <Layers3 size={14} className="text-primary" aria-hidden="true" />
            {cardCountLabel}
          </span>
          <select
            value={selectedCardCount}
            disabled={isBusy}
            onChange={(event) => onCardCountChange(Number(event.target.value))}
            className="field-control min-h-10 px-3 py-1.5 body-small"
          >
            {cardCountOptions.map((count) => (
              <option key={count} value={count}>
                {count}
              </option>
            ))}
          </select>
        </label>
      )}

      <div className="mb-5 space-y-1.5 body-small">
        <p className="flex items-center gap-1.5 font-semibold text-primary">
          <ShieldCheck size={13} aria-hidden="true" />
          {questionPoolLabel}
        </p>
        <p className="line-clamp-2 text-gray-60">{topics.join(' · ')}</p>
      </div>

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
  <span className="inline-flex min-w-0 items-center gap-1.5 body-small text-gray-60">
    <Icon size={14} aria-hidden="true" />
    <span>{label}</span>
  </span>
)
