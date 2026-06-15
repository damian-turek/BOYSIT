import { PlatformStats, PlatformStatsProps } from '@/components/molecules/PlatformStats'
import { PracticeTools, PracticeToolsProps } from '@/components/molecules/PracticeTools'
import { ProPlanCard, ProPlanCardProps } from '@/components/molecules/ProPlanCard'
import { QuestionsBankCard, QuestionsBankCardProps } from '@/components/molecules/QuestionsBankCard'
import { QuestionsLibrary, QuestionsLibraryProps } from '@/components/molecules/QuestionsLibrary'
import { TopCategories, TopCategoriesProps } from '@/components/molecules/TopCategories'

export type DashboardContentProps = {
  questionsBank: QuestionsBankCardProps
  topCategories: TopCategoriesProps
  platformStats: PlatformStatsProps
  proPlanCard: ProPlanCardProps
  practiceTools: PracticeToolsProps
  questionsLibrary: QuestionsLibraryProps
}

export const DashboardContent = ({
  questionsBank,
  topCategories,
  platformStats,
  questionsLibrary,
  proPlanCard,
  practiceTools,
}: DashboardContentProps) => {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
      <div className="w-full flex flex-col gap-6">
        <QuestionsBankCard {...questionsBank} />
        <QuestionsLibrary {...questionsLibrary} />
        <PracticeTools {...practiceTools} />
      </div>
      <div className="w-full flex flex-col gap-6">
        <TopCategories {...topCategories} />
        <PlatformStats {...platformStats} />
        <ProPlanCard {...proPlanCard} />
      </div>
    </section>
  )
}
