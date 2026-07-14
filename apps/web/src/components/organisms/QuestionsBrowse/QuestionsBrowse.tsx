'use client'

import { MouseEvent, useEffect, useMemo, useState } from 'react'

import Link from 'next/link'

import {
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Code2,
  Cpu,
  Crown,
  Database,
  Filter,
  GitBranch,
  Layers,
  LoaderCircle,
  Lock,
  RefreshCw,
  Search,
  Server,
  Shield,
  SlidersHorizontal,
  X,
} from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'

import { useAuthStore } from '@/store/useAuthStore'
import { useAuthSessionStore } from '@/store/useAuthSessionStore'

import {
  Category,
  fetchCategories,
  fetchQuestion,
  fetchQuestions,
  fetchTechnologies,
  Pagination,
  QuestionDetailData,
  QuestionDifficulty,
  QuestionPreview,
  Technology,
} from '@/services/questionsApi'
import { cn } from '@/utils/cn'

type GradeFilter = 'all' | QuestionDifficulty

const PAGE_SIZE = 20

const categoryIconConfig = {
  algorithms: { icon: Cpu, color: 'text-[#2B7FFF]' },
  backend: { icon: Server, color: 'text-[#615FFF]' },
  databases: { icon: Database, color: 'text-[#FF6900]' },
  devops: { icon: GitBranch, color: 'text-[#00BC7D]' },
  frontend: { icon: Code2, color: 'text-[#F0B100]' },
  security: { icon: Shield, color: 'text-[#FF2056]' },
  'system-design': { icon: Layers, color: 'text-[#AD46FF]' },
  testing: { icon: CheckCircle2, color: 'text-[#14B8A6]' },
} as const

const gradeConfig: Record<QuestionDifficulty, { label: string; className: string }> = {
  junior: {
    label: 'Junior',
    className:
      'border-[#A8DDD1] bg-[#DFF3EF] text-[#008A67] dark:border-success-50/30 dark:bg-success-50/15 dark:text-success-50',
  },
  middle: {
    label: 'Mid-level',
    className:
      'border-[#F5C8AA] bg-[#FFF0E6] text-[#A64F21] dark:border-warning-50/30 dark:bg-warning-50/15 dark:text-warning-50',
  },
  senior: {
    label: 'Senior',
    className:
      'border-[#F2B8BA] bg-[#FDE7E8] text-[#9F1B1F] dark:border-alert-50/30 dark:bg-alert-50/15 dark:text-alert-50',
  },
}

const GradeBadge = ({ grade }: { grade: QuestionDifficulty }) => {
  const config = gradeConfig[grade]

  return (
    <span
      className={cn(
        'inline-flex rounded-md border px-2 py-0.5 font-mono text-[11px] leading-4 font-semibold',
        config.className,
      )}
    >
      {config.label}
    </span>
  )
}

type QuestionCardProps = {
  question: QuestionPreview
  index: number
  expanded: boolean
  saved: boolean
  detail?: QuestionDetailData
  detailLoading: boolean
  detailError?: string
  onToggle: () => void
  onRetry: () => void
  onSave: (event: MouseEvent<HTMLButtonElement>) => void
}

