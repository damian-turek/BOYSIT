import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utils/cn'
import { ComponentPropsWithoutRef, ElementType } from 'react'
import Image, { type StaticImageData } from 'next/image'
import Link from 'next/link'

const buttonVariants = cva(
  'w-fit inline-flex items-center justify-center rounded-xl transition-colors focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50 cursor-pointer',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-white hover:bg-primary/90',
        secondary:
          'border border-gray-100/20 bg-transparent text-gray-100 hover:border-gray-100/40',
        text: 'bg-transparent text-gray-60 hover:text-primary/90',
      },
      size: {
        md: 'py-1.5 px-3 body-medium!',
        lg: 'py-[14px] px-8 button-font',
      },
      iconOnly: {
        true: '',
        false: '',
      },
    },
    compoundVariants: [
      { size: 'md', iconOnly: true, class: 'px-1.5 rounded-[12px]!' },
      { size: 'lg', iconOnly: true, class: 'px-[14px]' },
      { size: 'lg', iconOnly: false, variant: 'primary', class: 'shadow-lg shadow-primary/50' },
    ],
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      iconOnly: false,
    },
  },
)

export type ButtonAsElement = 'button' | 'link'

export type ButtonProps<T extends ButtonAsElement = 'button'> = VariantProps<
  typeof buttonVariants
> & {
  as?: T
  className?: string
  icon?: string | StaticImageData
  iconOnly?: boolean
} & (T extends 'link' ? ComponentPropsWithoutRef<typeof Link> : ComponentPropsWithoutRef<'button'>)

export const Button = <T extends ButtonAsElement = 'button'>({
  as,
  className,
  variant,
  size,
  children,
  icon,
  iconOnly,
  type,
  ...props
}: ButtonProps<T>) => {
  const Component = as === 'link' ? Link : 'button'

  const componentProps = {
    className: cn(buttonVariants({ variant, size, className, iconOnly }), className),
    'data-slot': 'button',
    ...(as !== 'link' ? { type: type || 'button' } : {}),
    ...props,
  } as any

  return (
    <Component {...componentProps}>
      {icon && (
        <Image
          src={icon}
          alt="button icon"
          width={16}
          height={16}
          className={cn(variant === 'primary' && !iconOnly ? 'invert' : '')}
        />
      )}
      {children}
    </Component>
  )
}
