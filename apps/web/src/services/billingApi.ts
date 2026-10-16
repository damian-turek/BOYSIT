import { requestAuthenticatedApi } from '@/services/apiClient'

type CheckoutSessionResponse = {
  url: string | null
  id: string
}

type PortalSessionResponse = {
  url: string
}

export type Invoice = {
  id: string
  number: string | null
  amountPaid: number
  currency: string
  status: string | null
  created: string
  hostedInvoiceUrl: string | null
  invoicePdf: string | null
}

export type BillingStatus = {
  customerExists: boolean
  subscription: {
    status:
      | 'incomplete'
      | 'incomplete_expired'
      | 'trialing'
      | 'active'
      | 'past_due'
      | 'canceled'
      | 'unpaid'
      | 'paused'
    currentPeriodEnd: string | null
    cancelAtPeriodEnd: boolean
  } | null
}

export const createCheckoutSession = async (
  planId: string,
  returnPath: string,
): Promise<CheckoutSessionResponse> => {
  const response = await requestAuthenticatedApi('/api/v1/stripe/checkout-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ planId, returnPath }),
  })

  return (await response.json()) as CheckoutSessionResponse
}

export const createPortalSession = async (returnPath: string): Promise<PortalSessionResponse> => {
  const response = await requestAuthenticatedApi('/api/v1/stripe/portal-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ returnPath }),
  })

  return (await response.json()) as PortalSessionResponse
}

export const getBillingStatus = async (): Promise<BillingStatus> => {
  const response = await requestAuthenticatedApi('/api/v1/stripe/subscription')
  return (await response.json()) as BillingStatus
}

export const getInvoices = async (): Promise<Invoice[]> => {
  const response = await requestAuthenticatedApi('/api/v1/stripe/invoices')
  const body = (await response.json()) as { invoices: Invoice[] }
  return body.invoices
}
