'use client'

import { InputHTMLAttributes, useId } from 'react'

import { cn } from '@/utils/cn'

type SwitchProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label: string
}

export const Switch = ({
  label,
  className,
  id,
  checked,
  onChange,
  disabled,
  ...props
}: SwitchProps) => {
  const generatedId = useId()
  const switchId = id ?? generatedId

  return (
    <label
      htmlFor={switchId}
      className={cn(
        'relative inline-flex h-6 w-10 shrink-0 cursor-pointer items-center',
        disabled && 'cursor-not-allowed opacity-60',
        className,
      )}
    >
      <span className="sr-only">{label}</span>
      <input
        id={switchId}
        type="checkbox"
        className="peer sr-only"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        {...props}
      />
      <span className="block h-6 w-10 rounded-full bg-gray-10 transition-colors peer-checked:bg-primary peer-focus-visible:ring-2 peer-focus-visible:ring-primary/40" />
      <span className="absolute top-1 left-1 size-4 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-4" />
    </label>
  )
}
