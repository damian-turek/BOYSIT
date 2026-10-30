'use client'

import { BookOpen, Code, Database, Layers, Users } from 'lucide-react'
import { motion } from 'motion/react'

const iconMap = {
  BookOpen,
  Layers,
  Database,
  Users,
} as const

export type PlatformStatsProps = {
  name: string
  tiles: {
    icon: string
    name: string
    text: string
  }[]
}

export const PlatformStats = ({ name, tiles }: PlatformStatsProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="surface-card flex flex-col p-5"
    >
      <div className="flex gap-3 items-center mb-4">
        <Users size={16} className="text-primary" />
        <h3 className="body-large text-gray-100">{name}</h3>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {tiles.map((tile) => {
          const IconComponent = iconMap[tile.icon as keyof typeof iconMap] || Code
          return (
            <div className="surface-inset p-3 flex flex-col items-center" key={tile.name}>
              <IconComponent size={14} className="text-primary mb-0.75" />
              <p className="body-medium font-mono text-gray-100 tabular-nums">{tile.name}</p>
              <p className="body-small text-gray-60">{tile.text}</p>
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}
