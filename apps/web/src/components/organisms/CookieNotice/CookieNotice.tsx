'use client'

import { useEffect, useState } from 'react'

import Link from 'next/link'

import { Cookie, X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'

import { Button } from '@/components/atoms/Button'

const STORAGE_KEY = 'prepcode.cookie-notice.dismissed'

export const CookieNotice = () => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    try {
      if (!window.localStorage.getItem(STORAGE_KEY)) {
        setIsVisible(true)
      }
    } catch {
      // If storage is unavailable, just show the notice once per page load.
      setIsVisible(true)
    }
  }, [])

  const dismiss = () => {
    setIsVisible(false)
    try {
      window.localStorage.setItem(STORAGE_KEY, '1')
    } catch {
      // Ignore - worst case the notice reappears next visit.
    }
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.2 }}
          className="surface-popover fixed bottom-4 left-4 right-4 z-40 mx-auto flex max-w-xl flex-col gap-3 p-4 sm:flex-row sm:items-center"
          role="region"
          aria-label="Cookie notice"
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Cookie size={16} aria-hidden="true" />
          </span>
          <p className="body-small text-gray-60 flex-1">
            Używamy wyłącznie niezbędnych plików cookies, potrzebnych do utrzymania Twojej sesji.
            Więcej informacji znajdziesz w{' '}
            <Link href="/privacy#cookies" className="text-primary underline underline-offset-2">
              polityce prywatności
            </Link>
            .
          </p>
          <div className="flex items-center gap-2 shrink-0">
            <Button size="md" onClick={dismiss}>
              Rozumiem
            </Button>
            <Button variant="text" iconOnly icon={X} aria-label="Zamknij" onClick={dismiss} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
