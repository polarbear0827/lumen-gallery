import type { Museum, MuseumId } from '../types'

interface MuseumFiltersProps {
  museums: Museum[]
  selected: MuseumId | 'all'
  onChange: (museum: MuseumId | 'all') => void
}

export function MuseumFilters({ museums, selected, onChange }: MuseumFiltersProps) {
  return (
    <div className="museum-filters" role="radiogroup" aria-label="依典藏機構篩選">
      <button role="radio" aria-checked={selected === 'all'} className={selected === 'all' ? 'is-active' : ''} onClick={() => onChange('all')}>全部</button>
      {museums.map((museum) => (
        <button
          key={museum.id}
          role="radio"
          aria-checked={selected === museum.id}
          className={selected === museum.id ? 'is-active' : ''}
          onClick={() => onChange(museum.id)}
        >
          <span className="filter-desktop-label">{museum.id === 'met' ? museum.shortName : museum.nameZh}</span>
          <span className="filter-mobile-label">{museum.shortName}</span>
        </button>
      ))}
    </div>
  )
}
