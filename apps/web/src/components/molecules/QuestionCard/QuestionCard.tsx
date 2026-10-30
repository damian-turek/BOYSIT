'use client'

import { useId, useState } from 'react'

import Link from 'next/link'

import { ICON_MAP, LEVEL_COLOR_MAP } from '@/config/questions'
import type { Question } from '@/types/question'
import { ArrowUpRight, Bookmark, ChevronDown, HelpCircle, LockKeyhole } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'

import { useBookmarksStore } from '@/store/useBookmarksStore'
import { useCheckoutStore } from '@/store/useCheckoutStore'

import { cn } from '@/utils/cn'

import { Tag } from '@/components/atoms/Tag'

export const QuestionCard = (props: Question & { pageNumber?: number }) => {
  const {
    index,
    level,
    technologies,
    category,
    question,
    answer,
    title,
    locked,
    company,
    pageNumber,
  } = props
  const t = useTranslations('QuestionsPage')
  const locale = useLocale()
  const answerId = useId()
  const [isOpen, setIsOpen] = useState(false)
  const toggleBookmark = useBookmarksStore((state) => state.toggleBookmark)
  const savedIds = useBookmarksStore((state) => state.savedIds)
  const addToLastSeen = useBookmarksStore((state) => state.addToLastSeen)
  const openCheckout = useCheckoutStore((state) => state.openCheckout)
  const isBookmarked = savedIds.includes(index)
  const CategoryIcon = ICON_MAP[category?.name] ?? HelpCircle
  const questionUrl = `/${locale}/dashboard/questions/${index}`
  const iconButtonClass = 'icon-control'

  return (
    <article
      className={cn(
        'surface-card min-w-0 p-4 transition-colors motion-reduce:transition-none sm:p-5',
        isOpen ? 'border-primary/35 bg-surface-raised' : 'surface-interactive',
      )}
    >
      <div className="flex items-start gap-3 sm:gap-4">
        {pageNumber !== undefined && (
          <span
            aria-hidden="true"
            className="hidden pt-2 font-mono text-xs text-gray-60 tabular-nums sm:block"
          >
            {String(pageNumber).padStart(2, '0')}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-2">
            <Tag text={level} className={cn('px-2.5 py-0.5', LEVEL_COLOR_MAP[level])} />
            {category?.name && (
              <span className="inline-flex items-center gap-1.5 text-xs text-gray-60">
                <CategoryIcon size={14} aria-hidden="true" />
                {category.name}
              </span>
            )}
            {company && <span className="text-xs text-gray-60">{company}</span>}
            {locked && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-60">
                <LockKeyhole size={12} aria-hidden="true" /> Pro
              </span>
            )}
          </div>
          <h2 className="break-words text-[15px] leading-6 font-medium text-gray-100 sm:text-base">
            <Link
              href={questionUrl}
              className="rounded-sm hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
            >
              {question || title}
            </Link>
          </h2>
          {technologies.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {technologies.map((technology) => (
                <span
                  key={technology}
                  className="rounded-md border border-gray-10 bg-surface-raised px-2 py-0.5 font-mono text-[11px] leading-5 text-gray-60"
                >
                  {technology}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="flex shrink-0 flex-col gap-1 sm:flex-row">
          <button
            type="button"
            aria-label={isBookmarked ? t('unsaveQuestion') : t('saveQuestion')}
            aria-pressed={isBookmarked}
            onClick={() => toggleBookmark({ ...props, question: question || title || '' })}
            className={cn(iconButtonClass, isBookmarked && 'text-primary')}
          >
            <Bookmark size={17} fill={isBookmarked ? 'currentColor' : 'none'} aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label={isOpen ? t('hideAnswer') : t('showAnswer')}
            aria-expanded={isOpen}
            aria-controls={answerId}
            onClick={() => {
              setIsOpen(!isOpen)
              if (!isOpen && !locked) addToLastSeen(props)
            }}
            className={iconButtonClass}
          >
            <ChevronDown
              size={18}
              aria-hidden="true"
              className={cn(
                'transition-transform motion-reduce:transition-none',
                isOpen && 'rotate-180',
              )}
            />
          </button>
        </div>
      </div>
      <div id={answerId} hidden={!isOpen} className="mt-5 border-t border-gray-10 pt-5 sm:pl-8">
        <p className="mb-2 text-xs font-semibold tracking-wider text-gray-60 uppercase">
          {t('answer')}
        </p>
        {locked ? (
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm leading-6 text-gray-60">{t('lockedDescription')}</p>
            <button
              type="button"
              onClick={() => openCheckout('pro_monthly', 'Pro')}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              {t('unlockPro')}
            </button>
          </div>
        ) : (
          <>
            <p className="whitespace-pre-wrap break-words text-sm leading-7 text-gray-100">
              {answer || t('answerUnavailable')}
            </p>
            <Link
              href={questionUrl}
              className="mt-4 inline-flex items-center gap-1 rounded-sm text-sm font-medium text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
            >
              {t('openQuestion')} <ArrowUpRight size={15} aria-hidden="true" />
            </Link>
          </>
        )}
      </div>
    </article>
  )
}
