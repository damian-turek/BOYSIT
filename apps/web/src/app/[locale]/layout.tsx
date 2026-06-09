import React from 'react'

import { notFound } from 'next/navigation'

import { getLayoutData } from '@/parsers/HomePage/getLayoutData'
import { AppProviders } from '@/providers'
import '@/styles/global.css'
import { getMessages } from 'next-intl/server'

import { AuthModal } from '@/components/organisms/AuthModal'
import { Footer } from '@/components/organisms/Nav/Footer'
import { Header } from '@/components/organisms/Nav/Header'

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
  const { HEADER_DATA, FOOTER_DATA } = getLayoutData()

  return (
    <html lang={locale}>
      <head>
        <title>PrepCode</title>
      </head>
      <body>
        <AppProviders locale={locale} messages={messages}>
          <Header {...HEADER_DATA} />
          {children}
          <AuthModal />
          <Footer {...FOOTER_DATA} />
        </AppProviders>
      </body>
    </html>
  )
}
