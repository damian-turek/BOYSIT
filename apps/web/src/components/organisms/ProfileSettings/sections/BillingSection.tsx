'use client'

import { useEffect, useState } from 'react'

import { createPortalSession, getBillingStatus, getInvoices } from '@/services/billingApi'
import type { BillingStatus, Invoice } from '@/services/billingApi'
import { CalendarDays, Check, CreditCard, Download, Loader2, ReceiptText } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { useCheckoutStore } from '@/store/useCheckoutStore'

import { Button } from '@/components/atoms/Button'
import { ProfileSettingsCard } from '@/components/molecules/ProfileSettingsCard'
import { ProfileStatusMessage } from '@/components/molecules/ProfileStatusMessage'

const planLabels = {
  free: 'plans.free',
  pro: 'plans.pro',
  admin: 'plans.admin',
} as const

const statusLabels = {
  incomplete: 'currentPlan.status.incomplete',
  incomplete_expired: 'currentPlan.status.incompleteExpired',
  trialing: 'currentPlan.status.trialing',
  active: 'currentPlan.status.active',
  past_due: 'currentPlan.status.pastDue',
  canceled: 'currentPlan.status.canceled',
  unpaid: 'currentPlan.status.unpaid',
  paused: 'currentPlan.status.paused',
} as const

type BillingSectionProps = {
  locale: string
  plan: 'free' | 'pro' | 'admin'
  proUntil: string | null | undefined
}

export const BillingSection = ({ locale, plan, proUntil }: BillingSectionProps) => {
  const t = useTranslations('ProfileSettings.billing')
  const openCheckout = useCheckoutStore((state) => state.openCheckout)
  const [isOpeningPortal, setIsOpeningPortal] = useState(false)
  const [portalError, setPortalError] = useState<string | null>(null)

  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [billingStatus, setBillingStatus] = useState<BillingStatus | null>(null)
  const [isLoadingInvoices, setIsLoadingInvoices] = useState(true)

  useEffect(() => {
    let isMounted = true

    Promise.all([getInvoices(), getBillingStatus()])
      .then(([invoiceData, status]) => {
        if (isMounted) {
          setInvoices(invoiceData)
          setBillingStatus(status)
        }
      })
      .catch(() => {
        if (isMounted) setInvoices([])
      })
      .finally(() => {
        if (isMounted) setIsLoadingInvoices(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  const handleManageSubscription = async () => {
    setIsOpeningPortal(true)
    setPortalError(null)

    try {
      const { url } = await createPortalSession(`/${locale}/dashboard/profile`)
      window.location.href = url
    } catch {
      setPortalError(t('currentPlan.manageSubscriptionError'))
      setIsOpeningPortal(false)
    }
  }

  const subscription = billingStatus?.subscription
  const periodEnd = subscription?.currentPeriodEnd ?? proUntil
  const renewalDate = periodEnd
    ? new Intl.DateTimeFormat(locale, {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(new Date(periodEnd))
    : null

  const statusKey = subscription?.status
    ? statusLabels[subscription.status]
    : plan === 'free'
      ? 'currentPlan.status.free'
      : 'currentPlan.status.active'
  const isHealthy = !subscription || subscription.status === 'active'

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

            {renewalDate && subscription?.cancelAtPeriodEnd && (
              <p className="mt-4 flex items-center gap-2 body-small text-gray-60">
                <CalendarDays size={14} aria-hidden="true" />
                {t('currentPlan.cancelsOn', { date: renewalDate })}
              </p>
            )}
            {renewalDate &&
              subscription?.status === 'active' &&
              !subscription.cancelAtPeriodEnd && (
                <p className="mt-4 flex items-center gap-2 body-small text-gray-60">
                  <CalendarDays size={14} aria-hidden="true" />
                  {t('currentPlan.renewsOn', { date: renewalDate })}
                </p>
              )}
          </div>

          <span
            className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-3 py-1 body-small font-semibold ${
              isHealthy
                ? 'border-success-50/25 bg-success-50/10 text-success-100'
                : 'border-primary/25 bg-primary/10 text-primary'
            }`}
          >
            {isHealthy && <Check size={13} aria-hidden="true" />}
            {t(statusKey)}
          </span>
        </div>

        <div className="mt-6 border-t border-[var(--color-gray-10)] pt-5">
          {plan === 'free' && !billingStatus?.customerExists ? (
            <Button
              type="button"
              size="lg"
              className="px-4 py-2"
              onClick={() => openCheckout('pro_monthly', 'Pro')}
            >
              {t('currentPlan.viewProPlans')}
            </Button>
          ) : billingStatus?.customerExists ? (
            <Button
              type="button"
              size="lg"
              variant="secondary"
              disabled={isOpeningPortal}
              className="px-4 py-2"
              onClick={() => void handleManageSubscription()}
            >
              {isOpeningPortal ? (
                <>
                  <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                  {t('currentPlan.manageSubscription')}
                </>
              ) : (
                t('currentPlan.manageSubscription')
              )}
            </Button>
          ) : plan !== 'admin' ? (
            <Button
              type="button"
              size="lg"
              className="px-4 py-2"
              onClick={() => openCheckout('pro_monthly', 'Pro')}
            >
              {t('currentPlan.viewProPlans')}
            </Button>
          ) : null}

          {portalError && (
            <div className="mt-3">
              <ProfileStatusMessage tone="error" message={portalError} />
            </div>
          )}
        </div>
      </ProfileSettingsCard>

      <ProfileSettingsCard title={t('history.title')} description={t('history.description')}>
        {isLoadingInvoices ? (
          <div className="flex flex-col gap-2 py-2">
            {[0, 1, 2].map((key) => (
              <div key={key} className="h-12 w-full animate-pulse rounded-lg bg-gray-05" />
            ))}
          </div>
        ) : invoices.length ? (
          <div className="flex flex-col">
            {invoices.map((invoice) => (
              <div
                key={invoice.id}
                className="flex items-center justify-between gap-4 border-b border-[var(--color-gray-10)] last:border-none py-3.5"
              >
                <div>
                  <p className="body-small text-gray-100">
                    {new Intl.DateTimeFormat(locale, {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    }).format(new Date(invoice.created))}
                  </p>
                  <p className="body-small text-gray-60 capitalize">{invoice.status}</p>
                </div>
                <div className="flex items-center gap-4">
                  <p className="body-small font-semibold text-gray-100">
                    {new Intl.NumberFormat(locale, {
                      style: 'currency',
                      currency: invoice.currency.toUpperCase(),
                    }).format(invoice.amountPaid / 100)}
                  </p>
                  {invoice.hostedInvoiceUrl && (
                    <a
                      href={invoice.hostedInvoiceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex size-8 items-center justify-center rounded-lg text-gray-60 hover:bg-gray-05 hover:text-gray-100 transition-colors"
                      aria-label={t('history.viewInvoice')}
                    >
                      <Download size={15} aria-hidden="true" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center py-8 text-center">
            <span className="mb-3 flex size-12 items-center justify-center rounded-xl bg-gray-05 text-gray-60">
              <ReceiptText size={21} aria-hidden="true" />
            </span>
            <p className="body-medium font-semibold text-gray-100">{t('history.emptyTitle')}</p>
            <p className="mt-1 max-w-sm body-small text-gray-60">{t('history.emptyDescription')}</p>
          </div>
        )}
      </ProfileSettingsCard>
    </div>
  )
}
