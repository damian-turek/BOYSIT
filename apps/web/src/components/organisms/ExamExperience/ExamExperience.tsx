'use client'

import { useEffect, useRef, useState } from 'react'

import { AlertTriangle, CheckCircle2, Clock, RotateCcw, XCircle } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'

import { ExamDifficulty, ExamQuestion, startExam, submitExam } from '@/services/examApi'

import { Button } from '@/components/atoms/Button'
import { Tag } from '@/components/atoms/Tag'

const QUESTION_TIME_SECONDS = 60
const QUESTION_COUNT = 10

type Stage = 'select' | 'active' | 'results'

type RecordedAnswer = {
  questionId: string
  knewIt: boolean
}

const DIFFICULTY_OPTIONS: {
  value: ExamDifficulty
  label: string
  description: string
  className: string
}[] = [
  {
    value: 'junior',
    label: 'Junior',
    description: 'Fundamentals and the questions you get asked most often.',
    className: 'bg-success-50/10 border-success-50/30 hover:border-success-50/60',
  },
  {
    value: 'middle',
    label: 'Middle',
    description: 'Practical scenarios, trade-offs, and everyday production issues.',
    className: 'bg-warning-50/10 border-warning-50/30 hover:border-warning-50/60',
  },
  {
    value: 'senior',
    label: 'Senior',
    description: 'Architecture, leadership calls, and deep technical dives.',
    className: 'bg-alert-50/10 border-alert-50/30 hover:border-alert-50/60',
  },
]

