'use client'

import { useEffect, useState } from 'react'

import { usePathname } from 'next/navigation'

import { fetchExamResult } from '@/services/examApi'
import type { ExamResult } from '@/types/exam'
import { CircleHelp, RefreshCw } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/atoms/Button'
import { LoadingState } from '@/components/molecules/LoadingState'
import { ExamResultsSkeleton } from '@/components/organisms/PageLoading/PageSkeletons'

import { ExamResultView } from './ExamResultView'

type ExamReviewProps = {
  sessionId: string
}

export const ExamReview = ({ sessionId }: ExamReviewProps) => {
  const t = useTranslations('Exam')
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

  if (loading) {
    return (
      <LoadingState label={t('review.loading')}>
        <ExamResultsSkeleton />
      </LoadingState>
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

  return <ExamResultView result={result} catalogPath={catalogPath} />
}
