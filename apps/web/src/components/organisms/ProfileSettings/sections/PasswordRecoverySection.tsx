'use client'

import { type FormEvent, useEffect, useRef, useState } from 'react'

import {
  PasswordRecoveryError,
  requestPasswordRecoveryOtp,
  updateRecoveredPassword,
  verifyPasswordRecoveryOtp,
} from '@/services/passwordRecovery'
import { KeyRound, Mail, RefreshCw, RotateCcw, Send, ShieldCheck } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { useAuthSessionStore } from '@/store/useAuthSessionStore'

import { Button } from '@/components/atoms/Button'
import { ProfileSettingsCard } from '@/components/molecules/ProfileSettingsCard'
import { ProfileSettingsField } from '@/components/molecules/ProfileSettingsField'
import { ProfileStatusMessage } from '@/components/molecules/ProfileStatusMessage'

const RECOVERY_OTP_LENGTH = 8
const PASSWORD_MIN_LENGTH = 8
const PASSWORD_MAX_LENGTH = 128

type RecoveryStep =
  | 'request'
  | 'requesting'
  | 'code_sent'
  | 'verifying'
  | 'new_password'
  | 'updating'
  | 'success'

type RecoveryStatus = {
  message: string
  tone: 'success' | 'error' | 'info'
}

const normalizeOtp = (otp: string): string => otp.replace(/\s/gu, '').slice(0, RECOVERY_OTP_LENGTH)

