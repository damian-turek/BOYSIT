'use client'

import { type FormEvent, useEffect, useState } from 'react'

import { AuthApiError, updateCurrentUserProfile } from '@/services/authApi'
import { Bell, Mail, User } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { useAuthSessionStore } from '@/store/useAuthSessionStore'

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

const PROFILE_NAME_MAX_LENGTH = 50
const profileNameContainsLetter = /\p{L}/u

const normalizeProfileName = (name: string): string =>
  name
    .normalize('NFC')
    .trim()
    .replace(/\p{Zs}+/gu, ' ')

const containsControlCharacter = (name: string): boolean =>
  Array.from(name).some((character) => {
    const codePoint = character.codePointAt(0)
    return codePoint !== undefined && (codePoint <= 31 || (codePoint >= 127 && codePoint <= 159))
  })

type ProfileStatus = {
  message: string
  tone: 'success' | 'error'
}

export const ProfileSection = ({ initialName, email }: ProfileSectionProps) => {
  const t = useTranslations('ProfileSettings.profile')
  const [name, setName] = useState(initialName)
  const [savedName, setSavedName] = useState(normalizeProfileName(initialName))
  const [nameError, setNameError] = useState<string>()
  const [status, setStatus] = useState<ProfileStatus>()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const setProfile = useAuthSessionStore((state) => state.setProfile)
  const [notifications, setNotifications] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(notificationOptions.map((option) => [option.id, true])),
  )

  useEffect(() => {
    setName(initialName)
    setSavedName(normalizeProfileName(initialName))
  }, [initialName])

  const normalizedName = normalizeProfileName(name)
  const hasChanges = normalizedName !== savedName

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setNameError(undefined)
    setStatus(undefined)

    if (!normalizedName) {
      setNameError(t('personal.nameRequired'))
      return
    }

    if (normalizedName.length > PROFILE_NAME_MAX_LENGTH) {
      setNameError(t('personal.nameTooLong', { max: PROFILE_NAME_MAX_LENGTH }))
      return
    }

    if (containsControlCharacter(name)) {
      setNameError(t('personal.nameInvalidCharacters'))
      return
    }

    if (!profileNameContainsLetter.test(normalizedName)) {
      setNameError(t('personal.nameMustContainLetter'))
      return
    }

    setIsSubmitting(true)

    try {
      const profile = await updateCurrentUserProfile({
        name: normalizedName,
      })

      setProfile(profile)
      setName(profile.name ?? '')
      setSavedName(normalizeProfileName(profile.name ?? ''))
      setStatus({
        message: t('status.success'),
        tone: 'success',
      })
    } catch (error) {
      if (error instanceof AuthApiError && error.status === 400) {
        setNameError(t('personal.nameInvalid'))
        return
      }

      setStatus({
        message:
          error instanceof AuthApiError && error.status === 401
            ? t('status.sessionExpired')
            : t('status.error'),
        tone: 'error',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-5">
      <ProfileSettingsCard title={t('personal.title')} description={t('personal.description')}>
        <form
          onSubmit={(event) => void handleSave(event)}
          className="space-y-4"
          aria-busy={isSubmitting}
        >
          <ProfileSettingsField
            label={t('personal.nameLabel')}
            icon={User}
            name="name"
            autoComplete="name"
            value={name}
            placeholder={t('personal.namePlaceholder')}
            error={nameError}
            hint={t('personal.nameHint', { max: PROFILE_NAME_MAX_LENGTH })}
            required
            maxLength={PROFILE_NAME_MAX_LENGTH}
            disabled={isSubmitting}
            onChange={(event) => {
              setName(event.target.value)
              setNameError(undefined)
              setStatus(undefined)
            }}
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
          <ProfileStatusMessage message={status?.message} tone={status?.tone} />
          <Button
            type="submit"
            size="lg"
            className="px-4 py-2"
            disabled={isSubmitting || !hasChanges}
          >
            {isSubmitting ? t('personal.savingButton') : t('personal.saveButton')}
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
                    <span className="block body-medium font-semibold text-gray-100">{label}</span>
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
