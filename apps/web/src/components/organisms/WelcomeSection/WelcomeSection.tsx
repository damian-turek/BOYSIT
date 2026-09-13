'use client'

import { useState } from 'react'

import { Flame, Search } from 'lucide-react'
import { motion } from 'motion/react'
import { useTranslations } from 'next-intl'

import { Input } from '@/components/atoms/inputs/Input'

export type WelcomeSectionProps = {
  title: string
  text: string
  streak: number
  // activities: DBActivity[]
}

export const WelcomeSection = ({ title, text, streak }: WelcomeSectionProps) => {
  const [searchQuery, setSearchQuery] = useState('')
  const t = useTranslations('WelcomeSection')

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
      <div className="relative mt-5 mb-8 w-full max-w-xl">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-60" />
        <Input
          type="text"
          placeholder={t('searchPlaceholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/*<ActivityCalendar activities={activities} streak={streak} />*/}
    </motion.section>
  )
}
