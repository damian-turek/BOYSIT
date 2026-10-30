'use client'

import { Suspense, useEffect, useRef } from 'react'

import dynamic from 'next/dynamic'

import { Code2 } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { JobApplicationCard } from '@/components/molecules/JobApplicationCard/JobApplicationCard'
import { JobTrackerStatCard } from '@/components/molecules/JobTrackerStatCard/JobTrackerStatCard'
import { QuestionCard } from '@/components/molecules/QuestionCard/QuestionCard'

import styles from './Features.module.css'
import {
  type FeaturePreviewKind,
  previewJobs,
  previewQuestions,
  previewResult,
  previewSession,
} from './feature-preview-data'

const ExamRunner = dynamic(() =>
  import('@/components/organisms/ExamSession/ExamRunner').then((module) => module.ExamRunner),
)
const ExamResultView = dynamic(() =>
  import('@/components/organisms/ExamSession/ExamResultView').then(
    (module) => module.ExamResultView,
  ),
)
const FiltersContent = dynamic(() =>
  import('@/components/organisms/Filters/FiltersContent').then((module) => module.FiltersContent),
)

// All previews are inert. Required action callbacks cannot be triggered from the landing page.
const ignorePreviewAction = () => undefined

export const FeaturePreview = ({ kind, title }: { kind: FeaturePreviewKind; title: string }) => {
  const t = useTranslations('FeatureShowcase')
  const tq = useTranslations('QuestionsPage')
  const tj = useTranslations('JobTracker')
  const viewportRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return
    const resize = () =>
      viewport.style.setProperty('--screen-scale', String(viewport.clientWidth / 960))
    const observer = new ResizeObserver(resize)
    observer.observe(viewport)
    resize()
    return () => observer.disconnect()
  }, [])

  return (
    <figure className="min-w-0">
      <div className="overflow-hidden rounded-2xl border border-gray-10 bg-surface-raised shadow-[0_24px_64px_-32px_rgba(0,0,0,0.22)]">
        <div className="flex h-10 items-center justify-between gap-3 border-b border-gray-10 px-4 text-xs text-gray-60">
          <span className="inline-flex items-center gap-2 font-semibold text-gray-100">
            <Code2 size={15} className="text-primary" />
            PrepCode
          </span>
          <span className="truncate">{title}</span>
        </div>
        <div ref={viewportRef} className={styles.screenViewport} inert aria-hidden="true">
          <div className={styles.screenCanvas}>
            <Suspense fallback={null}>
              {(kind === 'questions' || kind === 'filters') && (
                <div className="flex items-start gap-7">
                  {kind === 'filters' && (
                    <aside className="w-60 shrink-0 [&>div]:py-0!">
                      <FiltersContent
                        categories={[
                          { id: 'frontend', name: 'Frontend', slug: 'frontend' },
                          { id: 'backend', name: 'Backend', slug: 'backend' },
                        ]}
                        technologies={[
                          { id: 'react', name: 'React', slug: 'react' },
                          { id: 'typescript', name: 'TypeScript', slug: 'typescript' },
                        ]}
                      />
                    </aside>
                  )}
                  <div className="min-w-0 flex-1 space-y-4">
                    <h1 className="mb-5 text-xl font-semibold text-gray-100">{tq('title')}</h1>
                    {previewQuestions.map((question, index) => (
                      <QuestionCard key={question.index} {...question} pageNumber={index + 1} />
                    ))}
                  </div>
                </div>
              )}
              {kind === 'exams' && (
                <ExamRunner session={previewSession} onCompleted={ignorePreviewAction} />
              )}
              {kind === 'jobs' && (
                <div className="space-y-5">
                  <header>
                    <h1 className="text-2xl font-semibold text-gray-100">{tj('title')}</h1>
                    <p className="mt-2 text-sm text-gray-60">{tj('description')}</p>
                  </header>
                  <div className="grid grid-cols-3 gap-3">
                    <JobTrackerStatCard label={tj('statuses.applied')} value={1} tone="blue" />
                    <JobTrackerStatCard label={tj('statuses.technical')} value={1} tone="amber" />
                    <JobTrackerStatCard label={tj('statuses.offer')} value={0} tone="green" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {previewJobs.map((application) => (
                      <JobApplicationCard
                        key={application.id}
                        application={application}
                        onEdit={ignorePreviewAction}
                        onDelete={ignorePreviewAction}
                        onHistory={ignorePreviewAction}
                        onStatusChange={ignorePreviewAction}
                      />
                    ))}
                  </div>
                </div>
              )}
              {kind === 'progress' && (
                <ExamResultView result={previewResult} catalogPath="#features-section" />
              )}
            </Suspense>
          </div>
        </div>
      </div>
      <figcaption className="mt-3 text-center text-[11px] text-gray-60">{t('preview')}</figcaption>
    </figure>
  )
}
