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
    <div className="flex gap-2 mt-8 justify-center">
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <Link
          key={page}
          href={createPageURL(page)}
          className={`px-3 transform duration-150 ease-in-out py-1 rounded-lg ${currentPage === page ? 'bg-primary text-white' : 'text-gray-100 border border-gray-60/30 hover:bg-gray-60/20'}`}
        >
          {page}
        </Link>
      ))}
    </div>
  )
}
