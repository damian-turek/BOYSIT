'use client'

import { useEffect, useState } from 'react'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import { Filter, Search as SearchIcon } from 'lucide-react'
import { motion } from 'motion/react'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/atoms/Button'
import { Input } from '@/components/atoms/inputs/Input'

export const Search = () => {
  const t = useTranslations('QuestionsPage')
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [inputValue, setInputValue] = useState(searchParams.get('search') || '')
  const [isHidden, setIsHidden] = useState(false)

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())

      if (inputValue) {
        params.set('search', inputValue)
      } else {
        params.delete('search')
      }

      router.push(`${pathname}?${params.toString()}`, { scroll: false })
    }, 300)

    return () => clearTimeout(delayDebounceFn)
  }, [inputValue, pathname, router])

  useEffect(() => {
    let lastScrollY = window.scrollY

    const handleScroll = () => {
      if (window.innerWidth >= 768) {
        if (isHidden) setIsHidden(false)
        return
      }

      const currentScrollY = window.scrollY

      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setIsHidden(true)
      } else {
        setIsHidden(false)
      }

      lastScrollY = currentScrollY
    }

    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsHidden(false)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleResize)
    }
  }, [isHidden])

  return (
    <motion.div
      variants={{
        visible: { y: 0, opacity: 1 },
        hidden: { y: '-100%', opacity: 0 },
      }}
      animate={isHidden ? 'hidden' : 'visible'}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className="fixed top-0 left-0 w-full border-b border-gray-60/30 bg-white z-10"
    >
      <div className="flex w-screen flex-col gap-3 items-end dashboard-container mt-20 md:mt-0 pr-8 py-3">
        <div className="w-full relative">
          <SearchIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-60" />
          <Input
            type="text"
            className="pl-10"
            placeholder={t('inputPlaceholder')}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
        </div>

        <Button className="md:hidden" variant="secondary" icon={Filter}>
          {t('filters')}
        </Button>
      </div>
    </motion.div>
  )
}
