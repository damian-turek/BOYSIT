'use client'

import { CalendarDays, Check, CreditCard, ReceiptText } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/atoms/Button'
import { ProfileSettingsCard } from '@/components/molecules/ProfileSettingsCard'

const planLabels = {
  free: 'plans.free',
  pro: 'plans.pro',
  admin: 'plans.admin',
} as const

type BillingSectionProps = {
  locale: string
  plan: 'free' | 'pro' | 'admin'
  proUntil: string | null | undefined
}

export const BillingSection = ({
  locale,
  plan,
  proUntil,
}: BillingSectionProps) => {
  const t = useTranslations('ProfileSettings.billing')
  const renewalDate = proUntil
    ? new Intl.DateTimeFormat(locale, {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(new Date(proUntil))
    : null

  return (
    <div className="space-y-5">
      <ProfileSettingsCard
        title={t('currentPlan.title')}
        description={t('currentPlan.description')}
      >
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <CreditCard size={19} aria-hidden="true" />
              </span>
              <div>
                <p className="body-large text-gray-100">{t(planLabels[plan])}</p>
                <p className="body-small text-gray-60">
                  {plan === 'free'
                    ? t('currentPlan.freeDescription')
                    : t('currentPlan.paidDescription')}
                </p>
              </div>
            </div>

            {renewalDate && (
              <p className="mt-4 flex items-center gap-2 body-small text-gray-60">
                <CalendarDays size={14} aria-hidden="true" />
                {t('currentPlan.proAccessUntil', { date: renewalDate })}
              </p>
            )}
          </div>

          <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-success-50/25 bg-success-50/10 px-3 py-1 body-small font-semibold text-success-100">
            <Check size={13} aria-hidden="true" />
            {t('currentPlan.active')}
          </span>
        </div>

        <div className="mt-6 border-t border-[var(--color-gray-10)] pt-5">
          {plan === 'free' ? (
            <Button
              as="link"
              href={`/${locale}#pricing-section`}
              size="lg"
              className="px-4 py-2"
            >
              {t('currentPlan.viewProPlans')}
            </Button>
          ) : (
            <Button
              type="button"
              disabled
              variant="secondary"
              className="border-[var(--color-gray-10)] bg-gray-05 px-4 py-2 text-gray-60 opacity-70 hover:border-[var(--color-gray-10)]"
            >
              {t('currentPlan.subscriptionManagementSoon')}
            </Button>
          )}
        </div>
      </ProfileSettingsCard>

      <ProfileSettingsCard
        title={t('history.title')}
        description={t('history.description')}
      >
        <div className="flex flex-col items-center py-8 text-center">
          <span className="mb-3 flex size-12 items-center justify-center rounded-xl bg-gray-05 text-gray-60">
            <ReceiptText size={21} aria-hidden="true" />
          </span>
          <p className="body-medium font-semibold text-gray-100">
            {t('history.emptyTitle')}
          </p>
          <p className="mt-1 max-w-sm body-small text-gray-60">
            {t('history.emptyDescription')}
          </p>
        </div>
      </ProfileSettingsCard>
    </div>
  )
}
