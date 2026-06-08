import { HeroProps } from '@/components/HomePage/organisms/Hero'

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

  return { HERO_DATA }
}
