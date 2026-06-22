'use client'

import { StaticImageData } from 'next/image'

import { Variants, motion } from 'motion/react'
import { ReactSVG } from 'react-svg'

export type FeaturesProps = {
  label: string
  title: string
  description: string
  tiles: {
    icon: StaticImageData
    title: string
    description: string
    text: string
  }[]
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
}

export const Features = ({ label, tiles, description, title }: FeaturesProps) => {
  return (
    <section id="features-section" className="bg-background/30">
      <div className="section-container flex flex-col items-center">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.4 }}
          className="label-font-spaced uppercase text-gray-60 mb-4"
          dangerouslySetInnerHTML={{ __html: label }}
        />
        <motion.h2
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="title-font text-gray-100 mb-4 text-center"
          dangerouslySetInnerHTML={{ __html: title }}
        />
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="body-font text-gray-60 mb-12 md:mb-16 text-center max-w-xl"
          dangerouslySetInnerHTML={{ __html: description }}
        />

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
        >
          {tiles.map((tile) => (
            <motion.div
              key={tile.title}
              variants={itemVariants}
              whileHover={{
                y: -6,
                boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
              }}
              className="flex flex-col bg-background group p-6 md:p-8 bg-gray/8 border transition-colors ease-in-out duration-300 border-gray-60/30 hover:border-primary/60 rounded-xl max-w-384px cursor-pointer"
            >
              <div className="flex justify-center items-center bg-primary/10 ease-in-out transition duration-200 group-hover:bg-primary/20 w-12 h-12 rounded-xl mb-5">
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
              <p
                className="text-gray-100 body-font font-bold mb-2"
                dangerouslySetInnerHTML={{ __html: tile.title }}
              />
              <p
                className="text-gray-60 body-medium"
                dangerouslySetInnerHTML={{ __html: tile.description }}
              />
              <div className="w-full my-3 bg-gray-60/70 h-px" />
              <p
                className="text-gray-60 body-small"
                dangerouslySetInnerHTML={{ __html: tile.text }}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
