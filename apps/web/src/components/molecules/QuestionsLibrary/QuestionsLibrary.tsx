'use client'

import { useState } from 'react'

import Link from 'next/link'

import { ArrowRight, Bookmark, Clock, Lightbulb } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useTranslations } from 'next-intl'

import { formatRelativeTime } from '@/utils/formatRelativeTime'
import { cn } from '@/utils/cn'

import { Tag } from '@/components/atoms/Tag'

const tabIconMap = {
  Clock,
  Bookmark,
  Lightbulb,
} as const

type Item = {
  id: string
  tabId: string
  title: string
  category: string
  level: string
  levelColor: string
  timeAgo: string
  link: string
}

export type QuestionsLibraryProps = {
  name: string
  allQuestionsLink: string
  tabs: { id: string; label: string; icon: keyof typeof tabIconMap }[]
  /** Items per tab id, fetched server-side from /library (Bookmark + Attempt tables). */
  items: Record<string, Item[]>
}

const MotionLink = motion.create(Link)

export const QuestionsLibrary = ({ name, allQuestionsLink, tabs, items }: QuestionsLibraryProps) => {
  const t = useTranslations('WelcomeSection')
  const [activeTab, setActiveTab] = useState(tabs[0]?.id || '')

  const filteredItems: Item[] = items[activeTab] ?? []

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="flex flex-col border border-gray-60/40 bg-gray-60/5 rounded-2xl p-5"
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="body-large font-bold text-gray-100">{name}</h3>
        <Link
          href={allQuestionsLink}
          className="flex items-center gap-1 text-primary body-small font-medium hover:underline transition-all"
        >
          {t('allQuestions')} <ArrowRight size={14} />
        </Link>
      </div>

      <div className="flex bg-gray-60/10 p-1 rounded-xl mb-3 relative">
        {tabs.map((tab) => {
          const TabIcon = tabIconMap[tab.icon]
          const isActive = activeTab === tab.id

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-2 text-center text-gray-60 rounded-lg text-sm font-medium transition-all relative cursor-pointer z-10',
                isActive ? 'text-gray-100 font-semibold' : 'hover:text-gray-100',
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTabBg"
                  className="absolute inset-0 bg-white dark:bg-gray-100/10 shadow-xs border border-gray-60/10 rounded-lg -z-10"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <span className="flex items-center gap-1.5">
                {TabIcon && <TabIcon size={14} />}
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>

      <div className="flex flex-col overflow-x-hidden min-h-50">
        <AnimatePresence mode="popLayout">
          {filteredItems.length > 0 ? (
            filteredItems.map((item, index) => (
              <MotionLink
                key={item.id}
                href={item.link}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 6 }}
                whileHover="hover"
                whileTap={{ scale: 0.995 }}
                transition={{ duration: 0.2, delay: index * 0.03, ease: 'easeOut' }}
                className="flex justify-between items-center py-4 border-b border-gray-60/30 last:border-none group transition-colors duration-150"
              >
                <div className="flex flex-col gap-1.5">
                  <p className="body-medium text-gray-100 group-hover:text-primary transition-colors duration-200">
                    {item.title}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="body-small text-gray-60 text-xs">{item.category}</span>
                    <Tag
                      text={item.level}
                      className="rounded-sm px-1.5 py-0.5 text-[11px]"
                      style={{
                        backgroundColor: `${item.levelColor}12`,
                        borderColor: `${item.levelColor}25`,
                        color: item.levelColor,
                      }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {item.timeAgo && (
                    <span className="body-small text-gray-60 text-xs">
                      {formatRelativeTime(item.timeAgo)}
                    </span>
                  )}
                  <motion.div
                    variants={{ hover: { x: 3 } }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  >
                    <ArrowRight size={15} className="text-primary" />
                  </motion.div>
                </div>
              </MotionLink>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center text-gray-60 text-sm py-12"
            >
              {t('noQuestions')}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