const QuestionCard = ({
  question,
  index,
  expanded,
  saved,
  detail,
  detailLoading,
  detailError,
  onToggle,
  onRetry,
  onSave,
}: QuestionCardProps) => {
  const profile = useAuthSessionStore((state) => state.profile)
  const openAuthModal = useAuthStore((state) => state.openModal)
  const categoryConfig =
    categoryIconConfig[question.category?.slug as keyof typeof categoryIconConfig]
  const CategoryIcon = categoryConfig?.icon ?? Code2
  const chips = [
    ...(question.technology ? [question.technology.name] : []),
    ...question.tags.map((tag) => tag.name),
  ]

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.25), duration: 0.3 }}
      className={cn(
        'group overflow-hidden rounded-2xl border bg-[var(--color-gray-05)] transition-colors duration-200',
        expanded
          ? 'border-primary/40'
          : 'border-[var(--color-gray-10)] hover:border-primary/25',
      )}
    >
      <div className="flex items-start gap-3 p-4 sm:gap-4 sm:p-5">
        <Link
          href={`/dashboard/questions/${question.slug}`}
          className="flex min-w-0 flex-1 cursor-pointer items-start gap-3 text-left sm:gap-4"
        >
          <span className="w-6 shrink-0 select-none pt-1 font-mono text-[11px] leading-4 text-gray-60/60">
            {String(index + 1).padStart(2, '0')}
          </span>

          <span className="min-w-0 flex-1">
            <span className="mb-2.5 flex flex-wrap items-center gap-2">
              <GradeBadge grade={question.difficulty} />
              {question.category && (
                <span className="flex items-center gap-1 font-mono text-[11px] leading-4 text-gray-60">
                  <CategoryIcon size={12} className={categoryConfig?.color} />
                  {question.category.name}
                </span>
              )}
              {question.technology && (
                <span className="hidden font-mono text-[11px] leading-4 text-gray-60/70 sm:inline">
                  · {question.technology.name}
                </span>
              )}
            </span>

            <span className="block text-[14px] leading-[22px] font-medium text-gray-100">
              {question.title}
            </span>

            {chips.length > 0 && (
              <span className="mt-3 flex flex-wrap gap-1.5">
                {chips.slice(0, 5).map((chip) => (
                  <span
                    key={chip}
                    className="rounded border border-[var(--color-gray-10)] bg-background px-2 py-0.5 font-mono text-[11px] leading-4 text-gray-60"
                  >
                    {chip}
                  </span>
                ))}
              </span>
            )}
          </span>
        </Link>

        <div className="flex shrink-0 items-center gap-1 pt-0.5 sm:gap-2">
          {question.locked && (
            <span className="hidden items-center gap-1 rounded-lg border border-[var(--color-gray-10)] bg-background px-2 py-1 font-mono text-[11px] leading-4 text-gray-60 sm:flex">
              <Lock size={11} />
              Pro
            </span>
          )}
          <button
            type="button"
            onClick={onSave}
            aria-label={saved ? 'Remove bookmark' : 'Save question'}
            title={saved ? 'Remove bookmark' : 'Save question'}
            aria-pressed={saved}
            className="flex size-8 cursor-pointer items-center justify-center rounded-lg text-gray-60 transition-all hover:bg-white hover:text-primary"
          >
            {saved ? (
              <BookmarkCheck size={15} className="text-primary" />
            ) : (
              <Bookmark size={15} />
            )}
          </button>
          <button
            type="button"
            onClick={onToggle}
            aria-label={expanded ? 'Hide answer' : 'Show answer'}
            title={expanded ? 'Hide answer' : 'Show answer'}
            className="flex size-8 cursor-pointer items-center justify-center rounded-lg text-gray-60 transition-colors hover:bg-white hover:text-gray-100"
          >
            {detailLoading ? (
              <LoaderCircle size={15} className="animate-spin" />
            ) : (
              <ChevronDown
                size={16}
                className={cn('transition-transform duration-200', expanded && 'rotate-180')}
              />
            )}
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-5 sm:px-5">
              <div className="border-t border-[var(--color-gray-10)] pt-4">
                {question.locked ? (
                  <div className="flex flex-col items-center py-8 text-center">
                    <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary/10">
                      <Crown size={24} className="text-primary" />
                    </div>
                    <p className="mb-1 text-sm font-semibold text-gray-100">Pro answer</p>
                    <p className="body-small mb-5 max-w-xs text-gray-60">
                      {profile
                        ? 'Upgrade to Pro to unlock expert answers to all Pro questions.'
                        : 'Sign in to unlock the full answer preview and your personal progress.'}
                    </p>
                    {profile ? (
                      <Link
                        href="/pricing"
                        className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95"
                      >
                        Try Pro free for 7 days
                        <ChevronRight size={14} />
                      </Link>
                    ) : (
                      <button
                        type="button"
                        onClick={() => openAuthModal('login')}
                        className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95"
                      >
                        Sign in
                        <ChevronRight size={14} />
                      </button>
                    )}
                  </div>
                ) : detailLoading ? (
                  <div className="flex items-center gap-2 py-4 text-sm text-gray-60">
                    <LoaderCircle size={16} className="animate-spin" />
                    Loading answer...
                  </div>
                ) : detailError ? (
                  <div className="flex items-center justify-between gap-4 py-3">
                    <p className="text-sm text-alert-100">{detailError}</p>
                    <button
                      type="button"
                      onClick={onRetry}
                      className="flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-primary"
                    >
                      <RefreshCw size={13} />
                      Retry
                    </button>
                  </div>
                ) : detail ? (
                  <div>
                    <p className="mb-3 font-mono text-[11px] leading-4 font-semibold tracking-[1.2px] text-gray-60 uppercase">
                      Answer
                    </p>
                    {detail.codeSnippet && (
                      <pre className="mb-4 overflow-x-auto whitespace-pre-wrap rounded-xl border border-[var(--color-gray-10)] bg-background p-4 font-mono text-xs leading-relaxed text-gray-100">
                        <code>{detail.codeSnippet}</code>
                      </pre>
                    )}
                    <p className="text-[14px] leading-[22px] text-gray-60">
                      {detail.answerText ?? 'No answer has been added yet.'}
                    </p>
                    {detail.explanation && (
                      <p className="mt-3 border-l-2 border-primary/30 pl-3 text-[13px] leading-5 text-gray-60">
                        {detail.explanation}
                      </p>
                    )}
                  </div>
                ) : null}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  )
}

