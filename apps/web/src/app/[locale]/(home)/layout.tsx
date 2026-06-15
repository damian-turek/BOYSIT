import React from 'react'

import { getLayoutData } from '@/parsers/getLayoutData'
import { Metadata } from 'next'

import { AuthModal } from '@/components/organisms/AuthModal'
import { Footer } from '@/components/organisms/Nav/Footer'
import { Header } from '@/components/organisms/Nav/Header'

export const metadata: Metadata = {
  title: 'PrepCode',
}

export default async function LocaleLayout({
  children,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { HEADER_DATA, FOOTER_DATA } = getLayoutData()

  return (
    <>
      <Header {...HEADER_DATA} />
      {children}
      <AuthModal />
      <Footer {...FOOTER_DATA} />
    </>
  )
}
