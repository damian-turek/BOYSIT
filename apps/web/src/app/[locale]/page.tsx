import { Hero } from '@/components/organisms/Hero'
import { Features } from '@/components/organisms/Features'
import { HowItWorks } from '@/components/organisms/HowItWorks'
import { getHomePageData } from '@/parsers/HomePage/getHomePageData'
import { Pricing } from '@/components/organisms/Pricing'
import { ByNumbers } from '@/components/organisms/ByNumbers'

export default function Home() {
  const { HERO_DATA, FEATURES_DATA, HOW_IT_WORKS_DATA, BY_NUMBERS_DATA, PRICING_DATA } =
    getHomePageData()
  return (
    <main>
      <Hero {...HERO_DATA} />
      <Features {...FEATURES_DATA} />
      <HowItWorks {...HOW_IT_WORKS_DATA} />
      <ByNumbers {...BY_NUMBERS_DATA} />
      <Pricing {...PRICING_DATA} />
    </main>
  )
}
