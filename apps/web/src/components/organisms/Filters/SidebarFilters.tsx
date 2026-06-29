'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

const SENIORITY_LEVELS = ['All levels', 'Junior', 'Regular', 'Senior']
const DOMAINS = ['JavaScript/TypeScript', 'Algorithms', 'System Design', 'Databases', 'Architecture', 'CSS & HTML', 'Security', 'DevOps', 'Performance', 'Testing', 'Concurrency']
const COMPANIES = ['Google', 'Meta', 'Amazon', 'Microsoft', 'Yandex', 'JetBrains', 'Allegro', 'Avito', 'Tinkoff', 'Wildberries', '2GIS', 'Kaspersky']

export const SidebarFilters = () => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [isMounted, setIsMounted] = useState(false)
  
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const currentSeniority = searchParams.get('seniority') || 'All levels'
  const currentDomains = searchParams.getAll('domain')
  const currentCompanies = searchParams.getAll('company')
  
  const updateFilter = (key: string, value: string, isMultiple: boolean = false) => {
    const params = new URLSearchParams(searchParams.toString())

    if (!isMultiple) {
      if (value === 'All levels') {
        params.delete(key)
      } else {
        params.set(key, value)
      }
    } else {
      const existingValues = params.getAll(key)
      params.delete(key) 
      
      if (existingValues.includes(value)) {
        existingValues.filter(v => v !== value).forEach(v => params.append(key, v))
      } else {
        existingValues.push(value)
        existingValues.forEach(v => params.append(key, v))
      }
    }

    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  if (!isMounted) {
    return (
      <aside className="w-full flex flex-col gap-8 bg-white pr-4">
        <div className="h-40 bg-gray-50 rounded-xl animate-pulse w-full"></div>
        <div className="h-60 bg-gray-50 rounded-xl animate-pulse w-full"></div>
      </aside>
    )
  }

  return (
    <aside className="w-full flex flex-col gap-8 bg-white pr-4">
      {/* SENIORITY */}
      <div>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Seniority</h3>
        <div className="flex flex-col gap-3">
          {SENIORITY_LEVELS.map((level) => {
            const isSelected = currentSeniority === level
            return (
              <label key={level} className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="seniority"
                  checked={isSelected}
                  onChange={() => updateFilter('seniority', level, false)}
                  className="hidden" 
                />
                <span className={`px-4 py-2 rounded-xl w-full transition-colors ${
                  isSelected ? "bg-blue-50 text-blue-600 font-medium" : "text-gray-600 hover:bg-gray-50"
                }`}>
                  {level}
                </span>
              </label>
            )
          })}
        </div>
      </div>

      {/* DOMAIN */}
      <div>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Domain</h3>
        <div className="flex flex-col gap-3">
          {DOMAINS.map((domain) => (
            <label key={domain} className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={currentDomains.includes(domain)}
                onChange={() => updateFilter('domain', domain, true)}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{domain}</span>
            </label>
          ))}
        </div>
      </div>

      {/* COMPANY */}
      <div>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Company</h3>
        <div className="flex flex-wrap gap-2">
          {COMPANIES.map((company) => {
            const isSelected = currentCompanies.includes(company)
            return (
              <button
                key={company}
                onClick={() => updateFilter('company', company, true)}
                className={`px-3 py-1.5 text-xs border rounded-full transition-colors ${
                  isSelected 
                    ? 'bg-blue-50 border-blue-200 text-blue-700 font-medium'
                    : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                {company}
              </button>
            )
          })}
        </div>
      </div>
    </aside>
  )
}