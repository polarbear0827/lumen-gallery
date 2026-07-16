import { forwardRef, useState } from 'react'
import type { Artwork } from '../types'

interface ArtworkStageProps {
  artwork: Artwork
  onSwipePrevious: () => void
  onSwipeNext: () => void
}

export const ArtworkStage = forwardRef<HTMLElement, ArtworkStageProps>(function ArtworkStage(
  { artwork, onSwipePrevious, onSwipeNext },
  ref,
) {
  const [failed, setFailed] = useState(false)
  const [touchStart, setTouchStart] = useState<number | null>(null)

  return (
    <figure
      ref={ref}
      className="artwork-stage"
      onTouchStart={(event) => setTouchStart(event.changedTouches[0]?.clientX ?? null)}
      onTouchEnd={(event) => {
        if (touchStart === null) return
        const distance = (event.changedTouches[0]?.clientX ?? touchStart) - touchStart
        if (Math.abs(distance) > 48) {
          if (distance > 0) onSwipePrevious()
          else onSwipeNext()
        }
        setTouchStart(null)
      }}
    >
      <div
        className="artwork-frame"
        style={{ aspectRatio: `${artwork.aspectWidth} / ${artwork.aspectHeight}` }}
      >
        {failed ? (
          <div className="image-error" role="status">
            <span>影像暫時無法載入</span>
            <a href={artwork.originalImageUrl} target="_blank" rel="noreferrer">直接開啟原始影像</a>
          </div>
        ) : (
          <img
            src={artwork.displayImageUrl}
            alt={`${artwork.titleZh}，${artwork.artist}，${artwork.date}`}
            width={artwork.aspectWidth}
            height={artwork.aspectHeight}
            onError={() => setFailed(true)}
            draggable={false}
            decoding="async"
            fetchPriority="high"
          />
        )}
      </div>
      <figcaption className="sr-only">{artwork.imageAttribution}</figcaption>
    </figure>
  )
})
