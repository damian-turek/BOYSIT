import { DashboardContentProps } from '@/components/organisms/DashboardContent'
import { WelcomeSectionProps } from '@/components/organisms/WelcomeSection'

export const getDashboardData = () => {
  const WELCOME_SECTION_DATA = {
    title: 'Welcome back, Developer! 👋',
    text: 'Ready to level up your interview skill',
    streak: 7,
    activities: [
      { date: '2026-06-01', count: 2 },
      { date: '2026-06-02', count: 3 },
      { date: '2026-06-03', count: 1 },
      { date: '2026-06-04', count: 4 },
      { date: '2026-06-05', count: 8 },
      { date: '2026-06-06', count: 2 },
      { date: '2026-06-07', count: 1 },
      { date: '2026-06-08', count: 0 },
      { date: '2026-06-15', count: 2 },
    ],
  } satisfies WelcomeSectionProps

  const DASHBOARD_CONTENT_DATA = {
    questionsBank: {
      name: 'Full Question Bank',
      description: '3,850+ curated interview questions',
      text: 'Browse our comprehensive database of real interview questions from top tech companies. Filter by technology, difficulty, and company.',
      badge: 'NEW',
      button: {
        label: 'Explore All Questions →',
        link: '/dashboard/questions',
      },
      tags: ['JavaScript', 'Python', 'SQL', 'React', 'System Design'],
    },
    topCategories: {
      name: 'Top Categories',
      categories: [
        { name: 'JavaScript / TS', icon: 'Code', theme: '#F0B100', questionNumber: 615 },
        { name: 'System Design', icon: 'Layers', theme: '#AD46FF', questionNumber: 320 },
        { name: 'Databases', icon: 'Database', theme: '#FF6900', questionNumber: 290 },
        { name: 'Algorithms', icon: 'Cpu', theme: '#2B7FFF', questionNumber: 270 },
        { name: 'Architecture', icon: 'Server', theme: '#615FFF', questionNumber: 215 },
        { name: 'Security', icon: 'Shield', theme: '#FF2056', questionNumber: 180 },
        { name: 'DevOps', icon: 'Infinity', theme: '#00BC7D', questionNumber: 155 },
        { name: 'CSS & HTML', icon: 'Terminal', theme: '#00B8DB', questionNumber: 140 },
      ],
    },
    platformStats: {
      name: 'Platform Stats',
      tiles: [
        {
          icon: 'BookOpen',
          name: '3,850+',
          text: 'Questions',
        },
        {
          icon: 'Layers',
          name: '11',
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
    proPlanCard: {
      name: 'Pro Plan',
      text: 'Unlock all 3,850+ questions',
      list: ['Full access to all topics', 'Senior-level questions', 'Company-specific sets'],
      button: {
        label: 'View Plans →',
        link: '/pricing',
      },
      badge: 'From €9/month · Cancel anytime',
    },
    practiceTools: {
      name: 'Practice Tools',
      tools: [
        {
          name: 'Questions',
          description: 'Collection of questions',
          label: '3000 questions',
          theme: '#FF2056',
          icon: 'BookOpen',
          link: '/dashboard/questions',
        },
        {
          name: 'Coding Challenges',
          description: 'HackerRank-style problems from real interviews',
          label: '10 problems',
          badge: 'NEW',
          theme: '#7F22FE',
          icon: 'Terminal',
          link: '/dashboard/coding',
        },
        {
          name: 'Exam Mode',
          description: 'Timed multiple-choice · simulate a real interview',
          label: '3 modes',
          badge: 'POPULAR',
          theme: '#2563EB',
          icon: 'ClipboardCheck',
          link: '/dashboard/exam',
        },
        {
          name: 'Job Tracker',
          description: 'Track applications, get tailored interview questions',
          label: '6 active',
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
    },
  } satisfies DashboardContentProps

  return { WELCOME_SECTION_DATA, DASHBOARD_CONTENT_DATA }
}