export const PasswordRecoverySection = () => {
  const t = useTranslations('ProfileSettings.security.passwordRecovery')
  const session = useAuthSessionStore((state) => state.session)
  const profile = useAuthSessionStore((state) => state.profile)
  const initialized = useAuthSessionStore((state) => state.initialized)
  const loading = useAuthSessionStore((state) => state.loading)
  const setSession = useAuthSessionStore((state) => state.setSession)
  const mounted = useRef(true)
  const [step, setStep] = useState<RecoveryStep>('request')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmedPassword, setConfirmedPassword] = useState('')
  const [otpError, setOtpError] = useState<string>()
  const [newPasswordError, setNewPasswordError] = useState<string>()
  const [confirmedPasswordError, setConfirmedPasswordError] = useState<string>()
  const [status, setStatus] = useState<RecoveryStatus>()
  const [isResending, setIsResending] = useState(false)

  const canRecoverPassword =
    session?.user.identities?.some((identity) => identity.provider === 'email') ?? false
  const email = session?.user.email ?? profile?.email ?? ''
  const isSessionLoading = !initialized || loading
  const isBusy = step === 'requesting' || step === 'verifying' || step === 'updating' || isResending

  useEffect(() => {
    mounted.current = true

    return () => {
      mounted.current = false
    }
  }, [])

  const getErrorMessage = (error: PasswordRecoveryError): string => {
    switch (error.code) {
      case 'otp_expired':
      case 'token_expired':
        return t('errors.invalidCode')
      case 'weak_password':
        return t('errors.weakPassword')
      case 'same_password':
        return t('errors.samePassword')
      case 'over_email_send_rate_limit':
      case 'over_request_rate_limit':
        return t('errors.rateLimit')
      case 'email_address_not_authorized':
        return t('errors.deliveryNotConfigured')
      case 'session_expired':
      case 'session_not_found':
        return t('errors.sessionExpired')
      default:
        return t('errors.generic')
    }
  }

  const handleRequest = async () => {
    if (!email) return

    setStatus(undefined)
    setOtpError(undefined)
    setStep('requesting')

    try {
      await requestPasswordRecoveryOtp(email)
      if (!mounted.current) return

      setStep('code_sent')
      setStatus({
        message: t('status.codeSent', { email }),
        tone: 'info',
      })
    } catch (error) {
      if (!mounted.current) return

      setStep('request')
      setStatus({
        message:
          error instanceof PasswordRecoveryError ? getErrorMessage(error) : t('errors.generic'),
        tone: 'error',
      })
    }
  }

  const handleResend = async () => {
    if (!email) return

    setStatus(undefined)
    setOtpError(undefined)
    setIsResending(true)

    try {
      await requestPasswordRecoveryOtp(email)
      if (!mounted.current) return

      setStatus({
        message: t('status.codeResent', { email }),
        tone: 'info',
      })
    } catch (error) {
      if (!mounted.current) return

      setStatus({
        message:
          error instanceof PasswordRecoveryError ? getErrorMessage(error) : t('errors.generic'),
        tone: 'error',
      })
    } finally {
      if (mounted.current) {
        setIsResending(false)
      }
    }
  }

  const handleVerify = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setOtpError(undefined)
    setStatus(undefined)

    if (otp.length !== RECOVERY_OTP_LENGTH) {
      setOtpError(t('errors.codeLength', { length: RECOVERY_OTP_LENGTH }))
      return
    }

    setStep('verifying')

    try {
      const recoverySession = await verifyPasswordRecoveryOtp(email, otp)
      setSession(recoverySession)
      if (!mounted.current) return

      setOtp('')
      setStep('new_password')
      setStatus({
        message: t('status.codeVerified'),
        tone: 'success',
      })
    } catch (error) {
      if (!mounted.current) return

      setStep('code_sent')
      setOtpError(
        error instanceof PasswordRecoveryError ? getErrorMessage(error) : t('errors.invalidCode'),
      )
    }
  }

  const handlePasswordUpdate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setNewPasswordError(undefined)
    setConfirmedPasswordError(undefined)
    setStatus(undefined)

    if (newPassword.length < PASSWORD_MIN_LENGTH) {
      setNewPasswordError(t('errors.passwordTooShort', { min: PASSWORD_MIN_LENGTH }))
      return
    }

    if (newPassword.length > PASSWORD_MAX_LENGTH) {
      setNewPasswordError(t('errors.passwordTooLong', { max: PASSWORD_MAX_LENGTH }))
      return
    }

    if (newPassword !== confirmedPassword) {
      setConfirmedPasswordError(t('errors.passwordMismatch'))
      return
    }

    setStep('updating')

    try {
      const result = await updateRecoveredPassword(newPassword)
      if (!mounted.current) return

      setNewPassword('')
      setConfirmedPassword('')
      setStep('success')
      setStatus({
        message: result.otherSessionsRevoked
          ? t('status.success')
          : t('status.successSessionsWarning'),
        tone: result.otherSessionsRevoked ? 'success' : 'info',
      })
    } catch (error) {
      if (!mounted.current) return

      setStep('new_password')
      setNewPasswordError(
        error instanceof PasswordRecoveryError ? getErrorMessage(error) : t('errors.generic'),
      )
    }
  }

  const handleStartOver = () => {
    setStep('request')
    setOtp('')
    setNewPassword('')
    setConfirmedPassword('')
    setOtpError(undefined)
    setNewPasswordError(undefined)
    setConfirmedPasswordError(undefined)
    setStatus(undefined)
  }

  const isCodeStep = step === 'code_sent' || step === 'verifying'
  const isPasswordStep = step === 'new_password' || step === 'updating'

  return (
    <ProfileSettingsCard title={t('title')} description={t('description')}>
      <div className="space-y-4">
        <ProfileSettingsField
          label={t('emailLabel')}
          icon={Mail}
          name="password-recovery-email"
          type="email"
          value={email}
          readOnly
          aria-readonly="true"
          className="cursor-not-allowed text-gray-60"
        />

        {isSessionLoading && <ProfileStatusMessage message={t('status.loading')} tone="info" />}

        {!isSessionLoading && !session && (
          <ProfileStatusMessage message={t('errors.sessionExpired')} tone="error" />
        )}

        {!isSessionLoading && session && !canRecoverPassword && (
          <ProfileStatusMessage message={t('status.providerManaged')} tone="info" />
        )}

        {!isSessionLoading && session && canRecoverPassword && step === 'request' && (
          <>
            <p className="body-small text-gray-60">{t('requestHint')}</p>
            <ProfileStatusMessage message={status?.message} tone={status?.tone} />
            <Button
              type="button"
              icon={Send}
              size="lg"
              className="px-4 py-2"
              disabled={!email}
              onClick={() => void handleRequest()}
            >
              {t('sendCodeButton')}
            </Button>
          </>
        )}

        {step === 'requesting' && (
          <ProfileStatusMessage message={t('status.sendingCode')} tone="info" />
        )}

        {!isSessionLoading && session && canRecoverPassword && isCodeStep && (
          <form onSubmit={(event) => void handleVerify(event)} className="space-y-4">
            <ProfileSettingsField
              label={t('codeLabel')}
              icon={ShieldCheck}
              name="password-recovery-code"
              type="text"
              autoComplete="one-time-code"
              value={otp}
              placeholder={t('codePlaceholder')}
              error={otpError}
              hint={t('codeHint', { email })}
              required
              minLength={RECOVERY_OTP_LENGTH}
              maxLength={RECOVERY_OTP_LENGTH}
              disabled={isBusy}
              onChange={(event) => {
                setOtp(normalizeOtp(event.target.value))
                setOtpError(undefined)
                setStatus(undefined)
              }}
            />
            <ProfileStatusMessage message={status?.message} tone={status?.tone} />
            <div className="flex flex-wrap gap-2">
              <Button
                type="submit"
                icon={ShieldCheck}
                size="lg"
                className="px-4 py-2"
                disabled={isBusy || otp.length !== RECOVERY_OTP_LENGTH}
              >
                {step === 'verifying' ? t('verifyingButton') : t('verifyButton')}
              </Button>
              <Button
                type="button"
                variant="secondary"
                icon={RefreshCw}
                disabled={isBusy}
                onClick={() => void handleResend()}
              >
                {isResending ? t('resendingButton') : t('resendButton')}
              </Button>
              <Button
                type="button"
                variant="text"
                icon={RotateCcw}
                disabled={isBusy}
                onClick={handleStartOver}
              >
                {t('cancelButton')}
              </Button>
            </div>
          </form>
        )}

        {!isSessionLoading && session && canRecoverPassword && isPasswordStep && (
          <form onSubmit={(event) => void handlePasswordUpdate(event)} className="space-y-4">
            <ProfileStatusMessage message={status?.message} tone={status?.tone} />
            <ProfileSettingsField
              label={t('newPasswordLabel')}
              icon={KeyRound}
              name="recovered-password"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              placeholder={t('newPasswordPlaceholder')}
              error={newPasswordError}
              hint={t('newPasswordHint', { min: PASSWORD_MIN_LENGTH })}
              required
              minLength={PASSWORD_MIN_LENGTH}
              maxLength={PASSWORD_MAX_LENGTH}
              disabled={isBusy}
              onChange={(event) => {
                setNewPassword(event.target.value)
                setNewPasswordError(undefined)
                setStatus(undefined)
              }}
            />
            <ProfileSettingsField
              label={t('confirmPasswordLabel')}
              icon={KeyRound}
              name="confirmed-recovered-password"
              type="password"
              autoComplete="new-password"
              value={confirmedPassword}
              placeholder={t('confirmPasswordPlaceholder')}
              error={confirmedPasswordError}
              required
              minLength={PASSWORD_MIN_LENGTH}
              maxLength={PASSWORD_MAX_LENGTH}
              disabled={isBusy}
              onChange={(event) => {
                setConfirmedPassword(event.target.value)
                setConfirmedPasswordError(undefined)
                setStatus(undefined)
              }}
            />
            <Button
              type="submit"
              icon={KeyRound}
              size="lg"
              className="px-4 py-2"
              disabled={isBusy || !newPassword || !confirmedPassword}
            >
              {step === 'updating' ? t('updatingButton') : t('updateButton')}
            </Button>
          </form>
        )}

        {step === 'success' && (
          <ProfileStatusMessage message={status?.message} tone={status?.tone} />
        )}
      </div>
    </ProfileSettingsCard>
  )
}
