import { createApiUrl } from '@/config/api'
import { DashboardContentProps } from '@/components/organisms/DashboardContent'
import { WelcomeSectionProps } from '@/components/organisms/WelcomeSection'
import { createSupabaseServerClient } from '@/services/supabaseServer'

type CategoryIcon = 'Code' | 'Layers' | 'Database' | 'Cpu' | 'Server' | 'Shield' | 'Infinity' | 'Terminal'

const CATEGORY_ICON_RULES: { match: RegExp; icon: CategoryIcon }[] = [
  { match: /system design/i, icon: 'Layers' },
  { match: /database|sql/i, icon: 'Database' },
  { match: /algorithm|data structure/i, icon: 'Cpu' },
  { match: /architecture/i, icon: 'Server' },
  { match: /security/i, icon: 'Shield' },
  { match: /devops|ci\/cd|infra/i, icon: 'Infinity' },
  { match: /css|html|frontend/i, icon: 'Terminal' },
  { match: /javascript|typescript|\bjs\b|\bts\b/i, icon: 'Code' },
]
const DEFAULT_CATEGORY_ICON: CategoryIcon = 'Code'
const CATEGORY_THEME_PALETTE = [
  '#F0B100',
  '#AD46FF',
  '#FF6900',
  '#2B7FFF',
  '#615FFF',
  '#FF2056',
  '#00BC7D',
  '#00B8DB',
]

const getCategoryIcon = (name: string): CategoryIcon =>
  CATEGORY_ICON_RULES.find((rule) => rule.match.test(name))?.icon ?? DEFAULT_CATEGORY_ICON

type DashboardOverview = {
  topCategories: { name: string; slug: string; questionCount: number }[]
  practiceTools: { questions: number; jobTrackerActive: number }
  questionsBank: { total: number; tags: string[] }
}

type LibraryItem = {
  id: string
  tabId: string
  title: string
  category: string
  level: string
  levelColor: string
  timeAgo: string
  link: string
}

type LibraryPayload = {
  savedItems: LibraryItem[]
  lastSeenItems: LibraryItem[]
  forYouItems: LibraryItem[]
}

const EMPTY_OVERVIEW: DashboardOverview = {
  topCategories: [],
  practiceTools: { questions: 0, jobTrackerActive: 0 },
  questionsBank: { total: 0, tags: [] },
}

const EMPTY_LIBRARY: LibraryPayload = { savedItems: [], lastSeenItems: [], forYouItems: [] }

type UserProfile = { plan: 'free' | 'pro' | 'admin' }

const EMPTY_PROFILE: UserProfile = { plan: 'free' }

async function fetchWithAuth<T>(path: string, fallback: T): Promise<T> {
  try {
    const supabase = await createSupabaseServerClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    const headers: Record<string, string> = {}
    if (session?.access_token) {
      headers.authorization = `Bearer ${session.access_token}`
    }

    const res = await fetch(createApiUrl(path), { cache: 'no-store', headers })

    if (!res.ok) {
      console.error(`Backend responded with error for ${path}:`, res.status)
      return fallback
    }

    const body = await res.json()
    return (body?.data ?? fallback) as T
  } catch (error) {
    console.error(`Failed to fetch ${path}:`, error)
    return fallback
  }
}

export const getDashboardData = async () => {
  const [overview, library, profile] = await Promise.all([
    fetchWithAuth<DashboardOverview>('/api/v1/dashboard/overview', EMPTY_OVERVIEW),
    fetchWithAuth<LibraryPayload>('/api/v1/library', EMPTY_LIBRARY),
    fetchWithAuth<UserProfile>('/api/v1/me', EMPTY_PROFILE),
  ])

  const hasProAccess = profile.plan === 'pro' || profile.plan === 'admin'

  const WELCOME_SECTION_DATA = {
    title: 'Welcome back, Developer! 👋',
    text: 'Ready to level up your interview skill',
    streak: 7,
  } satisfies WelcomeSectionProps

  const DASHBOARD_CONTENT_DATA = {
    questionsBank: {
      name: 'Full Question Bank',
      description: `${overview.questionsBank.total.toLocaleString('en-US')}+ curated interview questions`,
      text: 'Browse our comprehensive database of real interview questions from top tech companies. Filter by technology, difficulty, and company.',
      badge: 'NEW',
      button: {
        label: 'Explore All Questions →',
        link: '/dashboard/questions',
      },
      tags: overview.questionsBank.tags.length
        ? overview.questionsBank.tags
        : ['JavaScript', 'Python', 'SQL', 'React', 'System Design'],
    },
    topCategories: {
      name: 'Top Categories',
      categories: overview.topCategories.map((category, index) => ({
        name: category.name,
        icon: getCategoryIcon(category.name),
        theme: CATEGORY_THEME_PALETTE[index % CATEGORY_THEME_PALETTE.length] ?? '#808080',
        questionNumber: category.questionCount,
      })),
    },
    platformStats: {
      name: 'Platform Stats',
      tiles: [
        {
          icon: 'BookOpen',
          name: `${overview.questionsBank.total.toLocaleString('en-US')}+`,
          text: 'Questions',
        },
        {
          icon: 'Layers',
          name: String(overview.topCategories.length),
          text: 'Categories',
        },
        {
          icon: 'Users',
          name: '18k+',
          text: 'Learners',
        },
        {
          icon: 'Database',
          name: '120+',
          text: 'Companies',
        },
      ],
    },
    ...(hasProAccess
      ? {}
      : {
          proPlanCard: {
            name: 'Pro Plan',
            text: 'Unlock all questions',
            list: ['Full access to all topics', 'Senior-level questions', 'Company-specific sets'],
            button: {
              label: 'View Plans →',
            },
            badge: 'From €12/month · Cancel anytime',
            planId: 'pro_monthly',
          },
        }),
    practiceTools: {
      name: 'Practice Tools',
      tools: [
        {
          name: 'Questions',
          description: 'Collection of questions',
          label: `${overview.practiceTools.questions.toLocaleString('en-US')} questions`,
          theme: '#FF2056',
          icon: 'BookOpen',
          link: '/dashboard/questions',
        },
        {
          name: 'Exam Mode',
          description: 'Timed practice questions · simulate a real interview',
          label: '3 levels',
          badge: 'POPULAR',
          theme: '#2563EB',
          icon: 'ClipboardCheck',
          link: '/dashboard/exam',
        },
        {
          name: 'Job Tracker',
          description: 'Track applications, get tailored interview questions',
          label: `${overview.practiceTools.jobTrackerActive} active`,
          theme: '#FE9A00',
          icon: 'Briefcase',
          link: '/dashboard/job-tracker',
        },
      ],
    },
    questionsLibrary: {
      name: 'My Library',
      allQuestionsLink: '/dashboard/questions',
      tabs: [
        { id: 'last-seen', label: 'Last Seen', icon: 'Clock' },
        { id: 'saved', label: 'Saved', icon: 'Bookmark' },
        { id: 'for-you', label: 'For You', icon: 'Lightbulb' },
      ],
      items: {
        'last-seen': library.lastSeenItems,
        saved: library.savedItems,
        'for-you': library.forYouItems,
      },
    },
  } satisfies DashboardContentProps

  return { WELCOME_SECTION_DATA, DASHBOARD_CONTENT_DATA }
}
