'use client'

import { ReactNode } from 'react'

import { ThemeProvider } from '@/providers/ThemeProvider'
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
        <div>{children}</div>
      </ThemeProvider>
    </NextIntlClientProvider>
  )
}
