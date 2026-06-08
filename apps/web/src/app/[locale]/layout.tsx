import '@/styles/global.css'
import React from 'react'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { AppProviders } from '@/providers'
import { Header } from '@/components/HomePage/organisms/Nav/Header'
import { getLayoutData } from '@/parsers/HomePage/getLayoutData'

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
  const { HEADER_DATA } = getLayoutData()

  return (
    <html lang={locale}>
      <head>
        <title>PrepCode</title>
      </head>
      <body>
        <AppProviders locale={locale} messages={messages}>
          <Header {...HEADER_DATA} />
          {children}
        </AppProviders>
      </body>
    </html>
  )
}
