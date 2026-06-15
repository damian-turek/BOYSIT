import React from 'react'

import { notFound } from 'next/navigation'

import { AppProviders } from '@/providers'
import '@/styles/global.css'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { getMessages } from 'next-intl/server'

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  if (!['en', 'pl'].includes(locale)) {
    notFound()
  }

  const messages = await getMessages()

  return (
    <html lang={locale}>
      <body>
        <AppProviders locale={locale} messages={messages}>
          {children}
          <SpeedInsights />
        </AppProviders>
      </body>
    </html>
  )
}
