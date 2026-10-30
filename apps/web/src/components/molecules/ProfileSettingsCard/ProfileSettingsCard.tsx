import { ReactNode } from 'react'

type ProfileSettingsCardProps = {
  title: string
  description?: string
  children: ReactNode
}

export const ProfileSettingsCard = ({ title, description, children }: ProfileSettingsCardProps) => {
  return (
    <section className="surface-card p-5 sm:p-6">
      <div className="mb-5 border-b border-[var(--color-gray-10)] pb-4">
        <h2 className="body-large text-gray-100">{title}</h2>
        {description && <p className="mt-1 body-small text-gray-60">{description}</p>}
      </div>
      {children}
    </section>
  )
}
