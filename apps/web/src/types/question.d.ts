export type Level = 'Junior' | 'Middle' | 'Senior'

export type Category = {
  name: string
}

export type Question = {
  index: string
  level: Level
  company?: string
  technologies: string[]
  category: Category
  question: string
  answer: string
  title?: string
  locked?: boolean
  explanation?: string | null
  codeSnippet?: string | null
}

export type QuestionApiItem = {
  id: string
  title: string
  difficulty: 'junior' | 'middle' | 'senior'
  questionText: string
  answerText: string | null
  explanation: string | null
  codeSnippet: string | null
  locked: boolean
  company?: string | null
  category: { name: string } | null
  technology: { name: string } | null
}
