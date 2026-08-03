'use client'

import { CATEGORY_THEMES, ICON_MAP, LEVEL_COLOR_MAP } from '@/config/questions'
import { Question } from '@/types/question'
import { Bookmark, HelpCircle, LucideIcon, Share2 } from 'lucide-react'

import { useBookmarksStore } from '@/store/useBookmarksStore'

import { Button } from '@/components/atoms/Button'
import { Tag } from '@/components/atoms/Tag'

export type SingleQuestionProps = Question & {
  nextQuestion: {
    id: string
    name: string
  }
}

export const SingleQuestion = ({
  level,
  technologies,
  company,
  category,
  question,
  answer,
  index,
}: SingleQuestionProps) => {
  const levelClass = LEVEL_COLOR_MAP[level]
  const matchedIcon = category ? ICON_MAP[category.name] : undefined
  const SelectedIcon: LucideIcon = matchedIcon || HelpCircle

  const { toggleBookmark, savedIds } = useBookmarksStore()
  const isBookmarked = savedIds.includes(index)

  return (
    <section className="dashboard-container">
      <div className="p-8 rounded-2xl bg-primary/5 border border-primary/20 flex flex-col gap-5 mb-5">
        <div className="flex items-center gap-4">
          <Tag text={level} className={levelClass} />

          <div className="flex gap-2">
            <SelectedIcon style={{ color: CATEGORY_THEMES[category.name] }} size={16} />
            <span className="label-font text-gray-60">{category.name}</span>
          </div>
        </div>

        <h1
          className="tiles-title-font text-gray-100"
          dangerouslySetInnerHTML={{ __html: question }}
        />

        <div className="flex items-center gap-2">
          {technologies.map((tech) => (
            <Tag key={tech} text={tech} className="bg-gray-60/5 text-gray-60 border-gray-60/30" />
          ))}
        </div>

        <div className="border-b border-primary/20" />

        <div className="flex gap-2">
          <Button
            className={
              isBookmarked
                ? `[&_svg]:fill-current [&_svg]:stroke-current`
                : `[&_svg]:fill-none [&_svg]:stroke-gray`
            }
            icon={Bookmark}
            onClick={(e) => {
              e.stopPropagation()
              toggleBookmark({ index, level, company, technologies, category, question, answer })
            }}
          >
            Save
          </Button>
          <Button
            variant="secondary"
            icon={Share2}
            onClick={() => void navigator.clipboard.writeText(window.location.href)}
          >
            Save
          </Button>
        </div>
      </div>
      <div className="p-8 rounded-2xl bg-primary/5 border border-primary/20 flex flex-col gap-3">
        <p className="text-gray-100 body-large">Answer:</p>
        <p className="text-gray-100 body-font" dangerouslySetInnerHTML={{ __html: answer }} />
      </div>
    </section>
  )
}
