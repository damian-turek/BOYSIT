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
}
