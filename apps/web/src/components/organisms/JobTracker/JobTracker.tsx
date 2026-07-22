'use client'

import { FormEvent, useEffect, useId, useMemo, useState } from 'react'

import { AlertTriangle, Briefcase, Plus, Save, Search, SearchX, X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'

import { Button } from '@/components/atoms/Button'
import { Input } from '@/components/atoms/inputs/Input'
import {
  JobApplication,
  JobApplicationCard,
  JobApplicationStatus,
  jobStatusConfig,
} from '@/components/molecules/JobApplicationCard'
import { JobTrackerStatCard, JobTrackerStatTone } from '@/components/molecules/JobTrackerStatCard'

type JobStatusStat = {
  id: Exclude<JobApplicationStatus, 'wishlist'>
  label: string
  tone: JobTrackerStatTone
}

type JobApplicationFormState = {
  company: string
  role: string
  location: string
  salary: string
  jobUrl: string
  status: JobApplicationStatus
  note: string
}

type JobApplicationPayload = Omit<JobApplication, 'id' | 'date' | 'technologies'>

const statusStats: JobStatusStat[] = [
  { id: 'applied', label: 'Applied', tone: 'blue' },
  { id: 'phone_screen', label: 'Phone Screen', tone: 'purple' },
  { id: 'technical', label: 'Technical', tone: 'amber' },
  { id: 'final_round', label: 'Final Round', tone: 'orange' },
  { id: 'offer', label: 'Offer', tone: 'green' },
  { id: 'rejected', label: 'Rejected', tone: 'rose' },
]

const statusOptions: { id: JobApplicationStatus | 'all'; label: string }[] = [
  { id: 'all', label: 'All statuses' },
  { id: 'wishlist', label: 'Wishlist' },
  ...statusStats,
]

const emptyJobForm: JobApplicationFormState = {
  company: '',
  role: '',
  location: '',
  salary: '',
  jobUrl: '',
  status: 'wishlist',
  note: '',
}

const initialApplications: JobApplication[] = [
  {
    id: 1,
    company: 'Allegro',
    role: 'Senior Frontend Engineer',
    location: 'Warsaw, Poland',
    status: 'technical',
    salary: '€6,000-8,000/mo',
    date: '2026-06-01',
    jobUrl: 'https://allegro.pl/praca',
    note: 'Had first call with HR. Technical interview scheduled for next week.',
    technologies: ['React', 'TypeScript', 'JavaScript'],
  },
  {
    id: 2,
    company: 'JetBrains',
    role: 'Full Stack Developer',
    location: 'Remote (EU)',
    status: 'phone_screen',
    salary: '€5,000-7,000/mo',
    date: '2026-05-28',
    jobUrl: 'https://www.jetbrains.com/careers',
    note: 'Applied via referral. Got a response in 3 days.',
    technologies: ['React', 'Python', 'PostgreSQL'],
  },
  {
    id: 3,
    company: 'Revolut',
    role: 'Backend Engineer',
    location: 'Krakow, Poland',
    status: 'applied',
    salary: '€7,000-10,000/mo',
    date: '2026-06-05',
    jobUrl: 'https://www.revolut.com/careers',
    note: 'Applied online. No response yet.',
    technologies: ['Python', 'PostgreSQL', 'System Design'],
  },
  {
    id: 4,
    company: 'Booking.com',
    role: 'Mid Frontend Developer',
    location: 'Amsterdam, Netherlands',
    status: 'final_round',
    salary: '€5,500-7,500/mo',
    date: '2026-05-15',
    jobUrl: 'https://careers.booking.com',
    note: 'Three rounds done. Final presentation next Friday.',
    technologies: ['JavaScript', 'React', 'TypeScript'],
  },
  {
    id: 5,
    company: 'CD Projekt Red',
    role: 'Frontend Engineer',
    location: 'Warsaw, Poland',
    status: 'wishlist',
    salary: '',
    date: '',
    jobUrl: 'https://www.cdprojektred.com/en/jobs',
    note: 'Interesting role. Need to tailor my CV.',
    technologies: ['React', 'TypeScript'],
  },
  {
    id: 6,
    company: 'Yandex',
    role: 'Senior Software Engineer',
    location: 'Remote',
    status: 'rejected',
    salary: '',
    date: '2026-05-10',
    jobUrl: '',
    note: 'Rejected after technical interview.',
    technologies: ['JavaScript', 'System Design'],
  },
]

const createApplication = (payload: JobApplicationPayload): JobApplication => ({
  id: Date.now(),
  ...payload,
  date: new Date().toISOString().slice(0, 10),
  technologies: ['Research'],
})

export const JobTracker = () => {
  const [applications, setApplications] = useState(initialApplications)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<JobApplicationStatus | 'all'>('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [form, setForm] = useState<JobApplicationFormState>(emptyJobForm)
  const [editingApplicationId, setEditingApplicationId] = useState<number | null>(null)
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null)

  const pendingDeleteApplication =
    applications.find((application) => application.id === pendingDeleteId) ?? null

  const filteredApplications = useMemo(() => {
    const query = search.trim().toLowerCase()

    return applications.filter((application) => {
      const matchesStatus =
        statusFilter === 'all' || application.status === statusFilter
      const matchesSearch =
        !query ||
        [application.company, application.role, application.location, application.note]
          .join(' ')
          .toLowerCase()
          .includes(query)

      return matchesStatus && matchesSearch
    })
  }, [applications, search, statusFilter])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!form.company.trim() || !form.role.trim()) return

    const applicationPayload: JobApplicationPayload = {
      company: form.company.trim(),
      role: form.role.trim(),
      location: form.location.trim() || 'Remote',
      salary: form.salary.trim(),
      status: form.status,
      jobUrl: form.jobUrl.trim(),
      note: form.note.trim() || 'No notes yet.',
    }

    if (editingApplicationId) {
      setApplications((current) =>
        current.map((application) =>
          application.id === editingApplicationId
            ? { ...application, ...applicationPayload }
            : application,
        ),
      )
    } else {
      setApplications((current) => [createApplication(applicationPayload), ...current])
    }

    setForm(emptyJobForm)
    setEditingApplicationId(null)
    setIsModalOpen(false)
  }

  const handleOpenCreateModal = () => {
    setEditingApplicationId(null)
    setForm(emptyJobForm)
    setIsModalOpen(true)
  }

  const handleEditApplication = (application: JobApplication) => {
    setEditingApplicationId(application.id)
    setForm({
      company: application.company,
      role: application.role,
      location: application.location,
      salary: application.salary,
      jobUrl: application.jobUrl,
      status: application.status,
      note: application.note,
    })
    setIsModalOpen(true)
  }

  const handleConfirmDelete = () => {
    if (!pendingDeleteId) return

    setApplications((current) =>
      current.filter((application) => application.id !== pendingDeleteId),
    )
    setPendingDeleteId(null)
  }

  const handleStatusChange = (
    applicationId: number,
    status: JobApplicationStatus,
  ) => {
    setApplications((current) =>
      current.map((application) =>
        application.id === applicationId ? { ...application, status } : application,
      ),
    )
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingApplicationId(null)
    setForm(emptyJobForm)
  }

  return (
    <>
      <JobTrackerHeader onAddJob={handleOpenCreateModal} />
      <JobTrackerStats applications={applications} />
      <JobTrackerFilters
        search={search}
        statusFilter={statusFilter}
        onSearchChange={setSearch}
        onStatusChange={setStatusFilter}
      />
      <JobApplicationsGrid
        applications={filteredApplications}
        onEdit={handleEditApplication}
        onDelete={setPendingDeleteId}
        onStatusChange={handleStatusChange}
      />
      <AddJobModal
        isOpen={isModalOpen}
        form={form}
        mode={editingApplicationId ? 'edit' : 'create'}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        onFormChange={setForm}
      />
      <DeleteJobDialog
        isOpen={Boolean(pendingDeleteId)}
        company={pendingDeleteApplication?.company}
        role={pendingDeleteApplication?.role}
        onCancel={() => setPendingDeleteId(null)}
        onConfirm={handleConfirmDelete}
      />
    </>
  )
}

