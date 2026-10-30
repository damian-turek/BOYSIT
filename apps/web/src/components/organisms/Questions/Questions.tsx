'use client'

import { useSearchParams } from 'next/navigation'

import { Question } from '@/types/question'
import { useTranslations } from 'next-intl'

import { Pagination } from '@/components/atoms/Pagination'
import { QuestionCard } from '@/components/molecules/QuestionCard'

export type QuestionsProps = {
  questionsCount: number
  questions: Question[]
}

export const Questions = ({ questionsCount, questions }: QuestionsProps) => {
  const searchParams = useSearchParams()
  const currentPage = Number(searchParams.get('page')) || 1
  const totalPages = Math.ceil(questionsCount / 20)
  const t = useTranslations('QuestionsPage')

  return (
    <section className="mt-40 lg:mt-20">
      <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-xl font-semibold tracking-tight text-gray-100">{t('title')}</h1>
        <p role="status" className="text-sm text-gray-60 tabular-nums">
          {t('questionCount', { count: questionsCount })}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {questions.map((question, index) => (
          <QuestionCard
            {...question}
            key={question.index}
            pageNumber={(currentPage - 1) * 20 + index + 1}
          />
        ))}
      </div>

      {questions.length === 0 && (
        <p className="rounded-2xl border border-dashed border-[var(--color-gray-10)] p-8 text-center text-sm leading-7 text-gray-60">
          {t('emptyDescription')}
        </p>
      )}

      <Pagination currentPage={currentPage} totalPages={totalPages} />
    </section>
  )
}
