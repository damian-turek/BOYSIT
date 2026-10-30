'use client'

import { useRef } from 'react'

import type { CompanyLogo } from '@/config/company-logos'
import { Variants, motion } from 'motion/react'

import { useAuthStore } from '@/store/useAuthStore'

import { Button } from '@/components/atoms/Button'

import { CompanyMarquee } from './CompanyMarquee'
import { HeroGrid } from './HeroGrid'

export type HeroProps = {
  title: string
  description: string
  label: string
  buttonStart: { label: string }
  buttonWorks: { label: string; link: string }
  questionsCategories: { label: string; companies: CompanyLogo[] }
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
    },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 40, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 90,
      damping: 14,
      mass: 0.8,
    },
  },
}

export const Hero = ({
  title,
  description,
  buttonStart,
  buttonWorks,
  questionsCategories,
  label,
}: HeroProps) => {
  const openModal = useAuthStore((state) => state.openModal)
  const heroRef = useRef<HTMLElement>(null)
  const handleScroll = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (buttonWorks.link.startsWith('#')) {
      e.preventDefault()

      const targetId =
        buttonWorks.link === '#how-it-works'
          ? 'how-it-works-section'
          : buttonWorks.link.replace('#', '')
      const element = document.getElementById(targetId)

      if (element) {
        const headerOffset = 64
        const elementPosition = element.getBoundingClientRect().top
        const offsetPosition = elementPosition + window.scrollY - headerOffset

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth',
        })
      }
    }
  }

  return (
    <section ref={heroRef} className="mt-16 relative isolate w-full">
      <HeroGrid containerRef={heroRef} />
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-150 h-75 bg-primary/10 blur-[120px] rounded-full" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative mx-auto flex max-w-360 flex-col items-center px-4 pt-12 pb-6 lg:px-8 lg:pt-24 lg:pb-8"
      >
        <motion.div
          variants={itemVariants}
          className="relative px-3 py-1 border border-primary/20 bg-primary/10 rounded-full flex items-center gap-2"
        >
          <p className="label-font text-primary" dangerouslySetInnerHTML={{ __html: label }} />
        </motion.div>

        <motion.h1
          variants={itemVariants}
          className="hero-text text-center text-gray-100 md:[&_span]:block [&_span]:text-primary max-w-90.5 md:max-w-2xl mt-6"
          dangerouslySetInnerHTML={{ __html: title }}
        />

        <motion.p
          variants={itemVariants}
          className="body-font text-gray-60 max-w-2xl text-center mt-6 text-base md:text-lg leading-relaxed"
          dangerouslySetInnerHTML={{ __html: description }}
        />

        <motion.div
          variants={itemVariants}
          className="pt-4 md:pt-8 pb-4 md:pb-8 flex flex-col md:flex-row gap-3 items-center px-2 w-full md:w-fit"
        >
          <Button
            onClick={() => openModal('register')}
            className="w-full md:w-fit shadow-lg shadow-primary/20"
            size="lg"
          >
            {buttonStart.label}
          </Button>
          <Button className="w-full md:w-fit" variant="secondary" onClick={handleScroll} size="lg">
            {buttonWorks.label}
          </Button>
        </motion.div>

        <motion.div variants={itemVariants} className="mt-4 w-full">
          <CompanyMarquee
            label={questionsCategories.label}
            companies={questionsCategories.companies}
          />
        </motion.div>
      </motion.div>
    </section>
  )
}
