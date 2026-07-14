import { getHomePageData } from '@/parsers/getHomePageData'

import { ByNumbers } from '@/components/organisms/ByNumbers'
import { Features } from '@/components/organisms/Features'
import { Hero } from '@/components/organisms/Hero'
import { HowItWorks } from '@/components/organisms/HowItWorks'
import { Pricing } from '@/components/organisms/Pricing'

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
