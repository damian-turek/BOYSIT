'use client'

import { useId, useState } from 'react'

import Link from 'next/link'

import { ICON_MAP, LEVEL_COLOR_MAP } from '@/config/questions'
import type { Question } from '@/types/question'
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Bookmark,
  Check,
  Copy,
  HelpCircle,
  LockKeyhole,
} from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'

import { useBookmarksStore } from '@/store/useBookmarksStore'
import { useCheckoutStore } from '@/store/useCheckoutStore'

import { cn } from '@/utils/cn'

import { Button } from '@/components/atoms/Button'
import { Tag } from '@/components/atoms/Tag'

export type SingleQuestionProps = Question & {
  nextQuestion: { id: string; name: string } | null
}

export const SingleQuestion = (props: SingleQuestionProps) => {
  const {
    level,
    technologies,
    category,
    question,
    answer,
    index,
    title,
    locked,
    explanation,
    codeSnippet,
    nextQuestion,
  } = props
  const t = useTranslations('QuestionsPage')
  const locale = useLocale()
  const answerHeadingId = useId()
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'error'>('idle')
  const toggleBookmark = useBookmarksStore((state) => state.toggleBookmark)
  const savedIds = useBookmarksStore((state) => state.savedIds)
  const openCheckout = useCheckoutStore((state) => state.openCheckout)
  const isBookmarked = savedIds.includes(index)
  const CategoryIcon = ICON_MAP[category?.name] ?? HelpCircle
  const focusClass =
    'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary'

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopyStatus('copied')
    } catch {
      setCopyStatus('error')
    }
  }

  return (
    <section className="dashboard-container">
      <Link
        href={`/${locale}/dashboard/questions`}
        className={cn(
          'mb-6 inline-flex items-center gap-2 rounded-sm text-sm text-gray-60 transition-colors hover:text-primary',
          focusClass,
        )}
      >
        <ArrowLeft size={16} aria-hidden="true" />
        {t('backToQuestions')}
      </Link>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_14rem]">
        <div className="min-w-0 space-y-6">
          <header className="surface-panel p-5 sm:p-8">
            <div className="mb-5 flex flex-wrap items-center gap-3">
              <span className="text-xs font-semibold tracking-wider text-primary uppercase">
                {t('interviewQuestion')}
              </span>
              {locked && (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-60">
                  <LockKeyhole size={13} aria-hidden="true" /> Pro
                </span>
              )}
            </div>
            <h1 className="text-2xl leading-tight font-semibold tracking-tight break-words text-gray-100 text-balance sm:text-3xl">
              {title || question}
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-2.5 lg:hidden">
              <Tag text={level} className={LEVEL_COLOR_MAP[level]} />
              {category?.name && (
                <span className="inline-flex items-center gap-1.5 text-xs text-gray-60">
                  <CategoryIcon size={14} aria-hidden="true" />
                  {category.name}
                </span>
              )}
              {technologies.map((tech) => (
                <span
                  key={tech}
                  className="rounded-md border border-[var(--color-gray-10)] px-2 py-1 text-xs text-gray-60"
                >
                  {tech}
                </span>
              ))}
            </div>
            {!locked && title && question && title.trim() !== question.trim() && (
              <p className="mt-5 max-w-[65ch] whitespace-pre-wrap break-words text-base leading-8 text-gray-100">
                {question}
              </p>
            )}
            <div className="mt-6 flex flex-wrap gap-2 border-t border-[var(--color-gray-10)] pt-5">
              <Button
                variant="secondary"
                aria-pressed={isBookmarked}
                onClick={() => toggleBookmark({ ...props, question: question || title || '' })}
                className={cn(
                  'min-h-10 transition-colors',
                  focusClass,
                  isBookmarked &&
                    'border-primary/30 bg-primary/5 text-primary [&_svg]:fill-current',
                )}
              >
                <Bookmark size={16} aria-hidden="true" />
                {isBookmarked ? t('saved') : t('saveQuestion')}
              </Button>
              <Button
                variant="text"
                onClick={() => void copyLink()}
                className={cn('min-h-10 transition-colors', focusClass)}
              >
                {copyStatus === 'copied' ? (
                  <Check size={16} aria-hidden="true" />
                ) : (
                  <Copy size={16} aria-hidden="true" />
                )}
                {copyStatus === 'copied' ? t('linkCopied') : t('copyLink')}
              </Button>
            </div>
            <p
              role="status"
              className={copyStatus === 'error' ? 'mt-3 text-sm text-gray-60' : 'sr-only'}
            >
              {copyStatus === 'error'
                ? t('copyError')
                : copyStatus === 'copied'
                  ? t('linkCopied')
                  : ''}
            </p>
          </header>

          <section aria-labelledby={answerHeadingId} className="surface-panel p-5 sm:p-8">
            <div className="mb-6 flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-xl bg-primary/8 text-primary">
                <BookOpen size={18} aria-hidden="true" />
              </span>
              <h2 id={answerHeadingId} className="text-lg font-semibold text-gray-100">
                {t('answer')}
              </h2>
            </div>
            {locked ? (
              <div className="surface-inset p-6">
                <LockKeyhole size={22} aria-hidden="true" className="mb-3 text-primary" />
                <h3 className="text-base font-semibold text-gray-100">{t('lockedTitle')}</h3>
                <p className="mt-2 mb-5 text-sm leading-7 text-gray-60">{t('lockedDescription')}</p>
                <Button
                  onClick={() => openCheckout('pro_monthly', 'Pro')}
                  className={cn('min-h-10 transition-colors', focusClass)}
                >
                  {t('unlockPro')}
                </Button>
              </div>
            ) : (
              <div className="space-y-7">
                <p className="max-w-[68ch] whitespace-pre-wrap break-words text-[15px] leading-8 text-gray-100 sm:text-base">
                  {answer || t('answerUnavailable')}
                </p>
                {explanation && explanation !== answer && (
                  <div className="border-t border-[var(--color-gray-10)] pt-6">
                    <h3 className="mb-3 text-sm font-semibold text-gray-100">{t('explanation')}</h3>
                    <p className="max-w-[68ch] whitespace-pre-wrap break-words text-[15px] leading-8 text-gray-100">
                      {explanation}
                    </p>
                  </div>
                )}
                {codeSnippet && (
                  <div className="min-w-0">
                    <h3 className="mb-3 text-sm font-semibold text-gray-100">{t('codeExample')}</h3>
                    <pre
                      tabIndex={0}
                      aria-label={t('codeExample')}
                      className={cn(
                        'surface-inset max-w-full overflow-x-auto p-5 font-mono text-[13px] leading-7 text-gray-100',
                        focusClass,
                      )}
                    >
                      <code translate="no">{codeSnippet}</code>
                    </pre>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>

        <aside className="surface-card hidden p-5 lg:sticky lg:top-8 lg:block">
          <h2 className="mb-5 text-sm font-semibold text-gray-100">{t('questionDetails')}</h2>
          <dl className="space-y-5">
            <div>
              <dt className="mb-2 text-xs text-gray-60">{t('seniority')}</dt>
              <dd>
                <Tag text={level} className={LEVEL_COLOR_MAP[level]} />
              </dd>
            </div>
            {category?.name && (
              <div>
                <dt className="mb-2 text-xs text-gray-60">{t('domain')}</dt>
                <dd className="flex items-center gap-2 text-sm text-gray-100">
                  <CategoryIcon size={16} aria-hidden="true" className="shrink-0 text-gray-60" />
                  {category.name}
                </dd>
              </div>
            )}
            {technologies.length > 0 && (
              <div>
                <dt className="mb-2 text-xs text-gray-60">{t('technology')}</dt>
                <dd className="flex flex-wrap gap-1.5">
                  {technologies.map((tech) => (
                    <span
                      key={tech}
                      className="rounded-md border border-[var(--color-gray-10)] bg-white px-2 py-1 text-xs text-gray-60"
                    >
                      {tech}
                    </span>
                  ))}
                </dd>
              </div>
            )}
          </dl>
        </aside>
      </div>

      {nextQuestion?.id && (
        <nav aria-label={t('questionNavigation')} className="mt-6">
          <Link
            href={`/${locale}/dashboard/questions/${nextQuestion.id}`}
            className={cn(
              'surface-card surface-interactive group flex items-center justify-between gap-5 p-5 sm:p-6',
              focusClass,
            )}
          >
            <span className="min-w-0">
              <span className="mb-1 block text-xs font-medium text-gray-60">
                {t('nextQuestion')}
              </span>
              <span className="block text-sm leading-6 font-medium break-words text-gray-100 sm:text-base">
                {nextQuestion.name}
              </span>
            </span>
            <ArrowRight
              size={20}
              aria-hidden="true"
              className="shrink-0 text-gray-60 transition-transform group-hover:translate-x-1 group-hover:text-primary motion-reduce:transition-none"
            />
          </Link>
        </nav>
      )}
    </section>
  )
}
