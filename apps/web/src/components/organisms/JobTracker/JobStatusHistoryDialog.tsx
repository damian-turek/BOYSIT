'use client'

import { useEffect, useId, useState } from 'react'

import { fetchJobApplicationStatusEvents } from '@/services/jobTrackerApi'
import type { JobApplication, JobApplicationStatusEvent } from '@/types/job-tracker'
import { History, X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useLocale, useTranslations } from 'next-intl'

import { Button } from '@/components/atoms/Button'

type JobStatusHistoryDialogProps = {
  application: JobApplication | null
  onClose: () => void
}

export const JobStatusHistoryDialog = ({ application, onClose }: JobStatusHistoryDialogProps) => {
  const t = useTranslations('JobTracker')
  const locale = useLocale()
  const titleId = useId()
  const [events, setEvents] = useState<JobApplicationStatusEvent[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(false)

  const loadPage = async (nextPage: number, signal?: AbortSignal) => {
    if (!application) return

    setIsLoading(true)
    setError(false)

    try {
      const result = await fetchJobApplicationStatusEvents(application.id, nextPage, signal)
      setEvents((current) => (nextPage === 1 ? result.data : [...current, ...result.data]))
      setPage(result.meta.page)
      setTotalPages(result.meta.totalPages)
    } catch (requestError) {
      if (requestError instanceof DOMException && requestError.name === 'AbortError') return
      setError(true)
    } finally {
      if (!signal?.aborted) setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!application) return

    const controller = new AbortController()
    setEvents([])
    setPage(1)
    setTotalPages(1)
    void loadPage(1, controller.signal)

    return () => controller.abort()
    // loadPage intentionally follows the selected application lifecycle.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [application])

  useEffect(() => {
    if (!application) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [application, onClose])

  const formatDate = (value: string) =>
    new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(
      new Date(value),
    )

  return (
    <AnimatePresence>
      {application && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              className="w-full max-w-lg rounded-xl border border-[var(--color-gray-10)] bg-white p-5 shadow-2xl dark:bg-[var(--color-gray-05)]"
            >
              <div className="mb-5 flex items-start justify-between gap-4">
                <div className="flex gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <History size={20} aria-hidden="true" />
                  </span>
                  <div>
                    <h2 id={titleId} className="body-large text-gray-100">
                      {t('history.title')}
                    </h2>
                    <p className="body-small text-gray-60">
                      {t('history.description', {
                        role: application.role,
                        company: application.company,
                      })}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="text"
                  icon={X}
                  iconOnly
                  aria-label={t('modal.close')}
                  onClick={onClose}
                />
              </div>

              <div className="max-h-[55vh] space-y-3 overflow-y-auto pr-1">
                {events.map((event) => (
                  <div key={event.id} className="relative border-l-2 border-primary/25 py-1 pl-4">
                    <span className="absolute -left-[5px] top-2 size-2 rounded-full bg-primary" />
                    <p className="body-medium text-gray-100">
                      {event.fromStatus
                        ? t('history.changed', {
                            from: t(`statuses.${event.fromStatus}`),
                            to: t(`statuses.${event.toStatus}`),
                          })
                        : t('history.created', { status: t(`statuses.${event.toStatus}`) })}
                    </p>
                    <p className="body-small text-gray-60">{formatDate(event.createdAt)}</p>
                  </div>
                ))}

                {!isLoading && !error && events.length === 0 && (
                  <p className="body-medium text-gray-60">{t('history.empty')}</p>
                )}

                {isLoading && <p className="body-medium text-gray-60">{t('history.loading')}</p>}
                {error && (
                  <div role="alert">
                    <p className="body-medium text-alert-50">{t('history.error')}</p>
                    <Button
                      variant="text"
                      onClick={() => void loadPage(events.length ? page + 1 : 1)}
                    >
                      {t('retry')}
                    </Button>
                  </div>
                )}
              </div>

              <div className="mt-5 flex justify-end gap-2">
                {page < totalPages && (
                  <Button
                    variant="secondary"
                    disabled={isLoading}
                    onClick={() => void loadPage(page + 1)}
                  >
                    {t('history.loadMore')}
                  </Button>
                )}
                <Button onClick={onClose}>{t('history.close')}</Button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