const JobTrackerHeader = ({ onAddJob }: { onAddJob: () => void }) => {
  return (
    <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Briefcase size={22} aria-hidden="true" />
        </span>
        <div>
          <h1 className="text-[25px] leading-8 font-bold text-gray-100">
            Job Tracker
          </h1>
          <p className="body-medium text-gray-60">
            Track your applications & prep smarter
          </p>
        </div>
      </div>
      <Button icon={Plus} size="lg" className="px-5 py-3" onClick={onAddJob}>
        Add Job
      </Button>
    </header>
  )
}

const JobTrackerStats = ({ applications }: { applications: JobApplication[] }) => {
  return (
    <section className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
      {statusStats.map((status) => (
        <JobTrackerStatCard
          key={status.id}
          label={status.label}
          value={applications.filter((application) => application.status === status.id).length}
          tone={status.tone}
        />
      ))}
    </section>
  )
}

const JobTrackerFilters = ({
  search,
  statusFilter,
  onSearchChange,
  onStatusChange,
}: {
  search: string
  statusFilter: JobApplicationStatus | 'all'
  onSearchChange: (value: string) => void
  onStatusChange: (value: JobApplicationStatus | 'all') => void
}) => {
  return (
    <section className="mb-8 grid grid-cols-1 gap-3 lg:grid-cols-[1fr_150px]">
      <div className="relative">
        <Search
          size={15}
          className="pointer-events-none absolute left-3.5 top-1/2 z-10 -translate-y-1/2 text-gray-60"
          aria-hidden="true"
        />
        <Input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search company or role..."
          className="pl-10"
        />
      </div>

      <select
        value={statusFilter}
        onChange={(event) =>
          onStatusChange(event.target.value as JobApplicationStatus | 'all')
        }
        className="h-11 rounded-xl border border-gray-60/20 bg-gray-60/5 px-3 font-mono text-[13px] leading-5 text-gray-100 focus:border-primary/60 focus:outline-hidden"
      >
        {statusOptions.map((status) => (
          <option key={status.id} value={status.id}>
            {status.label}
          </option>
        ))}
      </select>
    </section>
  )
}

