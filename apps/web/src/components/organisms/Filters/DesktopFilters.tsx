import { FiltersContent, FiltersContentProps } from './FiltersContent'

export const DesktopFilters = ({ categories, technologies }: FiltersContentProps) => {
  return (
    <aside className="hidden lg:block w-65 shrink-0 sticky top-24 h-[calc(100vh-100px)] overflow-y-auto pr-2 scrollbar-none">
      <FiltersContent categories={categories} technologies={technologies} />
    </aside>
  )
}
