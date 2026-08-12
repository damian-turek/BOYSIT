'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { saveExamAnswer, submitExam } from '@/services/examApi'
import type { ExamSession } from '@/types/exam'
import { ArrowLeft, ArrowRight, Check, Clock3, Send, ShieldCheck } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { cn } from '@/utils/cn'

import { Button } from '@/components/atoms/Button'
import { Tag } from '@/components/atoms/Tag'

type ExamRunnerProps = {
  session: ExamSession
  onSubmitted: () => void
}

type SaveState = 'idle' | 'saving' | 'saved' | 'error'

const calculateRemainingSeconds = (expiresAt: string) =>
  Math.max(0, Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 1_000))

const formatRemainingTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`
}

export const ExamRunner = ({ session, onSubmitted }: ExamRunnerProps) => {
  const t = useTranslations('Exam')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      session.questions.map((question) => [question.id, question.userAnswer ?? '']),
    ),
  )
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [error, setError] = useState<string>()
  const [submitting, setSubmitting] = useState(false)
  const [remainingSeconds, setRemainingSeconds] = useState(() =>
    calculateRemainingSeconds(session.expiresAt),
  )
  const savedAnswersRef = useRef(
    Object.fromEntries(
      session.questions.map((question) => [question.id, question.userAnswer ?? '']),
    ),
  )
  const saveVersionsRef = useRef<Record<string, number>>({})
  const autoSubmitStartedRef = useRef(false)
  const currentQuestion = session.questions[currentIndex]
  const currentAnswer = currentQuestion ? (answers[currentQuestion.id] ?? '') : ''

  const answeredCount = useMemo(
    () => Object.values(answers).filter((answer) => answer.trim().length > 0).length,
    [answers],
  )

  const persistAnswer = useCallback(
    async (questionId: string, answer: string) => {
      if (savedAnswersRef.current[questionId] === answer) return

      const version = (saveVersionsRef.current[questionId] ?? 0) + 1
      saveVersionsRef.current[questionId] = version
      setSaveState('saving')

      try {
        await saveExamAnswer(session.id, questionId, answer)

        if (saveVersionsRef.current[questionId] === version) {
          savedAnswersRef.current[questionId] = answer
          setSaveState('saved')
          setError(undefined)
        }
      } catch (requestError) {
        if (saveVersionsRef.current[questionId] === version) {
          setSaveState('error')
          setError(requestError instanceof Error ? requestError.message : t('errors.saveAnswer'))
        }
        throw requestError
      }
    },
    [session.id, t],
  )

  const handleSubmit = useCallback(
    async (automatic = false) => {
      if (submitting) return
      if (!automatic && !window.confirm(t('runner.submitConfirm'))) return

      setSubmitting(true)
      setError(undefined)

      try {
        if (currentQuestion) {
          try {
            await persistAnswer(currentQuestion.id, answers[currentQuestion.id] ?? '')
          } catch {
            if (!automatic) {
              setSubmitting(false)
              return
            }
          }
        }

        await submitExam(session.id)
        onSubmitted()
      } catch (requestError) {
        if (automatic) autoSubmitStartedRef.current = false
        setError(requestError instanceof Error ? requestError.message : t('errors.submit'))
        setSubmitting(false)
      }
    },
    [answers, currentQuestion, onSubmitted, persistAnswer, session.id, submitting, t],
  )

  useEffect(() => {
    if (!currentQuestion || savedAnswersRef.current[currentQuestion.id] === currentAnswer) return

    const timeoutId = window.setTimeout(() => {
      persistAnswer(currentQuestion.id, currentAnswer).catch(() => undefined)
    }, 800)

    return () => window.clearTimeout(timeoutId)
  }, [currentAnswer, currentQuestion, persistAnswer])

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      const nextRemainingSeconds = calculateRemainingSeconds(session.expiresAt)
      setRemainingSeconds(nextRemainingSeconds)

      if (nextRemainingSeconds === 0 && !autoSubmitStartedRef.current) {
        autoSubmitStartedRef.current = true
        handleSubmit(true).catch(() => undefined)
      }
    }, 1_000)

    return () => window.clearInterval(intervalId)
  }, [handleSubmit, session.expiresAt])

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      const hasUnsavedAnswer = session.questions.some(
        (question) => savedAnswersRef.current[question.id] !== (answers[question.id] ?? ''),
      )

      if (!hasUnsavedAnswer || submitting) return
      event.preventDefault()
      event.returnValue = ''
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [answers, session.questions, submitting])

  const navigateTo = async (nextIndex: number) => {
    if (!currentQuestion || nextIndex < 0 || nextIndex >= session.questions.length) return

    try {
      await persistAnswer(currentQuestion.id, currentAnswer)
      setCurrentIndex(nextIndex)
      setSaveState('idle')
    } catch {
      // Keep the user on the current question until its answer is saved.
    }
  }

  if (!currentQuestion) {
    return <p className="rounded-xl bg-gray-05 p-6 text-gray-60">{t('runner.noQuestions')}</p>
  }

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-4 rounded-xl border border-[var(--color-gray-10)] bg-gray-05 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="body-small font-semibold text-primary">{t('runner.eyebrow')}</p>
          <h1 className="text-[22px] leading-7 font-bold text-gray-100">
            {t(`exams.${session.examSlug}.title`)}
          </h1>
          <p className="body-medium mt-1 text-gray-60">
            {t('runner.progress', { answered: answeredCount, total: session.questions.length })}
          </p>
        </div>
        <div
          className={cn(
            'inline-flex w-fit items-center gap-2 rounded-xl border px-4 py-2 font-mono text-lg font-bold',
            remainingSeconds <= 60
              ? 'border-alert-50/30 bg-alert-50/10 text-alert-100'
              : 'border-primary/25 bg-primary/5 text-primary',
          )}
          aria-live="polite"
        >
          <Clock3 size={18} aria-hidden="true" />
          {formatRemainingTime(remainingSeconds)}
        </div>
      </header>

      {error && (
        <p
          className="rounded-xl border border-alert-50/25 bg-alert-50/5 px-4 py-3 body-medium text-alert-100"
          role="alert"
        >
          {error}
        </p>
      )}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_260px]">
        <section
          className="rounded-xl border border-[var(--color-gray-10)] bg-gray-05 p-5 sm:p-7"
          aria-labelledby="exam-question-title"
        >
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              <Tag
                text={t('runner.questionNumber', {
                  current: currentIndex + 1,
                  total: session.questions.length,
                })}
              />
              <Tag
                text={t(`questionTypes.${currentQuestion.questionType}`)}
                className="border-gray-60/20 bg-white text-gray-60 dark:bg-white/5"
              />
              <Tag
                text={t(`questionDifficulty.${currentQuestion.difficulty}`)}
                className="border-gray-60/20 bg-white text-gray-60 dark:bg-white/5"
              />
            </div>
            <span className="body-small text-gray-60" role="status">
              {saveState === 'saving'
                ? t('runner.saving')
                : saveState === 'saved'
                  ? t('runner.saved')
                  : saveState === 'error'
                    ? t('runner.saveFailed')
                    : ''}
            </span>
          </div>

          <h2 id="exam-question-title" className="mb-3 text-xl font-bold text-gray-100">
            {currentQuestion.title}
          </h2>
          <p className="mb-7 whitespace-pre-wrap body-large text-gray-100">
            {currentQuestion.questionText}
          </p>

          <label
            htmlFor="exam-answer"
            className="mb-2 block body-medium font-semibold text-gray-100"
          >
            {t('runner.answerLabel')}
          </label>
          <textarea
            id="exam-answer"
            value={currentAnswer}
            maxLength={10_000}
            rows={10}
            onChange={(event) => {
              setAnswers((currentAnswers) => ({
                ...currentAnswers,
                [currentQuestion.id]: event.target.value,
              }))
              setSaveState('idle')
            }}
            placeholder={t('runner.answerPlaceholder')}
            className="w-full resize-y rounded-xl border border-[var(--color-gray-10)] bg-white p-4 body-medium text-gray-100 outline-none transition-colors placeholder:text-gray-60/70 focus:border-primary dark:bg-white/5"
          />

          <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Button
              variant="secondary"
              icon={ArrowLeft}
              disabled={currentIndex === 0 || submitting}
              onClick={() => navigateTo(currentIndex - 1)}
            >
              {t('runner.previous')}
            </Button>
            <div className="flex flex-col gap-3 sm:flex-row">
              {currentIndex < session.questions.length - 1 ? (
                <Button
                  icon={ArrowRight}
                  disabled={submitting}
                  onClick={() => navigateTo(currentIndex + 1)}
                >
                  {t('runner.next')}
                </Button>
              ) : (
                <Button icon={Send} disabled={submitting} onClick={() => handleSubmit(false)}>
                  {submitting ? t('runner.submitting') : t('runner.submit')}
                </Button>
              )}
            </div>
          </div>
        </section>

        <aside
          className="h-fit rounded-xl border border-[var(--color-gray-10)] bg-gray-05 p-5 lg:sticky lg:top-5"
          aria-label={t('runner.navigationLabel')}
        >
          <div className="mb-4 flex items-center gap-2 text-gray-100">
            <ShieldCheck size={18} className="text-primary" aria-hidden="true" />
            <h2 className="body-large">{t('runner.navigationTitle')}</h2>
          </div>
          <div className="grid grid-cols-5 gap-2 sm:grid-cols-8 lg:grid-cols-5">
            {session.questions.map((question, index) => {
              const isCurrent = index === currentIndex
              const isAnswered = (answers[question.id] ?? '').trim().length > 0

              return (
                <button
                  key={question.id}
                  type="button"
                  aria-current={isCurrent ? 'step' : undefined}
                  aria-label={t('runner.goToQuestion', { number: index + 1 })}
                  onClick={() => navigateTo(index)}
                  className={cn(
                    'relative flex aspect-square items-center justify-center rounded-lg border body-small font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
                    isCurrent
                      ? 'border-primary bg-primary text-white'
                      : isAnswered
                        ? 'border-success-50/30 bg-success-50/10 text-success-100'
                        : 'border-gray-60/20 bg-white text-gray-60 hover:border-primary/30 dark:bg-white/5',
                  )}
                >
                  {index + 1}
                  {isAnswered && !isCurrent && (
                    <Check size={10} className="absolute right-1 top-1" aria-hidden="true" />
                  )}
                </button>
              )
            })}
          </div>
          <Button
            className="mt-5 w-full"
            variant="secondary"
            icon={Send}
            disabled={submitting}
            onClick={() => handleSubmit(false)}
          >
            {submitting ? t('runner.submitting') : t('runner.submit')}
          </Button>
        </aside>
      </div>
    </div>
  )
}
