import { forwardRef, useImperativeHandle, useLayoutEffect, useRef, useState } from 'react'
import type { Artwork } from '../types'

interface ArtworkStageProps {
  artwork: Artwork
  onSwipePrevious: () => void
  onSwipeNext: () => void
  onImageError: (id: string) => void
}

export const ArtworkStage = forwardRef<HTMLElement, ArtworkStageProps>(function ArtworkStage(
  { artwork, onSwipePrevious, onSwipeNext, onImageError },
  ref,
) {
  const stageRef = useRef<HTMLElement>(null)
  const [failed, setFailed] = useState(false)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [sourceSize, setSourceSize] = useState({ width: artwork.aspectWidth, height: artwork.aspectHeight })
  const [frameSize, setFrameSize] = useState<{ width: number; height: number } | null>(null)

  useImperativeHandle(ref, () => stageRef.current as HTMLElement, [])

  useLayoutEffect(() => {
    setFailed(false)
    setSourceSize({ width: artwork.aspectWidth, height: artwork.aspectHeight })
  }, [artwork.aspectHeight, artwork.aspectWidth, artwork.id])

  useLayoutEffect(() => {
    const stage = stageRef.current
    if (!stage) return
    const updateSize = () => {
      const bounds = stage.getBoundingClientRect()
      const inset = document.fullscreenElement === stage ? 0 : 20
      const availableWidth = Math.max(1, bounds.width - inset)
      const availableHeight = Math.max(1, bounds.height - inset)
      const ratio = sourceSize.width / sourceSize.height
      let width = availableWidth
      let height = width / ratio
      if (height > availableHeight) {
        height = availableHeight
        width = height * ratio
      }
      setFrameSize({ width: Math.round(width), height: Math.round(height) })
    }
    updateSize()
    const observer = new ResizeObserver(updateSize)
    observer.observe(stage)
    return () => observer.disconnect()
  }, [sourceSize.height, sourceSize.width])

  return (
    <figure
      ref={stageRef}
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
        style={{
          aspectRatio: `${sourceSize.width} / ${sourceSize.height}`,
          width: frameSize?.width,
          height: frameSize?.height,
        }}
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
            onLoad={(event) => {
              const image = event.currentTarget
              if (image.naturalWidth && image.naturalHeight) {
                setSourceSize({ width: image.naturalWidth, height: image.naturalHeight })
              }
            }}
            onError={() => {
              setFailed(true)
              onImageError(artwork.id)
            }}
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
