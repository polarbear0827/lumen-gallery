import type { Museum, MuseumId } from '../types'

interface MuseumFiltersProps {
  museums: Museum[]
  selected: MuseumId | 'all'
  loaded: Record<MuseumId, number>
  loading: Record<MuseumId, boolean>
  onChange: (museum: MuseumId | 'all') => void
}

export function MuseumFilters({ museums, selected, loaded, loading, onChange }: MuseumFiltersProps) {
  const allLoaded = Object.values(loaded).reduce((sum, value) => sum + value, 0)
  const anyLoading = Object.values(loading).some(Boolean)
  return (
    <div className="museum-filters" role="radiogroup" aria-label="依典藏機構篩選">
      <button role="radio" aria-checked={selected === 'all'} className={selected === 'all' ? 'is-active' : ''} onClick={() => onChange('all')}>
        <span>全部</span>
        <small>{allLoaded.toLocaleString('zh-TW')} 件繪畫／攝影{anyLoading ? ' · 載入中' : ''}</small>
      </button>
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
          <small>{loaded[museum.id].toLocaleString('zh-TW')} 件{loading[museum.id] ? ' · 載入中' : ''}</small>
        </button>
      ))}
    </div>
  )
}
