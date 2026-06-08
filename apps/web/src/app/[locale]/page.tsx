import { Hero } from '@/components/HomePage/organisms/Hero'
import { getHomePageData } from '@/parsers/HomePage/getHomePageData'
import { Features } from '@/components/HomePage/organisms/Features'
import { HowItWorks } from '@/components/HomePage/organisms/HowItWorks'

export default function Home() {
  const { HERO_DATA, FEATURES_DATA, HOW_IT_WORKS_DATA } = getHomePageData()
  return (
    <main>
      <Hero {...HERO_DATA} />
      <Features {...FEATURES_DATA} />
      <HowItWorks {...HOW_IT_WORKS_DATA} />
    </main>
  )
}
