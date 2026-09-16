'use client'

import {
  type Dispatch,
  type SetStateAction,
  useCallback,
  useEffect,
  useState,
  useTransition,
} from 'react'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import { JOB_APPLICATION_STATUSES, JOB_TRACKER_STATS } from '@/constants/job-tracker'
import {
  createJobApplication,
  deleteJobApplication,
  fetchJobApplications,
  fetchJobTechnologyOptions,
  updateJobApplication,
} from '@/services/jobTrackerApi'
import type {
  JobApplication,
  JobApplicationFollowUpFilter,
  JobApplicationInput,
  JobApplicationSort,
  JobApplicationStatus,
  JobTechnology,
  JobTrackerStats,
  PaginationMeta,
} from '@/types/job-tracker'
import {
  AlertTriangle,
  Briefcase,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  SearchX,
} from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useTranslations } from 'next-intl'

import { cn } from '@/utils/cn'

import { Button } from '@/components/atoms/Button'
import { Input } from '@/components/atoms/inputs/Input'
import { JobApplicationCard } from '@/components/molecules/JobApplicationCard'
import { JobTrackerStatCard } from '@/components/molecules/JobTrackerStatCard'

import { JobApplicationFormModal } from './JobApplicationFormModal'
import { JobStatusHistoryDialog } from './JobStatusHistoryDialog'

const PAGE_SIZE = 12

const EMPTY_STATS: JobTrackerStats = {
  wishlist: 0,
  applied: 0,
  phone_screen: 0,
  technical: 0,
  final_round: 0,
  offer: 0,
  rejected: 0,
}

const EMPTY_META: PaginationMeta = {
  page: 1,
  limit: PAGE_SIZE,
  total: 0,
  totalPages: 0,
}

const JOB_APPLICATION_SORTS: JobApplicationSort[] = [
  'updated_desc',
  'applied_desc',
  'follow_up_asc',
  'company_asc',
]

const JOB_APPLICATION_FOLLOW_UP_FILTERS: JobApplicationFollowUpFilter[] = [
  'overdue',
  'today',
  'next_7_days',
  'none',
]

const TERMINAL_JOB_APPLICATION_STATUSES: JobApplicationStatus[] = ['offer', 'rejected']

const isStatus = (value: string | null): value is JobApplicationStatus =>
  Boolean(value && JOB_APPLICATION_STATUSES.includes(value as JobApplicationStatus))

const isSort = (value: string | null): value is JobApplicationSort =>
  Boolean(value && JOB_APPLICATION_SORTS.includes(value as JobApplicationSort))

const isFollowUpFilter = (value: string | null): value is JobApplicationFollowUpFilter =>
  Boolean(
    value && JOB_APPLICATION_FOLLOW_UP_FILTERS.includes(value as JobApplicationFollowUpFilter),
  )

const parsePage = (value: string | null): number => {
  const page = Number(value)
  return Number.isInteger(page) && page > 0 ? page : 1
}

type JobTrackerNotice = {
  message: string
  tone: 'success' | 'error'
}

