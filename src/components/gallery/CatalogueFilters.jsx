import { CATEGORY_LABELS } from '../../data/artworks'

export default function CatalogueFilters({ categories, activeCategory, onCategoryChange }) {
  return (
    <div role="group" aria-label="Filter by category" className="flex flex-wrap gap-2">
      {categories.map((cat) => {
        const isActive = activeCategory === cat
        return (
          <button
            key={cat}
            type="button"
            onClick={() => onCategoryChange(cat)}
            aria-pressed={isActive}
            className={`rounded-full px-5 py-2.5 text-sm font-medium transition-colors duration-200 ${
              isActive ? 'bg-ink text-white' : 'glass text-zinc-700 hover:bg-white/85'
            }`}
          >
            {CATEGORY_LABELS[cat] || cat}
          </button>
        )
      })}
    </div>
  )
}
