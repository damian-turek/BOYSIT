'use client'

import { type FormEvent, useCallback, useEffect, useId, useState } from 'react'

import { useRouter } from 'next/navigation'

import {
  AuthApiError,
  deleteCurrentUserAccount,
  requestAccountDeletionCode,
} from '@/services/authApi'
import { getSupabaseClient } from '@/services/supabaseClient'
import { AlertTriangle, RefreshCw, Send, ShieldCheck, Trash2 } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useLocale, useTranslations } from 'next-intl'

import { useAuthSessionStore } from '@/store/useAuthSessionStore'

import { Button } from '@/components/atoms/Button'
import { Input } from '@/components/atoms/inputs/Input'
import { ProfileSettingsCard } from '@/components/molecules/ProfileSettingsCard'
import { ProfileStatusMessage } from '@/components/molecules/ProfileStatusMessage'

const ACCOUNT_DELETION_CODE_MIN_LENGTH = 6
const ACCOUNT_DELETION_CODE_MAX_LENGTH = 10

type DeleteAccountSectionProps = {
  email: string
}

type DeletionStatus = {
  message: string
  tone: 'error' | 'info'
}

const normalizeCode = (code: string): string =>
  code.replace(/\s/gu, '').slice(0, ACCOUNT_DELETION_CODE_MAX_LENGTH)

