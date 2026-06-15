'use client'

import Link from 'next/link'

import { ArrowRight, BookOpen, Briefcase, ClipboardCheck, Code, Terminal } from 'lucide-react'
import { motion } from 'motion/react'

import { Tag } from '@/components/atoms/Tag'

const iconMap = {
  Briefcase,
  ClipboardCheck,
  Terminal,
  BookOpen,
} as const

export type PracticeToolsProps = {
  name: string
  tools: {
    name: string
    description: string
    label: string
    badge?: string
    theme: string
    icon: string
    link: string
  }[]
}

const MotionLink = motion.create(Link)

export const PracticeTools = ({ name, tools }: PracticeToolsProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="flex flex-col border border-gray-60/40 bg-gray-60/5 rounded-xl overflow-hidden"
    >
      <h3 className="body-large mb-3 text-gray-100 px-5 pt-5">{name}</h3>
      {tools.map((tool, index) => {
        const IconComponent = iconMap[tool.icon as keyof typeof iconMap] || Code
        return (
          <MotionLink
            key={tool.name}
            href={tool.link}
            initial="initial"
            whileHover="hover"
            whileTap={{ scale: 0.995 }}
            variants={{
              initial: { opacity: 0, y: 12 },
              animate: { opacity: 1, y: 0 },
            }}
            animate="animate"
            transition={{ duration: 0.35, delay: index * 0.05, ease: 'easeOut' }}
            className="border-b gap-4 group flex justify-between items-center border-gray-60/40 last:border-none p-5 transition-colors ease-in-out duration-150 hover:bg-gray-60/5"
          >
            <motion.div
              variants={{
                hover: { x: 4 },
              }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
              style={{
                backgroundColor: `${tool.theme}15`,
                color: tool.theme,
              }}
            >
              <IconComponent size={18} />
            </motion.div>

            <div className="w-full">
              <div className="flex items-center gap-2">
                <p className="body-medium text-gray-100">{tool.name}</p>
                {tool.badge && (
                  <Tag
                    text={tool.badge}
                    className="rounded-sm px-2 py-1"
                    style={{
                      backgroundColor: `${tool.theme}15`,
                      borderColor: `${tool.theme}30`,
                      color: tool.theme,
                    }}
                  />
                )}
              </div>
              <p className="body-small text-gray-60">{tool.description}</p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <p
                className="label-font whitespace-nowrap"
                style={{
                  color: tool.theme,
                }}
              >
                {tool.label}
              </p>
              <motion.div
                variants={{
                  hover: { x: 4 },
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              >
                <ArrowRight size={15} style={{ color: tool.theme }} />
              </motion.div>
            </div>
          </MotionLink>
        )
      })}
    </motion.div>
  )
}
