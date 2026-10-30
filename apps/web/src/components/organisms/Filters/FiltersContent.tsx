'use client'

import { useId, useState } from 'react'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import { FilterItem, ICON_MAP, SENIORITY_OPTIONS } from '@/config/questions'
import { ChevronDown, HelpCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { cn } from '@/utils/cn'

export type FiltersContentProps = {
  categories: FilterItem[]
  technologies: FilterItem[]
  onFilterApply?: () => void
}

export const FiltersContent = ({
  categories = [],
  technologies = [],
  onFilterApply,
}: FiltersContentProps) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const t = useTranslations('QuestionsPage')
  const seniorityLabels = {
    'All levels': t('allLevels'),
    Junior: t('junior'),
    Middle: t('middle'),
    Senior: t('senior'),
  }

  const [isTechOpen, setIsTechOpen] = useState(true)
  const technologyId = useId()

  const activeDifficulty = searchParams.get('difficulty') || 'All levels'
  const activeCategory = searchParams.get('category') || ''
  const activeTech = searchParams.get('technology') || ''

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())

    if (value && value !== 'All levels') {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    params.set('page', '1')

    router.push(`${pathname}?${params.toString()}`, { scroll: false })

    if (onFilterApply) onFilterApply()
  }

  return (
    <div className="flex w-full flex-col gap-6 py-6 text-gray-100 lg:py-15">
      <div>
        <h2 className="mb-3 text-xs font-semibold tracking-wider text-gray-60 uppercase">
          {t('seniority')}
        </h2>
        <div className="flex flex-col gap-1">
          {SENIORITY_OPTIONS.map((level) => {
            const isActive =
              activeDifficulty.toLowerCase() === level.toLowerCase() ||
              (level === 'All levels' && !searchParams.get('difficulty'))
            return (
              <button
                key={level}
                type="button"
                aria-pressed={isActive}
                onClick={() =>
                  updateFilter('difficulty', level === 'All levels' ? null : level.toLowerCase())
                }
                className={cn(
                  'w-full cursor-pointer rounded-xl border px-4 py-2.5 text-left text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
                  isActive
                    ? 'border-primary/20 bg-primary/8 text-primary font-semibold'
                    : 'border-transparent text-gray-60 hover:bg-gray-60/5 hover:text-gray-100',
                )}
              >
                {seniorityLabels[level]}
              </button>
            )
          })}
        </div>
      </div>

      <hr className="border-[var(--color-gray-10)]" />

      <div>
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xs font-semibold tracking-wider text-gray-60 uppercase">
            {t('domain')}
          </h2>
        </div>
        <div className="flex flex-col gap-1">
          {categories.map((domain) => {
            const ValidIcon = ICON_MAP[domain.name] || HelpCircle
            const isActive = activeCategory === domain.slug

            return (
              <button
                key={domain.id}
                type="button"
                aria-pressed={isActive}
                onClick={() => updateFilter('category', isActive ? null : domain.slug)}
                className={cn(
                  'flex w-full cursor-pointer items-center gap-2.5 rounded-xl border px-4 py-2.5 text-left text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
                  isActive
                    ? 'border-primary/20 bg-primary/8 text-primary font-semibold'
                    : 'border-transparent text-gray-60 hover:bg-gray-60/5 hover:text-gray-100',
                )}
              >
                <ValidIcon size={16} aria-hidden="true" className="shrink-0" />
                <span>{domain.name}</span>
              </button>
            )
          })}
        </div>
      </div>

      <hr className="border-[var(--color-gray-10)]" />

      <div>
        <button
          type="button"
          aria-expanded={isTechOpen}
          aria-controls={technologyId}
          onClick={() => setIsTechOpen(!isTechOpen)}
          className="mb-3 flex w-full cursor-pointer items-center justify-between rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
        >
          <span className="text-xs font-semibold tracking-wider text-gray-60 uppercase">
            {t('technology')}
          </span>
          <ChevronDown
            size={14}
            aria-hidden="true"
            className={cn(
              'text-gray-60 transition-transform motion-reduce:transition-none',
              isTechOpen && 'rotate-180',
            )}
          />
        </button>

        {isTechOpen && (
          <div id={technologyId} className="flex flex-wrap gap-1.5 pt-1">
            {technologies.map((tech) => {
              const isActive = activeTech === tech.slug
              return (
                <button
                  key={tech.id}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => updateFilter('technology', isActive ? null : tech.slug)}
                  className={cn(
                    'cursor-pointer rounded-lg border px-3 py-2 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
                    isActive
                      ? 'border-primary/30 bg-primary/8 text-primary'
                      : 'border-[var(--color-gray-10)] bg-white text-gray-60 hover:border-gray-60/40 hover:text-gray-100',
                  )}
                >
                  {tech.name}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
