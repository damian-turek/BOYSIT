'use client'

import { useMemo } from 'react'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import { AnimatePresence, motion } from 'motion/react'
import { useTranslations } from 'next-intl'

import { ProfileSettingsTabs } from '@/components/molecules/ProfileSettingsTabs'
import { useAuthSessionStore } from '@/store/useAuthSessionStore'

import { profileSettingsSections } from './constants'
import { BillingSection } from './sections/BillingSection'
import { ProfileSection } from './sections/ProfileSection'
import { SecuritySection } from './sections/SecuritySection'
import { ProfileSectionId } from './types'

type ProfileSettingsProps = {
  locale: string
}

const isProfileSection = (value: string | null): value is ProfileSectionId =>
  profileSettingsSections.some((section) => section.id === value)

export const ProfileSettings = ({ locale }: ProfileSettingsProps) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const t = useTranslations('ProfileSettings')
  const profile = useAuthSessionStore((state) => state.profile)
  const session = useAuthSessionStore((state) => state.session)

  const activeSection = useMemo(() => {
    const requestedSection = searchParams.get('section')
    return isProfileSection(requestedSection) ? requestedSection : 'profile'
  }, [searchParams])

  const setActiveSection = (section: ProfileSectionId) => {
    const params = new URLSearchParams(searchParams.toString())

    if (section === 'profile') params.delete('section')
    else params.set('section', section)

    const query = params.toString()
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }

  const translatedSections = profileSettingsSections.map((section) => ({
    ...section,
    label: t(section.labelKey),
  }))

  return (
    <div className="mx-auto max-w-4xl">
      <header className="mb-7">
        <p className="mb-2 label-font-spaced font-semibold text-primary uppercase">
          {t('eyebrow')}
        </p>
        <h1 className="title-font text-gray-100">{t('title')}</h1>
        <p className="mt-1 body-medium text-gray-60">
          {t('description')}
        </p>
      </header>

      <ProfileSettingsTabs
        tabs={translatedSections}
        activeTab={activeSection}
        onTabChange={setActiveSection}
        ariaLabel={t('tabsAriaLabel')}
      />

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -12 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
        >
          {activeSection === 'profile' && (
            <ProfileSection
              initialName={profile?.name ?? session?.user.user_metadata?.name ?? ''}
              email={profile?.email ?? session?.user.email ?? ''}
            />
          )}
          {activeSection === 'security' && <SecuritySection />}
          {activeSection === 'billing' && (
            <BillingSection
              locale={locale}
              plan={profile?.plan ?? 'free'}
              proUntil={profile?.proUntil}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
