'use client'

import { useId } from 'react'

import type { CompanyLogo } from '@/config/company-logos'

import styles from './CompanyMarquee.module.css'

export const CompanyMarquee = ({
  label,
  companies,
}: {
  label: string
  companies: CompanyLogo[]
}) => {
  const labelId = useId()

  if (companies.length === 0) return null

  return (
    <div className={styles.marquee}>
      <div className={styles.heading}>
        <p
          id={labelId}
          className="text-center font-mono text-[11px] tracking-wider text-gray-60 uppercase"
        >
          {label}
        </p>
      </div>
      <div className={styles.viewport} role="region" aria-labelledby={labelId}>
        <div className={styles.track}>
          {[0, 1].map((copy) => (
            <ul key={copy} className={styles.group} aria-hidden={copy === 1 ? true : undefined}>
              {companies.map((company) => (
                <li key={company.name} className={styles.brand}>
                  <span
                    className={company.wordmark ? styles.wordmark : styles.logo}
                    style={{ maskImage: `url("${company.logo.src}")` }}
                    aria-hidden="true"
                  />
                  <span className={company.wordmark ? 'sr-only' : undefined}>{company.name}</span>
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </div>
  )
}
