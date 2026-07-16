import type { RefObject } from 'react'
import type { Artwork, Museum } from '../types'
import { DocumentIcon } from './Icons'

interface ArtworkMetaProps {
  artwork: Artwork
  museum: Museum
  detailsButtonRef: RefObject<HTMLButtonElement | null>
  onDetails: () => void
}

export function ArtworkMeta({ artwork, museum, detailsButtonRef, onDetails }: ArtworkMetaProps) {
  return (
    <section className="artwork-meta" aria-labelledby="artwork-title">
      <div className="artwork-copy">
        <h1 id="artwork-title">{artwork.titleZh}</h1>
        <div className="metadata-line">
          <span>{artwork.artist}</span>
          <span aria-hidden="true" className="metadata-divider" />
          <span>{artwork.date}</span>
          <span aria-hidden="true" className="metadata-divider" />
          <span lang="en">{museum.nameEn}</span>
        </div>
      </div>
      <button ref={detailsButtonRef} className="details-button" type="button" onClick={onDetails}>
        <DocumentIcon />
        作品資料與來源
      </button>
    </section>
  )
}
