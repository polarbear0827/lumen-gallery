import { ArrowLeftIcon, ArrowRightIcon, PauseIcon, PlayIcon } from './Icons'

interface GalleryControlsProps {
  current: number
  total: number
  isLoading: boolean
  isSlideshow: boolean
  onPrevious: () => void
  onNext: () => void
  onSlideshowToggle: () => void
}

export function GalleryControls({
  current,
  total,
  isLoading,
  isSlideshow,
  onPrevious,
  onNext,
  onSlideshowToggle,
}: GalleryControlsProps) {
  return (
    <div className="gallery-controls" aria-label="作品導覽">
      <button type="button" onClick={onPrevious} aria-label="上一件作品"><ArrowLeftIcon /></button>
      <div className="gallery-count" aria-live="polite">
        <p><strong>{String(current).padStart(2, '0')}</strong><span> / 已載入 {total.toLocaleString('zh-TW')}</span></p>
        <small>
          僅含繪畫與攝影
          {isLoading ? ' · 正在載入下一批' : ''}
        </small>
      </div>
      <button className="next-button" type="button" onClick={onNext} aria-label="下一件作品"><ArrowRightIcon /></button>
      <button
        className="slideshow-toggle"
        type="button"
        aria-pressed={isSlideshow}
        aria-label={isSlideshow ? '暫停輪播模式' : '開啟輪播模式'}
        onClick={onSlideshowToggle}
      >
        {isSlideshow ? <PauseIcon /> : <PlayIcon />}
        <span>{isSlideshow ? '暫停輪播' : '輪播模式'}</span>
        <small>{isSlideshow ? '每 6 秒切換' : '自動播放'}</small>
      </button>
    </div>
  )
}
