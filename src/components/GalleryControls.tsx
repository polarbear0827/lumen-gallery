import { ArrowLeftIcon, ArrowRightIcon } from './Icons'

interface GalleryControlsProps {
  current: number
  total: number
  onPrevious: () => void
  onNext: () => void
}

export function GalleryControls({ current, total, onPrevious, onNext }: GalleryControlsProps) {
  return (
    <div className="gallery-controls" aria-label="作品導覽">
      <button type="button" onClick={onPrevious} aria-label="上一件作品"><ArrowLeftIcon /></button>
      <p aria-live="polite"><strong>{String(current).padStart(2, '0')}</strong><span> / {String(total).padStart(2, '0')}</span></p>
      <button type="button" onClick={onNext} aria-label="下一件作品"><ArrowRightIcon /></button>
    </div>
  )
}
