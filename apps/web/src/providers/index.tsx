'use client'

import { ReactNode } from 'react'
import { NextIntlClientProvider, AbstractIntlMessages } from 'next-intl'

interface AppProvidersProps {
  children: ReactNode
  locale: string
  messages: AbstractIntlMessages
}

export function AppProviders({ children, locale, messages }: AppProvidersProps) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <div>{children}</div>
    </NextIntlClientProvider>
  )
}