type FilterSidebarProps = {
  grade: GradeFilter
  setGrade: (grade: GradeFilter) => void
  categories: Category[]
  selectedCategories: string[]
  toggleCategory: (slug: string) => void
  technologies: Technology[]
  selectedTechnologies: string[]
  toggleTechnology: (slug: string) => void
  onClearAll: () => void
  hasActiveFilters: boolean
}

const FilterSidebar = ({
  grade,
  setGrade,
  categories,
  selectedCategories,
  toggleCategory,
  technologies,
  selectedTechnologies,
  toggleTechnology,
  onClearAll,
  hasActiveFilters,
}: FilterSidebarProps) => {
  const [categoriesExpanded, setCategoriesExpanded] = useState(true)
  const [technologiesExpanded, setTechnologiesExpanded] = useState(false)

  const grades: { value: GradeFilter; label: string }[] = [
    { value: 'all', label: 'All levels' },
    { value: 'junior', label: 'Junior' },
    { value: 'middle', label: 'Mid-level' },
    { value: 'senior', label: 'Senior' },
  ]

  return (
    <aside className="w-full space-y-5 text-[14px] leading-[22px]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={15} className="text-primary" />
          <span className="text-[14px] leading-[22px] font-semibold text-gray-100">
            Filters
          </span>
        </div>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClearAll}
            className="flex cursor-pointer items-center gap-1 text-xs text-gray-60 transition-colors hover:text-primary"
          >
            <X size={11} />
            Clear all
          </button>
        )}
      </div>

      <div>
        <p className="mb-2.5 font-mono text-[11px] leading-4 font-semibold tracking-[1.2px] text-gray-60 uppercase">
          Seniority
        </p>
        <div className="space-y-1">
          {grades.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setGrade(item.value)}
              className={cn(
                'w-full cursor-pointer rounded-xl px-3 py-2 text-left text-[14px] leading-[22px] transition-all',
                grade === item.value
                  ? 'border border-primary/20 bg-primary/10 font-semibold text-primary'
                  : 'text-gray-60 hover:bg-background hover:text-gray-100',
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-[var(--color-gray-10)]" />

      <FilterSection
        label="Category"
        count={selectedCategories.length}
        expanded={categoriesExpanded}
        onToggle={() => setCategoriesExpanded((value) => !value)}
      >
        <div className="space-y-0.5">
          {categories.map((category) => {
            const active = selectedCategories.includes(category.slug)
            const config =
              categoryIconConfig[category.slug as keyof typeof categoryIconConfig]
            const Icon = config?.icon ?? Code2

            return (
              <button
                key={category.id}
                type="button"
                onClick={() => toggleCategory(category.slug)}
                className={cn(
                  'flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-left text-[12px] leading-4 transition-all',
                  active
                    ? 'border border-primary/20 bg-primary/10 font-semibold text-primary'
                    : 'text-gray-60 hover:bg-background hover:text-gray-100',
                )}
              >
                <Icon size={13} className={active ? 'text-primary' : config?.color} />
                {category.name}
              </button>
            )
          })}
        </div>
      </FilterSection>

      <div className="border-t border-[var(--color-gray-10)]" />

      <FilterSection
        label="Technology"
        count={selectedTechnologies.length}
        expanded={technologiesExpanded}
        onToggle={() => setTechnologiesExpanded((value) => !value)}
      >
        <div className="flex flex-wrap gap-1.5">
          {technologies.map((technology) => {
            const active = selectedTechnologies.includes(technology.slug)

            return (
              <button
                key={technology.id}
                type="button"
                onClick={() => toggleTechnology(technology.slug)}
                className={cn(
                  'cursor-pointer rounded-lg border px-2.5 py-1 font-mono text-[11px] leading-4 transition-all',
                  active
                    ? 'border-primary/30 bg-primary/10 font-semibold text-primary'
                    : 'border-[var(--color-gray-10)] text-gray-60 hover:bg-background hover:text-gray-100',
                )}
              >
                {technology.name}
              </button>
            )
          })}
        </div>
      </FilterSection>

      <div className="rounded-2xl border border-primary/25 bg-primary/5 p-4">
        <div className="mb-2 flex items-center gap-2">
          <Crown size={15} className="text-primary" />
          <span className="text-xs font-bold text-primary">Pro Plan</span>
        </div>
        <p className="body-small mb-3 text-gray-60">
          Unlock all Pro questions and expert answers.
        </p>
        <Link
          href="/pricing"
          className="block rounded-full bg-primary py-2 text-center text-xs font-semibold text-white transition-opacity hover:opacity-90"
        >
          Upgrade - from EUR 9/mo
        </Link>
      </div>
    </aside>
  )
}

