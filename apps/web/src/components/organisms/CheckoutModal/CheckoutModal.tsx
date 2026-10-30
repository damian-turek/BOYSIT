'use client'

import { useEffect, useId, useState } from 'react'

import { usePathname } from 'next/navigation'

import { createCheckoutSession } from '@/services/billingApi'
import { CreditCard, Loader2, ShieldCheck, X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'

import { useAuthSessionStore } from '@/store/useAuthSessionStore'
import { useAuthStore } from '@/store/useAuthStore'
import { useCheckoutStore } from '@/store/useCheckoutStore'

import { Button } from '@/components/atoms/Button'
import { ProfileStatusMessage } from '@/components/molecules/ProfileStatusMessage'

export const CheckoutModal = () => {
  const pathname = usePathname()
  const { isOpen, planId, planLabel, closeCheckout } = useCheckoutStore()
  const openAuthModal = useAuthStore((state) => state.openModal)
  const session = useAuthSessionStore((state) => state.session)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const titleId = useId()
  const descriptionId = useId()

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) {
      setError(null)
      setIsSubmitting(false)
    }
  }, [isOpen])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isSubmitting) closeCheckout()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [closeCheckout, isSubmitting])

  const handleContinue = async () => {
    if (!planId) return

    // Not signed in yet - send them through sign up first, then they can
    // come back to Pricing and check out once they have an account.
    if (!session) {
      closeCheckout()
      openAuthModal('register')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const { url } = await createCheckoutSession(planId, pathname)

      if (!url) {
        throw new Error('Stripe did not return a checkout URL')
      }

      window.location.href = url
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong while starting checkout')
      setIsSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-overlay backdrop-blur-xs"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={isSubmitting ? undefined : closeCheckout}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4">
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ duration: 0.18 }}
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              aria-describedby={descriptionId}
              className="surface-dialog my-auto w-full max-w-md p-6"
            >
              <div className="mb-5 flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <CreditCard size={20} aria-hidden="true" />
                  </span>
                  <div>
                    <h2 id={titleId} className="body-large text-gray-100">
                      Upgrade to {planLabel ?? 'Pro'}
                    </h2>
                    <p id={descriptionId} className="body-small text-gray-60">
                      Continue to Stripe Checkout to complete your subscription.
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="text"
                  icon={X}
                  iconOnly
                  disabled={isSubmitting}
                  aria-label="Close"
                  onClick={closeCheckout}
                />
              </div>

              {!session && (
                <p className="surface-inset mb-4 p-3 body-small text-gray-60">
                  You&apos;ll need an account first - we&apos;ll open sign up for you.
                </p>
              )}

              {error && (
                <div className="mb-4">
                  <ProfileStatusMessage tone="error" message={error} />
                </div>
              )}

              <div className="mb-5 flex items-center gap-2 body-small text-gray-60">
                <ShieldCheck size={15} className="text-primary" aria-hidden="true" />
                Secure payment powered by Stripe. Cancel anytime.
              </div>

              <Button
                size="lg"
                className="w-full"
                disabled={isSubmitting}
                onClick={() => void handleContinue()}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                    Redirecting to Stripe...
                  </>
                ) : session ? (
                  'Continue to payment →'
                ) : (
                  'Create account to continue →'
                )}
              </Button>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
