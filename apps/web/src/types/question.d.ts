export type Level = 'Junior' | 'Middle' | 'Senior'

export type Category = {
  name: string
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
