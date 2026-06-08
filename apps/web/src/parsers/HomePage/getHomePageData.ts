import { HeroProps } from '@/components/HomePage/organisms/Hero'
import { FeaturesProps } from '@/components/HomePage/organisms/Features'
import CommunityIcon from '@/assets/icons/community.svg'
import ExpertIcon from '@/assets/icons/expert.svg'
import InterviewIcon from '@/assets/icons/interview.svg'
import PowerIcon from '@/assets/icons/power.svg'
import StatsIcon from '@/assets/icons/stats.svg'
import FilterIcon from '@/assets/icons/filter.svg'

export const getHomePageData = () => {
  const HERO_DATA = {
    title: 'Master technical interviews <span>with real company questions</span>',
    description:
      "Practice with 3,850+ questions from actual interviews at Europe's leading tech companies. Expert answers, smart filters, and a thriving community of engineers.",
    label: 'Updated: 27 May 2026',
    buttonStart: {
      label: 'Start for free →',
      link: '#',
    },
    buttonWorks: {
      label: 'See how it works',
      link: '#',
    },
    trusted: 'Trusted by <span>12,000+</span> engineers',
    questionsCategories: {
      label: 'Questions sourced from',
      categories: [
        'Google',
        'Meta',
        'Amazon',
        'Microsoft',
        'Yandex',
        'JetBrains',
        'Sber',
        'Tinkoff',
        'Wildberries',
        'Avito',
        'Ozon',
        'VK',
        'Kaspersky',
        '2GIS',
      ],
    },
  } satisfies HeroProps

  const FEATURES_DATA = {
    label: 'Features',
    title: 'Everything you need to succeed',
    description:
      'PrepCode combines real interview questions, expert knowledge, and smart tools to give you an edge in your job search.',
    tiles: [
      {
        icon: InterviewIcon,
        title: 'Real Interview Questions',
        description:
          "Every question sourced from actual technical interviews at Europe's top companies",
        text: 'Our community of engineers share their interview experiences within 48 hours, keeping the question bank current and relevant.',
      },
      {
        icon: ExpertIcon,
        title: 'Expert-Reviewed Answers',
        description:
          'Detailed explanations written and reviewed by Senior engineers and tech leads',
        text: 'Each answer goes through a peer review process to ensure accuracy, clarity, and industry best practices.',
      },
      {
        icon: FilterIcon,
        title: 'Smart Filtering System',
        description: 'Filter by technology stack, seniority level, domain, and target company',
        text: "Practice exactly what matters for your target role. Junior frontend? Senior backend? We've got you covered.",
      },
      {
        icon: StatsIcon,
        title: 'Track Your Progress',
        description: 'Monitor your preparation with detailed analytics and learning insights',
        text: "See which domains you've mastered and where you need more practice. Set goals and track completion.",
      },
      {
        icon: CommunityIcon,
        title: 'Active Community',
        description: 'Join thousands of developers in private Discord and Telegram channels',
        text: "Discuss questions, share interview experiences, and get advice from those who've been there.",
      },
      {
        icon: PowerIcon,
        title: 'Always Current',
        description: 'Weekly updates with fresh questions and emerging technology trends',
        text: 'React 19? New AWS services? TypeScript 5.x? We add questions as the industry evolves.',
      },
    ],
  } satisfies FeaturesProps

  return { HERO_DATA, FEATURES_DATA }
}
