import { HeaderProps } from '@/components/organisms/Nav/Header'

export const getLayoutData = () => {
  const HEADER_DATA = {
    name: 'PrepCode',
    nav: [
      {
        label: 'Features',
        link: '#',
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
