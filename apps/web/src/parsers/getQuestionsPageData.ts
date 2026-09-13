import { createApiUrl } from '@/config/api'
import { FilterItem } from '@/config/questions'
import { createSupabaseServerClient } from '@/services/supabaseServer'
import { Question } from '@/types/question'

interface QuestionsPageData {
  QUESTIONS_DATA: {
    questionsCount: number
    questions: Question[]
  }
  dbCategories: FilterItem[]
  dbTechnologies: FilterItem[]
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const supabase = await createSupabaseServerClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  return session?.access_token ? { authorization: `Bearer ${session.access_token}` } : {}
}

async function fetchFilterItems(path: string, headers: Record<string, string>): Promise<FilterItem[]> {
  try {
    const res = await fetch(createApiUrl(path), { cache: 'no-store', headers })

    if (!res.ok) {
      console.error(`Backend responded with error for ${path}:`, res.status)
      return []
    }

    const body = await res.json()
    return (body?.data ?? []) as FilterItem[]
  } catch (error) {
    console.error(`Failed to fetch ${path}:`, error)
    return []
  }
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

  const headers = await getAuthHeaders()

  // The filter dropdowns must always list the FULL category/technology
  // taxonomy, independent of the current search/filter/pagination - so
  // they're fetched from their own endpoints, not derived from whatever
  // questions happen to be on the current (possibly already-filtered) page.
  const [questionsResult, dbCategories, dbTechnologies] = await Promise.all([
    (async () => {
      try {
        const res = await fetch(createApiUrl(`/api/v1/questions?${query.toString()}`), {
          cache: 'no-store',
          headers,
        })

        if (!res.ok) {
          const errorBody = await res.text()
          console.error('Backend responded with error:', res.status, errorBody)
          return null
        }

        const result = await res.json()

        if (!result?.meta) {
          console.error('Unexpected response shape from backend:', JSON.stringify(result))
          return null
        }

        return result
      } catch (error) {
        console.error('Error fetching questions:', error)
        return null
      }
    })(),
    fetchFilterItems('/api/v1/questions/categories', headers),
    fetchFilterItems('/api/v1/questions/technologies', headers),
  ])

  if (!questionsResult) {
    return {
      QUESTIONS_DATA: { questionsCount: 0, questions: [] },
      dbCategories,
      dbTechnologies,
    }
  }

  const questions: Question[] = (questionsResult.data || []).map((q: any) => ({
    index: q.id,
    level: q.difficulty ? q.difficulty.charAt(0).toUpperCase() + q.difficulty.slice(1) : 'Unknown',
    question: q.questionText,
    answer: q.answerText || q.explanation,
    company: q.company || null,
    category: q.category ? { name: q.category.name, theme: q.category.theme || '#808080' } : null,
    technologies: q.technology ? [q.technology.name] : [],
  }))

  return {
    QUESTIONS_DATA: {
      questionsCount: questionsResult.meta.total || 0,
      questions,
    },
    dbCategories,
    dbTechnologies,
  }
}
