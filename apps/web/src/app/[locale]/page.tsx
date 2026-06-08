import { Hero } from '@/components/HomePage/organisms/Hero'
import { getHomePageData } from '@/parsers/HomePage/getHomePageData'
import { Features } from '@/components/HomePage/organisms/Features'

export default function Home() {
  const { HERO_DATA, FEATURES_DATA } = getHomePageData()
  return (
    <main>
      <Hero {...HERO_DATA} />
      <Features {...FEATURES_DATA} />
    </main>
  )
}
