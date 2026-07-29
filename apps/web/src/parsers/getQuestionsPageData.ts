import { createApiUrl } from '@/config/api'
import { FilterItem } from '@/config/questions'
import { createSupabaseServerClient } from '@/lib/supabase'
import { Question } from '@/types/question'

interface QuestionsPageData {
  QUESTIONS_DATA: {
    questionsCount: number
    questions: Question[]
  }
  dbCategories: FilterItem[]
  dbTechnologies: FilterItem[]
}

export async function getQuestionsPageData(
  searchParams: Record<string, string | undefined>,
): Promise<QuestionsPageData> {
  const query = new URLSearchParams()

  if (searchParams.search) query.append('search', searchParams.search)
  if (searchParams.difficulty) query.append('difficulty', searchParams.difficulty)
  if (searchParams.category) query.append('categories', searchParams.category)
  if (searchParams.technology) query.append('technologies', searchParams.technology)
  if (searchParams.page) query.append('page', searchParams.page)

  try {
    const supabase = await createSupabaseServerClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    const headers: Record<string, string> = {}
    if (session?.access_token) {
      headers.authorization = `Bearer ${session.access_token}`
    }

    const res = await fetch(createApiUrl(`/api/v1/questions?${query.toString()}`), {
      cache: 'no-store',
      headers,
    })

    if (!res.ok) {
      const errorBody = await res.text()
      console.error('Backend responded with error:', res.status, errorBody)
      throw new Error(`Failed to fetch data from backend api: ${res.status} ${errorBody}`)
    }

    const result = await res.json()

    if (!result?.meta) {
      console.error('Unexpected response shape from backend:', JSON.stringify(result))
      throw new Error('Backend response missing "meta" field')
    }

    const categoriesMap = new Map<string, FilterItem>()
    const technologiesMap = new Map<string, FilterItem>()

    const questions: Question[] = (result.data || []).map((q: any) => {
      if (q.category?.id) {
        categoriesMap.set(q.category.id, {
          id: q.category.id,
          name: q.category.name,
          slug: q.category.slug,
        })
      }

      if (q.technology?.id) {
        technologiesMap.set(q.technology.id, {
          id: q.technology.id,
          name: q.technology.name,
          slug: q.technology.slug,
        })
      }

      return {
        index: q.id,
        level: q.difficulty
          ? q.difficulty.charAt(0).toUpperCase() + q.difficulty.slice(1)
          : 'Unknown',
        question: q.questionText,
        answer: q.answerText || q.explanation,
        company: q.company || null,
        category: q.category
          ? { name: q.category.name, theme: q.category.theme || '#808080' }
          : null,
        technologies: q.technology ? [q.technology.name] : [],
      }
    })

    return {
      QUESTIONS_DATA: {
        questionsCount: result.meta.total || 0,
        questions,
      },
      dbCategories: Array.from(categoriesMap.values()),
      dbTechnologies: Array.from(technologiesMap.values()),
    }
  } catch (error) {
    console.error('Error parsing questions page data:', error)
    return {
      QUESTIONS_DATA: { questionsCount: 0, questions: [] },
      dbCategories: [],
      dbTechnologies: [],
    }
  }
}
