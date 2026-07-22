'use client'

import { useState } from 'react'

import Link from 'next/link'

import { Level } from '@/types/question'
import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Code2,
  Copy,
  Cpu,
  Crown,
  Database,
  GitBranch,
  Layers,
  Lock,
  Server,
  Share2,
  Shield,
} from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'

import { useAuthSessionStore } from '@/store/useAuthSessionStore'
import { useAuthStore } from '@/store/useAuthStore'

import { cn } from '@/utils/cn'

const categoryIconConfig = {
  algorithms: { icon: Cpu, color: 'text-[#2B7FFF]' },
  backend: { icon: Server, color: 'text-[#615FFF]' },
  databases: { icon: Database, color: 'text-[#FF6900]' },
  devops: { icon: GitBranch, color: 'text-[#00BC7D]' },
  frontend: { icon: Code2, color: 'text-[#F0B100]' },
  security: { icon: Shield, color: 'text-[#FF2056]' },
  'system-design': { icon: Layers, color: 'text-[#AD46FF]' },
  testing: { icon: CheckCircle2, color: 'text-[#14B8A6]' },
} as const

const gradeConfig: Record<Level, { label: string; className: string }> = {
  Junior: {
    label: 'Junior',
    className:
      'border-[#A8DDD1] bg-[#DFF3EF] text-[#008A67] dark:border-success-50/30 dark:bg-success-50/15 dark:text-success-50',
  },
  Middle: {
    label: 'Mid-level',
    className:
      'border-[#F5C8AA] bg-[#FFF0E6] text-[#A64F21] dark:border-warning-50/30 dark:bg-warning-50/15 dark:text-warning-50',
  },
  Senior: {
    label: 'Senior',
    className:
      'border-[#F2B8BA] bg-[#FDE7E8] text-[#9F1B1F] dark:border-alert-50/30 dark:bg-alert-50/15 dark:text-alert-50',
  },
}

const questionTypeLabels = {
  theory: 'Theory',
  practical: 'Practical',
  code: 'Code',
  system_design: 'System design',
  troubleshooting: 'Troubleshooting',
} as const

export type QuestionDetailProps = {
  question: QuestionDetailData
}

