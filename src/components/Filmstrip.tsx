import { memo, useEffect, useRef } from 'react'
import type { Artwork } from '../types'

interface FilmstripProps {
  artworks: Artwork[]
  selectedId: string
  onSelect: (id: string) => void
  onImageError: (id: string) => void
}

export const Filmstrip = memo(function Filmstrip({ artworks, selectedId, onSelect, onImageError }: FilmstripProps) {
  const selectedRef = useRef<HTMLButtonElement | null>(null)
  const trackRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const selected = selectedRef.current
    const track = trackRef.current
    if (!selected || !track) return
    const target = selected.offsetLeft - (track.clientWidth - selected.offsetWidth) / 2
    track.scrollTo({ left: Math.max(0, target), behavior: 'smooth' })
  }, [selectedId])

  return (
    <div className="filmstrip" aria-label="作品縮圖列">
      <div ref={trackRef} className="filmstrip-track">
        {artworks.map((artwork) => {
          const selected = artwork.id === selectedId
          return (
            <button
              key={artwork.id}
              ref={selected ? selectedRef : undefined}
              type="button"
              className={selected ? 'is-selected' : ''}
              aria-current={selected ? 'true' : undefined}
              aria-label={`顯示《${artwork.titleZh}》`}
              onClick={() => onSelect(artwork.id)}
            >
              <img
                src={artwork.thumbnailUrl}
                alt=""
                width={artwork.aspectWidth}
                height={artwork.aspectHeight}
                loading={selected ? 'eager' : 'lazy'}
                decoding="async"
                draggable={false}
                onError={() => onImageError(artwork.id)}
              />
            </button>
          )
        })}
      </div>
    </div>
  )
})
