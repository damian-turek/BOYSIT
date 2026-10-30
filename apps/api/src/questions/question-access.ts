import type { QuestionWhereInput, UserPlan } from 'database'

export const hasFullQuestionAccess = (plan: UserPlan): boolean => plan === 'pro' || plan === 'admin'

export const getVisibleQuestionWhere = (plan: UserPlan): QuestionWhereInput => ({
  isActive: true,
  ...(hasFullQuestionAccess(plan) ? {} : { accessLevel: 'free' }),
})
