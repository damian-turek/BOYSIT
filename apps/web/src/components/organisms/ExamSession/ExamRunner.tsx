'use client'

import { useMemo, useState } from 'react'

import { completeExamReview, submitExamAssessment } from '@/services/examApi'
import type { ExamAssessment, ExamSession } from '@/types/exam'
import {
  CheckCircle2,
  Eye,
  HelpCircle,
  LoaderCircle,
  RotateCcw,
  ShieldCheck,
  XCircle,
} from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useTranslations } from 'next-intl'

import { cn } from '@/utils/cn'

import { Button } from '@/components/atoms/Button'
import { Tag } from '@/components/atoms/Tag'

type ExamRunnerProps = {
  session: ExamSession
  onCompleted: () => void
}

const ASSESSMENT_OPTIONS: Array<{
  value: ExamAssessment
  icon: typeof CheckCircle2
  className: string
}> = [
  {
    value: 'know',
    icon: CheckCircle2,
    className: 'border-success-50/30 bg-success-50/10 text-success-100 hover:bg-success-50/15',
  },
  {
    value: 'partial',
    icon: HelpCircle,
    className: 'border-warning-50/30 bg-warning-50/10 text-warning-100 hover:bg-warning-50/15',
  },
  {
    value: 'dont_know',
    icon: XCircle,
    className: 'border-alert-50/30 bg-alert-50/10 text-alert-100 hover:bg-alert-50/15',
  },
]

