export type Level = 'Junior' | 'Regular' | 'Senior'

type Category = {
  name: string
  theme: string
}

export type Question = {
  index: number
  level: Level
  company?: string
  technologies: string[]
  category: Category
  question: string
  answer: string
}
