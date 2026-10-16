'use client'

import { ReactNode, Suspense } from 'react'

import { AuthProvider } from '@/providers/AuthProvider'
import { ThemeProvider } from '@/providers/ThemeProvider'
import { AbstractIntlMessages, NextIntlClientProvider } from 'next-intl'

import { AuthModal } from '@/components/organisms/AuthModal'
import { CheckoutConfirmationModal, CheckoutModal } from '@/components/organisms/CheckoutModal'
import { CookieNotice } from '@/components/organisms/CookieNotice'

interface AppProvidersProps {
  children: ReactNode
  locale: string
  messages: AbstractIntlMessages
}

export function AppProviders({ children, locale, messages }: AppProvidersProps) {
  return (
    <NextIntlClientProvider timeZone="Europe/Warsaw" locale={locale} messages={messages}>
      <ThemeProvider>
        <AuthProvider>
          <div>{children}</div>
          <AuthModal />
          <CheckoutModal />
          <Suspense fallback={null}>
            <CheckoutConfirmationModal />
          </Suspense>
          <CookieNotice />
        </AuthProvider>
      </ThemeProvider>
    </NextIntlClientProvider>
  )
}