export const ExamRunner = ({ session, onCompleted }: ExamRunnerProps) => {
  const t = useTranslations('Exam')
  const initialAssessments = useMemo(
    () =>
      Object.fromEntries(
        session.questions
          .filter((question) => question.assessment)
          .map((question) => [question.id, question.assessment]),
      ) as Record<string, ExamAssessment>,
    [session.questions],
  )
  const firstUnassessedIndex = session.questions.findIndex((question) => !question.assessment)
  const [currentIndex, setCurrentIndex] = useState(
    firstUnassessedIndex === -1 ? Math.max(0, session.questions.length - 1) : firstUnassessedIndex,
  )
  const [assessments, setAssessments] = useState(initialAssessments)
  const [isRevealed, setIsRevealed] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string>()
  const currentQuestion = session.questions[currentIndex]
  const assessedCount = Object.keys(assessments).length

  const handleAssessment = async (assessment: ExamAssessment) => {
    if (!currentQuestion || saving) return

    setSaving(true)
    setError(undefined)

    try {
      await submitExamAssessment(session.id, currentQuestion.id, assessment)
      const nextAssessments = { ...assessments, [currentQuestion.id]: assessment }
      setAssessments(nextAssessments)

      if (Object.keys(nextAssessments).length === session.questions.length) {
        await completeExamReview(session.id)
        onCompleted()
        return
      }

      const nextIndex = session.questions.findIndex(
        (question, index) => index > currentIndex && !nextAssessments[question.id],
      )
      const wrappedIndex = session.questions.findIndex((question) => !nextAssessments[question.id])
      setCurrentIndex(nextIndex === -1 ? wrappedIndex : nextIndex)
      setIsRevealed(false)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : t('errors.assessment'))
    } finally {
      setSaving(false)
    }
  }

  if (!currentQuestion) {
    return <p className="rounded-xl bg-gray-05 p-6 text-gray-60">{t('runner.noQuestions')}</p>
  }

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <header className="surface-card p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="body-small font-semibold text-primary">{t('runner.eyebrow')}</p>
            <h1 className="text-[22px] leading-7 font-bold text-gray-100">
              {t(`exams.${session.examSlug}.title`)}
            </h1>
            <p className="body-medium mt-1 text-gray-60">
              {t('runner.progress', { assessed: assessedCount, total: session.questions.length })}
            </p>
          </div>
          <span className="rounded-lg bg-primary/10 px-3 py-1.5 body-small font-semibold text-primary">
            {t('runner.questionNumber', {
              current: currentIndex + 1,
              total: session.questions.length,
            })}
          </span>
        </div>
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-gray-60/10">
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-300"
            style={{ width: `${(assessedCount / session.questions.length) * 100}%` }}
          />
        </div>
      </header>

      {session.access === 'free' && (
        <aside className="flex gap-3 rounded-xl border border-primary/25 bg-primary/5 p-4">
          <ShieldCheck className="mt-0.5 shrink-0 text-primary" size={19} aria-hidden="true" />
          <div>
            <h2 className="body-medium font-semibold text-gray-100">
              {t('runner.freeDisclaimerTitle')}
            </h2>
            <p className="body-small mt-0.5 text-gray-60">
              {t('runner.freeDisclaimerDescription')}
            </p>
          </div>
        </aside>
      )}

      {error && (
        <p
          className="rounded-xl border border-alert-50/25 bg-alert-50/5 px-4 py-3 body-medium text-alert-100"
          role="alert"
        >
          {error}
        </p>
      )}

      <section aria-live="polite" aria-labelledby="flashcard-title">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={`${currentQuestion.id}-${isRevealed ? 'answer' : 'question'}`}
            initial={{ opacity: 0, rotateY: isRevealed ? -10 : 10, y: 8 }}
            animate={{ opacity: 1, rotateY: 0, y: 0 }}
            exit={{ opacity: 0, rotateY: isRevealed ? 10 : -10, y: -8 }}
            transition={{ duration: 0.2 }}
            className="surface-panel flex min-h-[430px] flex-col p-6 sm:p-8"
          >
            <div className="mb-6 flex flex-wrap items-center gap-2">
              <Tag
                text={
                  isRevealed
                    ? t('runner.answerSide')
                    : t(`questionTypes.${currentQuestion.questionType}`)
                }
              />
              <Tag
                text={t(`questionDifficulty.${currentQuestion.difficulty}`)}
                className="border-gray-60/20 bg-white text-gray-60 dark:bg-white/5"
              />
            </div>

            {!isRevealed ? (
              <div className="flex flex-1 flex-col">
                <h2 id="flashcard-title" className="text-2xl leading-8 font-bold text-gray-100">
                  {currentQuestion.title}
                </h2>
                <p className="mt-5 whitespace-pre-wrap body-large text-gray-100">
                  {currentQuestion.questionText}
                </p>
                <Button
                  className="mt-auto self-center sm:min-w-56"
                  icon={Eye}
                  onClick={() => setIsRevealed(true)}
                >
                  {t('runner.showAnswer')}
                </Button>
              </div>
            ) : (
              <div className="flex flex-1 flex-col">
                <h2 id="flashcard-title" className="body-small font-semibold text-primary">
                  {t('runner.referenceAnswer')}
                </h2>
                <p className="mt-2 whitespace-pre-wrap text-xl leading-8 font-semibold text-gray-100">
                  {currentQuestion.answerText || t('runner.noReferenceAnswer')}
                </p>
                {currentQuestion.explanation && (
                  <div className="surface-inset mt-6 p-4">
                    <h3 className="body-small font-semibold text-primary">
                      {t('runner.explanation')}
                    </h3>
                    <p className="mt-1 whitespace-pre-wrap body-medium text-gray-100">
                      {currentQuestion.explanation}
                    </p>
                  </div>
                )}
                {currentQuestion.codeSnippet && (
                  <pre className="surface-inset mt-5 overflow-x-auto p-4 font-mono text-sm text-gray-100">
                    <code>{currentQuestion.codeSnippet}</code>
                  </pre>
                )}

                <div className="mt-auto pt-8">
                  <p className="mb-3 text-center body-medium font-semibold text-gray-100">
                    {t('runner.assessmentPrompt')}
                  </p>
                  <div
                    className="grid gap-2 sm:grid-cols-3"
                    role="group"
                    aria-label={t('runner.assessmentPrompt')}
                  >
                    {ASSESSMENT_OPTIONS.map(({ value, icon: Icon, className }) => (
                      <button
                        key={value}
                        type="button"
                        disabled={saving}
                        onClick={() => handleAssessment(value)}
                        className={cn(
                          'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border px-3 py-2 body-small font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-wait disabled:opacity-60',
                          className,
                        )}
                      >
                        {saving ? (
                          <LoaderCircle className="animate-spin" size={16} aria-hidden="true" />
                        ) : (
                          <Icon size={16} aria-hidden="true" />
                        )}
                        {t(`assessment.${value}`)}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => setIsRevealed(false)}
                    className="mx-auto mt-4 flex items-center gap-1.5 body-small font-semibold text-gray-60 hover:text-gray-100 disabled:opacity-50"
                  >
                    <RotateCcw size={14} aria-hidden="true" />
                    {t('runner.showQuestion')}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </section>
    </div>
  )
}
