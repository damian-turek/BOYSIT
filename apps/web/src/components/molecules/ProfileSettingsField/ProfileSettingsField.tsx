import { ComponentType, InputHTMLAttributes } from 'react'

import { LucideProps } from 'lucide-react'

import { Input } from '@/components/atoms/inputs/Input'

type ProfileSettingsFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  icon: ComponentType<LucideProps>
  hint?: string
}

export const ProfileSettingsField = ({
  label,
  icon: Icon,
  hint,
  className,
  ...props
}: ProfileSettingsFieldProps) => {
  return (
    <Input
      label={label}
      labelClassName="label-font-spaced font-semibold uppercase"
      leftIcon={Icon}
      hint={hint}
      className={className}
      {...props}
    />
  )
}
