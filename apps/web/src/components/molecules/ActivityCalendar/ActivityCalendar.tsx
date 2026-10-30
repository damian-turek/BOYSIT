'use client'

import React from 'react'

import { Flame } from 'lucide-react'
import { motion } from 'motion/react'
import { useLocale, useTranslations } from 'next-intl'

export type DBActivity = {
  date: string
  count: number
}

export type ActivityCalendarProps = {
  activities: DBActivity[]
  streak: number
}

export const ActivityCalendar = ({ activities, streak }: ActivityCalendarProps) => {
  const t = useTranslations('ActivityCalendar')
  const locale = useLocale()

  const currentDaysOfWeek = t('days').split(',')

  const today = new Date()
  const currentYear = today.getFullYear()
  const currentMonth = today.getMonth()
  const currentDateNum = today.getDate()

  const monthName = today.toLocaleString(locale === 'pl' ? 'pl-PL' : 'en-US', {
    month: 'long',
    year: 'numeric',
  })
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay()
  const offsetDays = firstDayIndex === 0 ? 6 : firstDayIndex - 1

  const getCountForDay = (dayNum: number) => {
    const formattedDate = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`
    const found = activities.find((act) => act.date === formattedDate)
    return found ? found.count : 0
  }

  const getColorClass = (count: number, isFuture: boolean) => {
    if (isFuture) return 'bg-transparent border border border-gray-60/30 text-gray-60/30'

    switch (count) {
      case 0:
        return 'bg-primary/10 text-gray-60'
      case 1:
        return 'bg-primary/50 text-white'
      case 2:
        return 'bg-primary/60 text-white'
      case 3:
        return 'bg-primary/70 text-white'
      case 4:
        return 'bg-primary/80 text-white'
      default:
        return 'bg-primary text-white'
    }
  }

  const totalQuestions = activities.reduce((sum, act) => sum + act.count, 0)
  const activeDaysCount = activities.filter((act) => act.count > 0).length

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="surface-card w-full p-5"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center sm:justify-between mb-6">
        <div className="flex items-center gap-2">
          <h2 className="body-font font-bold text-gray-100 capitalize">{monthName}</h2>
          <span className="body-small text-gray-60">
            {t('info', { questions: totalQuestions, activeDays: activeDaysCount })}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-1.5 rounded-full bg-orange-500/10 px-3 py-1 text-sm font-semibold text-orange-600">
            <Flame className="h-4 w-4  fill-orange-500 text-orange-500" />
            <span className="body-small">{t('streak', { count: streak })}</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-gray-60">
            <span>{t('less')}</span>
            <div className="flex gap-1">
              <span className="h-3 w-3 rounded-full bg-white border border-gray-60" />
              <span className="h-3 w-3 rounded-full bg-primary/50" />
              <span className="h-3 w-3 rounded-full bg-primary/70" />
              <span className="h-3 w-3 rounded-full bg-primary/80" />
              <span className="h-3 w-3 rounded-full bg-primary" />
            </div>
            <span>{t('more')}</span>
          </div>
        </div>
      </div>

      <div className="w-full">
        <div>
          <div className="grid grid-cols-7 mb-2 text-center body-medium text-gray-60 uppercase">
            {currentDaysOfWeek.map((day, idx) => (
              <div key={idx}>{day}</div>
            ))}
          </div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.01 } },
            }}
            className="grid grid-cols-7 gap-2"
          >
            {Array.from({ length: offsetDays }).map((_, idx) => (
              <div key={`offset-${idx}`} className="h-10 bg-transparent" />
            ))}

            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const dayNum = idx + 1
              const isFuture = dayNum > currentDateNum
              const isToday = dayNum === currentDateNum
              const count = getCountForDay(dayNum)

              return (
                <motion.div
                  key={`day-${dayNum}`}
                  variants={{
                    hidden: { opacity: 0, scale: 0.8 },
                    visible: { opacity: 1, scale: 1 },
                  }}
                  whileHover={!isFuture ? { scale: 1.1, zIndex: 10 } : {}}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className={`
                    relative flex h-9 items-center justify-center rounded-xl body-medium font-semibold transition-all cursor-default select-none
                    ${getColorClass(count, isFuture)}
                    ${isToday ? 'ring ring-primary ring-offset-2 ring-offset-white' : ''}
                  `}
                >
                  {dayNum}
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
