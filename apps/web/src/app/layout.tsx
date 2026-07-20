'use client'

import { ReactNode, useEffect } from 'react'

import '@/styles/global.css'

import { useBookmarksStore } from '@/store/useBookmarksStore'

type Props = {
  children: ReactNode
}

export default function RootLayout({ children }: Props) {
  useEffect(() => {
    useBookmarksStore.persist.rehydrate()
  }, [])

  return (
    <html suppressHydrationWarning>
      <body>{children}</body>
    </html>
  )
}
