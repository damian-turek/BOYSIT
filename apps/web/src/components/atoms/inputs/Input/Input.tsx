import { type ComponentType, type InputHTMLAttributes, type ReactNode, useId } from 'react'

import type { LucideProps } from 'lucide-react'

import { cn } from '@/utils/cn'

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  error?: string
  hint?: string
  className?: string
  labelClassName?: string
  leftIcon?: ComponentType<LucideProps>
  endAdornment?: ReactNode
}

export const Input = ({
  className,
  id,
  label,
  error,
  hint,
  labelClassName,
  leftIcon: LeftIcon,
  endAdornment,
  ...props
}: InputProps) => {
  const generatedId = useId()
  const inputId = id ?? generatedId

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label
          htmlFor={inputId}
          className={cn('label-font text-gray-60 select-none', labelClassName)}
        >
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
          id={inputId}
          className={cn(
            'field-control w-full h-11 px-4 body-medium',
            LeftIcon ? 'pl-10' : '',
            endAdornment ? 'pr-11' : '',
            error && 'border-alert-50 focus-visible:border-alert-50 focus-visible:outline-alert-50',
            className,
          )}
          {...props}
        />

        {endAdornment}
      </div>

      {error && <p className="body-small text-alert-50">{error}</p>}
      {!error && hint && <p className="body-small text-gray-60">{hint}</p>}
    </div>
  )
}