const JobApplicationsGrid = ({
  applications,
  onEdit,
  onDelete,
  onStatusChange,
}: {
  applications: JobApplication[]
  onEdit: (application: JobApplication) => void
  onDelete: (applicationId: number) => void
  onStatusChange: (applicationId: number, status: JobApplicationStatus) => void
}) => {
  if (applications.length === 0) {
    return (
      <section className="rounded-xl border border-dashed border-gray-60/30 bg-gray-60/5 px-4 py-12 text-center">
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl bg-gray-60/10 text-gray-60">
          <SearchX size={22} aria-hidden="true" />
        </div>
        <h2 className="body-large text-gray-100">No applications found</h2>
        <p className="body-medium mx-auto mt-1 max-w-md text-gray-60">
          Try changing the search query or status filter, or add a new job to
          start tracking applications.
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
            transition={{
              opacity: { duration: 0.18 },
              layout: { duration: 0.22, ease: 'easeInOut' },
              y: { duration: 0.22, ease: 'easeOut' },
              scale: { duration: 0.18, ease: 'easeOut' },
            }}
            className="h-full"
          >
            <JobApplicationCard
              application={application}
              onEdit={onEdit}
              onDelete={onDelete}
              onStatusChange={onStatusChange}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </section>
  )
}

const AddJobModal = ({
  isOpen,
  form,
  mode,
  onClose,
  onSubmit,
  onFormChange,
}: {
  isOpen: boolean
  form: JobApplicationFormState
  mode: 'create' | 'edit'
  onClose: () => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onFormChange: (form: JobApplicationFormState) => void
}) => {
  const titleId = useId()
  const descriptionId = useId()
  const statusId = useId()
  const notesId = useId()

  const availableStatuses = statusOptions.filter(
    (status): status is { id: JobApplicationStatus; label: string } => status.id !== 'all',
  )

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4">
            <motion.form
              onSubmit={onSubmit}
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ duration: 0.18 }}
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              aria-describedby={descriptionId}
              className="my-auto w-full max-w-2xl rounded-xl border border-[var(--color-gray-10)] bg-white p-5 shadow-2xl"
            >
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <h2 id={titleId} className="body-large text-gray-100">
                    {mode === 'edit' ? 'Edit job' : 'Add job'}
                  </h2>
                  <p id={descriptionId} className="body-small text-gray-60">
                    This is local frontend state until backend endpoints exist.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="text"
                  icon={X}
                  iconOnly
                  aria-label="Close"
                  onClick={onClose}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  id="job-company"
                  name="company"
                  autoComplete="organization"
                  label="Company"
                  value={form.company}
                  onChange={(event) =>
                    onFormChange({ ...form, company: event.target.value })
                  }
                  required
                  placeholder="Company name"
                />
                <Input
                  id="job-role"
                  name="role"
                  autoComplete="organization-title"
                  label="Role"
                  value={form.role}
                  onChange={(event) =>
                    onFormChange({ ...form, role: event.target.value })
                  }
                  required
                  placeholder="Frontend Engineer"
                />
                <Input
                  id="job-location"
                  name="location"
                  autoComplete="address-level2"
                  label="Location"
                  value={form.location}
                  onChange={(event) =>
                    onFormChange({ ...form, location: event.target.value })
                  }
                  placeholder="Warsaw / Remote"
                />
                <Input
                  id="job-salary"
                  name="salary"
                  autoComplete="off"
                  label="Salary"
                  value={form.salary}
                  onChange={(event) =>
                    onFormChange({ ...form, salary: event.target.value })
                  }
                  placeholder="€6,000-8,000/mo"
                />
                <Input
                  id="job-url"
                  name="jobUrl"
                  autoComplete="url"
                  label="Job posting URL"
                  type="url"
                  value={form.jobUrl}
                  onChange={(event) =>
                    onFormChange({ ...form, jobUrl: event.target.value })
                  }
                  placeholder="https://company.com/jobs/frontend"
                  className="truncate"
                />
                <div className="flex flex-col gap-1.5">
                  <label htmlFor={statusId} className="label-font text-gray-60 select-none">
                    Status
                  </label>
                  <select
                    id={statusId}
                    name="status"
                    value={form.status}
                    onChange={(event) =>
                      onFormChange({
                        ...form,
                        status: event.target.value as JobApplicationStatus,
                      })
                    }
                    className="h-11 w-full rounded-xl border border-gray-60/20 bg-gray-65/5 px-4 body-medium text-gray-100 transition-colors duration-200 focus:border-primary/60 focus:outline-hidden dark:bg-gray-10/20"
                  >
                    {availableStatuses.map((status) => (
                      <option key={status.id} value={status.id}>
                        {jobStatusConfig[status.id].label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label htmlFor={notesId} className="label-font text-gray-60 select-none">
                    Notes
                  </label>
                  <textarea
                    id={notesId}
                    name="note"
                    autoComplete="off"
                    value={form.note}
                    onChange={(event) =>
                      onFormChange({ ...form, note: event.target.value })
                    }
                    placeholder="Interview details, recruiter context, next steps..."
                    rows={4}
                    className="min-h-28 w-full resize-y rounded-xl border border-gray-60/20 bg-gray-65/5 px-4 py-3 body-medium text-gray-100 transition-colors duration-200 placeholder:text-gray-60/50 focus:border-primary/60 focus:outline-hidden dark:bg-gray-10/20"
                  />
                </div>
              </div>

              <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button type="button" variant="secondary" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  icon={mode === 'edit' ? Save : Plus}
                  className="w-full sm:w-fit"
                >
                  {mode === 'edit' ? 'Save changes' : 'Add Job'}
                </Button>
              </div>
            </motion.form>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

const DeleteJobDialog = ({
  isOpen,
  company,
  role,
  onCancel,
  onConfirm,
}: {
  isOpen: boolean
  company?: string
  role?: string
  onCancel: () => void
  onConfirm: () => void
}) => {
  const titleId = useId()
  const descriptionId = useId()

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCancel()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onCancel])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
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
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="w-full max-w-md rounded-xl border border-[var(--color-gray-10)] bg-white p-5 shadow-2xl"
            >
              <div className="mb-4 flex gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-alert-50/10 text-alert-50">
                  <AlertTriangle size={20} aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <h2 id={titleId} className="body-large text-gray-100">
                    Delete job application?
                  </h2>
                  <p id={descriptionId} className="body-medium mt-1 text-gray-60">
                    {company && role
                      ? `${role} at ${company} will be removed from your tracker.`
                      : 'This application will be removed from your tracker.'}
                  </p>
                </div>
              </div>

              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button type="button" variant="secondary" onClick={onCancel}>
                  Cancel
                </Button>
                <Button
                  type="button"
                  className="bg-alert-50 hover:bg-alert-50/90"
                  onClick={onConfirm}
                >
                  Delete
                </Button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