export const ExamExperience = () => {
  const [stage, setStage] = useState<Stage>('select')
  const [isLoading, setIsLoading] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [difficulty, setDifficulty] = useState<ExamDifficulty | null>(null)
  const [questions, setQuestions] = useState<ExamQuestion[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<RecordedAnswer[]>([])
  const [revealed, setRevealed] = useState(false)
  const [timedOut, setTimedOut] = useState(false)
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME_SECONDS)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [serverResult, setServerResult] = useState<{
    correctCount: number
    scorePercentage: number
  } | null>(null)

  const startedAtRef = useRef<number>(0)

  useEffect(() => {
    if (stage !== 'active' || revealed) return

    if (timeLeft <= 0) {
      setRevealed(true)
      setTimedOut(true)
      return
    }

    const timer = setTimeout(() => setTimeLeft((value) => value - 1), 1000)
    return () => clearTimeout(timer)
  }, [stage, revealed, timeLeft])

  const handleStart = async (selectedDifficulty: ExamDifficulty) => {
    setIsLoading(true)
    setLoadError(null)

    try {
      const data = await startExam(selectedDifficulty, QUESTION_COUNT)

      if (!data.totalQuestions) {
        setLoadError("There aren't enough questions for this level yet - try another one.")
        return
      }

      setDifficulty(selectedDifficulty)
      setQuestions(data.questions)
      setCurrentIndex(0)
      setAnswers([])
      setRevealed(false)
      setTimedOut(false)
      setTimeLeft(QUESTION_TIME_SECONDS)
      setServerResult(null)
      setSubmitError(null)
      startedAtRef.current = Date.now()
      setStage('active')
    } catch {
      setLoadError('Could not start the exam. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const finishExam = async (finalAnswers: RecordedAnswer[]) => {
    if (!difficulty) return

    setIsSubmitting(true)
    setSubmitError(null)

    const durationSeconds = Math.max(1, Math.round((Date.now() - startedAtRef.current) / 1000))

    try {
      const result = await submitExam({ difficulty, answers: finalAnswers, durationSeconds })
      setServerResult({ correctCount: result.correctCount, scorePercentage: result.scorePercentage })
    } catch {
      setSubmitError("Your score below is accurate, but we couldn't save this attempt to your history.")
    } finally {
      setIsSubmitting(false)
      setStage('results')
    }
  }

  const handleAnswer = (knewIt: boolean) => {
    const currentQuestion = questions[currentIndex]
    if (!currentQuestion) return

    const nextAnswers = [...answers, { questionId: currentQuestion.id, knewIt }]
    setAnswers(nextAnswers)

    if (currentIndex + 1 >= questions.length) {
      void finishExam(nextAnswers)
      return
    }

    setCurrentIndex((index) => index + 1)
    setRevealed(false)
    setTimedOut(false)
    setTimeLeft(QUESTION_TIME_SECONDS)
  }

  const handleRestart = () => {
    setStage('select')
    setDifficulty(null)
    setQuestions([])
    setAnswers([])
    setServerResult(null)
    setSubmitError(null)
  }

  if (stage === 'select') {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="tiles-title-font text-gray-100 mb-2">Exam Mode</h1>
          <p className="body-medium text-gray-60">
            Pick a level. You&apos;ll get {QUESTION_COUNT} timed questions, one at a time - reveal the
            answer, then mark honestly whether you knew it.
          </p>
        </div>

        {loadError && (
          <div className="flex items-center gap-2 rounded-xl border border-alert-50/30 bg-alert-50/10 px-4 py-3 body-small text-alert-50">
            <AlertTriangle size={16} aria-hidden="true" />
            {loadError}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {DIFFICULTY_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              disabled={isLoading}
              onClick={() => void handleStart(option.value)}
              className={`text-left p-6 rounded-xl border transition-all ease-in-out duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${option.className}`}
            >
              <p className="body-large text-gray-100 mb-2">{option.label}</p>
              <p className="body-small text-gray-60">{option.description}</p>
            </button>
          ))}
        </div>
      </div>
    )
  }

  if (stage === 'active') {
    const currentQuestion = questions[currentIndex]
    if (!currentQuestion) return null

    const minutes = Math.floor(timeLeft / 60)
    const seconds = timeLeft % 60

    return (
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Tag text={difficulty ?? ''} className="capitalize" />
            <p className="body-small text-gray-60">
              Question {currentIndex + 1} of {questions.length}
            </p>
          </div>
          <div
            className={`flex items-center gap-1.5 label-font ${timeLeft <= 10 && !revealed ? 'text-alert-50' : 'text-gray-60'}`}
          >
            <Clock size={14} aria-hidden="true" />
            {minutes}:{seconds.toString().padStart(2, '0')}
          </div>
        </div>

        <div className="h-1.5 w-full rounded-full bg-gray-60/10 overflow-hidden">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="p-8 rounded-2xl bg-primary/5 border border-primary/20 flex flex-col gap-4"
          >
            {(currentQuestion.category || currentQuestion.technology) && (
              <div className="flex gap-2">
                {currentQuestion.category && (
                  <Tag
                    text={currentQuestion.category}
                    className="bg-gray-60/5 text-gray-60 border-gray-60/30"
                  />
                )}
                {currentQuestion.technology && (
                  <Tag
                    text={currentQuestion.technology}
                    className="bg-gray-60/5 text-gray-60 border-gray-60/30"
                  />
                )}
              </div>
            )}

            <p
              className="tiles-title-font text-gray-100"
              dangerouslySetInnerHTML={{ __html: currentQuestion.questionText }}
            />

            {!revealed ? (
              <Button className="w-fit mt-2" onClick={() => setRevealed(true)}>
                Show answer
              </Button>
            ) : (
              <div className="mt-2 flex flex-col gap-4">
                <div className="border-t border-primary/20 pt-4">
                  {timedOut && (
                    <p className="body-small text-alert-50 mb-2">Time&apos;s up for this one.</p>
                  )}
                  <p className="body-large text-gray-100 mb-2">Answer</p>
                  {currentQuestion.answerText ? (
                    <p
                      className="body-font text-gray-100"
                      dangerouslySetInnerHTML={{ __html: currentQuestion.answerText }}
                    />
                  ) : (
                    <p className="body-font text-gray-60">No written answer for this question.</p>
                  )}
                  {currentQuestion.explanation && (
                    <p
                      className="body-font text-gray-60 mt-3"
                      dangerouslySetInnerHTML={{ __html: currentQuestion.explanation }}
                    />
                  )}
                  {currentQuestion.codeSnippet && (
                    <pre className="mt-3 overflow-x-auto rounded-lg bg-gray-100/5 p-4 body-small text-gray-100">
                      <code>{currentQuestion.codeSnippet}</code>
                    </pre>
                  )}
                </div>

                {timedOut ? (
                  <Button
                    variant="secondary"
                    className="w-fit"
                    disabled={isSubmitting}
                    onClick={() => handleAnswer(false)}
                  >
                    Continue (marked as didn&apos;t know) →
                  </Button>
                ) : (
                  <div className="flex gap-3">
                    <Button
                      disabled={isSubmitting}
                      icon={CheckCircle2}
                      onClick={() => handleAnswer(true)}
                    >
                      I knew it
                    </Button>
                    <Button
                      variant="secondary"
                      disabled={isSubmitting}
                      icon={XCircle}
                      onClick={() => handleAnswer(false)}
                    >
                      I didn&apos;t know it
                    </Button>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    )
  }

  const correctCount = serverResult?.correctCount ?? answers.filter((answer) => answer.knewIt).length
  const scorePercentage =
    serverResult?.scorePercentage ?? Math.round((correctCount / Math.max(1, answers.length)) * 100)

  return (
    <div className="flex flex-col gap-6">
      <div className="p-8 rounded-2xl bg-primary/5 border border-primary/20 flex flex-col items-center text-center gap-2">
        <Tag text={difficulty ?? ''} className="capitalize mb-2" />
        <p className="tiles-title-font text-gray-100">
          {correctCount} / {answers.length} correct
        </p>
        <p className="body-medium text-gray-60">{scorePercentage}% score</p>
      </div>

      {submitError && (
        <div className="flex items-center gap-2 rounded-xl border border-alert-50/30 bg-alert-50/10 px-4 py-3 body-small text-alert-50">
          <AlertTriangle size={16} aria-hidden="true" />
          {submitError}
        </div>
      )}

      <div className="flex flex-col rounded-xl border border-gray-60/40 bg-gray-60/5 overflow-hidden">
        {questions.map((question, index) => {
          const answer = answers[index]
          return (
            <div
              key={question.id}
              className="flex items-center justify-between gap-4 border-b border-gray-60/40 last:border-none p-4"
            >
              <p className="body-small text-gray-100 line-clamp-1">{question.title}</p>
              {answer?.knewIt ? (
                <CheckCircle2 size={18} className="text-success-50 shrink-0" aria-hidden="true" />
              ) : (
                <XCircle size={18} className="text-alert-50 shrink-0" aria-hidden="true" />
              )}
            </div>
          )
        })}
      </div>

      <div className="flex gap-3">
        <Button icon={RotateCcw} onClick={handleRestart}>
          Try another level
        </Button>
        <Button as="link" href="/dashboard" variant="secondary">
          Back to dashboard
        </Button>
      </div>
    </div>
  )
}