export const JobTracker = () => {
  const t = useTranslations('JobTracker')
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isNavigating, startTransition] = useTransition()
  const queryString = searchParams.toString()
  const search = searchParams.get('search')?.trim() ?? ''
  const statusParam = searchParams.get('status')
  const sortParam = searchParams.get('sort')
  const followUpParam = searchParams.get('followUp')
  const statusFilter = isStatus(statusParam) ? statusParam : undefined
  const sort = isSort(sortParam) ? sortParam : 'updated_desc'
  const followUpFilter = isFollowUpFilter(followUpParam) ? followUpParam : undefined
  const page = parsePage(searchParams.get('page'))

  const [searchInput, setSearchInput] = useState(search)
  const [applications, setApplications] = useState<JobApplication[]>([])
  const [stats, setStats] = useState<JobTrackerStats>(EMPTY_STATS)
  const [meta, setMeta] = useState<PaginationMeta>(EMPTY_META)
  const [technologyOptions, setTechnologyOptions] = useState<JobTechnology[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [notice, setNotice] = useState<JobTrackerNotice>()
  const [reloadKey, setReloadKey] = useState(0)
  const [formApplication, setFormApplication] = useState<JobApplication | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formError, setFormError] = useState<string>()
  const [pendingDelete, setPendingDelete] = useState<JobApplication | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [historyApplication, setHistoryApplication] = useState<JobApplication | null>(null)
  const [updatingStatusIds, setUpdatingStatusIds] = useState<Set<string>>(new Set())

  const updateQuery = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(queryString)

      for (const [key, value] of Object.entries(updates)) {
        if (value) params.set(key, value)
        else params.delete(key)
      }

      const nextQuery = params.toString()
      startTransition(() => {
        router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false })
      })
    },
    [pathname, queryString, router],
  )

  useEffect(() => {
    setSearchInput(search)
  }, [search])

  useEffect(() => {
    if (searchInput.trim() === search) return

    const timer = window.setTimeout(() => {
      updateQuery({ search: searchInput.trim() || null, page: null })
    }, 350)

    return () => window.clearTimeout(timer)
  }, [search, searchInput, updateQuery])

  useEffect(() => {
    const controller = new AbortController()
    setIsLoading(true)
    setLoadError(false)

    void fetchJobApplications(
      {
        search: search || undefined,
        status: statusFilter,
        followUp: followUpFilter,
        sort,
        page,
        limit: PAGE_SIZE,
      },
      controller.signal,
    )
      .then((result) => {
        setApplications(result.data)
        setStats(result.stats)
        setMeta(result.meta)

        if (result.meta.totalPages > 0 && page > result.meta.totalPages) {
          updateQuery({ page: String(result.meta.totalPages) })
        }
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return
        setLoadError(true)
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false)
      })

    return () => controller.abort()
  }, [followUpFilter, page, reloadKey, search, sort, statusFilter, updateQuery])

  useEffect(() => {
    const controller = new AbortController()

    void fetchJobTechnologyOptions(controller.signal)
      .then(setTechnologyOptions)
      .catch((error: unknown) => {
        if (!(error instanceof DOMException && error.name === 'AbortError')) {
          setTechnologyOptions([])
        }
      })

    return () => controller.abort()
  }, [])

  const openCreateForm = () => {
    setFormApplication(null)
    setFormError(undefined)
    setIsFormOpen(true)
  }

  const openEditForm = (application: JobApplication) => {
    setFormApplication(application)
    setFormError(undefined)
    setIsFormOpen(true)
  }

  const closeForm = () => {
    if (isSaving) return
    setIsFormOpen(false)
    setFormApplication(null)
    setFormError(undefined)
  }

  const handleSave = async (input: JobApplicationInput) => {
    setIsSaving(true)
    setFormError(undefined)

    try {
      if (formApplication) {
        await updateJobApplication(formApplication.id, input)
        setNotice({ message: t('notices.updated'), tone: 'success' })
      } else {
        await createJobApplication(input)
        setNotice({ message: t('notices.created'), tone: 'success' })
      }

      setIsFormOpen(false)
      setFormApplication(null)
      setReloadKey((current) => current + 1)
    } catch {
      setFormError(t('errors.save'))
    } finally {
      setIsSaving(false)
    }
  }

  const handleStatusChange = async (applicationId: string, nextStatus: JobApplicationStatus) => {
    const previous = applications.find((application) => application.id === applicationId)
    if (!previous || previous.status === nextStatus || updatingStatusIds.has(applicationId)) return

    setNotice(undefined)
    setUpdatingStatusIds((current) => new Set(current).add(applicationId))
    setApplications((current) =>
      current.map((application) =>
        application.id === applicationId ? { ...application, status: nextStatus } : application,
      ),
    )
    setStats((current) => ({
      ...current,
      [previous.status]: Math.max(0, current[previous.status] - 1),
      [nextStatus]: current[nextStatus] + 1,
    }))

    try {
      const updated = await updateJobApplication(applicationId, { status: nextStatus })
      setApplications((current) =>
        current.map((application) => (application.id === applicationId ? updated : application)),
      )
      setNotice({ message: t('notices.statusUpdated'), tone: 'success' })
      setReloadKey((current) => current + 1)
    } catch {
      setApplications((current) =>
        current.map((application) => (application.id === applicationId ? previous : application)),
      )
      setStats((current) => ({
        ...current,
        [previous.status]: current[previous.status] + 1,
        [nextStatus]: Math.max(0, current[nextStatus] - 1),
      }))
      setNotice({ message: t('errors.status'), tone: 'error' })
    } finally {
      setUpdatingStatusIds((current) => {
        const next = new Set(current)
        next.delete(applicationId)
        return next
      })
    }
  }

  const handleDelete = async () => {
    if (!pendingDelete || isDeleting) return

    setIsDeleting(true)

    try {
      await deleteJobApplication(pendingDelete.id)
      setNotice({ message: t('notices.deleted'), tone: 'success' })
      setPendingDelete(null)

      if (applications.length === 1 && page > 1) {
        updateQuery({ page: String(page - 1) })
      } else {
        setReloadKey((current) => current + 1)
      }
    } catch {
      setNotice({ message: t('errors.delete'), tone: 'error' })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <JobTrackerHeader onAddJob={openCreateForm} />
      <JobTrackerStats stats={stats} />
      <JobTrackerFilters
        search={searchInput}
        statusFilter={statusFilter}
        followUpFilter={followUpFilter}
        sort={sort}
        disabled={isNavigating}
        onSearchChange={setSearchInput}
        onStatusChange={(value) =>
          updateQuery({
            status: value ?? null,
            followUp:
              value && TERMINAL_JOB_APPLICATION_STATUSES.includes(value)
                ? null
                : (followUpFilter ?? null),
            page: null,
          })
        }
        onFollowUpChange={(value) =>
          updateQuery({
            followUp: value ?? null,
            status:
              value && statusFilter && TERMINAL_JOB_APPLICATION_STATUSES.includes(statusFilter)
                ? null
                : (statusFilter ?? null),
            page: null,
          })
        }
        onSortChange={(value) => updateQuery({ sort: value, page: null })}
      />

      {notice && (
        <p
          className={`mb-4 body-medium ${notice.tone === 'error' ? 'text-alert-50' : 'text-gray-60'}`}
          role={notice.tone === 'error' ? 'alert' : 'status'}
        >
          {notice.message}
        </p>
      )}

      {isLoading && applications.length === 0 ? (
        <JobApplicationsSkeleton label={t('loading')} />
      ) : loadError ? (
        <JobTrackerError onRetry={() => setReloadKey((current) => current + 1)} />
      ) : (
        <>
          <JobApplicationsGrid
            applications={applications}
            updatingStatusIds={updatingStatusIds}
            onEdit={openEditForm}
            onDelete={(id) =>
              setPendingDelete(applications.find((application) => application.id === id) ?? null)
            }
            onHistory={setHistoryApplication}
            onStatusChange={handleStatusChange}
          />
          <JobTrackerPagination
            meta={meta}
            disabled={isLoading || isNavigating}
            onPageChange={(nextPage) => updateQuery({ page: String(nextPage) })}
          />
        </>
      )}

      <JobApplicationFormModal
        isOpen={isFormOpen}
        application={formApplication}
        technologyOptions={technologyOptions}
        isSaving={isSaving}
        error={formError}
        onClose={closeForm}
        onSubmit={handleSave}
      />
      <DeleteJobDialog
        application={pendingDelete}
        isDeleting={isDeleting}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => void handleDelete()}
      />
      <JobStatusHistoryDialog
        application={historyApplication}
        onClose={() => setHistoryApplication(null)}
      />
    </>
  )
}

