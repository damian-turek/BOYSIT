import { useEffect, useRef, useState } from 'react'

import { JOB_APPLICATION_STATUSES, JOB_STATUS_CONFIG } from '@/constants/job-tracker'
import type { JobApplication, JobApplicationStatus } from '@/types/job-tracker'
import {
  CalendarDays,
  ChevronDown,
  CircleDollarSign,
  ExternalLink,
  History,
  MapPin,
  Pencil,
  Sparkles,
  Trash2,
} from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useLocale, useTranslations } from 'next-intl'

import { cn } from '@/utils/cn'

import { Tag } from '@/components/atoms/Tag'

type JobApplicationCardProps = {
  application: JobApplication
  onEdit: (application: JobApplication) => void
  onDelete: (applicationId: string) => void
  onHistory: (application: JobApplication) => void
  onStatusChange: (applicationId: string, status: JobApplicationStatus) => void
  isStatusUpdating?: boolean
}

type FollowUpTiming = 'overdue' | 'today' | 'upcoming' | 'inactive'

const getFollowUpTiming = (application: JobApplication, now = new Date()): FollowUpTiming => {
  if (application.status === 'offer' || application.status === 'rejected') return 'inactive'

  const followUpTime = new Date(application.followUpAt ?? '').getTime()
  if (Number.isNaN(followUpTime)) return 'inactive'

  const startOfToday = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  const startOfTomorrow = startOfToday + 24 * 60 * 60 * 1_000

  if (followUpTime < startOfToday) return 'overdue'
  if (followUpTime < startOfTomorrow) return 'today'

  return 'upcoming'
}

const getInitials = (company: string) =>
  company
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()

