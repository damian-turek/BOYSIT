'use client'

import { useEffect, useState } from 'react'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

import { getSupabaseClient } from '@/services/supabaseClient'
import { useTranslations } from 'next-intl'

import { useAuthSessionStore } from '@/store/useAuthSessionStore'
import { useAuthStore } from '@/store/useAuthStore'
import { useThemeStore } from '@/store/useThemeStore'

import { Button } from '@/components/atoms/Button'

import Logo from '@/assets/icons/logo.svg'
import NightIcon from '@/assets/icons/night.svg'
import SunIcon from '@/assets/icons/sun.svg'

export type HeaderProps = {
  name: string
  nav: {
    label: string
    link: string
  }[]
}

export const Header = ({ name, nav }: HeaderProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const t = useTranslations('Header')
  const openModal = useAuthStore((state) => state.openModal)
  const profile = useAuthSessionStore((state) => state.profile)
  const clearAuth = useAuthSessionStore((state) => state.clear)

  const router = useRouter()
  const pathname = usePathname()
  const isDark = useThemeStore((state) => state.isDark)
  const toggleTheme = useThemeStore((state) => state.toggleTheme)

  const handleSignOut = async () => {
    const supabase = getSupabaseClient()
    await supabase.auth.signOut()
    clearAuth()
  }

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

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, link: string) => {
    if (link.startsWith('#')) {
      e.preventDefault()
      setIsOpen(false)

      const isHomepage = pathname === '/' || pathname === '/pl' || pathname === '/en'

      if (isHomepage) {
        const targetId = link === '#features' ? 'features-section' : link.replace('#', '')
        const element = document.getElementById(targetId)

        if (element) {
          const elementPosition = element.getBoundingClientRect().top
          const offsetPosition = elementPosition + window.scrollY - 64

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth',
          })
        }
      } else {
        router.push(`/${link}`)
      }
    }
  }

  return (
    <header className="fixed top-0 z-50 h-16 w-full border-b border-gray-60/20 bg-white/90 backdrop-blur-md dark:bg-background/90">
      <div className="flex justify-between items-center h-full max-w-360 mx-auto px-4">
        <Link
          className="group flex gap-2 items-center body-large cursor-pointer z-50"
          href="/"
          onClick={() => setIsOpen(false)}
        >
          <Button icon={Logo} iconOnly className="group-hover:bg-primary/90" />
          <p
            className="body-large text-gray-100 transition-colors duration-300"
            dangerouslySetInnerHTML={{ __html: name }}
          />
        </Link>

        <nav className="hidden md:flex gap-6 items-center">
          {nav.map((e) => (
            <Link
              className="body-medium text-gray-60 hover:text-gray-100/90 transition-colors duration-200 ease-in-out cursor-pointer"
              href={e.link}
              key={e.label}
              onClick={(event) => handleNavClick(event, e.link)}
              dangerouslySetInnerHTML={{ __html: e.label }}
            />
          ))}
        </nav>

        <div className="hidden md:flex gap-2 items-center">
          <Button
            variant="text"
            icon={isDark ? SunIcon : NightIcon}
            iconOnly
            onClick={toggleTheme}
            className={`hover:[&_svg_path]:stroke-primary! ${isDark ? '[&_svg_path]:stroke-primary' : ''}`}
          />
          {profile ? (
            <>
              <span className="body-small text-gray-60">{profile.email}</span>
              <Button
                onClick={() => void handleSignOut()}
                variant="text"
                className="hover:text-primary!"
              >
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={() => openModal('login')}
                variant="text"
                className="hover:text-primary!"
              >
                {t('login')}
              </Button>
              <Button onClick={() => openModal('register')}>{t('getStarted')} →</Button>
            </>
          )}
        </div>

        <div className="md:hidden flex gap-2 items-center">
          <Button
            variant="text"
            icon={isDark ? SunIcon : NightIcon}
            iconOnly
            onClick={toggleTheme}
            className={`hover:[&_svg_path]:stroke-primary! ${isDark ? '[&_svg_path]:stroke-primary' : ''}`}
          />
          <Button
            variant="text"
            onClick={() => setIsOpen(!isOpen)}
            className="flex flex-col justify-center items-center w-6 h-6 md:hidden z-50 focus:outline-hidden gap-1"
            aria-label="Toggle menu"
          >
            <span
              className={`w-4 h-[1.5px] bg-gray-100 transition-all duration-300 rounded-full ${isOpen ? 'rotate-45 translate-y-1.25' : ''}`}
            />
            <span
              className={`w-4 h-[1.5px] bg-gray-100 transition-all duration-300 rounded-full ${isOpen ? 'opacity-0' : ''}`}
            />
            <span
              className={`w-4 h-[1.5px] bg-gray-100 transition-all duration-300 rounded-full ${isOpen ? '-rotate-45 -translate-y-1.25' : ''}`}
            />
          </Button>
        </div>
      </div>

      <div
        className={`absolute top-16 left-0 w-full h-[calc(100vh-64px)] bg-white dark:bg-[#141420] border-t border-gray-60/10 px-4 pt-6 pb-10 flex flex-col justify-between transition-all duration-300 md:hidden z-40 ${
          isOpen ? 'opacity-100 translate-y-0 visible' : 'opacity-0 -translate-y-4 invisible'
        }`}
      >
        <nav className="flex flex-col items-center gap-4">
          {nav.map((e) => (
            <Link
              className="font-medium text-gray-100 hover:text-primary transition-colors duration-200 cursor-pointer"
              href={e.link}
              key={e.label}
              onClick={(event) => handleNavClick(event, e.link)} // Obsługa kliknięcia (zamknie menu automatycznie)
              dangerouslySetInnerHTML={{ __html: e.label }}
            />
          ))}
        </nav>

        <div className="flex flex-col gap-4 border-t border-gray-60/10 pt-5">
          {profile ? (
            <>
              <span className="text-center body-small text-gray-60">{profile.email}</span>
              <Button
                onClick={() => void handleSignOut()}
                variant="text"
                className="w-full justify-center hover:text-primary!"
              >
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={() => openModal('login')}
                variant="text"
                className="w-full justify-center hover:text-primary!"
              >
                {t('login')}
              </Button>
              <Button onClick={() => openModal('register')} className="w-full justify-center">
                {t('getStarted')} →
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
