import { Metadata } from 'next'

import { ProfileSettings } from '@/components/organisms/ProfileSettings'

type PageProps = {
  params: Promise<{ locale: string }>
}

export const metadata: Metadata = {
  title: 'Profile',
}

export default async function ProfilePage({ params }: PageProps) {
  const { locale } = await params

  return (
    <main className="dashboard-container">
      <ProfileSettings locale={locale} />
    </main>
  )
}
