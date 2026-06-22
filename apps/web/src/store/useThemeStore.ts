import { create } from 'zustand'

type ThemeStore = {
  isDark: boolean
  initializeTheme: () => void
  toggleTheme: () => void
}

export const useThemeStore = create<ThemeStore>((set, get) => ({
  isDark: false,

  initializeTheme: () => {
    const savedTheme = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

    const dark = savedTheme === 'dark' || (!savedTheme && prefersDark)

    document.documentElement.classList.toggle('dark', dark)

    set({ isDark: dark })
  },

  toggleTheme: () => {
    const dark = !get().isDark

    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('theme', dark ? 'dark' : 'light')

    set({ isDark: dark })
  },
}))
