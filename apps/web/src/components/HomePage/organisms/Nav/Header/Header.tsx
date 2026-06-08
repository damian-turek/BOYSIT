'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'motion/react'
import { Button } from '@/components/shared/atoms/button'
import NightIcon from '@/assets/icons/night.svg'
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

  useEffect(() => {
    const isDarkTheme = document.documentElement.classList.contains('dark')
    setIsDark(isDarkTheme)
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

        <nav className="hidden md:flex gap-6 items-center">
          {nav.map((e) => (
            <Link
              className="body-medium text-gray-60 hover:text-gray-100/90 transition-colors duration-200 ease-in-out"
              href={e.link}
              key={e.label}
              dangerouslySetInnerHTML={{ __html: e.label }}
            />
          ))}
        </nav>

        <div className="hidden md:flex gap-2 items-center">
          <Button
            variant="text"
            icon={NightIcon}
            iconOnly
            onClick={toggleTheme}
            className="hover:[&_svg_path]:stroke-primary!"
          />
          <Button variant="text" className="hover:text-primary!">
            {t('login')}
          </Button>
          <Button>{t('getStarted')} →</Button>
        </div>
        <div className="md:hidden flex gap-2 items-center">
          <Button
            variant="text"
            icon={NightIcon}
            iconOnly
            onClick={toggleTheme}
            className="hover:[&_svg_path]:stroke-primary!"
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
              className="font-medium text-gray-100 hover:text-primary transition-colors duration-200"
              href={e.link}
              key={e.label}
              onClick={() => setIsOpen(false)}
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
