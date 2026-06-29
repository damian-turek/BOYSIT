import { Question } from '@/types/question'
import { QuestionCard } from '@/components/molecules/QuestionCard'

export type QuestionsProps = {
  questionsCount: number
  questions: Question[]
}

export const Questions = ({ questionsCount, questions }: QuestionsProps) => {
  const levelOrder = { Junior: 1, Regular: 2, Senior: 3 }

  return (
    <section> {/* <--- ЗДЕСЬ ДОЛЖНО БЫТЬ ПУСТО, никаких mt-40 md:mt-20 */}
      <p className="label-font font-bold text-gray-100 mb-4">
        {questionsCount}
        <span className="text-gray-60 font-normal"> questions</span>
      </p>

      <div className="flex flex-col gap-3">
        {[...questions]
          .sort((a, b) => levelOrder[a.level] - levelOrder[b.level])
          .map((question) => (
            <QuestionCard {...question} key={question.index} />
          ))}
      </div>
    </section>
  )
}