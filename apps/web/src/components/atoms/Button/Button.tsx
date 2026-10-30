import type { ComponentPropsWithoutRef, ComponentType } from 'react'

import Image, { type StaticImageData } from 'next/image'
import Link from 'next/link'

import { type VariantProps, cva } from 'class-variance-authority'
import type { LucideProps } from 'lucide-react'

import { cn } from '@/utils/cn'

const buttonVariants = cva(
  'w-fit min-h-10 inline-flex gap-2 items-center justify-center rounded-xl transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:pointer-events-none disabled:opacity-50 cursor-pointer motion-reduce:transition-none',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-on-primary hover:bg-primary/90',
        secondary:
          'border border-gray-10 bg-surface-raised text-gray-100 hover:border-border-strong hover:bg-surface-hover',
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
  icon?: string | StaticImageData | ComponentType<LucideProps>
  iconOnly?: boolean
} & (T extends 'link' ? ComponentPropsWithoutRef<typeof Link> : ComponentPropsWithoutRef<'button'>)
export const Button = <T extends ButtonAsElement = 'button'>({
  as,
  className,
  variant,
  size,
  children,
  icon: Icon,
  iconOnly,
  type,
  ...props
}: ButtonProps<T>) => {
  const componentProps = {
    className: cn(buttonVariants({ variant, size, className, iconOnly }), className),
    'data-slot': 'button',
  }

  const isStaticImage = Icon && typeof Icon === 'object' && 'src' in Icon
  const isStringImage = typeof Icon === 'string'

  const content = (
    <>
      {Icon &&
        (isStringImage || isStaticImage ? (
          <Image
            src={Icon as string | StaticImageData}
            alt=""
            width={16}
            height={16}
            className={cn(variant === 'primary' && !iconOnly ? 'invert' : '')}
          />
        ) : (
          <Icon size={16} aria-hidden="true" />
        ))}
      {children}
    </>
  )

  if (as === 'link') {
    return (
      <Link {...(props as ComponentPropsWithoutRef<typeof Link>)} {...componentProps}>
        {content}
      </Link>
    )
  }

  return (
    <button
      {...(props as ComponentPropsWithoutRef<'button'>)}
      {...componentProps}
      type={(type as ComponentPropsWithoutRef<'button'>['type']) || 'button'}
    >
      {content}
    </button>
  )
}
