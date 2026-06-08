import { HeaderProps } from '@/components/organisms/Nav/Header'

export const getLayoutData = () => {
  const HEADER_DATA = {
    name: 'PrepCode',
    nav: [
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
  } satisfies HeaderProps

  return { HEADER_DATA }
}
