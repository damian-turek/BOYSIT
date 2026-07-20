'use client'

import { useState } from 'react'

import { Filter, X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'

import { Button } from '@/components/atoms/Button'

import { FiltersContent, FiltersContentProps } from './FiltersContent'

export const MobileFilters = ({ categories, technologies }: FiltersContentProps) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="md:hidden">
      <Button
        onClick={() => setIsOpen(true)}
        variant="secondary"
        icon={Filter}
        className="w-full justify-center"
      >
        Filters
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 z-50 backdrop-blur-xs"
            />

            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 h-full w-[300px] bg-white border-r border-gray-60/20 z-100 p-6 overflow-y-auto scrollbar-none"
            >
              <div className="flex justify-between items-center mb-6">
                <span className="font-bold text-gray-100 flex items-center gap-2">
                  <Filter size={18} /> Filters
                </span>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-60 hover:text-gray-100 p-1 hover:bg-gray-60/5 rounded-lg cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              <FiltersContent categories={categories} technologies={technologies} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
