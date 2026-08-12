'use client'

import { useMemo, useState } from 'react'

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
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useTranslations } from 'next-intl'

import { useAuthSessionStore } from '@/store/useAuthSessionStore'

import { cn } from '@/utils/cn'

import type { ExamCardTone } from '@/components/molecules/ExamCard'
import { ExamCard } from '@/components/molecules/ExamCard'

type ExamCategory = 'all' | 'mixed' | 'frontend' | 'backend' | 'system_design'
type ExamAccess = 'free' | 'pro'
type ExamDifficulty = 'introductory' | 'intermediate' | 'advanced'

type ExamDefinition = {
  id: 'warmup' | 'frontendBasics' | 'javascript' | 'react' | 'backend' | 'systemDesign'
  category: Exclude<ExamCategory, 'all'>
  access: ExamAccess
  difficulty: ExamDifficulty
  questionCount: number
  durationMinutes: number
  topicKeys: Array<'javascript' | 'typescript' | 'react' | 'node' | 'databases' | 'architecture'>
  icon: LucideIcon
  tone: ExamCardTone
}

const EXAM_CATEGORIES: ExamCategory[] = ['all', 'mixed', 'frontend', 'backend', 'system_design']

// Presentation-only definitions until the exam API owns templates and question selection.
const EXAMS: ExamDefinition[] = [
  {
    id: 'warmup',
    category: 'mixed',
    access: 'free',
    difficulty: 'introductory',
    questionCount: 8,
    durationMinutes: 10,
    topicKeys: ['javascript', 'typescript', 'databases'],
    icon: Sparkles,
    tone: 'blue',
  },
  {
    id: 'frontendBasics',
    category: 'frontend',
    access: 'free',
    difficulty: 'introductory',
    questionCount: 10,
    durationMinutes: 15,
    topicKeys: ['javascript', 'typescript', 'react'],
    icon: Code2,
    tone: 'green',
  },
  {
    id: 'javascript',
    category: 'frontend',
    access: 'pro',
    difficulty: 'intermediate',
    questionCount: 25,
    durationMinutes: 35,
    topicKeys: ['javascript', 'typescript'],
    icon: Braces,
    tone: 'amber',
  },
  {
    id: 'react',
    category: 'frontend',
    access: 'pro',
    difficulty: 'intermediate',
    questionCount: 20,
    durationMinutes: 30,
    topicKeys: ['react', 'javascript', 'typescript'],
    icon: Blocks,
    tone: 'purple',
  },
  {
    id: 'backend',
    category: 'backend',
    access: 'pro',
    difficulty: 'intermediate',
    questionCount: 25,
    durationMinutes: 40,
    topicKeys: ['node', 'databases', 'architecture'],
    icon: Database,
    tone: 'green',
  },
  {
    id: 'systemDesign',
    category: 'system_design',
    access: 'pro',
    difficulty: 'advanced',
    questionCount: 15,
    durationMinutes: 45,
    topicKeys: ['architecture', 'databases'],
    icon: Layers3,
    tone: 'purple',
  },
]

export const ExamHub = () => {
  const t = useTranslations('Exam')
  const profile = useAuthSessionStore((state) => state.profile)
  const initialized = useAuthSessionStore((state) => state.initialized)
  const loading = useAuthSessionStore((state) => state.loading)
  const [category, setCategory] = useState<ExamCategory>('all')
  const [selectedExamId, setSelectedExamId] = useState<ExamDefinition['id']>()
  const hasProAccess = profile?.plan === 'pro' || profile?.plan === 'admin'
  const isAccessLoading = !initialized || loading

  const visibleExams = useMemo(
    () => EXAMS.filter((exam) => category === 'all' || exam.category === category),
    [category],
  )

  const handleStart = (exam: ExamDefinition) => {
    if (isAccessLoading || (exam.access === 'pro' && !hasProAccess)) return
    setSelectedExamId(exam.id)
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
                {t('prototypeBadge')}
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

        <motion.div layout className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {visibleExams.map((exam) => {
              const isLocked = isAccessLoading || (exam.access === 'pro' && !hasProAccess)

              return (
                <ExamCard
                  key={exam.id}
                  title={t(`exams.${exam.id}.title`)}
                  description={t(`exams.${exam.id}.description`)}
                  accessLabel={t(`accessLabels.${exam.access}`)}
                  questionPoolLabel={t(
                    exam.access === 'free' ? 'card.freeQuestionPool' : 'card.fullQuestionPool',
                  )}
                  questionCountLabel={t('card.questions', { count: exam.questionCount })}
                  durationLabel={t('card.minutes', { count: exam.durationMinutes })}
                  difficultyLabel={t(`difficulty.${exam.difficulty}`)}
                  actionLabel={t(
                    isAccessLoading
                      ? 'card.checkingAccess'
                      : isLocked
                        ? 'card.proRequired'
                        : exam.access === 'free'
                          ? 'card.startPreview'
                          : 'card.startExam',
                  )}
                  topics={exam.topicKeys.map((topic) => t(`topics.${topic}`))}
                  icon={exam.icon}
                  tone={exam.tone}
                  isLocked={isLocked}
                  onStart={() => handleStart(exam)}
                />
              )
            })}
          </AnimatePresence>
        </motion.div>
      </section>

      <AnimatePresence>
        {selectedExamId && (
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="rounded-xl border border-primary/25 bg-primary/5 px-4 py-3 body-medium text-gray-100"
            role="status"
          >
            {t('runnerPending', { exam: t(`exams.${selectedExamId}.title`) })}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}
