'use client'

import { useId, useRef } from 'react'

import { SlidersHorizontal, X } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/atoms/Button'

import { FiltersContent, type FiltersContentProps } from './FiltersContent'

export const MobileFilters = ({ categories, technologies }: FiltersContentProps) => {
  const t = useTranslations('QuestionsPage')
  const dialog = useRef<HTMLDialogElement>(null)
  const titleId = useId()

  return (
    <div className="lg:hidden">
      <Button
        variant="secondary"
        onClick={() => dialog.current?.showModal()}
        aria-haspopup="dialog"
        className="min-h-10 gap-2 border-[var(--color-gray-10)] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <SlidersHorizontal size={16} aria-hidden="true" />
        {t('filters')}
      </Button>
      <dialog
        ref={dialog}
        aria-labelledby={titleId}
        className="fixed inset-y-0 left-0 m-0 h-dvh max-h-none w-[min(22rem,100%)] max-w-none overflow-y-auto overscroll-contain border-r border-gray-10 bg-surface-raised p-6 text-gray-100 backdrop:bg-overlay backdrop:backdrop-blur-xs"
      >
        <div className="flex items-center justify-between gap-4">
          <h2 id={titleId} className="flex items-center gap-2 text-base font-semibold">
            <SlidersHorizontal size={18} aria-hidden="true" />
            {t('filters')}
          </h2>
          <button
            type="button"
            aria-label={t('closeFilters')}
            onClick={() => dialog.current?.close()}
            className="flex size-10 cursor-pointer items-center justify-center rounded-lg text-gray-60 hover:bg-gray-60/10 hover:text-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        <FiltersContent
          categories={categories}
          technologies={technologies}
          onFilterApply={() => dialog.current?.close()}
        />
      </dialog>
    </div>
  )
}
