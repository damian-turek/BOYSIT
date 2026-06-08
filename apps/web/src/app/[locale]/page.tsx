import { Hero } from '@/components/organisms/Hero'
import { Features } from '@/components/organisms/Features'
import { HowItWorks } from '@/components/organisms/HowItWorks'
import { getHomePageData } from '@/parsers/HomePage/getHomePageData'
import { Pricing } from '@/components/organisms/Pricing'

export default function Home() {
  const { HERO_DATA, FEATURES_DATA, HOW_IT_WORKS_DATA, PRICING_DATA } = getHomePageData()
  return (
    <main>
      <Hero {...HERO_DATA} />
      <Features {...FEATURES_DATA} />
      <HowItWorks {...HOW_IT_WORKS_DATA} />
      <Pricing {...PRICING_DATA} />
    </main>
  )
}
