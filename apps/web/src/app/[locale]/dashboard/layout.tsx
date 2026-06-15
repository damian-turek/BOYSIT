import React from 'react'

import { getLayoutData } from '@/parsers/getLayoutData'

import { Sidebar } from '@/components/organisms/Nav/Sidebar'

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
