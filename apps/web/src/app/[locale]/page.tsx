import { Hero } from '@/components/HomePage/organisms/Hero'
import { getHomePageData } from '@/parsers/HomePage/getHomePageData'

export default function Home() {
  const { HERO_DATA } = getHomePageData()
  return (
    <main>
      <Hero {...HERO_DATA} />
    </main>
  )
}
