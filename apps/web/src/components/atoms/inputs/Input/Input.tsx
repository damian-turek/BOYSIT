import { type InputHTMLAttributes, type ReactNode, useId } from 'react'

import { cn } from '@/utils/cn'

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  error?: string
  className?: string
  endAdornment?: ReactNode
}

export const Input = ({ className, id, label, error, endAdornment, ...props }: InputProps) => {
  const generatedId = useId()
  const inputId = id ?? generatedId

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={inputId} className="label-font text-gray-60 select-none">
          {label}
        </label>
      )}

      <div className="relative w-full flex items-center">
        <input
          id={inputId}
          className={cn(
            'w-full h-11 px-4 rounded-xl transition-colors duration-200',
            'bg-gray-65/5 dark:bg-gray-10/20',
            'text-gray-100 placeholder:body-medium placeholder:text-gray-60/50',
            'border focus:outline-hidden',
            endAdornment ? 'pr-11' : '',
            error
              ? 'border-alert-50 focus:border-alert-50'
              : 'border-gray-60/20 focus:border-primary/60',
            className,
          )}
          {...props}
        />

        {endAdornment}
      </div>

      {error && <p className="body-small text-alert-50">{error}</p>}
    </div>
  )
}
