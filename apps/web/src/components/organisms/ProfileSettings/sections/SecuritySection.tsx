'use client'

import { ShieldCheck } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/atoms/Button'
import { ProfileSettingsCard } from '@/components/molecules/ProfileSettingsCard'

import { PasswordRecoverySection } from './PasswordRecoverySection'

export const SecuritySection = () => {
  const t = useTranslations('ProfileSettings.security')

  return (
    <section className="space-y-5">
      <PasswordRecoverySection />

      <ProfileSettingsCard title={t('mfa.title')} description={t('mfa.description')}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ShieldCheck size={19} aria-hidden="true" />
            </span>
            <div>
              <p className="body-medium font-semibold text-gray-100">{t('mfa.disabledTitle')}</p>
              <p className="mt-0.5 body-small text-gray-60">{t('mfa.disabledDescription')}</p>
            </div>
          </div>
          <Button
            type="button"
            disabled
            variant="secondary"
            className="border-[var(--color-gray-10)] bg-gray-05 px-4 py-2 text-gray-60 opacity-70 hover:border-[var(--color-gray-10)]"
          >
            {t('mfa.comingSoon')}
          </Button>
        </div>
      </ProfileSettingsCard>
    </section>
  )
}
