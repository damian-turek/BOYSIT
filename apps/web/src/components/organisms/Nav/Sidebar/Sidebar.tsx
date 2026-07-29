'use client'

import { useEffect, useState } from 'react'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import {
  BookOpen,
  Briefcase,
  ChevronRight,
  ClipboardCheck,
  Crown,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Sun,
  Terminal,
  User,
  X,
} from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useTranslations } from 'next-intl'

import { useThemeStore } from '@/store/useThemeStore'

import { cn } from '@/utils/cn'

import { Button } from '@/components/atoms/Button'

import Logo from '@/assets/icons/logo.svg'

const iconMap = {
  LayoutDashboard,
  BookOpen,
  Terminal,
  Briefcase,
  ClipboardCheck,
  User,
} as const

export type SidebarProps = {
  name: string
  nav: {
    label: string
    link: string
    icon: keyof typeof iconMap
  }[]
  upgradeButton: {
    link: string
    title: string
    text: string
  }
}

const MotionLink = motion.create(Link)

export const Sidebar = ({ name, nav, upgradeButton }: SidebarProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const isDark = useThemeStore((state) => state.isDark)
  const toggleTheme = useThemeStore((state) => state.toggleTheme)
  const pathname = usePathname()
  const cleanedPathname = pathname ? pathname.replace(/^\/[a-z]{2}(\/|$)/, '/').toLowerCase() : '/'
  const t = useTranslations('Sidebar')

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  return (
    <>
      <header className="fixed top-0 left-0 md:hidden flex justify-between items-center border-b border-gray-60/30 w-full bg-white p-4 z-40">
        <Link className="group flex gap-2 items-center body-large cursor-pointer" href="/dashboard">
          <Button icon={Logo} iconOnly className="group-hover:bg-primary/90" />
          <p
            className="body-large text-gray-100 transition-colors duration-300"
            dangerouslySetInnerHTML={{ __html: name }}
          />
        </Link>
        <div className="flex items-center">
          <Button
            variant="text"
            icon={isDark ? Sun : Moon}
            iconOnly
            onClick={toggleTheme}
            className={`hover:[&_svg_path]:stroke-primary! ${isDark ? '[&_svg_path]:stroke-primary' : ''}`}
          />
          <Button onClick={() => setIsOpen(true)} variant="text" aria-label={t('openMenu')}>
            <Menu size={20} />
          </Button>
        </div>
      </header>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 z-40 md:hidden backdrop-blur-xs"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      <aside
        className={cn(
          'fixed top-0 left-0 w-56.25 h-screen flex flex-col border-r border-gray-60/30 bg-white z-50 transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
        )}
      >
        <div className="flex gap-2 items-center justify-between z-50 px-4 py-5 border-b border-gray-60/30 shrink-0">
          <Link
            className="group flex gap-2 items-center body-large cursor-pointer"
            href="/dashboard"
          >
            <Button icon={Logo} iconOnly className="group-hover:bg-primary/90" />
            <p
              className="body-large text-gray-100 transition-colors duration-300"
              dangerouslySetInnerHTML={{ __html: name }}
            />
          </Link>

          <Button
            variant="secondary"
            onClick={() => setIsOpen(false)}
            iconOnly
            icon={X}
            className="md:hidden"
            aria-label={t('closeMenu')}
          />
        </div>

        <div className="flex flex-col flex-1 min-h-0 py-4 gap-4 justify-between">
          <div className="flex flex-col gap-1 overflow-y-auto overflow-x-hidden">
            {nav.map((link) => {
              const ComponentIcon = iconMap[link.icon]
              const isActive = cleanedPathname === link.link.toLowerCase()

              return (
                <MotionLink
                  key={link.label}
                  href={link.link}
                  whileHover={{ x: 2 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  className={cn(
                    'relative flex gap-3 mx-3 body-medium items-center justify-between rounded-xl transition-colors duration-300 px-3 py-2.5',
                    isActive
                      ? 'text-primary font-semibold'
                      : 'text-gray-60 hover:text-primary hover:bg-gray-60/5',
                  )}
                >
                  {isActive && (
                    <motion.span
                      layoutId="sidebar-active-link"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      className="absolute inset-0 z-0 rounded-xl border border-primary/30 bg-primary/10"
                      aria-hidden="true"
                    />
                  )}
                  <div className="relative z-10 flex gap-3 items-center">
                    {ComponentIcon && <ComponentIcon size={17} />}
                    {link.label}
                  </div>
                  {isActive && <ChevronRight size={13} className="relative z-10" />}
                </MotionLink>
              )
            })}
          </div>

          <MotionLink
            className="p-3 mx-3 flex items-center gap-3 border border-primary/50 rounded-xl bg-linear-to-r from-primary/15 to-primary/5 shrink-0"
            href={upgradeButton.link}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          >
            <Button iconOnly icon={Crown} />
            <div className="flex-1 min-w-0">
              <p
                className="body-small text-gray-100 font-bold truncate"
                dangerouslySetInnerHTML={{ __html: upgradeButton.title }}
              />
              <p
                className="body-small text-gray-60 truncate"
                dangerouslySetInnerHTML={{ __html: upgradeButton.text }}
              />
            </div>
            <ChevronRight size={13} className="shrink-0" />
          </MotionLink>
        </div>

        <div className="flex flex-col px-3 py-4 border-t border-gray-60/30 shrink-0">
          <Button
            variant="text"
            icon={isDark ? Sun : Moon}
            iconOnly
            onClick={toggleTheme}
            className={`hover:[&_svg_path]:stroke-primary! ${isDark ? '[&_svg_path]:stroke-primary' : ''}`}
          >
            {t('darkMode')}
          </Button>
          <Button
            variant="text"
            icon={LogOut}
            iconOnly
            className={`hover:[&_svg_path]:stroke-primary! ${isDark ? '[&_svg_path]:stroke-primary' : ''}`}
          >
            {t('logout')}
          </Button>
        </div>
      </aside>
    </>
  )
}
