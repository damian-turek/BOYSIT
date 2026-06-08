'use client'

import { StaticImageData } from 'next/image'
import { motion, Variants } from 'motion/react'
import { Button } from '@/components/shared/atoms/button'
import { ReactSVG } from 'react-svg'

export type HowItWorksProps = {
  label: string
  title: string
  description: string
  tiles: {
    icon: StaticImageData
    title: string
    description: string
  }[]
  button: {
    label: string
    link: string
  }
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, scale: 0.96, y: 15 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
}

export const HowItWorks = ({ label, tiles, description, button, title }: HowItWorksProps) => {
  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      id="how-it-works-section"
      whileInView="visible"
      viewport={{ once: true, margin: '-100px' }}
      className="section-container flex flex-col items-center py-20"
    >
      <motion.p
        initial={{ opacity: 0, filter: 'blur(4px)' }}
        whileInView={{ opacity: 1, filter: 'blur(0px)' }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.5 }}
        className="label-font-spaced uppercase text-gray-60 mb-4"
        dangerouslySetInnerHTML={{ __html: label }}
      />
      <motion.h2
        initial={{ opacity: 0, y: -10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="title-font text-gray-100 mb-4 text-center"
        dangerouslySetInnerHTML={{ __html: title }}
      />
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.7, delay: 0.1 }}
        className="body-font text-gray-60 mb-12 md:mb-16 text-center max-w-xl"
        dangerouslySetInnerHTML={{ __html: description }}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 w-full max-w-4xl mb-12">
        {tiles.map((tile, index) => (
          <motion.div variants={itemVariants} key={tile.title} className="flex gap-6">
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl">
                <ReactSVG
                  src={tile.icon.src}
                  beforeInjection={(svg) => {
                    svg.setAttribute(
                      'class',
                      'w-6 h-6 transition-colors duration-200 [&_path]:stroke-primary',
                    )
                  }}
                />
              </div>
              {index !== tiles.length - 1 && (
                <div className="h-18 w-0.5 bg-linear-to-b from-primary/20 to-transparent" />
              )}
            </div>
            <div className="flex flex-col gap-2 max-w-100">
              <p
                className="label-font text-primary"
                dangerouslySetInnerHTML={{ __html: '0' + (1 + index) }}
              />
              <p
                className="body-large font-semibold text-gray-100"
                dangerouslySetInnerHTML={{ __html: tile.title }}
              />
              <p
                className="body-medium text-gray-60"
                dangerouslySetInnerHTML={{ __html: tile.description }}
              />
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ type: 'spring', stiffness: 100, damping: 15, delay: 0.3 }}
      >
        <Button as="link" href={button.link} size="lg">
          {button.label}
        </Button>
      </motion.div>
    </motion.section>
  )
}
