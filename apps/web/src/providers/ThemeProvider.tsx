'use client'

import { useEffect } from 'react'

import { useThemeStore } from '@/store/useThemeStore'

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const initializeTheme = useThemeStore((state) => state.initializeTheme)

  useEffect(() => {
    initializeTheme()
  }, [initializeTheme])

  return <>{children}</>
}
