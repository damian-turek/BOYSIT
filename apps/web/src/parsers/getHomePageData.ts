import { ByNumbersProps } from '@/components/organisms/ByNumbers'
import { FeaturesProps } from '@/components/organisms/Features'
import { HeroProps } from '@/components/organisms/Hero'
import { HowItWorksProps } from '@/components/organisms/HowItWorks'
import { PricingProps } from '@/components/organisms/Pricing'

import BookIcon from '@/assets/icons/book.svg'
import CommunityIcon from '@/assets/icons/community.svg'
import CrownIcon from '@/assets/icons/crown.svg'
import ExpertIcon from '@/assets/icons/expert.svg'
import FilterIcon from '@/assets/icons/filter.svg'
import InterviewIcon from '@/assets/icons/interview.svg'
import PowerIcon from '@/assets/icons/power.svg'
import StarIcon from '@/assets/icons/star.svg'
import StatsIcon from '@/assets/icons/stats.svg'

export const getHomePageData = () => {
  const HERO_DATA = {
    title: 'Master technical interviews <span>with real company questions</span>',
    description:
      "Practice with 3,850+ questions from actual interviews at Europe's leading tech companies. Expert answers, smart filters, and a thriving community of engineers.",
    label: 'Updated: 27 May 2026',
    buttonStart: {
      label: 'Start for free →',
    },
    buttonWorks: {
      label: 'See how it works',
      link: '#how-it-works-section',
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

  const HOW_IT_WORKS_DATA = {
    label: 'How It Works',
    title: 'Your path to interview success',
    description: 'From zero to ready in four simple steps',
    tiles: [
      {
        icon: BookIcon,
        title: 'Smart Filtering System',
        description: 'Filter by technology stack, seniority level, domain, and target company',
      },
      {
        icon: FilterIcon,
        title: 'Track Your Progress',
        description: 'Monitor your preparation with detailed analytics and learning insights',
      },
      {
        icon: InterviewIcon,
        title: 'Active Community',
        description: 'Join thousands of developers in private Discord and Telegram channels',
      },
      {
        icon: ExpertIcon,
        title: 'Always Current',
        description: 'Weekly updates with fresh questions and emerging technology trends',
      },
    ],
    button: {
      label: 'Start practicing today →',
    },
  } satisfies HowItWorksProps

  const BY_NUMBERS_DATA = {
    label: 'By the numbers',
    title: 'Trusted by engineers worldwide',
    tiles: [
      {
        number: '3,850+',
        title: 'Interview Questions',
        description: 'From Junior to Senior level',
      },
      {
        number: '20+',
        title: 'Tech Stacks',
        description: 'Frontend, Backend, Mobile, DevOps, Data',
      },
      {
        number: '14',
        title: 'Companies',
        description: 'Google, Meta, Amazon, Microsoft, and more',
      },
      {
        number: '12K+',
        title: 'Engineers',
        description: 'Active community members',
      },
    ],
  } satisfies ByNumbersProps

  const PRICING_DATA = {
    label: 'Pricing',
    title: 'Choose Your Plan',
    description: "Start for free and upgrade when you're ready to unlock your full potential",
    tiles: [
      {
        name: 'Free',
        icon: BookIcon,
        price: '€0<span>/forever</span>',
        text: 'Perfect for getting started with interview prep',
        services: [
          {
            contains: true,
            label: '<span>50 questions per month</span>',
          },
          {
            contains: true,
            label: 'Basic filters (stack, difficulty)',
          },
          {
            contains: true,
            label: 'Access to <span>3 specialties</span>',
          },
          {
            contains: true,
            label: 'Junior-level question answers',
          },
          {
            label: 'Senior-level questions locked',
          },
          {
            label: 'No community access',
          },
          {
            label: 'Mock interview simulator',
          },
          {
            label: 'Priority support',
          },
        ],
        button: {
          label: 'Get Started Free',
        },
      },
      {
        name: 'Pro',
        icon: CrownIcon,
        planId: 'pro_monthly',
        price: '€12<span>/month</span>',
        text: 'Unlock everything you need to ace your interviews',
        label: {
          icon: StarIcon,
          text: 'Most Popular',
        },
        info: 'Cancel anytime. No credit card required for trial.',
        services: [
          {
            contains: true,
            label: '<span>Unlimited questions</span>',
          },
          {
            contains: true,
            label: 'All filters & advanced sorting',
          },
          {
            contains: true,
            label: '<span>All specialties</span> unlocked',
          },
          {
            contains: true,
            label: 'Full expert answers for <span>all levels</span>',
          },
          {
            contains: true,
            label: 'Senior-level questions locked',
          },
          {
            contains: true,
            label: 'Discord & Telegram community',
          },
          {
            contains: true,
            label: 'Mock interview simulator',
          },
          {
            contains: true,
            label: 'Priority support',
          },
        ],
        button: {
          label: 'Try Free for 7 Days →',
        },
      },
    ],
  } satisfies PricingProps

  return { HERO_DATA, FEATURES_DATA, HOW_IT_WORKS_DATA, BY_NUMBERS_DATA, PRICING_DATA }
}
