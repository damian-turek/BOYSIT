'use client'

import { useEffect, useId, useRef, useState } from 'react'

import { ArrowDown } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { FeaturePreview } from './FeaturePreview'
import styles from './Features.module.css'
import type { FeaturePreviewKind } from './feature-preview-data'

export type FeaturesProps = {
  label: string
  title: string
  description: string
  tiles: { preview: FeaturePreviewKind }[]
}

const PINNED_QUERY =
  '(min-width: 1024px) and (min-height: 750px) and (prefers-reduced-motion: no-preference)'

export const Features = ({ label, title, tiles }: FeaturesProps) => {
  const t = useTranslations('FeatureShowcase')
  const headingId = useId()
  const trackRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const count = tiles.length
  const currentIndex = Math.min(activeIndex, Math.max(0, count - 1))
  const active = tiles[currentIndex]

  useEffect(() => {
    const track = trackRef.current
    const stage = stageRef.current
    if (!track || !stage || count === 0) return

    const media = window.matchMedia(PINNED_QUERY)
    let frame: number | null = null
    const update = () => {
      frame = null
      if (!media.matches) return
      const travel = track.offsetHeight - stage.offsetHeight
      const stickyTop = Number.parseFloat(getComputedStyle(stage).top) || 64
      const progress = Math.max(
        0,
        Math.min(1, (stickyTop - track.getBoundingClientRect().top) / travel),
      )
      setActiveIndex(Math.min(count - 1, Math.floor(progress * count)))
    }
    const schedule = () => {
      if (frame === null) frame = requestAnimationFrame(update)
    }
    const resize = new ResizeObserver(schedule)
    resize.observe(track)
    resize.observe(stage)
    window.addEventListener('scroll', schedule, { passive: true })
    media.addEventListener('change', schedule)
    schedule()
    return () => {
      if (frame !== null) cancelAnimationFrame(frame)
      resize.disconnect()
      window.removeEventListener('scroll', schedule)
      media.removeEventListener('change', schedule)
    }
  }, [count])

  const selectFeature = (index: number) => {
    const track = trackRef.current
    const stage = stageRef.current
    if (track && stage && window.matchMedia(PINNED_QUERY).matches) {
      const travel = track.offsetHeight - stage.offsetHeight
      const stickyTop = Number.parseFloat(getComputedStyle(stage).top) || 64
      window.scrollTo({
        top:
          window.scrollY +
          track.getBoundingClientRect().top -
          stickyTop +
          (index / count) * travel +
          1,
        behavior: 'instant',
      })
    }
    setActiveIndex(index)
  }

  if (!active) return null

  return (
    <section
      id="features-section"
      ref={trackRef}
      aria-label={title}
      className={styles.track}
      style={{ '--feature-count': count } as React.CSSProperties}
    >
      <div ref={stageRef} className={styles.stage}>
        <div className={styles.inner}>
          <div className="flex items-center justify-between gap-4 border-b border-gray-10 pb-5">
            <span className="text-sm font-medium text-gray-60">{label}</span>
            <span className="font-mono text-xs text-gray-60 tabular-nums">
              {String(currentIndex + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}
            </span>
          </div>

          <div className={styles.body}>
            <nav aria-label={t('navigation')} className={styles.navigation}>
              <div className={styles.stepList}>
                {tiles.map((tile, index) => (
                  <button
                    key={tile.preview}
                    type="button"
                    onClick={() => selectFeature(index)}
                    aria-label={t(`items.${tile.preview}.title`)}
                    title={t(`items.${tile.preview}.title`)}
                    aria-current={index === currentIndex ? 'step' : undefined}
                    className={styles.step}
                  >
                    <span className={styles.dot} aria-hidden="true" />
                  </button>
                ))}
                <span
                  aria-hidden="true"
                  className={styles.activeDot}
                  style={{ transform: `translateY(${currentIndex * 44}px)` }}
                />
              </div>
            </nav>
            <div key={currentIndex} className={styles.slide} aria-labelledby={headingId}>
              <div className={styles.copy}>
                <p className="mb-5 font-mono text-sm text-primary" aria-hidden="true">
                  / {String(currentIndex + 1).padStart(2, '0')}
                </p>
                <h2 id={headingId} className={styles.heading}>
                  {t(`items.${active.preview}.title`)}
                </h2>
                <p className="mt-6 max-w-[38ch] text-base leading-7 text-gray-60 md:text-lg">
                  {t(`items.${active.preview}.description`)}
                </p>
                <p className={`${styles.scrollHint} mt-10 items-center gap-2 text-xs text-gray-60`}>
                  <ArrowDown size={14} aria-hidden="true" />
                  {t('scrollHint')}
                </p>
              </div>
              <FeaturePreview kind={active.preview} title={t(`items.${active.preview}.title`)} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
