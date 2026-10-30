'use client'

import { Database } from 'lucide-react'
import { motion } from 'motion/react'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/atoms/Button'
import { Tag } from '@/components/atoms/Tag'

export type QuestionsBankCardProps = {
  name: string
  description: string
  text: string
  badge?: string
  button: {
    label: string
    link: string
  }
  tags: string[]
}

export const QuestionsBankCard = ({
  name,
  button,
  tags,
  badge,
  description,
  text,
}: QuestionsBankCardProps) => {
  const t = useTranslations('QuestionsBank')
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="surface-card flex flex-col p-5"
    >
      <div className="flex justify-between items-start">
        <div className="flex gap-3 items-center">
          <Button
            className="bg-primary/20 text-primary hover:bg-primary/20 cursor-auto [&_svg]:size-6"
            size="lg"
            iconOnly
            icon={Database}
          />
          <div>
            <h3 className="body-large text-gray-100">{name}</h3>
            <p className="body-small text-gray-60">{description}</p>
          </div>
        </div>
        {badge && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 20, delay: 0.2 }}
          >
            <Tag text={badge} />
          </motion.div>
        )}
      </div>
      <p className="body-medium my-4 text-gray-60 leading-5">{text}</p>
      <Button size="lg" as="link" href={button.link}>
        {button.label}
      </Button>
      <div className="flex items-end gap-1.5 flex-wrap mt-5">
        <span className="label-font text-gray-60">{t('shortcut')}:</span>
        {tags.map((tag, index) => (
          <motion.div
            key={tag}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2, delay: 0.1 + index * 0.04 }}
          >
            <Tag text={tag} className="bg-gray-60/5 border-gray-60/30 text-gray-100/70" />
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
