'use client'

import { useEffect, useRef, useState } from 'react'

import Link from 'next/link'

import { LEVEL_COLOR_MAP } from '@/config/questions'
import { SearchQuestionResult, searchQuestions } from '@/services/searchApi'
import { Level } from '@/types/question'
import { Flame, Lock, Search } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useTranslations } from 'next-intl'

import { Tag } from '@/components/atoms/Tag'
import { Input } from '@/components/atoms/inputs/Input'

export type WelcomeSectionProps = {
  title: string
  text: string
  streak: number
}

const MIN_QUERY_LENGTH = 2
const DEBOUNCE_MS = 300

const DIFFICULTY_TO_LEVEL: Record<SearchQuestionResult['difficulty'], Level> = {
  junior: 'Junior',
  middle: 'Middle',
  senior: 'Senior',
}

const toLevelLabel = (difficulty: SearchQuestionResult['difficulty']): Level =>
  DIFFICULTY_TO_LEVEL[difficulty]

export const WelcomeSection = ({ title, text, streak }: WelcomeSectionProps) => {
  const t = useTranslations('WelcomeSection')

  const [searchQuery, setSearchQuery] = useState('')
  const [results, setResults] = useState<SearchQuestionResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const trimmed = searchQuery.trim()

    if (trimmed.length < MIN_QUERY_LENGTH) {
      setResults([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    const timeout = setTimeout(() => {
      searchQuestions(trimmed)
        .then((response) => setResults(response.data))
        .catch(() => setResults([]))
        .finally(() => setIsLoading(false))
    }, DEBOUNCE_MS)

    return () => clearTimeout(timeout)
  }, [searchQuery])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false)
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  const trimmedQuery = searchQuery.trim()
  const showDropdown = isOpen && trimmedQuery.length >= MIN_QUERY_LENGTH

  return (
    <motion.section
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <div className="flex justify-between md:justify-start gap-6">
        <div>
          <h1 className="section-header-font text-gray-100">{title}</h1>
          <p className="body-medium text-gray-60">{text}</p>
        </div>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-orange-500/10 border border-orange-500/20 shrink-0 select-none cursor-default"
        >
          <Flame size={20} className="text-orange-500" />
          <div className="text-center">
            <p className="body-large text-orange-500 leading-none">{streak}</p>
            <p className="body-small text-gray-60 leading-none">{t('streak')}</p>
          </div>
        </motion.div>
      </div>

      <div ref={containerRef} className="relative mt-5 mb-8 w-full max-w-xl">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-60 z-10" />
        <Input
          type="text"
          placeholder={t('searchPlaceholder')}
          value={searchQuery}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setSearchQuery(e.target.value)
            setIsOpen(true)
          }}
          className="pl-10"
        />

        <AnimatePresence>
          {showDropdown && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="surface-popover absolute top-full left-0 mt-2 w-full overflow-hidden z-20"
            >
              {isLoading ? (
                <div className="flex flex-col gap-2 p-4">
                  {[0, 1, 2].map((key) => (
                    <div key={key} className="h-4 w-full animate-pulse rounded bg-gray-60/10" />
                  ))}
                </div>
              ) : results.length ? (
                <>
                  <div className="max-h-80 overflow-y-auto">
                    {results.map((result) => (
                      <Link
                        key={result.id}
                        href={`/dashboard/questions/${result.id}`}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center justify-between gap-3 border-b border-gray-60/20 last:border-none p-3.5 transition-colors ease-in-out duration-150 hover:bg-gray-60/5"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {result.locked && (
                            <Lock size={13} className="text-gray-60 shrink-0" aria-hidden="true" />
                          )}
                          <p className="body-small text-gray-100 truncate">{result.title}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {result.category && (
                            <span className="body-small text-gray-60 hidden sm:inline">
                              {result.category.name}
                            </span>
                          )}
                          <Tag
                            text={toLevelLabel(result.difficulty)}
                            className={LEVEL_COLOR_MAP[toLevelLabel(result.difficulty)]}
                          />
                        </div>
                      </Link>
                    ))}
                  </div>
                  <Link
                    href={`/dashboard/questions?search=${encodeURIComponent(trimmedQuery)}`}
                    onClick={() => setIsOpen(false)}
                    className="block p-3 text-center label-font text-primary hover:bg-primary/5 transition-colors ease-in-out duration-150"
                  >
                    {t('allQuestions')} →
                  </Link>
                </>
              ) : (
                <p className="p-4 body-small text-gray-60 text-center">{t('noQuestions')}</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.section>
  )
}
