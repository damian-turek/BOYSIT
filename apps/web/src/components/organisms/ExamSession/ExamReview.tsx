'use client'

import { useEffect, useMemo, useState } from 'react'

import { usePathname } from 'next/navigation'

import { fetchExamResult } from '@/services/examApi'
import type { ExamResult } from '@/types/exam'
import { ArrowLeft, CircleHelp, RefreshCw, Trophy } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'

import { cn } from '@/utils/cn'

import { Button } from '@/components/atoms/Button'

type ExamReviewProps = {
  sessionId: string
}

export const ExamReview = ({ sessionId }: ExamReviewProps) => {
  const t = useTranslations('Exam')
  const locale = useLocale()
  const pathname = usePathname()
  const [result, setResult] = useState<ExamResult>()
  const [loading, setLoading] = useState(true)
  const [retryKey, setRetryKey] = useState(0)
  const [error, setError] = useState<string>()
  const catalogPath = pathname.split('/').slice(0, -1).join('/')

  useEffect(() => {
    const controller = new AbortController()

    setLoading(true)
    setError(undefined)
    fetchExamResult(sessionId, controller.signal)
      .then(setResult)
      .catch((requestError: unknown) => {
        if (requestError instanceof DOMException && requestError.name === 'AbortError') return
        setError(requestError instanceof Error ? requestError.message : t('errors.result'))
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [retryKey, sessionId, t])

  const completedLabel = useMemo(() => {
    if (!result?.completedAt) return null
    return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(
      new Date(result.completedAt),
    )
  }, [locale, result?.completedAt])

  if (loading) {
    return (
      <div className="space-y-5" aria-live="polite">
        <div className="h-36 animate-pulse rounded-xl bg-gray-05" />
        <div className="h-80 animate-pulse rounded-xl bg-gray-05" />
        <span className="sr-only">{t('review.loading')}</span>
      </div>
    )
  }

  if (error || !result) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center rounded-xl border border-alert-50/25 bg-alert-50/5 p-8 text-center">
        <CircleHelp className="mb-3 text-alert-100" aria-hidden="true" />
        <h1 className="body-large text-gray-100">{t('review.loadErrorTitle')}</h1>
        <p className="body-medium mt-1 mb-5 text-gray-60">{error ?? t('errors.result')}</p>
        <Button variant="secondary" icon={RefreshCw} onClick={() => setRetryKey((key) => key + 1)}>
          {t('actions.retry')}
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <header className="rounded-xl border border-[var(--color-gray-10)] bg-gray-05 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Trophy size={22} aria-hidden="true" />
            </span>
            <div>
              <p className="body-small font-semibold text-primary">
                {t('review.completedEyebrow')}
              </p>
              <h1 className="text-[24px] leading-8 font-bold text-gray-100">
                {t(`exams.${result.examSlug}.title`)}
              </h1>
              <p className="body-medium mt-1 text-gray-60">{t('review.completedDescription')}</p>
              {completedLabel && (
                <p className="body-small mt-2 text-gray-60">
                  {t('review.completedAt', { date: completedLabel })}
                </p>
              )}
            </div>
          </div>
          <Button as="link" href={catalogPath} variant="secondary" icon={ArrowLeft}>
            {t('review.backToCatalog')}
          </Button>
        </div>
      </header>

      <section
        className="grid grid-cols-2 gap-3 md:grid-cols-4"
        aria-label={t('review.summaryLabel')}
      >
        <SummaryCard label={t('review.summary.total')} value={result.summary.total} />
        <SummaryCard label={t('review.summary.know')} value={result.summary.know} tone="success" />
        <SummaryCard
          label={t('review.summary.partial')}
          value={result.summary.partial}
          tone="warning"
        />
        <SummaryCard
          label={t('review.summary.dontKnow')}
          value={result.summary.dontKnow}
          tone="alert"
        />
      </section>

      <section className="space-y-4" aria-labelledby="exam-review-questions">
        <div>
          <h2 id="exam-review-questions" className="body-large text-gray-100">
            {t('review.questionsTitle')}
          </h2>
          <p className="body-medium text-gray-60">{t('review.questionsDescription')}</p>
        </div>

        {result.questions.map((question) => (
          <details
            key={question.id}
            className="group rounded-xl border border-[var(--color-gray-10)] bg-gray-05 open:border-primary/25"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
              <div>
                <p className="body-small font-semibold text-primary">
                  {t('review.questionNumber', { number: question.position })}
                </p>
                <h3 className="body-large text-gray-100">{question.title}</h3>
              </div>
              {question.assessment && (
                <span className="rounded-lg border border-primary/20 bg-primary/5 px-2.5 py-1 body-small font-semibold text-primary">
                  {t(`assessment.${question.assessment}`)}
                </span>
              )}
            </summary>

            <div className="space-y-5 border-t border-[var(--color-gray-10)] p-5">
              <ReviewBlock title={t('review.prompt')} content={question.questionText} />
              <ReviewBlock
                title={t('review.referenceAnswer')}
                content={question.answerText || t('review.noReferenceAnswer')}
                muted={!question.answerText}
              />
              {question.explanation && (
                <ReviewBlock title={t('review.explanation')} content={question.explanation} />
              )}
              {question.codeSnippet && (
                <div>
                  <h4 className="body-medium mb-2 font-semibold text-gray-100">
                    {t('review.codeSnippet')}
                  </h4>
                  <pre className="overflow-x-auto rounded-xl bg-gray-100 p-4 text-sm text-white dark:bg-black/40">
                    <code>{question.codeSnippet}</code>
                  </pre>
                </div>
              )}
            </div>
          </details>
        ))}
      </section>
    </div>
  )
}

const SummaryCard = ({
  label,
  value,
  tone = 'default',
}: {
  label: string
  value: number
  tone?: 'default' | 'success' | 'warning' | 'alert'
}) => (
  <div
    className={cn(
      'rounded-xl border border-[var(--color-gray-10)] bg-gray-05 p-4',
      tone === 'success' && 'border-success-50/25 bg-success-50/5',
      tone === 'warning' && 'border-warning-50/25 bg-warning-50/5',
      tone === 'alert' && 'border-alert-50/25 bg-alert-50/5',
    )}
  >
    <p className="text-2xl font-bold text-gray-100">{value}</p>
    <p className="body-small text-gray-60">{label}</p>
  </div>
)

const ReviewBlock = ({
  title,
  content,
  muted = false,
}: {
  title: string
  content: string
  muted?: boolean
}) => (
  <div>
    <h4 className="body-medium mb-2 font-semibold text-gray-100">{title}</h4>
    <p
      className={cn(
        'whitespace-pre-wrap rounded-xl border border-[var(--color-gray-10)] bg-white/60 p-4 body-medium text-gray-100 dark:bg-white/5',
        muted && 'italic text-gray-60',
      )}
    >
      {content}
    </p>
  </div>
)
