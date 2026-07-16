import { ArrowLeftIcon, ArrowRightIcon } from './Icons'

interface GalleryControlsProps {
  current: number
  total: number
  availableTotal: number | null
  isLoading: boolean
  onPrevious: () => void
  onNext: () => void
}

export function GalleryControls({ current, total, availableTotal, isLoading, onPrevious, onNext }: GalleryControlsProps) {
  return (
    <div className="gallery-controls" aria-label="作品導覽">
      <button type="button" onClick={onPrevious} aria-label="上一件作品"><ArrowLeftIcon /></button>
      <div className="gallery-count" aria-live="polite">
        <p><strong>{String(current).padStart(2, '0')}</strong><span> / 已載入 {total.toLocaleString('zh-TW')}</span></p>
        <small>
          API 資料池 {availableTotal?.toLocaleString('zh-TW') ?? '連線中'} 件
          {isLoading ? ' · 正在載入下一批' : ''}
        </small>
      </div>
      <button type="button" onClick={onNext} aria-label="下一件作品"><ArrowRightIcon /></button>
    </div>
  )
}
