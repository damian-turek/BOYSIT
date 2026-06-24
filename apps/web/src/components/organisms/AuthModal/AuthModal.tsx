'use client'

import { useEffect, useState } from 'react'

import { usePathname, useRouter } from 'next/navigation'

import { AnimatePresence, motion } from 'motion/react'
import { useTranslations } from 'next-intl'

import { getSupabaseClient } from '@/services/supabase'
import { useAuthStore } from '@/store/useAuthStore'

import { Button } from '@/components/atoms/Button'
import { Input } from '@/components/atoms/inputs/Input'

import CloseIcon from '@/assets/icons/close.svg'
import GitHubIcon from '@/assets/icons/github.svg'
import GoogleIcon from '@/assets/icons/google.svg'
import Logo from '@/assets/icons/logo.svg'

type OAuthProvider = 'github' | 'google'

export const AuthModal = () => {
  const t = useTranslations('Auth')
  const router = useRouter()
  const pathname = usePathname()
  const { isOpen, view, closeModal, setView } = useAuthStore()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  const locale = pathname.startsWith('/pl') ? 'pl' : 'en'
  const dashboardPath = `/${locale}/dashboard`

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [closeModal])

  useEffect(() => {
    if (!isOpen) {
      setStatusMessage(null)
      setIsSubmitting(false)
    }
  }, [isOpen])

  const handleOAuth = async (provider: OAuthProvider) => {
    setStatusMessage(null)
    setIsSubmitting(true)
    const supabase = getSupabaseClient()

    const redirectTo =
      typeof window !== 'undefined'
        ? `${window.location.origin}${dashboardPath}`
        : undefined

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo,
      },
    })

    if (error) {
      setStatusMessage(error.message)
      setIsSubmitting(false)
      return
    }

    setIsSubmitting(false)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setStatusMessage(null)

    if (view === 'register' && password !== confirmPassword) {
      setStatusMessage('Passwords do not match')
      return
    }

    setIsSubmitting(true)
    const supabase = getSupabaseClient()

    const redirectTo =
      typeof window !== 'undefined'
        ? `${window.location.origin}${dashboardPath}`
        : undefined

    const result =
      view === 'login'
        ? await supabase.auth.signInWithPassword({
            email,
            password,
          })
        : await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                name,
              },
              emailRedirectTo: redirectTo,
            },
          })

    if (result.error) {
      setStatusMessage(result.error.message)
      setIsSubmitting(false)
      return
    }

    if (result.data.session) {
      closeModal()
      router.replace(dashboardPath)
      setIsSubmitting(false)
      return
    }

    if (view === 'register') {
      setStatusMessage(
        'Check your email to confirm the account before logging in.',
      )
    } else {
      setStatusMessage('Sign-in completed, but no active session was created.')
    }

    setIsSubmitting(false)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
            className="absolute inset-0 bg-white/90 backdrop-blur-xs"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', duration: 0.4, bounce: 0 }}
            className="relative z-10 flex w-full max-w-md flex-col items-center rounded-2xl border border-gray-60/20 bg-white p-6 shadow-2xl md:p-8 dark:border-gray-10/30 dark:bg-white"
          >
            <Button
              onClick={closeModal}
              icon={CloseIcon}
              variant="text"
              className="absolute right-4 top-4"
              aria-label="Close modal"
            />

            <div className="absolute -top-15 flex items-center gap-2 font-bold tracking-[-0.6px] text-gray-100 body-font">
              <Button icon={Logo} iconOnly className="h-10 w-10" />
              PrepCode
            </div>

            <div className="mb-8 flex w-full flex-col items-center text-center">
              <h3 className="body-font font-bold text-gray-100">
                {view === 'login' ? t('title') : t('registerTitle')}
              </h3>
              <p className="body-medium mt-1 text-gray-60">
                {view === 'login' ? t('description') : t('registerDescription')}
              </p>
            </div>

            <div className="mb-6 flex w-full items-center gap-3">
              <Button
                icon={GitHubIcon}
                variant="secondary"
                className="w-full"
                onClick={() => void handleOAuth('github')}
                disabled={isSubmitting}
              >
                GitHub
              </Button>
              <Button
                icon={GoogleIcon}
                variant="secondary"
                className="w-full"
                onClick={() => void handleOAuth('google')}
                disabled={isSubmitting}
              >
                Google
              </Button>
            </div>

            <div className="relative my-5 flex w-full items-center justify-center">
              <div className="h-px w-full bg-gray-60/20" />
              <span className="absolute bg-white px-3 body-small text-gray-60 dark:bg-white">
                {t('label')}
              </span>
            </div>

            <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
              {view === 'register' && (
                <Input
                  label={t('name')}
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              )}

              <Input
                label={t('email')}
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <Input
                label={t('password')}
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              {view === 'register' && (
                <Input
                  label={t('confirmPassword')}
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              )}

              <Button
                type="submit"
                className="mt-2 w-full justify-center shadow-md shadow-primary/20"
                size="lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Please wait...' : view === 'login' ? t('login') : t('register')}
              </Button>
            </form>

            {statusMessage && (
              <p className="mt-4 w-full text-sm text-gray-60">{statusMessage}</p>
            )}

            <div className="mt-6 text-center body-medium text-gray-60">
              {view === 'login' ? (
                <p>
                  {t('dontHaveAccount')}
                  <span
                    onClick={() => setView('register')}
                    className="cursor-pointer text-primary transition-all duration-150 hover:font-semibold"
                  >
                    {t('signup')}
                  </span>
                </p>
              ) : (
                <p>
                  {t('alreadyHaveAccount')}
                  <span
                    onClick={() => setView('login')}
                    className="cursor-pointer text-primary transition-all duration-150 hover:font-semibold"
                  >
                    {t('login')}
                  </span>
                </p>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
