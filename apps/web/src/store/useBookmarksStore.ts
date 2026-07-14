import { Question } from '@/types/question'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface LibraryItem {
  id: string
  tabId: string
  title: string
  category: string
  level: string
  levelColor: string
  timeAgo: string
  link: string
}

interface BookmarksState {
  savedIds: string[]
  savedItems: LibraryItem[]
  lastSeenItems: LibraryItem[]
  toggleBookmark: (question: Question) => void
  addToLastSeen: (question: Question) => void
}

const levelColors: Record<string, string> = {
  Junior: '#00BC7D',
  Regular: '#FE9A00',
  Senior: '#FF2056',
}

export const useBookmarksStore = create<BookmarksState>()(
  persist(
    (set, get) => ({
      savedIds: [],
      savedItems: [],
      lastSeenItems: [],

      toggleBookmark: (question) => {
        const qId = question.index.toString()
        const isAlreadySaved = get().savedIds.includes(qId)

        if (isAlreadySaved) {
          set({
            savedIds: get().savedIds.filter((id) => id !== qId),
            savedItems: get().savedItems.filter((item) => item.id !== qId),
          })
        } else {
          const newItem: LibraryItem = {
            id: qId,
            tabId: 'saved',
            title: question.question,
            category: question.category?.name || 'General',
            level: question.level,
            levelColor: levelColors[question.level] || '#FE9A00',
            timeAgo: 'Just now',
            link: `/dashboard/questions`,
          }
          set({
            savedIds: [...get().savedIds, qId],
            savedItems: [newItem, ...get().savedItems],
          })
        }
      },

      addToLastSeen: (question) => {
        const qId = question.index.toString()

        const filtered = get().lastSeenItems.filter((item) => item.id !== qId)

        const newItem: LibraryItem = {
          id: qId,
          tabId: 'last-seen',
          title: question.question,
          category: question.category?.name || 'General',
          level: question.level,
          levelColor: levelColors[question.level] || '#FE9A00',
          timeAgo: '1m ago', // Można tu wstawić dynamiczny czas
          link: `/dashboard/questions/${question.index}`,
        }

        const updatedList = [newItem, ...filtered].slice(0, 4)

        set({ lastSeenItems: updatedList })
      },
    }),
    {
      name: 'prepcode-bookmarks',
    },
  ),
)
