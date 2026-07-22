'use client'

import { useState } from 'react'

import Link from 'next/link'

import { CATEGORY_THEMES, ICON_MAP, LEVEL_COLOR_MAP } from '@/config/questions'
import { Question } from '@/types/question'
import { Bookmark, ChevronDown, HelpCircle, type LucideIcon } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'

import { useBookmarksStore } from '@/store/useBookmarksStore'

import { cn } from '@/utils/cn'

import { Tag } from '@/components/atoms/Tag'

export const QuestionCard = ({
  index,
  level,
  company,
  technologies,
  category,
  question,
  answer,
  pageNumber,
}: Question & { pageNumber?: number }) => {
  const [isOpen, setIsOpen] = useState(false)
  const { toggleBookmark, savedIds, addToLastSeen } = useBookmarksStore()
  const qId = index.toString()
  const isBookmarked = savedIds.includes(qId)

  const matchedIcon = category ? ICON_MAP[category.name] : undefined
  const SelectedIcon: LucideIcon = matchedIcon || HelpCircle
  const levelClass = LEVEL_COLOR_MAP[level]

  return (
    <div
      className={cn(
        'relative w-full p-5 flex gap-4 border rounded-xl bg-gray-60/5 transition-colors duration-200 select-none hover:bg-gray-60/10',
        isOpen ? 'border-primary shadow-xs' : 'border-gray-60/40',
      )}
    >
      <Link href={`/dashboard/questions/${qId}`} className="after:absolute after:inset-0 z-0">
        <span className="sr-only">Zobacz szczegóły</span>
      </Link>

      <p className="label-font text-gray-60 mt-1 mr-2">
        {index < 10 ? `0${pageNumber}` : pageNumber}
      </p>

      <div className="w-full flex flex-col gap-3">
        <div className="flex flex-wrap gap-3 items-center">
          <Tag text={level} className={levelClass} />
          {category && (
            <div className="flex items-center gap-1.5">
              <SelectedIcon style={{ color: CATEGORY_THEMES[category.name] }} size={16} />
              <span className="label-font text-gray-60">{category.name}</span>
            </div>
          )}
          {company && <p className="label-font text-gray-60/60">·</p>}
          {company && <p className="label-font text-gray-60/60">{company}</p>}
        </div>

        <p className="body-medium text-gray-100 font-medium">{question}</p>

        <div className="flex flex-wrap gap-1.5">
          {technologies.map((technology) => (
            <Tag
              text={technology}
              key={technology}
              className="bg-gray-60/5 text-gray-60 border-gray-60/30 rounded-sm"
            />
          ))}
        </div>

        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.15, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="pt-4 border-t border-gray-60/20">
                <p className="body-medium text-gray-60">{answer}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="relative flex gap-2 mt-0.5">
        <button
          onClick={(e) => {
            e.stopPropagation()
            toggleBookmark({ index, level, company, technologies, category, question, answer })
          }}
          className={cn(
            'transition-colors cursor-pointer h-fit',
            isBookmarked ? 'text-primary' : 'text-gray-60 hover:text-primary',
          )}
        >
          <Bookmark
            size={15}
            fill={isBookmarked ? 'currentColor' : 'none'}
            stroke={isBookmarked ? 'currentColor' : 'gray'}
          />
        </button>

        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          className="text-gray-60 h-fit cursor-pointer"
          onClick={() => {
            setIsOpen(!isOpen)
            if (!isOpen) {
              addToLastSeen({ index, level, company, technologies, category, question, answer })
            }
          }}
        >
          <ChevronDown size={16} />
        </motion.div>
      </div>
    </div>
  )
}
