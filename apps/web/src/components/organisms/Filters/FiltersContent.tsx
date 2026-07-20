'use client'

import { useState } from 'react'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import { CATEGORY_THEMES, FilterItem, ICON_MAP, SENIORITY_OPTIONS } from '@/config/questions'
import { ChevronDown, HelpCircle } from 'lucide-react'

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

  const [isTechOpen, setIsTechOpen] = useState(true)

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
    <div className="flex flex-col gap-8 w-full max-w-65 text-gray-100 select-none py-15">
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-60/80 mb-3">
          Seniority
        </h3>
        <div className="flex flex-col gap-1">
          {SENIORITY_OPTIONS.map((level) => {
            const isActive =
              activeDifficulty.toLowerCase() === level.toLowerCase() ||
              (level === 'All levels' && !searchParams.get('difficulty'))
            return (
              <button
                key={level}
                onClick={() =>
                  updateFilter('difficulty', level === 'All levels' ? null : level.toLowerCase())
                }
                className={cn(
                  'w-full text-left px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer',
                  isActive
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'text-gray-60 hover:bg-gray-60/5 hover:text-gray-100',
                )}
              >
                {level}
              </button>
            )
          })}
        </div>
      </div>

      <hr className="border-gray-60/10" />

      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-60/80">Domain</h3>
          <ChevronDown size={14} className="text-gray-60" />
        </div>
        <div className="flex flex-col gap-1">
          {categories.map((domain) => {
            const ValidIcon = ICON_MAP[domain.name] || HelpCircle
            const isActive = activeCategory === domain.slug
            const iconColor = CATEGORY_THEMES[domain.name] || '#808080'

            return (
              <button
                key={domain.id}
                onClick={() => updateFilter('category', isActive ? null : domain.slug)}
                className={cn(
                  'flex items-center gap-2.5 w-full text-left px-4 py-2 rounded-xl text-sm transition-all cursor-pointer',
                  isActive
                    ? 'bg-gray-60/10 text-gray-100 font-semibold'
                    : 'text-gray-60 hover:bg-gray-60/5 hover:text-gray-100',
                )}
              >
                <ValidIcon size={16} style={{ color: iconColor }} />
                <span>{domain.name}</span>
              </button>
            )
          })}
        </div>
      </div>

      <hr className="border-gray-60/10" />

      <div>
        <button
          onClick={() => setIsTechOpen(!isTechOpen)}
          className="flex justify-between items-center w-full mb-3 cursor-pointer"
        >
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-60/80">Technology</h3>
          <ChevronDown
            size={14}
            className={cn('text-gray-60 transition-transform', isTechOpen && 'rotate-180')}
          />
        </button>

        {isTechOpen && (
          <div className="flex flex-wrap gap-1.5 pt-1 animate-in fade-in duration-200">
            {technologies.map((tech) => {
              const isActive = activeTech === tech.slug
              return (
                <button
                  key={tech.id}
                  onClick={() => updateFilter('technology', isActive ? null : tech.slug)}
                  className={cn(
                    'px-3 py-1.5 text-xs border rounded-lg font-medium transition-all cursor-pointer',
                    isActive
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-gray-60/20 text-gray-60 bg-gray-60/5 hover:border-gray-60/40 hover:text-gray-100',
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
