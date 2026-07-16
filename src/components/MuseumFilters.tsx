import type { Museum, MuseumId } from '../types'

interface MuseumFiltersProps {
  museums: Museum[]
  selected: MuseumId | 'all'
  totals: Record<MuseumId, number | null>
  loaded: Record<MuseumId, number>
  loading: Record<MuseumId, boolean>
  onChange: (museum: MuseumId | 'all') => void
}

function formatCount(value: number | null) {
  return value === null ? '連線中' : value.toLocaleString('zh-TW')
}

export function MuseumFilters({ museums, selected, totals, loaded, loading, onChange }: MuseumFiltersProps) {
  const knownTotals = Object.values(totals).filter((value): value is number => value !== null)
  const allTotal = knownTotals.length > 0 ? knownTotals.reduce((sum, value) => sum + value, 0) : null
  const hasPendingTotal = knownTotals.length < Object.keys(totals).length
  const allLoaded = Object.values(loaded).reduce((sum, value) => sum + value, 0)
  return (
    <div className="museum-filters" role="radiogroup" aria-label="依典藏機構篩選">
      <button role="radio" aria-checked={selected === 'all'} className={selected === 'all' ? 'is-active' : ''} onClick={() => onChange('all')}>
        <span>全部</span>
        <small>{allLoaded} 已載入 · API {formatCount(allTotal)}{hasPendingTotal && allTotal !== null ? '+' : ''}</small>
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
          <small>{loaded[museum.id]} 已載入 · API {loading[museum.id] && totals[museum.id] === null ? '連線中' : formatCount(totals[museum.id])}</small>
        </button>
      ))}
    </div>
  )
}
