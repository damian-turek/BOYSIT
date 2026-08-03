import { ComponentType, InputHTMLAttributes } from 'react'

import { LucideProps } from 'lucide-react'

import { Input } from '@/components/atoms/inputs/Input'
import { PasswordInput } from '@/components/molecules/PasswordInput'

type ProfileSettingsFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  icon: ComponentType<LucideProps>
  error?: string
  hint?: string
}

export const ProfileSettingsField = ({
  label,
  icon: Icon,
  error,
  hint,
  className,
  ...props
}: ProfileSettingsFieldProps) => {
  const inputProps = {
    label,
    labelClassName: 'label-font-spaced font-semibold uppercase',
    leftIcon: Icon,
    error,
    hint,
    className,
  }

  if (props.type === 'password') {
    return <PasswordInput {...inputProps} {...props} />
  }

  return <Input {...inputProps} {...props} />
}
