'use client'

import Link from 'next/link'

import {
  Infinity as InfinityIcon,
  BookOpen,
  Code,
  Cpu,
  Database,
  Layers,
  Server,
  Shield,
  Terminal,
} from 'lucide-react'
import { motion } from 'motion/react'
import { useTranslations } from 'next-intl'

const iconMap = {
  Code,
  Layers,
  Database,
  Cpu,
  Server,
  Shield,
  Infinity: InfinityIcon,
  Terminal,
} as const

export type TopCategoriesProps = {
  name: string
  categories: {
    name: string
    icon: string
    theme: string
    questionNumber: number
  }[]
}

const MotionLink = motion.create(Link)

export const TopCategories = ({ name, categories }: TopCategoriesProps) => {
  const t = useTranslations('WelcomeSection')
  const maxQuestions = Math.max(...categories.map((c) => c.questionNumber), 1)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="flex flex-col p-6.5 border border-gray-60/40 bg-gray-60/5 rounded-xl"
    >
      <div className="flex justify-between gap-3 items-center mb-4">
        <div className="flex gap-3 items-center">
          <BookOpen size={16} className="text-primary" />
          <h3 className="body-large text-gray-100">{name}</h3>
        </div>
        <Link className="body-small text-primary underline" href="/dashboard/questions">
          {t('all')} →
        </Link>
      </div>
      <div className="flex flex-col gap-2">
        {categories.map((category) => {
          const IconComponent = iconMap[category.icon as keyof typeof iconMap] || Code
          const percentage = (category.questionNumber / maxQuestions) * 100

          return (
            <MotionLink
              href="/dashboard/questions"
              key={category.name}
              whileHover={{ x: 4 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="flex w-full gap-3 p-2 transition-all ease-in-out duration-200 hover:bg-gray-60/10 rounded-xl"
            >
              <div
                className="p-2 rounded-xl border flex items-center justify-center shrink-0"
                style={{
                  backgroundColor: `${category.theme}15`,
                  borderColor: `${category.theme}30`,
                  color: category.theme,
                }}
              >
                <IconComponent size={18} />
              </div>
              <div className="flex flex-col items-center gap-1 w-full">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    <span className="body-medium font-medium text-gray-100">{category.name}</span>
                  </div>
                  <span className="body-small text-gray-60 font-semibold">
                    {category.questionNumber}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-gray-60/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: `${category.theme}99` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
                  />
                </div>
              </div>
            </MotionLink>
          )
        })}
      </div>
    </motion.div>
  )
}
