'use client'

import { ComponentType } from 'react'

import { LucideProps } from 'lucide-react'

import { cn } from '@/utils/cn'

export type ProfileSettingsTab<T extends string> = {
  id: T
  label: string
  icon: ComponentType<LucideProps>
}

type ProfileSettingsTabsProps<T extends string> = {
  tabs: ProfileSettingsTab<T>[]
  activeTab: T
  onTabChange: (tab: T) => void
  ariaLabel: string
}

export const ProfileSettingsTabs = <T extends string>({
  tabs,
  activeTab,
  onTabChange,
  ariaLabel,
}: ProfileSettingsTabsProps<T>) => {
  return (
    <nav className="mb-6 flex gap-1 border-b border-[var(--color-gray-10)]" aria-label={ariaLabel}>
      {tabs.map((tab) => {
        const Icon = tab.icon
        const isActive = activeTab === tab.id

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              '-mb-px flex shrink-0 cursor-pointer items-center gap-2 border-b-2 px-3.5 py-2.5 body-medium transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/40',
              isActive
                ? 'border-primary text-primary font-semibold'
                : 'border-transparent text-gray-60 hover:text-gray-100',
            )}
          >
            <Icon size={16} aria-hidden="true" />
            {tab.label}
          </button>
        )
      })}
    </nav>
  )
}
