import { useEffect, useRef } from 'react'
import type { Artwork, Museum } from '../types'
import { CloseIcon } from './Icons'

interface CollectionPanelProps {
  artworks: Artwork[]
  museumById: Map<string, Museum>
  onSelect: (id: string) => void
  onClose: () => void
}

export function CollectionPanel({ artworks, museumById, onSelect, onClose }: CollectionPanelProps) {
  const closeRef = useRef<HTMLButtonElement>(null)
  useEffect(() => closeRef.current?.focus(), [])

  return (
    <section className="overlay-panel collection-panel" role="dialog" aria-modal="true" aria-labelledby="collection-title">
      <div className="overlay-heading">
        <div>
          <h2 id="collection-title">典藏</h2>
          <p>十二件開放典藏作品，所有影像皆直接取自典藏機構官方伺服器。</p>
        </div>
        <button ref={closeRef} className="icon-button" type="button" onClick={onClose} aria-label="關閉典藏"><CloseIcon /></button>
      </div>
      <div className="collection-grid">
        {artworks.map((artwork, index) => (
          <button key={artwork.id} type="button" onClick={() => onSelect(artwork.id)}>
            <span className="collection-image-wrap" style={{ aspectRatio: `${artwork.aspectWidth} / ${artwork.aspectHeight}` }}>
              <img src={artwork.thumbnailUrl} alt="" width={artwork.aspectWidth} height={artwork.aspectHeight} loading={index < 6 ? 'eager' : 'lazy'} decoding="async" />
            </span>
            <span className="collection-copy">
              <strong>{artwork.titleZh}</strong>
              <span>{artwork.artist}，{artwork.date}</span>
              <small>{museumById.get(artwork.museumId)?.nameZh}</small>
            </span>
          </button>
        ))}
      </div>
    </section>
  )
}