const JobTrackerHeader = ({ onAddJob }: { onAddJob: () => void }) => {
  const t = useTranslations('JobTracker')

  return (
    <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Briefcase size={22} aria-hidden="true" />
        </span>
        <div>
          <h1 className="text-[25px] leading-8 font-bold text-gray-100">{t('title')}</h1>
          <p className="body-medium text-gray-60">{t('description')}</p>
        </div>
      </div>
      <Button icon={Plus} size="lg" className="px-5 py-3" onClick={onAddJob}>
        {t('addJob')}
      </Button>
    </header>
  )
}

const JobTrackerStats = ({ stats }: { stats: JobTrackerStats }) => {
  const t = useTranslations('JobTracker')

  return (
    <section className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
      {JOB_TRACKER_STATS.map((status) => (
        <JobTrackerStatCard
          key={status.id}
          label={t(`statuses.${status.id}`)}
          value={stats[status.id]}
          tone={status.tone}
        />
      ))}
    </section>
  )
}

type JobTrackerFiltersProps = {
  search: string
  statusFilter?: JobApplicationStatus
  followUpFilter?: JobApplicationFollowUpFilter
  sort: JobApplicationSort
  disabled: boolean
  onSearchChange: Dispatch<SetStateAction<string>>
  onStatusChange: (value?: JobApplicationStatus) => void
  onFollowUpChange: (value?: JobApplicationFollowUpFilter) => void
  onSortChange: (value: JobApplicationSort) => void
}

