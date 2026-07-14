import { QuestionsProps } from '@/components/organisms/Questions'

export const CATEGORY_THEMES: Record<string, string> = {
  'JavaScript/TypeScript': '#F0B100',
  Security: '#FF2056',
  Backend: '#16A34A',
  Frontend: '#D946EF',
  'CSS & HTML': '#00B8DB',
  Algorithms: '#2B7FFF',
  Databases: '#FF6900',
  Performance: '#FE9A00',
  Testing: '#00BBA7',
  Architecture: '#615FFF',
  Concurrency: '#F6339A',
  'System Design': '#AD46FF',
  DevOps: '#00BC7D',
  Terminal: '#00B8DB',
}

export const getQuestionsPageData = async (searchParams: Record<string, string | undefined>) => {
  const params = new URLSearchParams()
  if (searchParams.page) params.append('page', searchParams.page)
  if (searchParams.search) params.append('search', searchParams.search)
  if (searchParams.technology) params.append('technology', searchParams.technology)
  if (searchParams.difficulty) params.append('difficulty', searchParams.difficulty)

  const backendUrl = process.env.API_URL || 'http://localhost:4000'

  const res = await fetch(`${backendUrl}/api/questions?${params}`, {
    next: {
      revalidate: 60,
      tags: ['questions'],
    },
  })
  const data = await res.json()

  const page = () => {
    const currentPage = Number(searchParams.page ?? 0) || 0

    if (currentPage > 1) return (currentPage - 1) * 20

    return currentPage
  }

  const QUESTIONS_DATA = {
    questions:
      data?.data?.map((question: any, index: number) => ({
        index: question.id,
        pageNumber: page() + index + 1,
        slug: question.slug,
        level: question.difficulty
          ? question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)
          : '',
        company: question.company || '',
        technologies: question.technology ? [question.technology.name] : [],
        category: {
          name: question.category?.name || '',
          theme: CATEGORY_THEMES[question.category?.name] || '#808080',
        },
        question: question.questionText,
        answer: question.answerText,
      })) ?? [],
    questionsCount: data?.meta?.totalCount || 0,
  } satisfies QuestionsProps

  return { QUESTIONS_DATA }
}
