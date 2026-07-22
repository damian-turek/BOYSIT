'use client'

import { useState } from 'react'

import { Button } from '@/components/atoms/Button'
import { Input, type InputProps } from '@/components/atoms/inputs/Input'

import EyeIcon from '@/assets/icons/eye.svg'

export type PasswordInputProps = Omit<InputProps, 'endAdornment'>

export const PasswordInput = ({ ...props }: PasswordInputProps) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)

  return (
    <Input
      {...props}
      type={isPasswordVisible ? 'text' : 'password'}
      endAdornment={
        <Button
          variant="text"
          aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
          aria-pressed={isPasswordVisible}
          icon={EyeIcon}
          iconOnly
          className="absolute right-0 top-1/2 -translate-1/2"
          onClick={() => setIsPasswordVisible((current) => !current)}
        />
      }
    />
  )
}