const JobTrackerFilters = ({
  search,
  statusFilter,
  followUpFilter,
  sort,
  disabled,
  onSearchChange,
  onStatusChange,
  onFollowUpChange,
  onSortChange,
}: JobTrackerFiltersProps) => {
  const t = useTranslations('JobTracker')

  return (
    <section className="mb-8 grid grid-cols-1 gap-3 lg:grid-cols-[1fr_170px_190px]">
      <div className="relative">
        <Search
          size={15}
          className="pointer-events-none absolute left-3.5 top-1/2 z-10 -translate-y-1/2 text-gray-60"
          aria-hidden="true"
        />
        <Input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={t('searchPlaceholder')}
          maxLength={100}
          className="pl-10"
        />
      </div>

      <select
        value={statusFilter ?? 'all'}
        disabled={disabled}
        aria-label={t('filterByStatus')}
        onChange={(event) =>
          onStatusChange(
            event.target.value === 'all' ? undefined : (event.target.value as JobApplicationStatus),
          )
        }
        className="h-11 rounded-xl border border-gray-60/20 bg-gray-60/5 px-3 font-mono text-[13px] leading-5 text-gray-100 focus:border-primary/60 focus:outline-hidden"
      >
        <option value="all">{t('allStatuses')}</option>
        {JOB_APPLICATION_STATUSES.map((status) => (
          <option key={status} value={status}>
            {t(`statuses.${status}`)}
          </option>
        ))}
      </select>

      <select
        value={sort}
        disabled={disabled}
        aria-label={t('sort.label')}
        onChange={(event) => onSortChange(event.target.value as JobApplicationSort)}
        className="h-11 rounded-xl border border-gray-60/20 bg-gray-60/5 px-3 font-mono text-[13px] leading-5 text-gray-100 focus:border-primary/60 focus:outline-hidden"
      >
        {JOB_APPLICATION_SORTS.map((sortId) => (
          <option key={sortId} value={sortId}>
            {t(`sort.${sortId}`)}
          </option>
        ))}
      </select>

      <div
        role="group"
        aria-label={t('followUpFilters.label')}
        className="flex flex-wrap items-center gap-2 pt-1 lg:col-span-3"
      >
        <span className="mr-1 inline-flex items-center gap-1.5 body-small font-semibold text-gray-60">
          <CalendarClock size={14} aria-hidden="true" />
          {t('followUpFilters.label')}
        </span>
        {[undefined, ...JOB_APPLICATION_FOLLOW_UP_FILTERS].map((filter) => {
          const isSelected = filter === followUpFilter
          const label = filter ? t(`followUpFilters.${filter}`) : t('followUpFilters.all')

          return (
            <button
              key={filter ?? 'all'}
              type="button"
              aria-pressed={isSelected}
              disabled={disabled}
              onClick={() => onFollowUpChange(filter)}
              className={cn(
                'rounded-lg border px-3 py-1.5 body-small font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-wait disabled:opacity-60',
                isSelected
                  ? 'border-primary/40 bg-primary/10 text-primary'
                  : 'border-gray-60/20 bg-gray-60/5 text-gray-60 hover:border-primary/30 hover:text-gray-100',
              )}
            >
              {label}
            </button>
          )
        })}
      </div>
    </section>
  )
}

type JobApplicationsGridProps = {
  applications: JobApplication[]
  updatingStatusIds: Set<string>
  onEdit: (application: JobApplication) => void
  onDelete: (applicationId: string) => void
  onHistory: (application: JobApplication) => void
  onStatusChange: (applicationId: string, status: JobApplicationStatus) => void
}