export const QuestionDetail = ({ question }: QuestionDetailProps) => {
  const [answerOpen, setAnswerOpen] = useState(false)
  const [saved, setSaved] = useState(false)
  const [copied, setCopied] = useState(false)
  const profile = useAuthSessionStore((state) => state.profile)
  const openAuthModal = useAuthStore((state) => state.openModal)

  const categoryMeta =
    categoryIconConfig[question.category?.slug as keyof typeof categoryIconConfig]
  const CategoryIcon = categoryMeta?.icon ?? Code2
  const grade = gradeConfig[question.difficulty]
  const chips = [
    ...(question.technology ? [question.technology.name] : []),
    ...question.tags.map((tag) => tag.name),
  ]

  const handleShare = async () => {
    if (typeof window === 'undefined') return

    try {
      if (navigator.share) {
        await navigator.share({ title: question.title, url: window.location.href })
        return
      }

      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return
    }
  }

  return (
    <main className="dashboard-container">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex min-w-0 items-center gap-2">
          <Link
            href="/dashboard/questions"
            className="group flex shrink-0 items-center gap-1.5 text-sm text-gray-60 transition-colors hover:text-gray-100"
          >
            <ArrowLeft size={15} className="transition-transform group-hover:-translate-x-0.5" />
            Questions
          </Link>
          <ChevronRight size={13} className="shrink-0 text-gray-60/50" />
          <span className="truncate text-sm text-gray-60">
            {question.category?.name ?? 'Question'}
          </span>
        </div>

        <motion.article
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-4 rounded-2xl border border-[var(--color-gray-10)] bg-white p-5 sm:p-8"
        >
          <div className="mb-5 flex flex-wrap items-center gap-2">
            <span
              className={cn(
                'inline-flex rounded-md border px-2 py-0.5 font-mono text-[11px] leading-4 font-semibold',
                grade.className,
              )}
            >
              {grade.label}
            </span>
            {question.category && (
              <span className="flex items-center gap-1.5 font-mono text-[11px] leading-4 text-gray-60">
                <CategoryIcon size={13} className={categoryMeta?.color} />
                {question.category.name}
              </span>
            )}
            <span className="font-mono text-[11px] leading-4 text-gray-60/70">
              · {questionTypeLabels[question.questionType]}
            </span>
          </div>

          <h1 className="mb-4 text-lg leading-relaxed font-semibold text-gray-100 sm:text-xl">
            {question.title}
          </h1>

          {(question.questionText || question.excerpt) && (
            <p className="mb-5 text-[14px] leading-[22px] text-gray-60">
              {question.questionText ?? question.excerpt}
            </p>
          )}

          {chips.length > 0 && (
            <div className="mb-6 flex flex-wrap gap-2">
              {chips.map((chip) => (
                <span
                  key={chip}
                  className="rounded-lg border border-[var(--color-gray-10)] bg-background px-2.5 py-1 font-mono text-[11px] leading-4 text-gray-60"
                >
                  {chip}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2 border-t border-[var(--color-gray-10)] pt-5">
            <button
              type="button"
              onClick={() => setSaved((value) => !value)}
              aria-pressed={saved}
              className={cn(
                'flex cursor-pointer items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition-all',
                saved
                  ? 'border-primary/30 bg-primary/10 text-primary'
                  : 'border-[var(--color-gray-10)] text-gray-60 hover:bg-background hover:text-gray-100',
              )}
            >
              {saved ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
              {saved ? 'Saved' : 'Save'}
            </button>
            <button
              type="button"
              onClick={() => void handleShare()}
              className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-[var(--color-gray-10)] px-3 py-2 text-xs font-semibold text-gray-60 transition-all hover:bg-background hover:text-gray-100"
            >
              {copied ? <Copy size={14} /> : <Share2 size={14} />}
              {copied ? 'Copied' : 'Share'}
            </button>
          </div>
        </motion.article>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-6 overflow-hidden rounded-2xl border border-[var(--color-gray-10)] bg-white"
        >
          <button
            type="button"
            onClick={() => !question.locked && setAnswerOpen((value) => !value)}
            aria-expanded={question.locked ? true : answerOpen}
            className={cn(
              'flex w-full items-center justify-between px-5 py-4 text-left transition-colors sm:px-6',
              question.locked ? 'cursor-default' : 'cursor-pointer hover:bg-background/70',
            )}
          >
            <span className="flex items-center gap-2">
              {question.locked ? (
                <Lock size={15} className="text-gray-60" />
              ) : (
                <ChevronDown
                  size={15}
                  className={cn(
                    'text-primary transition-transform duration-200',
                    answerOpen && 'rotate-180',
                  )}
                />
              )}
              <span className="text-sm font-semibold text-gray-100">
                {question.locked ? 'Answer - Pro only' : 'Show answer'}
              </span>
            </span>

            {question.locked && (
              <span className="flex items-center gap-1 rounded-lg border border-primary/20 bg-primary/10 px-2 py-0.5 font-mono text-xs text-primary">
                <Crown size={11} />
                Pro
              </span>
            )}
          </button>

          <AnimatePresence initial={false}>
            {(answerOpen || question.locked) && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.22 }}
                className="overflow-hidden"
              >
                <div className="border-t border-[var(--color-gray-10)] px-5 pb-6 sm:px-6">
                  {question.locked ? (
                    <div className="flex flex-col items-center py-10 text-center">
                      <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary/10">
                        <Crown size={26} className="text-primary" />
                      </div>
                      <p className="mb-1 text-sm font-semibold text-gray-100">
                        This answer is for Pro members
                      </p>
                      <p className="body-small mb-5 max-w-xs text-gray-60">
                        {profile
                          ? 'Upgrade to Pro to unlock expert answers and the complete question library.'
                          : 'Sign in to unlock your personalized access and the full preview.'}
                      </p>
                      {profile ? (
                        <Link
                          href="/pricing"
                          className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95"
                        >
                          Try Pro free for 7 days
                          <ChevronRight size={14} />
                        </Link>
                      ) : (
                        <button
                          type="button"
                          onClick={() => openAuthModal('login')}
                          className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95"
                        >
                          Sign in
                          <ChevronRight size={14} />
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="pt-4">
                      {question.codeSnippet && (
                        <pre className="mb-4 overflow-x-auto whitespace-pre-wrap rounded-xl border border-[var(--color-gray-10)] bg-background p-4 font-mono text-xs leading-relaxed text-gray-100">
                          <code>{question.codeSnippet}</code>
                        </pre>
                      )}
                      <p className="text-[14px] leading-[22px] text-gray-60">
                        {question.answerText ?? 'No answer has been added yet.'}
                      </p>
                      {question.explanation && (
                        <div className="mt-5 rounded-xl bg-background p-4">
                          <p className="mb-2 font-mono text-[11px] leading-4 font-semibold tracking-[1.2px] text-gray-60 uppercase">
                            Explanation
                          </p>
                          <p className="text-[14px] leading-[22px] text-gray-60">
                            {question.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>
      </div>
    </main>
  )
}
