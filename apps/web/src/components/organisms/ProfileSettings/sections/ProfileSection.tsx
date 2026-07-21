'use client'

import { FormEvent, useState } from 'react'

import { Bell, Mail, User } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/atoms/Button'
import { Switch } from '@/components/atoms/Switch'
import { ProfileSettingsCard } from '@/components/molecules/ProfileSettingsCard'
import { ProfileSettingsField } from '@/components/molecules/ProfileSettingsField'
import { ProfileStatusMessage } from '@/components/molecules/ProfileStatusMessage'

import { notificationOptions } from '../constants'

type ProfileSectionProps = {
  initialName: string
  email: string
}

export const ProfileSection = ({
  initialName,
  email,
}: ProfileSectionProps) => {
  const t = useTranslations('ProfileSettings.profile')
  const [name, setName] = useState(initialName)
  const [status, setStatus] = useState<string>()
  const [notifications, setNotifications] = useState<Record<string, boolean>>(
    () =>
      Object.fromEntries(
        notificationOptions.map((option) => [option.id, true]),
      ),
  )

  const handleSave = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setStatus(t('statusPreview'))
  }

  return (
    <div className="space-y-5">
      <ProfileSettingsCard
        title={t('personal.title')}
        description={t('personal.description')}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <ProfileSettingsField
            label={t('personal.nameLabel')}
            icon={User}
            name="name"
            autoComplete="name"
            value={name}
            placeholder={t('personal.namePlaceholder')}
            onChange={(event) => setName(event.target.value)}
          />
          <ProfileSettingsField
            label={t('personal.emailLabel')}
            icon={Mail}
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            spellCheck={false}
            value={email}
            placeholder={t('personal.emailPlaceholder')}
            readOnly
            aria-readonly="true"
            hint={t('personal.emailHint')}
            className="cursor-not-allowed text-gray-60"
          />
          <ProfileStatusMessage message={status} />
          <Button type="submit" size="lg" className="px-4 py-2">
            {t('personal.saveButton')}
          </Button>
        </form>
      </ProfileSettingsCard>

      <ProfileSettingsCard
        title={t('notifications.title')}
        description={t('notifications.description')}
      >
        <div className="divide-y divide-[var(--color-gray-10)]">
          {notificationOptions.map((option) => {
            const checked = notifications[option.id] ?? false
            const label = t(option.labelKey)

            return (
              <div
                key={option.id}
                className="flex items-start justify-between gap-5 py-4 first:pt-0 last:pb-0"
              >
                <span className="flex min-w-0 gap-3">
                  <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Bell size={15} aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="block body-medium font-semibold text-gray-100">
                      {label}
                    </span>
                    <span className="mt-0.5 block body-small text-gray-60">
                      {t(option.descriptionKey)}
                    </span>
                  </span>
                </span>
                <Switch
                  label={label}
                  checked={checked}
                  onChange={(event) =>
                    setNotifications((current) => ({
                      ...current,
                      [option.id]: event.target.checked,
                    }))
                  }
                  className="mt-1"
                />
              </div>
            )
          })}
        </div>
      </ProfileSettingsCard>
    </div>
  )
}
