import { BookOpen, Briefcase, ClipboardCheck, LayoutDashboard, Terminal, User } from 'lucide-react'

import { HeaderProps } from '@/components/organisms/Nav/Header'
import { SidebarProps } from '@/components/organisms/Nav/Sidebar'

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

  const SIDEBAR_DATA = {
    name: 'PrepCode',
    nav: [
      {
        label: 'Dashboard',
        link: '/dashboard',
        icon: 'LayoutDashboard',
      },
      {
        label: 'Questions',
        link: '/dashboard/questions',
        icon: 'BookOpen',
      },
      {
        label: 'Coding',
        link: '/dashboard/coding',
        icon: 'Terminal',
      },
      {
        label: 'Job Tracker',
        link: '/dashboard/job-tracker',
        icon: 'Briefcase',
      },
      {
        label: 'Exam',
        link: '/dashboard/exam',
        icon: 'ClipboardCheck',
      },
      {
        label: 'Profile',
        link: '/dashboard/profile',
        icon: 'User',
      },
    ],
    upgradeButton: {
      link: '/price',
      title: 'Upgrade to Pro',
      text: 'From €9/month',
    },
  } satisfies SidebarProps

  return { HEADER_DATA, FOOTER_DATA, SIDEBAR_DATA }
}
