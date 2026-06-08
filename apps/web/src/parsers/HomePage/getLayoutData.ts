import { HeaderProps } from '@/components/HomePage/organisms/Nav/Header'

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
        link: '#',
      },
      {
        label: 'Pricing',
        link: '#',
      },
    ],
  } satisfies HeaderProps

  return { HEADER_DATA }
}
