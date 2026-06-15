import React from 'react'

import { getLayoutData } from '@/parsers/getLayoutData'
import { Metadata } from 'next'

import { Sidebar } from '@/components/organisms/Nav/Sidebar'

export const metadata: Metadata = {
  title: 'DashBoard',
}

export default async function LocaleLayout({
  children,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { SIDEBAR_DATA } = getLayoutData()

  return (
    <>
      <Sidebar {...SIDEBAR_DATA} />
      {children}
    </>
  )
}
