'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation' // <-- Importy do obsługi routingu
import { motion } from 'motion/react'
import { Button } from '@/components/shared/atoms/button'
import NightIcon from '@/assets/icons/night.svg'
import SunIcon from '@/assets/icons/sun.svg'
import Logo from '@/assets/icons/logo.svg'
import { useTranslations } from 'next-intl'

export type HeaderProps = {
  name: string
  nav: {
    label: string
    link: string
  }[]
}

export const Header = ({ name, nav }: HeaderProps) => {
  const [isDark, setIsDark] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const t = useTranslations('Header')

  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      document.documentElement.classList.add('dark')
      setIsDark(true)
    } else {
      document.documentElement.classList.remove('dark')
      setIsDark(false)
    }
  }, [])

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
    const controlNavbar = () => {
      const currentScrollY = window.scrollY

      if (currentScrollY < 10) {
        setIsVisible(true)
      } else if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setIsVisible(false)
        setIsOpen(false)
      } else if (currentScrollY < lastScrollY) {
        setIsVisible(true)
      }

      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', controlNavbar)

    return () => {
      window.removeEventListener('scroll', controlNavbar)
    }
  }, [lastScrollY])

  const toggleTheme = () => {
    if (document.documentElement.classList.contains('dark')) {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
      setIsDark(false)
    } else {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
      setIsDark(true)
    }
  }

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
          const offsetPosition = elementPosition + window.scrollY

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
    <motion.header
      animate={{ y: isVisible ? 0 : '-100%' }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="fixed top-0 w-full h-16 bg-white dark:bg-background border-b border-gray-60/20 z-50"
    >
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

        {/* DESKTOP NAV */}
        <nav className="hidden md:flex gap-6 items-center">
          {nav.map((e) => (
            <Link
              className="body-medium text-gray-60 hover:text-gray-100/90 transition-colors duration-200 ease-in-out cursor-pointer"
              href={e.link}
              key={e.label}
              onClick={(event) => handleNavClick(event, e.link)} // Obługa kliknięcia
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
          <Button variant="text" className="hover:text-primary!">
            {t('login')}
          </Button>
          <Button>{t('getStarted')} →</Button>
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

      {/* MOBILE NAV */}
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
          <Button variant="text" className="w-full justify-center hover:text-primary!">
            {t('login')}
          </Button>
          <Button className="w-full justify-center">{t('getStarted')} →</Button>
        </div>
      </div>
    </motion.header>
  )
}