type FilterSectionProps = {
  label: string
  count: number
  expanded: boolean
  onToggle: () => void
  children: React.ReactNode
}

const FilterSection = ({
  label,
  count,
  expanded,
  onToggle,
  children,
}: FilterSectionProps) => (
  <div>
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={expanded}
      className="mb-2.5 flex w-full cursor-pointer items-center justify-between"
    >
      <span className="font-mono text-[11px] leading-4 font-semibold tracking-[1.2px] text-gray-60 uppercase">
        {label} {count > 0 && <span className="text-primary">({count})</span>}
      </span>
      <ChevronDown
        size={13}
        className={cn('text-gray-60 transition-transform', expanded && 'rotate-180')}
      />
    </button>
    <AnimatePresence initial={false}>
      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="overflow-hidden"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  </div>
)

export const QuestionsBrowse = () => {
  const [search, setSearch] = useState('')
  const [grade, setGrade] = useState<GradeFilter>('all')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedTechnologies, setSelectedTechnologies] = useState<string[]>([])
  const [questions, setQuestions] = useState<QuestionPreview[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [technologies, setTechnologies] = useState<Technology[]>([])
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    pageSize: PAGE_SIZE,
    total: 0,
  })
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string>()
  const [reloadToken, setReloadToken] = useState(0)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [details, setDetails] = useState<Record<string, QuestionDetailData>>({})
  const [detailLoadingId, setDetailLoadingId] = useState<string | null>(null)
  const [detailErrors, setDetailErrors] = useState<Record<string, string>>({})
  const [savedIds, setSavedIds] = useState<Set<string>>(() => new Set())
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  useEffect(() => {
    const controller = new AbortController()

    void Promise.all([
      fetchCategories(controller.signal),
      fetchTechnologies(controller.signal),
    ])
      .then(([categoryData, technologyData]) => {
        setCategories(categoryData)
        setTechnologies(technologyData)
      })
      .catch((requestError: unknown) => {
        if (requestError instanceof DOMException && requestError.name === 'AbortError') return
        setError('Could not load question filters. Make sure the API is running.')
      })

    return () => controller.abort()
  }, [])

  useEffect(() => {
    document.body.style.overflow = mobileFiltersOpen ? 'hidden' : ''

    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileFiltersOpen])

  useEffect(() => {
    const controller = new AbortController()
    const timeout = window.setTimeout(
      () => {
        setLoading(true)
        setError(undefined)

        void fetchQuestions(
          {
            categorySlugs: selectedCategories,
            technologySlugs: selectedTechnologies,
            difficulty: grade === 'all' ? undefined : grade,
            search,
            page: 1,
            pageSize: PAGE_SIZE,
          },
          controller.signal,
        )
          .then((response) => {
            setQuestions(response.data)
            setPagination(response.pagination)
            setExpandedId(null)
          })
          .catch((requestError: unknown) => {
            if (requestError instanceof DOMException && requestError.name === 'AbortError') return
            setError('Could not load questions. Make sure the API is running on port 4000.')
          })
          .finally(() => {
            if (!controller.signal.aborted) setLoading(false)
          })
      },
      search ? 300 : 0,
    )

    return () => {
      window.clearTimeout(timeout)
      controller.abort()
    }
  }, [grade, reloadToken, search, selectedCategories, selectedTechnologies])

  const visibleTechnologies = useMemo(() => {
    if (selectedCategories.length === 0) return technologies

    return technologies.filter(
      (technology) =>
        technology.category && selectedCategories.includes(technology.category.slug),
    )
  }, [selectedCategories, technologies])

  const toggleValue = (
    value: string,
    setValues: React.Dispatch<React.SetStateAction<string[]>>,
  ) => {
    setValues((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value],
    )
  }

  const toggleSave = (id: string, event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    setSavedIds((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const loadDetail = async (question: QuestionPreview) => {
    if (question.locked || details[question.id]) return

    setDetailLoadingId(question.id)
    setDetailErrors((current) => {
      const next = { ...current }
      delete next[question.id]
      return next
    })

    try {
      const detail = await fetchQuestion(question.slug)
      setDetails((current) => ({ ...current, [question.id]: detail }))
    } catch {
      setDetailErrors((current) => ({
        ...current,
        [question.id]: 'The answer could not be loaded.',
      }))
    } finally {
      setDetailLoadingId((current) => (current === question.id ? null : current))
    }
  }

  const toggleQuestion = (question: QuestionPreview) => {
    const willExpand = expandedId !== question.id
    setExpandedId(willExpand ? question.id : null)

    if (willExpand) void loadDetail(question)
  }

  const loadMore = async () => {
    const nextPage = pagination.page + 1
    setLoadingMore(true)

    try {
      const response = await fetchQuestions({
        categorySlugs: selectedCategories,
        technologySlugs: selectedTechnologies,
        difficulty: grade === 'all' ? undefined : grade,
        search,
        page: nextPage,
        pageSize: PAGE_SIZE,
      })
      setQuestions((current) => [...current, ...response.data])
      setPagination(response.pagination)
    } catch {
      setError('Could not load more questions.')
    } finally {
      setLoadingMore(false)
    }
  }

  const hasActiveFilters =
    grade !== 'all' ||
    selectedCategories.length > 0 ||
    selectedTechnologies.length > 0

  const clearAll = () => {
    setGrade('all')
    setSelectedCategories([])
    setSelectedTechnologies([])
    setSearch('')
  }

  const activeChips = [
    ...(grade !== 'all'
      ? [{ label: gradeConfig[grade].label, onRemove: () => setGrade('all') }]
      : []),
    ...selectedCategories.map((slug) => ({
      label: categories.find((category) => category.slug === slug)?.name ?? slug,
      onRemove: () => toggleValue(slug, setSelectedCategories),
    })),
    ...selectedTechnologies.map((slug) => ({
      label: technologies.find((technology) => technology.slug === slug)?.name ?? slug,
      onRemove: () => toggleValue(slug, setSelectedTechnologies),
    })),
  ]

  const filterSidebarProps: FilterSidebarProps = {
    grade,
    setGrade,
    categories,
    selectedCategories,
    toggleCategory: (slug) => toggleValue(slug, setSelectedCategories),
    technologies: visibleTechnologies,
    selectedTechnologies,
    toggleTechnology: (slug) => toggleValue(slug, setSelectedTechnologies),
    onClearAll: clearAll,
    hasActiveFilters,
  }

  const hasMore = questions.length < pagination.total

  return (
    <main className="dashboard-container max-w-7xl">
      <div className="sticky top-16 z-30 -mx-4 border-b border-[var(--color-gray-10)] bg-white/95 px-4 py-4 backdrop-blur-md md:top-0 lg:-mx-8 lg:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative min-w-0 flex-1">
            <Search
              size={15}
              className="absolute top-1/2 left-3.5 -translate-y-1/2 text-gray-60"
            />
            <input
              type="search"
              aria-label="Search questions"
              placeholder="Search questions, topics, technologies..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full rounded-xl border border-[var(--color-gray-10)] bg-white py-2.5 pr-10 pl-10 text-[14px] leading-[22px] text-gray-100 outline-none transition-all placeholder:text-gray-60 focus:border-primary/50 focus:ring-4 focus:ring-primary/10"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                aria-label="Clear search"
                title="Clear search"
                className="absolute top-1/2 right-3 flex size-6 -translate-y-1/2 cursor-pointer items-center justify-center text-gray-60 transition-colors hover:text-gray-100"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="ml-auto flex items-center gap-2">
            <span className="hidden font-mono text-[11px] leading-4 text-gray-60 sm:block">
              <span className="font-semibold text-gray-100">{questions.length}</span> /{' '}
              {pagination.total} questions
            </span>
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(true)}
              className={cn(
                'flex cursor-pointer items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition-all lg:hidden',
                hasActiveFilters
                  ? 'border-primary/30 bg-primary/10 text-primary'
                  : 'border-[var(--color-gray-10)] text-gray-60 hover:bg-background hover:text-gray-100',
              )}
            >
              <Filter size={13} />
              Filters
              {activeChips.length > 0 && (
                <span className="flex size-4 items-center justify-center rounded-full bg-primary text-[10px] text-white">
                  {activeChips.length}
                </span>
              )}
            </button>
          </div>
        </div>

        <AnimatePresence initial={false}>
          {activeChips.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-3 flex flex-wrap gap-2 overflow-hidden"
            >
              {activeChips.map((chip) => (
                <span
                  key={chip.label}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/10 px-2.5 py-1 font-mono text-xs text-primary"
                >
                  {chip.label}
                  <button
                    type="button"
                    onClick={chip.onRemove}
                    aria-label={`Remove ${chip.label} filter`}
                    className="cursor-pointer transition-opacity hover:opacity-60"
                  >
                    <X size={10} />
                  </button>
                </span>
              ))}
              <button
                type="button"
                onClick={clearAll}
                className="cursor-pointer text-xs text-gray-60 transition-colors hover:text-gray-100"
              >
                Clear all
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex gap-8 py-8">
        <div className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-24">
            <FilterSidebar {...filterSidebarProps} />
          </div>
        </div>

        <AnimatePresence>
          {mobileFiltersOpen && (
            <>
              <motion.button
                type="button"
                aria-label="Close filters"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileFiltersOpen(false)}
                className="fixed inset-0 z-40 cursor-default bg-black/50 lg:hidden"
              />
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="fixed inset-y-0 left-0 z-50 w-[min(20rem,88vw)] overflow-y-auto border-r border-[var(--color-gray-10)] bg-white p-5 lg:hidden"
              >
                <div className="mb-5 flex items-center justify-between">
                  <span className="font-semibold text-gray-100">Filters</span>
                  <button
                    type="button"
                    onClick={() => setMobileFiltersOpen(false)}
                    aria-label="Close filters"
                    title="Close filters"
                    className="flex size-8 cursor-pointer items-center justify-center rounded-lg text-gray-60 transition-colors hover:bg-background hover:text-gray-100"
                  >
                    <X size={16} />
                  </button>
                </div>
                <FilterSidebar {...filterSidebarProps} />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <section className="min-w-0 flex-1" aria-label="Questions">
          <div className="mb-4 flex items-center justify-between">
            <p className="font-mono text-[12px] leading-4 text-gray-60">
              <span className="font-semibold text-gray-100">{pagination.total}</span> questions
              {hasActiveFilters && ' matching filters'}
            </p>
          </div>

          {loading ? (
            <div className="space-y-3" aria-label="Loading questions">
              {Array.from({ length: 6 }, (_, index) => (
                <div
                  key={index}
                  className="h-32 animate-pulse rounded-2xl border border-[var(--color-gray-10)] bg-[var(--color-gray-05)]"
                />
              ))}
            </div>
          ) : error && questions.length === 0 ? (
            <div className="py-24 text-center">
              <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-white">
                <RefreshCw size={22} className="text-gray-60" />
              </div>
              <p className="mb-1 text-sm font-semibold text-gray-100">
                Questions are unavailable
              </p>
              <p className="body-small mb-4 text-gray-60">{error}</p>
              <button
                type="button"
                onClick={() => setReloadToken((current) => current + 1)}
                className="cursor-pointer text-xs font-medium text-primary hover:underline"
              >
                Try again
              </button>
            </div>
          ) : questions.length === 0 ? (
            <div className="py-24 text-center">
              <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-white">
                <Search size={22} className="text-gray-60" />
              </div>
              <p className="mb-1 text-sm font-semibold text-gray-100">No questions found</p>
              <p className="body-small mb-4 text-gray-60">
                Try adjusting your filters or search query.
              </p>
              <button
                type="button"
                onClick={clearAll}
                className="cursor-pointer text-xs font-medium text-primary hover:underline"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <>
              <motion.div layout className="space-y-3">
                {questions.map((question, index) => (
                  <QuestionCard
                    key={question.id}
                    question={question}
                    index={index}
                    expanded={expandedId === question.id}
                    saved={savedIds.has(question.id)}
                    detail={details[question.id]}
                    detailLoading={detailLoadingId === question.id}
                    detailError={detailErrors[question.id]}
                    onToggle={() => toggleQuestion(question)}
                    onRetry={() => void loadDetail(question)}
                    onSave={(event) => toggleSave(question.id, event)}
                  />
                ))}
              </motion.div>

              {hasMore && (
                <div className="mt-6 flex justify-center">
                  <button
                    type="button"
                    onClick={() => void loadMore()}
                    disabled={loadingMore}
                    className="flex cursor-pointer items-center gap-2 rounded-xl border border-[var(--color-gray-10)] bg-white px-5 py-2.5 text-sm font-semibold text-gray-100 transition-colors hover:border-primary/30 hover:text-primary disabled:cursor-wait disabled:opacity-60"
                  >
                    {loadingMore && <LoaderCircle size={15} className="animate-spin" />}
                    Load more
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  )
}