const JobApplicationsGrid = ({
  applications,
  updatingStatusIds,
  onEdit,
  onDelete,
  onHistory,
  onStatusChange,
}: JobApplicationsGridProps) => {
  const t = useTranslations('JobTracker')

  if (applications.length === 0) {
    return (
      <section className="rounded-xl border border-dashed border-gray-60/30 bg-gray-60/5 px-4 py-12 text-center">
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl bg-gray-60/10 text-gray-60">
          <SearchX size={22} aria-hidden="true" />
        </div>
        <h2 className="body-large text-gray-100">{t('emptyState.title')}</h2>
        <p className="body-medium mx-auto mt-1 max-w-md text-gray-60">
          {t('emptyState.description')}
        </p>
      </section>
    )
  }

  return (
    <section className="grid grid-cols-1 items-stretch gap-5 lg:grid-cols-2">
      <AnimatePresence mode="popLayout">
        {applications.map((application) => (
          <motion.div
            key={application.id}
            layout
            initial={{ opacity: 0, y: 14, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="h-full"
          >
            <JobApplicationCard
              application={application}
              onEdit={onEdit}
              onDelete={onDelete}
              onHistory={onHistory}
              onStatusChange={onStatusChange}
              isStatusUpdating={updatingStatusIds.has(application.id)}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </section>
  )
}

const JobApplicationsSkeleton = ({ label }: { label: string }) => (
  <div className="grid grid-cols-1 gap-5 lg:grid-cols-2" aria-busy="true" aria-label={label}>
    {Array.from({ length: 4 }, (_, index) => (
      <div
        key={index}
        className="h-72 animate-pulse rounded-xl border border-[var(--color-gray-10)] bg-gray-60/5"
      />
    ))}
  </div>
)

const JobTrackerError = ({ onRetry }: { onRetry: () => void }) => {
  const t = useTranslations('JobTracker')

  return (
    <section
      className="rounded-xl border border-alert-50/30 bg-alert-50/5 px-4 py-10 text-center"
      role="alert"
    >
      <AlertTriangle className="mx-auto mb-3 text-alert-50" aria-hidden="true" />
      <h2 className="body-large text-gray-100">{t('errors.loadTitle')}</h2>
      <p className="body-medium mt-1 text-gray-60">{t('errors.load')}</p>
      <Button className="mt-4" onClick={onRetry}>
        {t('retry')}
      </Button>
    </section>
  )
}

const JobTrackerPagination = ({
  meta,
  disabled,
  onPageChange,
}: {
  meta: PaginationMeta
  disabled: boolean
  onPageChange: (page: number) => void
}) => {
  const t = useTranslations('JobTracker')

  if (meta.totalPages <= 1) return null

  return (
    <nav className="mt-8 flex items-center justify-center gap-3" aria-label={t('pagination.label')}>
      <Button
        variant="secondary"
        icon={ChevronLeft}
        disabled={disabled || meta.page <= 1}
        onClick={() => onPageChange(meta.page - 1)}
      >
        {t('pagination.previous')}
      </Button>
      <span className="body-medium text-gray-60">
        {t('pagination.page', { page: meta.page, total: meta.totalPages })}
      </span>
      <Button
        variant="secondary"
        disabled={disabled || meta.page >= meta.totalPages}
        onClick={() => onPageChange(meta.page + 1)}
      >
        {t('pagination.next')}
        <ChevronRight size={16} aria-hidden="true" />
      </Button>
    </nav>
  )
}

const DeleteJobDialog = ({
  application,
  isDeleting,
  onCancel,
  onConfirm,
}: {
  application: JobApplication | null
  isDeleting: boolean
  onCancel: () => void
  onConfirm: () => void
}) => {
  const t = useTranslations('JobTracker')
  const titleId = `delete-job-${application?.id ?? 'dialog'}`
  const descriptionId = `${titleId}-description`

  useEffect(() => {
    if (!application) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isDeleting) onCancel()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [application, isDeleting, onCancel])

  return (
    <AnimatePresence>
      {application && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={isDeleting ? undefined : onCancel}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              aria-describedby={descriptionId}
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              className="w-full max-w-md rounded-xl border border-[var(--color-gray-10)] bg-white p-5 shadow-2xl dark:bg-[var(--color-gray-05)]"
            >
              <div className="mb-4 flex gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-alert-50/10 text-alert-50">
                  <AlertTriangle size={20} aria-hidden="true" />
                </span>
                <div>
                  <h2 id={titleId} className="body-large text-gray-100">
                    {t('deleteDialog.title')}
                  </h2>
                  <p id={descriptionId} className="body-medium mt-1 text-gray-60">
                    {t('deleteDialog.description', {
                      role: application.role,
                      company: application.company,
                    })}
                  </p>
                </div>
              </div>
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button variant="secondary" disabled={isDeleting} onClick={onCancel}>
                  {t('cancel')}
                </Button>
                <Button
                  className="bg-alert-50 hover:bg-alert-50/90"
                  disabled={isDeleting}
                  onClick={onConfirm}
                >
                  {isDeleting ? t('deleteDialog.deleting') : t('delete')}
                </Button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
