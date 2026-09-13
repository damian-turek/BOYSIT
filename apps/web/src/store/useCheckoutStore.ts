import { create } from 'zustand'

interface CheckoutStore {
  isOpen: boolean
  planId: string | null
  planLabel: string | null
  openCheckout: (planId: string, planLabel: string) => void
  closeCheckout: () => void
}

export const useCheckoutStore = create<CheckoutStore>((set) => ({
  isOpen: false,
  planId: null,
  planLabel: null,
  openCheckout: (planId, planLabel) => set({ isOpen: true, planId, planLabel }),
  closeCheckout: () => set({ isOpen: false }),
}))
