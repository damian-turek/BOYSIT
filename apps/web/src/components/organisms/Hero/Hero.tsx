'use client'

import { Variants, motion } from 'motion/react'

import { useAuthStore } from '@/store/useAuthStore'

import { Button } from '@/components/atoms/Button'

export type HeroProps = {
  title: string
  description: string
  label: string
  buttonStart: { label: string }
  buttonWorks: { label: string; link: string }
  trusted: string
  questionsCategories: { label: string; categories: string[] }
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
  trusted,
  questionsCategories,
  label,
}: HeroProps) => {
  const openModal = useAuthStore((state) => state.openModal)
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
    <section className="mt-16 relative overflow-hidden w-full bg-white dark:bg-background bg-[linear-gradient(to_right,#80808018_1px,transparent_1px),linear-gradient(to_bottom,#80808018_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff0c_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0c_1px,transparent_1px)] bg-size-[40px_40px]">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-150 h-75 bg-primary/10 blur-[120px] pointer-events-none rounded-full" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative section-container flex flex-col items-center"
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

        <motion.div
          variants={itemVariants}
          className="flex gap-2 items-center px-4 py-2 mb-8 md:mb-10 border border-gray-60/30 bg-gray-60/8 rounded-full backdrop-blur-xs"
        >
          <div className="flex items-center">
            <div className="w-7 h-7 bg-primary/30 rounded-full border-2 border-white" />
            <div className="w-7 h-7 bg-primary/30 rounded-full border-2 border-white -ml-2" />
            <div className="w-7 h-7 bg-primary/30 rounded-full border-2 border-white -ml-2" />
            <div className="w-7 h-7 bg-primary/30 rounded-full border-2 border-white -ml-2" />
          </div>
          <p
            className="body-small md:body-medium text-gray-60 [&_span]:font-semibold [&_span]:text-gray-100"
            dangerouslySetInnerHTML={{ __html: trusted }}
          />
        </motion.div>

        <motion.div variants={itemVariants} className="flex flex-col gap-4 items-center px-2">
          <p
            className="label-font-spaced uppercase text-gray-60 "
            dangerouslySetInnerHTML={{ __html: questionsCategories.label }}
          />
          <div className="flex flex-wrap gap-2 md:gap-3 justify-center max-w-270">
            {questionsCategories.categories.map((category) => (
              <div
                key={category}
                className="label-font px-3 py-2 rounded-lg border border-gray-60/20 bg-gray-60/5 backdrop-blur-sm text-gray-100"
              >
                {category}
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}
