'use client'

import { motion, Variants } from 'motion/react'
import { PricingCard, PricingCardProps } from '@/components/molecules/PricingCard'

export type PricingProps = {
  label: string
  title: string
  description: string
  tiles: PricingCardProps[]
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

export const Pricing = ({ label, tiles, description, title }: PricingProps) => {
  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      id="pricing-section"
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
        className="body-font text-gray-60 mb-12 text-center"
        dangerouslySetInnerHTML={{ __html: description }}
      />

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.7, delay: 0.1 }}
        className="flex flex-col md:flex-row items-center md:items-start gap-6"
      >
        {tiles.map((tile) => (
          <PricingCard key={tile.name} {...tile} />
        ))}
      </motion.div>
    </motion.section>
  )
}
