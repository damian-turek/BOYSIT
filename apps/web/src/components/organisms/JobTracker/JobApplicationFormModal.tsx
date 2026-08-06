'use client'

import { type FormEvent, useEffect, useId, useMemo, useState } from 'react'

import { JOB_APPLICATION_STATUSES } from '@/constants/job-tracker'
import type {
  JobApplication,
  JobApplicationInput,
  JobApplicationStatus,
  JobTechnology,
} from '@/types/job-tracker'
import { Plus, Save, X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/atoms/Button'
import { Input } from '@/components/atoms/inputs/Input'

type FormState = {
  company: string
  role: string
  location: string
  salary: string
  jobUrl: string
  status: JobApplicationStatus
  note: string
  appliedAt: string
  followUpAt: string
  technologyIds: string[]
  customTechnologies: string
}

const emptyForm: FormState = {
  company: '',
  role: '',
  location: '',
  salary: '',
  jobUrl: '',
  status: 'wishlist',
  note: '',
  appliedAt: '',
  followUpAt: '',
  technologyIds: [],
  customTechnologies: '',
}

const toFormState = (application: JobApplication | null): FormState =>
  application
    ? {
        company: application.company,
        role: application.role,
        location: application.location ?? '',
        salary: application.salary ?? '',
        jobUrl: application.jobUrl ?? '',
        status: application.status,
        note: application.note ?? '',
        appliedAt: application.appliedAt?.slice(0, 10) ?? '',
        followUpAt: application.followUpAt?.slice(0, 10) ?? '',
        technologyIds: application.technologies.map((technology) => technology.id),
        customTechnologies: application.customTechnologies.join(', '),
      }
    : emptyForm

const toIsoDate = (value: string): string => `${value}T00:00:00.000Z`

type JobApplicationFormModalProps = {
  isOpen: boolean
  application: JobApplication | null
  technologyOptions: JobTechnology[]
  isSaving: boolean
  error?: string
  onClose: () => void
  onSubmit: (input: JobApplicationInput) => Promise<void>
}

export const JobApplicationFormModal = ({
  isOpen,
  application,
  technologyOptions,
  isSaving,
  error,
  onClose,
  onSubmit,
}: JobApplicationFormModalProps) => {
  const t = useTranslations('JobTracker')
  const [form, setForm] = useState<FormState>(emptyForm)
  const titleId = useId()
  const descriptionId = useId()
  const statusId = useId()
  const notesId = useId()
  const isEdit = Boolean(application)

  useEffect(() => {
    if (isOpen) setForm(toFormState(application))
  }, [application, isOpen])

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isSaving) onClose()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, isSaving, onClose])

  const customTechnologies = useMemo(
    () =>
      form.customTechnologies
        .split(',')
        .map((technology) => technology.trim())
        .filter(Boolean),
    [form.customTechnologies],
  )

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    await onSubmit({
      company: form.company.trim(),
      role: form.role.trim(),
      location: form.location.trim() || null,
      salary: form.salary.trim() || null,
      jobUrl: form.jobUrl.trim() || null,
      status: form.status,
      note: form.note.trim() || null,
      ...(form.appliedAt
        ? { appliedAt: toIsoDate(form.appliedAt) }
        : isEdit && !(application?.status === 'wishlist' && form.status !== 'wishlist')
          ? { appliedAt: null }
          : {}),
      followUpAt: form.followUpAt ? toIsoDate(form.followUpAt) : null,
      technologyIds: form.technologyIds,
      customTechnologies,
    })
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={isSaving ? undefined : onClose}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4">
            <motion.form
              onSubmit={(event) => void handleSubmit(event)}
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ duration: 0.18 }}
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              aria-describedby={descriptionId}
              className="my-auto w-full max-w-2xl rounded-xl border border-[var(--color-gray-10)] bg-white p-5 shadow-2xl dark:bg-[var(--color-gray-05)]"
            >
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <h2 id={titleId} className="body-large text-gray-100">
                    {isEdit ? t('modal.editTitle') : t('modal.addTitle')}
                  </h2>
                  <p id={descriptionId} className="body-small text-gray-60">
                    {t('modal.description')}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="text"
                  icon={X}
                  iconOnly
                  disabled={isSaving}
                  aria-label={t('modal.close')}
                  onClick={onClose}
                />
              </div>

              <fieldset disabled={isSaving} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  name="company"
                  autoComplete="organization"
                  label={t('modal.company')}
                  value={form.company}
                  maxLength={120}
                  required
                  onChange={(event) => setForm({ ...form, company: event.target.value })}
                  placeholder={t('modal.companyPlaceholder')}
                />
                <Input
                  name="role"
                  autoComplete="organization-title"
                  label={t('modal.role')}
                  value={form.role}
                  maxLength={160}
                  required
                  onChange={(event) => setForm({ ...form, role: event.target.value })}
                  placeholder={t('modal.rolePlaceholder')}
                />
                <Input
                  name="location"
                  autoComplete="address-level2"
                  label={t('modal.location')}
                  value={form.location}
                  maxLength={160}
                  onChange={(event) => setForm({ ...form, location: event.target.value })}
                  placeholder={t('modal.locationPlaceholder')}
                />
                <Input
                  name="salary"
                  autoComplete="off"
                  label={t('modal.salary')}
                  value={form.salary}
                  maxLength={100}
                  onChange={(event) => setForm({ ...form, salary: event.target.value })}
                  placeholder={t('modal.salaryPlaceholder')}
                />
                <Input
                  name="jobUrl"
                  autoComplete="url"
                  label={t('modal.jobPostingUrl')}
                  type="url"
                  value={form.jobUrl}
                  maxLength={2048}
                  onChange={(event) => setForm({ ...form, jobUrl: event.target.value })}
                  placeholder="https://company.com/jobs/frontend"
                />
                <div className="flex flex-col gap-1.5">
                  <label htmlFor={statusId} className="label-font text-gray-60 select-none">
                    {t('modal.status')}
                  </label>
                  <select
                    id={statusId}
                    value={form.status}
                    onChange={(event) =>
                      setForm({ ...form, status: event.target.value as JobApplicationStatus })
                    }
                    className="h-11 w-full rounded-xl border border-gray-60/20 bg-gray-65/5 px-4 body-medium text-gray-100 focus:border-primary/60 focus:outline-hidden dark:bg-gray-10/20"
                  >
                    {JOB_APPLICATION_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {t(`statuses.${status}`)}
                      </option>
                    ))}
                  </select>
                </div>
                <Input
                  name="appliedAt"
                  type="date"
                  label={t('modal.appliedAt')}
                  value={form.appliedAt}
                  hint={t('modal.appliedAtHint')}
                  onChange={(event) => setForm({ ...form, appliedAt: event.target.value })}
                />
                <Input
                  name="followUpAt"
                  type="date"
                  label={t('modal.followUpAt')}
                  value={form.followUpAt}
                  onChange={(event) => setForm({ ...form, followUpAt: event.target.value })}
                />

                <div className="sm:col-span-2">
                  <span className="label-font text-gray-60 select-none">
                    {t('modal.technologies')}
                  </span>
                  <div className="mt-1.5 grid max-h-36 grid-cols-2 gap-2 overflow-y-auto rounded-xl border border-gray-60/20 bg-gray-65/5 p-3 sm:grid-cols-3 dark:bg-gray-10/20">
                    {technologyOptions.length ? (
                      technologyOptions.map((technology) => (
                        <label
                          key={technology.id}
                          className="flex cursor-pointer items-center gap-2 body-small text-gray-100"
                        >
                          <input
                            type="checkbox"
                            checked={form.technologyIds.includes(technology.id)}
                            onChange={(event) =>
                              setForm({
                                ...form,
                                technologyIds: event.target.checked
                                  ? [...form.technologyIds, technology.id]
                                  : form.technologyIds.filter((id) => id !== technology.id),
                              })
                            }
                          />
                          <span className="truncate">{technology.name}</span>
                        </label>
                      ))
                    ) : (
                      <p className="body-small col-span-full text-gray-60">
                        {t('modal.noTechnologies')}
                      </p>
                    )}
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <Input
                    name="customTechnologies"
                    label={t('modal.customTechnologies')}
                    value={form.customTechnologies}
                    hint={t('modal.customTechnologiesHint')}
                    onChange={(event) =>
                      setForm({ ...form, customTechnologies: event.target.value })
                    }
                  />
                </div>

                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label htmlFor={notesId} className="label-font text-gray-60 select-none">
                    {t('modal.notes')}
                  </label>
                  <textarea
                    id={notesId}
                    value={form.note}
                    maxLength={5000}
                    onChange={(event) => setForm({ ...form, note: event.target.value })}
                    placeholder={t('modal.notesPlaceholder')}
                    rows={4}
                    className="min-h-28 w-full resize-y rounded-xl border border-gray-60/20 bg-gray-65/5 px-4 py-3 body-medium text-gray-100 placeholder:text-gray-60/50 focus:border-primary/60 focus:outline-hidden dark:bg-gray-10/20"
                  />
                </div>
              </fieldset>

              {error && (
                <p className="mt-4 body-small text-alert-50" role="alert">
                  {error}
                </p>
              )}

              <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button type="button" variant="secondary" disabled={isSaving} onClick={onClose}>
                  {t('cancel')}
                </Button>
                <Button
                  type="submit"
                  icon={isEdit ? Save : Plus}
                  disabled={isSaving}
                  className="w-full sm:w-fit"
                >
                  {isSaving ? t('modal.saving') : isEdit ? t('saveChanges') : t('addJob')}
                </Button>
              </div>
            </motion.form>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
