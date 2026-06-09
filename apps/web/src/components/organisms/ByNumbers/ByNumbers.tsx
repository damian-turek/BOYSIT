'use client'

import { Variants, motion } from 'motion/react'

export type ByNumbersProps = {
  label: string
  title: string
  tiles: {
    number: string
    title: string
    description: string
  }[]
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1, // Kolejne kafelki pojawiają się z opóźnieniem 100ms
    },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9, y: 30 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 80,
      damping: 14,
    },
  },
}

export const ByNumbers = ({ label, tiles, title }: ByNumbersProps) => {
  return (
    <section className="bg-background">
      <motion.section
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        className="section-container flex flex-col items-center"
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
          className="title-font text-gray-100 mb-12 text-center"
          dangerouslySetInnerHTML={{ __html: title }}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 w-full">
          {tiles.map((tile) => (
            <motion.div
              key={tile.title}
              variants={itemVariants}
              whileHover={{
                y: -8,
                scale: 1.02,
                boxShadow: '0 20px 30px -10px rgba(37, 99, 235, 0.15)',
              }}
              className="p-6 md:p-8 flex flex-col items-center border border-primary/20 dark:border-primary/30 hover:border-primary bg-primary/5 rounded-2xl transition-colors duration-300"
            >
              <motion.p
                initial={{ scale: 0.5, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 120 }}
                className="label-font text-[36px]! md:text-[48px]! font-bold leading-9! md:leading-12 mb-2 text-primary select-none"
                dangerouslySetInnerHTML={{ __html: tile.number }}
              />
              <p
                className="body-large text-gray-100 mb-1 font-semibold text-center"
                dangerouslySetInnerHTML={{ __html: tile.title }}
              />
              <p
                className="body-medium text-gray-60 text-center max-w-50"
                dangerouslySetInnerHTML={{ __html: tile.description }}
              />
            </motion.div>
          ))}
        </div>
      </motion.section>
    </section>
  )
}