export const DeleteAccountSection = ({ email }: DeleteAccountSectionProps) => {
  const t = useTranslations('ProfileSettings.profile.deleteAccount')
  const locale = useLocale()
  const router = useRouter()
  const clearAuth = useAuthSessionStore((state) => state.clear)
  const titleId = useId()
  const descriptionId = useId()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [codeRequested, setCodeRequested] = useState(false)
  const [code, setCode] = useState('')
  const [status, setStatus] = useState<DeletionStatus>()
  const [isSending, setIsSending] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [resendAfterSeconds, setResendAfterSeconds] = useState(0)

  const isBusy = isSending || isDeleting
  const isResending = isSending && codeRequested

  const resetDialog = useCallback(() => {
    setCodeRequested(false)
    setCode('')
    setStatus(undefined)
    setIsSending(false)
    setIsDeleting(false)
    setResendAfterSeconds(0)
  }, [])

  const closeDialog = useCallback(() => {
    if (isBusy) return

    setIsDialogOpen(false)
    resetDialog()
  }, [isBusy, resetDialog])

  useEffect(() => {
    if (!isDialogOpen) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isBusy) {
        setIsDialogOpen(false)
        resetDialog()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isBusy, isDialogOpen, resetDialog])

  useEffect(() => {
    if (resendAfterSeconds <= 0) return

    const timer = window.setInterval(() => {
      setResendAfterSeconds((current) => Math.max(0, current - 1))
    }, 1_000)

    return () => window.clearInterval(timer)
  }, [resendAfterSeconds])

  const getErrorMessage = (error: unknown): string => {
    if (!(error instanceof AuthApiError)) return t('errors.generic')

    if (error.status === 401) return t('errors.sessionExpired')

    switch (error.code) {
      case 'ACCOUNT_DELETION_CODE_RATE_LIMITED':
      case 'ACCOUNT_DELETION_EMAIL_RATE_LIMITED':
        if (error.retryAfterSeconds) {
          setResendAfterSeconds(error.retryAfterSeconds)
        }
        return t('errors.rateLimit')
      case 'INVALID_ACCOUNT_DELETION_CODE':
        return t('errors.invalidCode')
      case 'ACCOUNT_DELETION_NOT_CONFIGURED':
      case 'ACCOUNT_DELETION_EMAIL_NOT_CONFIGURED':
        return t('errors.notConfigured')
      case 'ACCOUNT_DELETION_EMAIL_FAILED':
        return t('errors.delivery')
      default:
        return t('errors.generic')
    }
  }

  const handleRequestCode = async () => {
    setStatus(undefined)
    setIsSending(true)

    try {
      const cooldownSeconds = await requestAccountDeletionCode()
      setCodeRequested(true)
      setResendAfterSeconds(cooldownSeconds)
      setStatus({
        message: t('status.codeSent', { email }),
        tone: 'info',
      })
    } catch (error) {
      setStatus({
        message: getErrorMessage(error),
        tone: 'error',
      })
    } finally {
      setIsSending(false)
    }
  }

  const handleDelete = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setStatus(undefined)

    if (!codeRequested) {
      await handleRequestCode()
      return
    }

    if (code.length < ACCOUNT_DELETION_CODE_MIN_LENGTH) {
      setStatus({
        message: t('errors.codeLength'),
        tone: 'error',
      })
      return
    }

    setIsDeleting(true)

    try {
      await deleteCurrentUserAccount({ code })
    } catch (error) {
      setStatus({
        message: getErrorMessage(error),
        tone: 'error',
      })
      setIsDeleting(false)
      return
    }

    const supabase = getSupabaseClient()
    await supabase.auth.signOut({ scope: 'local' }).catch(() => undefined)
    clearAuth()
    router.replace(`/${locale}`)
    router.refresh()
  }

  return (
    <>
      <ProfileSettingsCard title={t('title')} description={t('description')}>
        <Button
          type="button"
          icon={Trash2}
          className="bg-alert-50 hover:bg-alert-50/90"
          onClick={() => setIsDialogOpen(true)}
        >
          {t('openButton')}
        </Button>
      </ProfileSettingsCard>

      <AnimatePresence>
        {isDialogOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-50 bg-overlay backdrop-blur-xs"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeDialog}
            />
            <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.form
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                aria-describedby={descriptionId}
                aria-busy={isBusy}
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12, scale: 0.98 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                className="surface-dialog pointer-events-auto w-full max-w-md p-5 sm:p-6"
                onSubmit={(event) => void handleDelete(event)}
              >
                <div className="mb-5 flex gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-alert-50/10 text-alert-50">
                    <AlertTriangle size={20} aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <h2 id={titleId} className="body-large text-gray-100">
                      {t('dialogTitle')}
                    </h2>
                    <p id={descriptionId} className="body-medium mt-1 text-gray-60">
                      {t('dialogDescription')}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {!codeRequested ? (
                    <p className="body-small text-gray-60">{t('sendCodeHint', { email })}</p>
                  ) : (
                    <Input
                      label={t('codeLabel')}
                      name="account-deletion-code"
                      value={code}
                      placeholder={t('codePlaceholder')}
                      hint={t('codeHint', { email })}
                      autoComplete="one-time-code"
                      inputMode="text"
                      minLength={ACCOUNT_DELETION_CODE_MIN_LENGTH}
                      maxLength={ACCOUNT_DELETION_CODE_MAX_LENGTH}
                      spellCheck={false}
                      autoFocus
                      disabled={isBusy}
                      onChange={(event) => {
                        setCode(normalizeCode(event.target.value))
                        setStatus(undefined)
                      }}
                    />
                  )}
                  <ProfileStatusMessage message={status?.message} tone={status?.tone} />
                </div>

                <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <Button type="button" variant="secondary" disabled={isBusy} onClick={closeDialog}>
                    {t('cancelButton')}
                  </Button>
                  {codeRequested && (
                    <Button
                      type="button"
                      variant="secondary"
                      icon={RefreshCw}
                      disabled={isBusy || resendAfterSeconds > 0}
                      onClick={() => void handleRequestCode()}
                    >
                      {isResending
                        ? t('sendingButton')
                        : resendAfterSeconds > 0
                          ? t('resendCountdownButton', { seconds: resendAfterSeconds })
                          : t('resendButton')}
                    </Button>
                  )}
                  <Button
                    type="submit"
                    icon={codeRequested ? ShieldCheck : Send}
                    className="bg-alert-50 hover:bg-alert-50/90"
                    disabled={
                      isBusy ||
                      (!codeRequested && resendAfterSeconds > 0) ||
                      (codeRequested && code.length < ACCOUNT_DELETION_CODE_MIN_LENGTH)
                    }
                  >
                    {isDeleting
                      ? t('deletingButton')
                      : codeRequested
                        ? t('confirmButton')
                        : isSending
                          ? t('sendingButton')
                          : t('sendCodeButton')}
                  </Button>
                </div>
              </motion.form>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
