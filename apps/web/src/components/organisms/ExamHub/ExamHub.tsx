'use client'

import { useEffect, useMemo, useState } from 'react'

import { usePathname, useRouter } from 'next/navigation'

import { fetchExamCatalog, startExam } from '@/services/examApi'
import type { ExamCatalogItem, ExamCategory, ExamSlug } from '@/types/exam'
import type { LucideIcon } from 'lucide-react'
import {
  Blocks,
  Braces,
  CheckCircle2,
  ClipboardCheck,
  Code2,
  Crown,
  Database,
  Layers3,
  RefreshCw,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useTranslations } from 'next-intl'

import { useAuthSessionStore } from '@/store/useAuthSessionStore'

import { cn } from '@/utils/cn'

import { Button } from '@/components/atoms/Button'
import type { ExamCardTone } from '@/components/molecules/ExamCard'
import { ExamCard } from '@/components/molecules/ExamCard'

type ExamFilterCategory = 'all' | ExamCategory

type ExamVisual = {
  icon: LucideIcon
  tone: ExamCardTone
}

const EXAM_CATEGORIES: ExamFilterCategory[] = [
  'all',
  'mixed',
  'frontend',
  'backend',
  'system_design',
]

const EXAM_VISUALS: Record<ExamSlug, ExamVisual> = {
  warmup: { icon: Sparkles, tone: 'blue' },
  'frontend-basics': { icon: Code2, tone: 'green' },
  javascript: { icon: Braces, tone: 'amber' },
  react: { icon: Blocks, tone: 'purple' },
  backend: { icon: Database, tone: 'green' },
  'system-design': { icon: Layers3, tone: 'purple' },
}

