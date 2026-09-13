import { requestAuthenticatedApi } from '@/services/apiClient'

type CheckoutSessionResponse = {
  url: string | null
  id: string
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
