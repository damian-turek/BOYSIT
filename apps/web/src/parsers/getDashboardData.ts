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

  return { WELCOME_SECTION_DATA }
}
