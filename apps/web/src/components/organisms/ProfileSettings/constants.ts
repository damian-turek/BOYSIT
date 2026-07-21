import { CreditCard, Shield, User } from 'lucide-react'

import { ProfileSectionId } from './types'

export const notificationOptions = [
  {
    id: 'weekly-progress',
    labelKey: 'notifications.weeklyProgress.label',
    descriptionKey: 'notifications.weeklyProgress.description',
  },
  {
    id: 'new-questions',
    labelKey: 'notifications.newQuestions.label',
    descriptionKey: 'notifications.newQuestions.description',
  },
  {
    id: 'community-updates',
    labelKey: 'notifications.communityUpdates.label',
    descriptionKey: 'notifications.communityUpdates.description',
  },
] as const

export const profileSettingsSections = [
  { id: 'profile', labelKey: 'tabs.profile', icon: User },
  { id: 'security', labelKey: 'tabs.security', icon: Shield },
  { id: 'billing', labelKey: 'tabs.billing', icon: CreditCard },
] satisfies {
  id: ProfileSectionId
  labelKey: string
  icon: typeof User
}[]
