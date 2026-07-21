'use client'

import { FormEvent, useState } from 'react'

import { useTranslations } from 'next-intl'

import { KeyRound, Lock, ShieldCheck } from 'lucide-react'

import { Button } from '@/components/atoms/Button'
import { ProfileSettingsCard } from '@/components/molecules/ProfileSettingsCard'
import { ProfileSettingsField } from '@/components/molecules/ProfileSettingsField'
import { ProfileStatusMessage } from '@/components/molecules/ProfileStatusMessage'

export const SecuritySection = () => {
  const t = useTranslations('ProfileSettings.security')
  const [status, setStatus] = useState<string>()

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setStatus(t('statusPreview'))
  }

  return (
    <section className="space-y-5">
      <ProfileSettingsCard
        title={t('password.title')}
        description={t('password.description')}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <ProfileSettingsField
            label={t('password.currentLabel')}
            icon={Lock}
            name="current-password"
            type="password"
            autoComplete="current-password"
            placeholder={t('password.currentPlaceholder')}
          />
          <ProfileSettingsField
            label={t('password.newLabel')}
            icon={KeyRound}
            name="new-password"
            type="password"
            autoComplete="new-password"
            placeholder={t('password.newPlaceholder')}
            hint={t('password.newHint')}
          />
          <ProfileSettingsField
            label={t('password.confirmLabel')}
            icon={KeyRound}
            name="confirm-password"
            type="password"
            autoComplete="new-password"
            placeholder={t('password.confirmPlaceholder')}
          />
          <ProfileStatusMessage message={status} />
          <Button type="submit" size="lg" className="px-4 py-2">
            {t('password.submitButton')}
          </Button>
        </form>
      </ProfileSettingsCard>

      <ProfileSettingsCard
        title={t('mfa.title')}
        description={t('mfa.description')}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ShieldCheck size={19} aria-hidden="true" />
            </span>
            <div>
              <p className="body-medium font-semibold text-gray-100">
                {t('mfa.disabledTitle')}
              </p>
              <p className="mt-0.5 body-small text-gray-60">
                {t('mfa.disabledDescription')}
              </p>
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
