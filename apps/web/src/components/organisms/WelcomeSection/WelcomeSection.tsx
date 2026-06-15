'use client'

import { useState } from 'react'

import { LangProps } from '@/types/lang'
import { Flame, Search } from 'lucide-react'

import { Input } from '@/components/atoms/inputs/Input'
import { ActivityCalendar, DBActivity } from '@/components/molecules/ActivityCalendar'

export type WelcomeSectionProps = {
  title: string
  text: string
  streak: number
  activities: DBActivity[]
  lang?: LangProps
}

export const WelcomeSection = ({ title, text, streak, activities, lang }: WelcomeSectionProps) => {
  const [searchQuery, setSearchQuery] = useState('')
  return (
    <section>
      <div className="flex justify-between md:justify-start gap-6">
        <div>
          <h1 className="section-header-font text-gray-100">{title}</h1>
          <p className="body-medium text-gray-60">{text}</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-orange-500/10 border border-orange-500/20 shrink-0">
          <Flame size={20} className="text-orange-500" />
          <div className="text-center">
            <p className="body-large text-orange-500 leading-none">{streak}</p>
            <p className="body-small text-gray-60">streak</p>
          </div>
        </div>
      </div>
      <div className="relative mt-5 mb-8 w-full max-w-xl">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-60" />
        <Input
          type="text"
          placeholder="Search questions, topics, companies..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <ActivityCalendar activities={activities} streak={streak} lang={lang} />
    </section>
  )
}
