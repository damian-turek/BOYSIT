import { HeaderProps } from '@/components/organisms/Nav/Header'

export const getLayoutData = () => {
  const HEADER_DATA = {
    name: 'PrepCode',
    nav: [
      {
        label: 'Features',
        link: '#features-section',
      },
      {
        label: 'How it works',
        link: '#how-it-works-section',
      },
      {
        label: 'Pricing',
        link: '#pricing-section',
      },
    ],
  } satisfies HeaderProps

  const FOOTER_DATA = {
    name: 'PrepCode',
    description:
      "Master technical interviews with real questions from Europe's top tech companies.",
    products: [
      {
        label: 'Features',
        link: '#features',
      },
      {
        label: 'How it works',
        link: '#how-it-works-section',
      },
      {
        label: 'Pricing',
        link: '#pricing-section',
      },
    ],
    company: [
      {
        label: 'About',
        link: '#',
      },
      {
        label: 'Contacts',
        link: '#',
      },
      {
        label: 'Discord',
        link: '#',
      },
    ],
    bottomLinks: [
      {
        label: 'Privacy',
        link: '#',
      },
      {
        label: 'Terms',
        link: '#',
      },
      {
        label: 'Cookies',
        link: '#',
      },
    ],
  }

  return { HEADER_DATA, FOOTER_DATA }
}
