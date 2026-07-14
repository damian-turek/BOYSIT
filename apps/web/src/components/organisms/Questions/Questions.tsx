'use client'

import { useSearchParams } from 'next/navigation'

import { Question } from '@/types/question'

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

  return (
    <section className="mt-40 md:mt-20">
      <p className="label-font font-bold text-gray-100 mb-4">
        {questionsCount}
        <span className="text-gray-60 font-normal"> questions</span>
      </p>

      <div className="flex flex-col gap-3">
        {questions.map((question) => (
          <QuestionCard {...question} key={question.index} />
        ))}
      </div>

      <Pagination currentPage={currentPage} totalPages={totalPages} />
    </section>
  )
}
