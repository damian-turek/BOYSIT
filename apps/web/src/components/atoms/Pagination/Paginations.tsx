'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'

export const Pagination = ({
  currentPage,
  totalPages,
}: {
  currentPage: number
  totalPages: number
}) => {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams)
    params.set('page', pageNumber.toString())
    return `${pathname}?${params.toString()}`
  }

  return (
    <div className="flex flex-wrap gap-2 mt-8 justify-center">
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <Link
          key={page}
          href={createPageURL(page)}
          aria-current={currentPage === page ? 'page' : undefined}
          className={`inline-flex min-h-10 min-w-10 items-center justify-center rounded-xl border px-3 py-1 tabular-nums transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary motion-reduce:transition-none ${currentPage === page ? 'border-primary bg-primary text-on-primary' : 'border-gray-10 bg-surface text-gray-100 hover:border-border-strong hover:bg-surface-hover'}`}
        >
          {page}
        </Link>
      ))}
    </div>
  )
}
