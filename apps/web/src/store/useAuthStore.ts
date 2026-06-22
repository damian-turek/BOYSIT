import { create } from 'zustand'

type AuthView = 'login' | 'register'

type AuthStore = {
  isOpen: boolean
  view: AuthView
  openModal: (view?: AuthView) => void
  closeModal: () => void
  setView: (view: AuthView) => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  isOpen: false,
  view: 'login',
  openModal: (view = 'login') => set({ isOpen: true, view }),
  closeModal: () => set({ isOpen: false }),
  setView: (view) => set({ view }),
}))
