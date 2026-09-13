'use client'

import { ReactNode } from 'react'

import { AuthModal } from '@/components/organisms/AuthModal'
import { CheckoutModal } from '@/components/organisms/CheckoutModal'
import { CookieNotice } from '@/components/organisms/CookieNotice'
import { ThemeProvider } from '@/providers/ThemeProvider'
import { AuthProvider } from '@/providers/AuthProvider'
import { AbstractIntlMessages, NextIntlClientProvider } from 'next-intl'

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
          <CookieNotice />
        </AuthProvider>
      </ThemeProvider>
    </NextIntlClientProvider>
  )
}
