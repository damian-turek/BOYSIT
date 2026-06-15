'use client'

import { useEffect } from 'react'

import { router } from 'next/client'

import { AnimatePresence, motion } from 'motion/react'
import { useTranslations } from 'next-intl'

import { useAuthStore } from '@/store/useAuthStore'

import { Button } from '@/components/atoms/Button'
import { Input } from '@/components/atoms/inputs/Input'

import CloseIcon from '@/assets/icons/close.svg'
import GitHubIcon from '@/assets/icons/github.svg'
import GoogleIcon from '@/assets/icons/google.svg'
import Logo from '@/assets/icons/logo.svg'

export const AuthModal = () => {
  const t = useTranslations('Auth')
  const { isOpen, view, closeModal, setView } = useAuthStore()

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
            className="relative w-full max-w-md bg-white dark:bg-white border border-gray-60/20 dark:border-gray-10/30 rounded-2xl p-6 md:p-8 shadow-2xl z-10 flex flex-col items-center"
          >
            <Button
              onClick={closeModal}
              icon={CloseIcon}
              variant="text"
              className="absolute top-4 right-4"
              aria-label="Close modal"
            />

            <div className="absolute text-gray-100 -top-15 body-font font-bold tracking-[-0.6px] flex gap-2 items-center font-">
              <Button icon={Logo} iconOnly className="w-10 h-10" />
              PrepCode
            </div>

            <div className="flex flex-col items-center mb-8 w-full text-center">
              <h3 className="body-font font-bold text-gray-100">
                {view === 'login' ? t('title') : t('registerTitle')}
              </h3>
              <p className="body-medium text-gray-60 mt-1">
                {view === 'login' ? t('description') : t('registerDescription')}
              </p>
            </div>

            <div className="flex items-center gap-3 mb-6 w-full">
              <Button icon={GitHubIcon} variant="secondary" className="w-full">
                GitHub
              </Button>
              <Button icon={GoogleIcon} variant="secondary" className="w-full">
                Google
              </Button>
            </div>

            <div className="relative w-full flex items-center justify-center my-5">
              <div className="w-full h-px bg-gray-60/20" />
              <span className="absolute bg-white dark:bg-white px-3 body-small text-gray-60">
                {t('label')}
              </span>
            </div>

            <form onSubmit={(e) => e.preventDefault()} className="w-full flex flex-col gap-4">
              {view === 'register' && (
                <Input label={t('name')} type="text" placeholder="John Doe" required />
              )}

              <Input label={t('email')} type="email" placeholder="name@example.com" required />

              <Input label={t('password')} type="password" placeholder="••••••••" required />

              {view === 'register' && (
                <Input
                  label={t('confirmPassword')}
                  type="password"
                  placeholder="••••••••"
                  required
                />
              )}

              <Button
                type="submit"
                className="w-full justify-center shadow-md shadow-primary/20 mt-2"
                size="lg"
              >
                {view === 'login' ? t('login') : t('register')}
              </Button>
            </form>

            <div className="mt-6 text-center body-medium text-gray-60">
              {view === 'login' ? (
                <p>
                  {t('dontHaveAccount')}
                  <span
                    onClick={() => setView('register')}
                    className="text-primary cursor-pointer hover:font-semibold transition-all duration-150"
                  >
                    {t('signup')}
                  </span>
                </p>
              ) : (
                <p>
                  {t('alreadyHaveAccount')}
                  <span
                    onClick={() => setView('login')}
                    className="text-primary cursor-pointer hover:font-semibold transition-all duration-150"
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
