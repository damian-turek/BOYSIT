'use client'

import { useEffect, useState } from 'react'

import { fetchExamSession } from '@/services/examApi'
import type { ExamSession as ExamSessionData } from '@/types/exam'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/atoms/Button'

import { ExamReview } from './ExamReview'
import { ExamRunner } from './ExamRunner'

export type ExamSessionProps = {
  sessionId: string
}

export const ExamSession = ({ sessionId }: ExamSessionProps) => {
  const t = useTranslations('Exam')
  const [session, setSession] = useState<ExamSessionData>()
  const [loading, setLoading] = useState(true)
  const [retryKey, setRetryKey] = useState(0)
  const [error, setError] = useState<string>()

  useEffect(() => {
    const controller = new AbortController()

    setLoading(true)
    setError(undefined)

    fetchExamSession(sessionId, controller.signal)
      .then(setSession)
      .catch((requestError: unknown) => {
        if (requestError instanceof DOMException && requestError.name === 'AbortError') return
        setError(requestError instanceof Error ? requestError.message : t('errors.session'))
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [retryKey, sessionId, t])

  if (loading) {
    return (
      <div className="space-y-5" aria-live="polite">
        <div className="h-20 animate-pulse rounded-xl bg-gray-05" />
        <div className="h-[480px] animate-pulse rounded-xl bg-gray-05" />
        <span className="sr-only">{t('session.loading')}</span>
      </div>
    )
  }

  if (error || !session) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center rounded-xl border border-alert-50/25 bg-alert-50/5 p-8 text-center">
        <AlertTriangle className="mb-3 text-alert-100" aria-hidden="true" />
        <h1 className="body-large text-gray-100">{t('session.loadErrorTitle')}</h1>
        <p className="body-medium mt-1 mb-5 text-gray-60">{error ?? t('errors.session')}</p>
        <Button variant="secondary" icon={RefreshCw} onClick={() => setRetryKey((key) => key + 1)}>
          {t('actions.retry')}
        </Button>
      </div>
    )
  }

  if (session.status !== 'in_progress') {
    return <ExamReview sessionId={session.id} />
  }

  return (
    <ExamRunner session={session} onSubmitted={() => setRetryKey((currentKey) => currentKey + 1)} />
  )
}
