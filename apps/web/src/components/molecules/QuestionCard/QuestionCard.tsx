'use client'

import { useState } from 'react'

import { Level, Question } from '@/types/question'
import {
  // eslint-disable-next-line no-shadow-restricted-names
  Infinity,
  Bookmark,
  ChartColumn,
  ChevronDown,
  CircleCheck,
  CodeXml,
  Cpu,
  Database,
  Globe,
  HelpCircle,
  Layers,
  type LucideIcon,
  Server,
  Shield,
  Terminal,
  Zap,
} from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'

import { useBookmarksStore } from '@/store/useBookmarksStore'

import { cn } from '@/utils/cn'

import { Tag } from '@/components/atoms/Tag'

const iconMap: Record<string, LucideIcon> = {
  'JavaScript/TypeScript': CodeXml,
  Security: Shield,
  'CSS & HTML': Globe,
  Algorithms: Cpu,
  Terminal: Terminal,
  Performance: Zap,
  Databases: Database,
  Testing: CircleCheck,
  Concurrency: ChartColumn,
  DevOps: Infinity,
  Architecture: Server,
  SystemDesign: Layers,
}

const levelColorMap: Record<Level, string> = {
  Junior: 'bg-success-50/15 text-success-50 border-success-50/30',
  Regular: 'bg-warning-50/15 text-warning-50 border-warning-50/30',
  Senior: 'bg-alert-50/15 text-alert-50 border-alert-50/30',
}

export const QuestionCard = ({
  index,
  level,
  company,
  technologies,
  category,
  question,
  answer,
}: Question) => {
  const [isOpen, setIsOpen] = useState(false)
  const { toggleBookmark, savedIds, addToLastSeen } = useBookmarksStore()
  const qId = `q-generated-${index}`
  const isBookmarked = savedIds.includes(qId)

  const matchedIcon = category ? iconMap[category.name] : undefined
  const SelectedIcon: LucideIcon = matchedIcon || HelpCircle

  const levelClass = levelColorMap[level]

  const handleCardClick = () => {
    const nextOpenState = !isOpen
    setIsOpen(nextOpenState)

    if (nextOpenState) {
      addToLastSeen({ index, level, company, technologies, category, question, answer })
    }
  }

  return (
    <div
      className={cn(
        `w-full p-5 flex gap-4 border rounded-xl bg-gray-60/5 transition-colors duration-200 cursor-pointer select-none hover:bg-gray-60/10`,
        isOpen ? 'border-primary shadow-xs' : 'border-gray-60/40',
      )}
      onClick={handleCardClick}
    >
      <p className="label-font text-gray-60 mt-1 mr-2">{index < 10 ? `0${index}` : index}</p>

      <div className="w-full flex flex-col gap-3">
        <div className="flex flex-wrap gap-3 items-center">
          <Tag text={level} className={levelClass} />
          {category && (
            <div className="flex items-center gap-1.5">
              <SelectedIcon style={{ color: category.theme }} size={16} />
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
              onClick={(e) => e.stopPropagation()}
            >
              <div className="pt-4 border-t border-gray-60/20">
                <p className="body-medium text-gray-60">{answer}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex gap-2 mt-0.5">
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
          {/* Dynamiczne sterowanie parametrem fill oraz stroke */}
          <Bookmark
            size={15}
            fill={isBookmarked ? 'currentColor' : 'none'}
            stroke={isBookmarked ? 'currentColor' : 'gray'}
          />
        </button>

        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          className="text-gray-60 h-fit"
        >
          <ChevronDown size={16} />
        </motion.div>
      </div>
    </div>
  )
}