export const JobApplicationCard = ({
  application,
  onEdit,
  onDelete,
  onHistory,
  onStatusChange,
  isStatusUpdating = false,
}: JobApplicationCardProps) => {
  const t = useTranslations('JobTracker')
  const locale = useLocale()
  const [isStatusOpen, setIsStatusOpen] = useState(false)
  const statusRef = useRef<HTMLDivElement>(null)
  const status = JOB_STATUS_CONFIG[application.status]
  const followUpTiming = application.followUpAt ? getFollowUpTiming(application) : undefined
  const technologies = [
    ...application.technologies.map((technology) => technology.name),
    ...application.customTechnologies,
  ].filter(
    (technology, index, values) =>
      values.findIndex((value) => value.toLowerCase() === technology.toLowerCase()) === index,
  )

  const formatDate = (value: string) =>
    new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeZone: 'UTC' }).format(
      new Date(value),
    )

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!statusRef.current?.contains(event.target as Node)) {
        setIsStatusOpen(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)

    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [])

  return (
    <article className="surface-card flex h-full flex-col p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex min-w-0 gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 font-mono text-[14px] leading-5 font-bold text-primary">
            {getInitials(application.company)}
          </span>
          <div className="min-w-0">
            <h2 className="truncate text-[16px] leading-5 font-bold text-gray-100">
              {application.role}
            </h2>
            <p className="body-medium truncate text-gray-60">{application.company}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            className="icon-control hover:text-primary"
            aria-label={t('card.editJob')}
            onClick={() => onEdit(application)}
          >
            <Pencil size={15} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="icon-control hover:text-alert-50"
            aria-label={t('card.deleteJob')}
            onClick={() => onDelete(application.id)}
          >
            <Trash2 size={15} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2 body-small text-gray-60">
        <div ref={statusRef} className="relative">
          <button
            type="button"
            className={cn(
              'inline-flex min-h-10 items-center gap-1.5 rounded-lg border px-2 py-1 font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
              status.className,
            )}
            aria-expanded={isStatusOpen}
            aria-label={t('card.changeStatus')}
            disabled={isStatusUpdating}
            onClick={() => setIsStatusOpen((current) => !current)}
          >
            <span className={`size-1.5 rounded-full ${status.dotClassName}`} />
            {t(`statuses.${application.status}`)}
            <ChevronDown
              size={12}
              aria-hidden="true"
              className={cn('transition-transform', isStatusOpen ? 'rotate-180' : '')}
            />
          </button>

          <AnimatePresence initial={false}>
            {isStatusOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                className="surface-popover absolute left-0 top-full z-20 mt-2 w-44 overflow-hidden"
              >
                <div className="p-1">
                  {JOB_APPLICATION_STATUSES.map((statusId) => {
                    const statusConfig = JOB_STATUS_CONFIG[statusId]
                    const isSelected = statusId === application.status

                    return (
                      <button
                        key={statusId}
                        type="button"
                        className={cn(
                          'flex min-h-10 w-full items-center gap-2 rounded-lg px-2.5 py-2 body-small font-semibold text-gray-60 transition-colors hover:bg-surface-hover hover:text-gray-100 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary',
                          isSelected ? 'bg-gray-05 text-gray-100' : '',
                        )}
                        onClick={() => {
                          onStatusChange(application.id, statusId)
                          setIsStatusOpen(false)
                        }}
                      >
                        <span className={`size-1.5 rounded-full ${statusConfig.dotClassName}`} />
                        <span className="truncate">{t(`statuses.${statusId}`)}</span>
                      </button>
                    )
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {application.location && (
          <span className="inline-flex items-center gap-1">
            <MapPin size={13} aria-hidden="true" />
            {application.location}
          </span>
        )}
        {application.salary && (
          <span className="inline-flex items-center gap-1">
            <CircleDollarSign size={13} aria-hidden="true" />
            {application.salary}
          </span>
        )}
        {application.appliedAt && (
          <span className="ml-auto inline-flex items-center gap-1">
            <CalendarDays size={13} aria-hidden="true" />
            {t('card.applied', { date: formatDate(application.appliedAt) })}
          </span>
        )}
      </div>

      {application.followUpAt && (
        <p
          className={cn(
            'mb-3 inline-flex w-fit items-center gap-1.5 rounded-lg border px-2.5 py-1 body-small font-semibold',
            followUpTiming === 'overdue' && 'border-alert-50/25 bg-alert-50/10 text-alert-100',
            followUpTiming === 'today' && 'border-warning-50/25 bg-warning-50/10 text-warning-100',
            followUpTiming === 'upcoming' && 'border-primary/25 bg-primary/10 text-primary',
            followUpTiming === 'inactive' && 'border-gray-60/20 bg-gray-60/5 text-gray-60',
          )}
        >
          <CalendarDays size={13} aria-hidden="true" />
          {followUpTiming === 'overdue'
            ? t('card.followUpOverdue', { date: formatDate(application.followUpAt) })
            : followUpTiming === 'today'
              ? t('card.followUpToday', { date: formatDate(application.followUpAt) })
              : t('card.followUp', { date: formatDate(application.followUpAt) })}
        </p>
      )}

      {application.jobUrl && (
        <a
          href={application.jobUrl}
          target="_blank"
          rel="noreferrer"
          className="mb-3 inline-flex min-w-0 items-center gap-1.5 body-small font-semibold text-primary transition-colors hover:text-primary/80"
        >
          <ExternalLink size={13} className="shrink-0" aria-hidden="true" />
          <span className="truncate">{t('card.jobPosting')}</span>
        </a>
      )}

      {technologies.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {technologies.map((technology) => (
            <Tag
              key={technology}
              text={technology}
              className="rounded-lg border-gray-60/20 bg-white text-gray-60"
            />
          ))}
        </div>
      )}

      <p className="surface-inset mb-3 min-h-[45px] overflow-hidden px-3 py-2 body-medium text-gray-60 line-clamp-2">
        {application.note || t('defaults.noNotes')}
      </p>

      <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2">
        <button
          type="button"
          className="inline-flex items-center gap-2 body-small font-semibold text-primary transition-colors hover:text-primary/80"
          onClick={() => onHistory(application)}
        >
          <History size={14} aria-hidden="true" />
          {t('card.statusHistory')}
        </button>
        <button
          type="button"
          disabled
          className="inline-flex items-center gap-2 body-small font-semibold text-gray-60 opacity-60"
          title={t('card.comingSoon')}
        >
          <Sparkles size={14} aria-hidden="true" />
          {t('card.likelyInterviewQuestions')}
          <span className="rounded-md bg-gray-60/10 px-1.5 py-0.5 text-[10px] uppercase">
            {t('card.comingSoon')}
          </span>
        </button>
      </div>
    </article>
  )
}
