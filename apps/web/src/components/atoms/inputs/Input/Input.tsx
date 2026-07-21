'use client'

import * as React from 'react'
import { ComponentType } from 'react'
import { useState } from 'react'

import { LucideProps } from 'lucide-react'

import { cn } from '@/utils/cn'

import { Button } from '@/components/atoms/Button'

import EyeIcon from '@/assets/icons/eye.svg'

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  error?: string
  hint?: string
  className?: string
  labelClassName?: string
  leftIcon?: ComponentType<LucideProps>
}

export const Input = ({
  className,
  label,
  error,
  hint,
  type,
  labelClassName,
  leftIcon: LeftIcon,
  ...props
}: InputProps) => {
  const [showPassword, setShowPassword] = useState(false)
  const isPasswordType = type === 'password'

  const currentType = isPasswordType ? (showPassword ? 'text' : 'password') : type

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev)
  }

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label className={cn('label-font text-gray-60 select-none', labelClassName)}>
          {label}
        </label>
      )}

      <div className="relative w-full flex items-center">
        {LeftIcon && (
          <LeftIcon
            size={16}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-60"
            aria-hidden="true"
          />
        )}
        <input
          type={currentType}
          className={cn(
            'w-full h-11 px-4 rounded-xl transition-colors duration-200',
            'bg-gray-65/5 dark:bg-gray-10/20',
            'text-gray-100 placeholder:body-medium placeholder:text-gray-60/50',
            'border focus:outline-hidden',
            LeftIcon ? 'pl-10' : '',
            isPasswordType ? 'pr-11' : '',
            error
              ? 'border-alert-50 focus:border-alert-50'
              : 'border-gray-60/20 focus:border-primary/60',
            className,
          )}
          {...props}
        />

        {isPasswordType && (
          <Button
            onClick={togglePasswordVisibility}
            variant="text"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            icon={EyeIcon}
            iconOnly
            className="absolute right-0 transform -translate-1/2 top-1/2"
          />
        )}
      </div>

      {error && <p className="body-small text-alert-50">{error}</p>}
      {!error && hint && <p className="body-small text-gray-60">{hint}</p>}
    </div>
  )
}
