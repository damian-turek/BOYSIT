'use client'

import { useEffect, useId, useState } from 'react'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import { getBillingStatus } from '@/services/billingApi'
import { CheckCircle2, Loader2, X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/atoms/Button'

type ConfirmationState = 'checking' | 'processing' | 'confirmed' | 'pending' | 'failed'

const BILLING_STATUS_RETRY_DELAY_MS = 2_000
const MAX_BILLING_STATUS_CHECKS = 30
const unsuccessfulSubscriptionStatuses = new Set([
  'canceled',
  'incomplete_expired',
  'past_due',
  'unpaid',
])

export const CheckoutConfirmationModal = () => {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const t = useTranslations('CheckoutConfirmation')
  const titleId = useId()
  const descriptionId = useId()
  const isCheckoutReturn = searchParams.get('checkout') === 'success'
  const [state, setState] = useState<ConfirmationState>('checking')
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    if (!isCheckoutReturn) return

    let isCurrent = true
    let retryTimeout: number | undefined
    let checks = 0

    const refreshBillingStatus = async () => {
      checks += 1
      try {
        const billingStatus = await getBillingStatus()
        if (!isCurrent) return

        if (billingStatus.subscription?.status === 'active') {
          setState('confirmed')
          return
        }
        if (
          billingStatus.subscription?.status &&
          unsuccessfulSubscriptionStatuses.has(billingStatus.subscription.status)
        ) {
          setState('failed')
          return
        }
      } catch {
        // The return redirect is not proof of entitlement. Retry while a webhook or auth refresh is pending.
      }

      if (!isCurrent) return
      if (checks >= MAX_BILLING_STATUS_CHECKS) {
        setState('pending')
        return
      }
      setState('processing')
      retryTimeout = window.setTimeout(refreshBillingStatus, BILLING_STATUS_RETRY_DELAY_MS)
    }

    setState('checking')
    void refreshBillingStatus()

    return () => {
      isCurrent = false
      if (retryTimeout) window.clearTimeout(retryTimeout)
    }
  }, [isCheckoutReturn, retryCount])

  useEffect(() => {
    if (!isCheckoutReturn) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [isCheckoutReturn])

  const closeModal = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('checkout')
    const query = params.toString()
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }

  const isConfirmed = state === 'confirmed'
  const isChecking = state === 'checking'
  const isPending = state === 'pending'
  const isFailed = state === 'failed'

  return (
    <AnimatePresence>
      {isCheckoutReturn && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
          />
          <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              aria-describedby={descriptionId}
              aria-busy={!isConfirmed}
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="pointer-events-auto w-full max-w-md rounded-xl border border-[var(--color-gray-10)] bg-white p-6 shadow-2xl dark:bg-[var(--color-gray-05)]"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-start gap-3">
                  <span
                    className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${
                      isConfirmed
                        ? 'bg-success-50/10 text-success-100'
                        : 'bg-primary/10 text-primary'
                    }`}
                  >
                    {isConfirmed ? (
                      <CheckCircle2 size={22} aria-hidden="true" />
                    ) : (
                      <Loader2 size={21} className="animate-spin" aria-hidden="true" />
                    )}
                  </span>
                  <div className="min-w-0">
                    <h2 id={titleId} className="body-large text-gray-100">
                      {isConfirmed
                        ? t('successTitle')
                        : isFailed
                          ? t('failedTitle')
                          : isPending
                            ? t('pendingTitle')
                            : t('processingTitle')}
                    </h2>
                    <p
                      id={descriptionId}
                      className="mt-1 body-small text-gray-60"
                      aria-live="polite"
                    >
                      {isConfirmed
                        ? t('successDescription')
                        : isFailed
                          ? t('failedDescription')
                          : isPending
                            ? t('pendingDescription')
                            : isChecking
                              ? t('checkingDescription')
                              : t('processingDescription')}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="text"
                  icon={X}
                  iconOnly
                  aria-label={t('close')}
                  onClick={closeModal}
                />
              </div>

              <div className="mt-6 flex justify-end">
                <Button
                  type="button"
                  onClick={() => {
                    if (isPending || isFailed) {
                      setState('checking')
                      setRetryCount((count) => count + 1)
                    } else {
                      closeModal()
                    }
                  }}
                >
                  {isPending || isFailed
                    ? t('retryButton')
                    : isConfirmed
                      ? t('successButton')
                      : t('processingButton')}
                </Button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
