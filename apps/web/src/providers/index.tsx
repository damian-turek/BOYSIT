'use client'

import { ReactNode } from 'react'

import { AuthModal } from '@/components/organisms/AuthModal'
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
        </AuthProvider>
      </ThemeProvider>
    </NextIntlClientProvider>
  )
}
