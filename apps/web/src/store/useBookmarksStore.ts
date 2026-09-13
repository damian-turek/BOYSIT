import { Question } from '@/types/question'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { toggleBookmarkOnServer } from '@/services/libraryApi'

interface LibraryItem {
  id: string
  tabId: string
  title: string
  category: string
  level: string
  levelColor: string
  timestamp: number
  link: string
}

interface BookmarksState {
  savedIds: string[]
  savedItems: LibraryItem[]
  lastSeenItems: LibraryItem[]
  toggleBookmark: (question: Question) => void
  addToLastSeen: (question: Question) => void
}

const getLevelColor = (level: string): string => {
  const fallbackColors: Record<string, string> = {
    Junior: '#00BC7D',
    Middle: '#FE9A00',
    Regular: '#FE9A00',
    Senior: '#FF2056',
  }
  return fallbackColors[level] || '#FE9A00'
}

export const useBookmarksStore = create<BookmarksState>()(
  persist(
    (set, get) => ({
      savedIds: [],
      savedItems: [],
      lastSeenItems: [],

      toggleBookmark: (question) => {
        const qId = question.index.toString()
        const { savedIds, savedItems } = get()
        const isAlreadySaved = savedIds.includes(qId)

        if (isAlreadySaved) {
          set({
            savedIds: savedIds.filter((id) => id !== qId),
            savedItems: savedItems.filter((item) => item.id !== qId),
          })
        } else {
          const newItem: LibraryItem = {
            id: qId,
            tabId: 'saved',
            title: question.question,
            category: question.category?.name || 'General',
            level: question.level,
            levelColor: getLevelColor(question.level),
            timestamp: Date.now(),
            link: `/dashboard/questions`,
          }
          set({
            savedIds: [...savedIds, qId],
            savedItems: [newItem, ...savedItems],
          })
        }

        // Persist to the backend (Bookmark table) so "My Library" on the
        // dashboard and other devices see the same saved questions. This is
        // fire-and-forget for a snappy UI; a failure just means the toggle
        // didn't survive server-side, which is logged for now.
        toggleBookmarkOnServer(qId).catch((error) => {
          console.error('Failed to sync bookmark with the server', error)
        })
      },

      addToLastSeen: (question) => {
        const qId = question.index.toString()
        const { lastSeenItems } = get()

        const filtered = lastSeenItems.filter((item) => item.id !== qId)

        const newItem: LibraryItem = {
          id: qId,
          tabId: 'last-seen',
          title: question.question,
          category: question.category?.name || 'General',
          level: question.level,
          levelColor: getLevelColor(question.level),
          timestamp: Date.now(), // Dokładny czas kliknięcia
          link: `/dashboard/questions/${question.index}`,
        }

        const updatedList = [newItem, ...filtered].slice(0, 4)

        set({ lastSeenItems: updatedList })
      },
    }),
    {
      name: 'prepcode-bookmarks',
      skipHydration: true,
    },
  ),
)