export const ExamHub = () => {
  const t = useTranslations('Exam')
  const router = useRouter()
  const pathname = usePathname()
  const profile = useAuthSessionStore((state) => state.profile)
  const initialized = useAuthSessionStore((state) => state.initialized)
  const authLoading = useAuthSessionStore((state) => state.loading)
  const [category, setCategory] = useState<ExamFilterCategory>('all')
  const [catalog, setCatalog] = useState<ExamCatalogItem[]>([])
  const [catalogLoading, setCatalogLoading] = useState(true)
  const [retryKey, setRetryKey] = useState(0)
  const [startingSlug, setStartingSlug] = useState<ExamSlug>()
  const [error, setError] = useState<string>()
  const hasProAccess = profile?.plan === 'pro' || profile?.plan === 'admin'
  const isAccessLoading = !initialized || authLoading || catalogLoading

  useEffect(() => {
    const controller = new AbortController()

    setCatalogLoading(true)
    setError(undefined)

    fetchExamCatalog(controller.signal)
      .then(setCatalog)
      .catch((requestError: unknown) => {
        if (requestError instanceof DOMException && requestError.name === 'AbortError') return
        setError(requestError instanceof Error ? requestError.message : t('errors.catalog'))
      })
      .finally(() => {
        if (!controller.signal.aborted) setCatalogLoading(false)
      })

    return () => controller.abort()
  }, [retryKey, t])

  const visibleExams = useMemo(
    () => catalog.filter((exam) => category === 'all' || exam.category === category),
    [catalog, category],
  )

  const handleStart = async (exam: ExamCatalogItem) => {
    if (!exam.canStart || startingSlug) return

    setStartingSlug(exam.slug)
    setError(undefined)

    try {
      const session = await startExam(exam.slug)
      router.push(`${pathname.replace(/\/$/, '')}/${session.sessionId}`)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : t('errors.start'))
      setStartingSlug(undefined)
    }
  }

  return (
    <div className="space-y-7">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <ClipboardCheck size={23} aria-hidden="true" />
          </span>
          <div>
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <h1 className="text-[25px] leading-8 font-bold text-gray-100">{t('title')}</h1>
              <span className="rounded-md border border-primary/25 bg-primary/10 px-2 py-0.5 label-font font-semibold text-primary">
                {t('modeBadge')}
              </span>
            </div>
            <p className="body-medium max-w-2xl text-gray-60">{t('description')}</p>
          </div>
        </div>
      </header>

      <section
        className={cn(
          'flex flex-col gap-4 rounded-xl border p-5 sm:flex-row sm:items-center sm:justify-between',
          hasProAccess ? 'border-success-50/25 bg-success-50/5' : 'border-primary/25 bg-primary/5',
        )}
        aria-busy={isAccessLoading}
      >
        <div className="flex items-start gap-3">
          <span
            className={cn(
              'flex size-10 shrink-0 items-center justify-center rounded-xl',
              hasProAccess ? 'bg-success-50/10 text-success-100' : 'bg-primary/10 text-primary',
            )}
          >
            {hasProAccess ? (
              <Crown size={19} aria-hidden="true" />
            ) : (
              <ShieldCheck size={19} aria-hidden="true" />
            )}
          </span>
          <div>
            <h2 className="body-large text-gray-100">
              {isAccessLoading
                ? t('access.checkingTitle')
                : hasProAccess
                  ? t('access.proTitle')
                  : t('access.freeTitle')}
            </h2>
            <p className="body-medium mt-0.5 max-w-3xl text-gray-60">
              {isAccessLoading
                ? t('access.checkingDescription')
                : hasProAccess
                  ? t('access.proDescription')
                  : t('access.freeDescription')}
            </p>
          </div>
        </div>
        <span
          className={cn(
            'inline-flex w-fit items-center gap-1.5 rounded-lg border px-3 py-1.5 body-small font-semibold',
            hasProAccess
              ? 'border-success-50/25 bg-success-50/10 text-success-100'
              : 'border-primary/25 bg-white/60 text-primary dark:bg-white/5',
          )}
        >
          <CheckCircle2 size={14} aria-hidden="true" />
          {hasProAccess ? t('access.fullPool') : t('access.freePool')}
        </span>
      </section>

      {error && (
        <div
          className="flex flex-col gap-3 rounded-xl border border-alert-50/25 bg-alert-50/5 px-4 py-3 text-gray-100 sm:flex-row sm:items-center sm:justify-between"
          role="alert"
        >
          <p className="body-medium">{error}</p>
          <Button
            variant="secondary"
            icon={RefreshCw}
            onClick={() => setRetryKey((value) => value + 1)}
          >
            {t('actions.retry')}
          </Button>
        </div>
      )}

      <section aria-labelledby="exam-library-title">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id="exam-library-title" className="body-large text-gray-100">
              {t('library.title')}
            </h2>
            <p className="body-medium text-gray-60">{t('library.description')}</p>
          </div>
          <div role="group" aria-label={t('filters.label')} className="flex flex-wrap gap-2">
            {EXAM_CATEGORIES.map((categoryId) => {
              const isSelected = categoryId === category

              return (
                <button
                  key={categoryId}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => setCategory(categoryId)}
                  className={cn(
                    'rounded-lg border px-3 py-1.5 body-small font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
                    isSelected
                      ? 'border-primary/40 bg-primary/10 text-primary'
                      : 'border-gray-60/20 bg-gray-60/5 text-gray-60 hover:border-primary/30 hover:text-gray-100',
                  )}
                >
                  {t(`filters.${categoryId}`)}
                </button>
              )
            })}
          </div>
        </div>

        {catalogLoading ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3" aria-live="polite">
            {Array.from({ length: 6 }, (_, index) => (
              <div
                key={index}
                className="h-[365px] animate-pulse rounded-xl border border-[var(--color-gray-10)] bg-gray-05"
              />
            ))}
            <span className="sr-only">{t('library.loading')}</span>
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {visibleExams.map((exam) => {
                const visual = EXAM_VISUALS[exam.slug]
                const isBusy = startingSlug === exam.slug
                const actionKey = exam.activeSessionId
                  ? 'card.continueExam'
                  : exam.lockReason === 'pro_required'
                    ? 'card.proRequired'
                    : exam.lockReason === 'insufficient_questions'
                      ? 'card.questionsUnavailable'
                      : exam.access === 'free'
                        ? 'card.startPreview'
                        : 'card.startExam'

                return (
                  <ExamCard
                    key={exam.slug}
                    title={t(`exams.${exam.slug}.title`)}
                    description={t(`exams.${exam.slug}.description`)}
                    accessLabel={t(`accessLabels.${exam.access}`)}
                    questionPoolLabel={t(
                      exam.access === 'free' ? 'card.freeQuestionPool' : 'card.fullQuestionPool',
                    )}
                    questionCountLabel={t('card.questions', { count: exam.questionCount })}
                    durationLabel={t('card.minutes', { count: exam.durationMinutes })}
                    difficultyLabel={t(`difficulty.${exam.displayDifficulty}`)}
                    actionLabel={isBusy ? t('card.starting') : t(actionKey)}
                    availabilityLabel={
                      exam.lockReason === 'insufficient_questions'
                        ? t('card.availableQuestions', {
                            available: exam.availableQuestionCount,
                            required: exam.questionCount,
                          })
                        : undefined
                    }
                    topics={exam.topics.map((topic) => t(`topics.${topic}`))}
                    icon={visual.icon}
                    tone={visual.tone}
                    isLocked={!exam.canStart}
                    isBusy={isBusy}
                    onStart={() => handleStart(exam)}
                  />
                )
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </section>
    </div>
  )
}
