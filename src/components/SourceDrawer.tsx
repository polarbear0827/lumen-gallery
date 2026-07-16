import { useEffect, useRef } from 'react'
import type { Artwork, Museum } from '../types'
import { CloseIcon, DownloadIcon, ExternalLinkIcon, InfoIcon } from './Icons'

interface SourceDrawerProps {
  artwork: Artwork
  museum: Museum
  onClose: () => void
}

const fields: Array<[string, keyof Artwork]> = [
  ['作品原名', 'originalTitle'],
  ['藝術家', 'artistBio'],
  ['年代', 'date'],
  ['媒材', 'medium'],
  ['尺寸', 'dimensions'],
  ['部門', 'department'],
  ['典藏編號', 'accessionNumber'],
  ['入藏資訊', 'creditLine'],
]

export function SourceDrawer({ artwork, museum, onClose }: SourceDrawerProps) {
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    closeRef.current?.focus()
  }, [])

  return (
    <aside className="source-drawer" role="dialog" aria-modal="true" aria-labelledby="source-title">
      <div className="drawer-header">
        <h2 id="source-title">作品資料與來源</h2>
        <button ref={closeRef} className="icon-button" type="button" onClick={onClose} aria-label="關閉作品資料">
          <CloseIcon />
        </button>
      </div>

      <div className="drawer-content">
        <dl className="source-list">
          <div>
            <dt>作品</dt>
            <dd>{artwork.titleZh}</dd>
          </div>
          {fields.map(([label, key]) => (
            <div key={key}>
              <dt>{label}</dt>
              <dd className={key === 'originalTitle' ? 'latin' : undefined}>{artwork[key]}</dd>
            </div>
          ))}
          <div>
            <dt>典藏機構</dt>
            <dd><span>{museum.nameZh}</span><small lang="en">{museum.nameEn}</small></dd>
          </div>
          <div>
            <dt>授權</dt>
            <dd><a href={artwork.licenseUrl} target="_blank" rel="noreferrer">{artwork.licenseLabel}</a></dd>
          </div>
          <div>
            <dt>影像來源</dt>
            <dd>本站保存之官方開放影像顯示用副本；{artwork.imageAttribution}</dd>
          </div>
          <div>
            <dt>資料來源</dt>
            <dd>{museum.apiName}</dd>
          </div>
        </dl>

        <div className="source-actions">
          <a href={artwork.objectUrl} target="_blank" rel="noreferrer"><ExternalLinkIcon />查看館藏原頁</a>
          <a href={artwork.originalImageUrl} target="_blank" rel="noreferrer"><DownloadIcon />開啟原始影像</a>
          <a href={artwork.apiUrl} target="_blank" rel="noreferrer"><ExternalLinkIcon />檢視原始 API JSON</a>
        </div>

        <p className="disclosure-note"><InfoIcon />作品中譯由本站編輯，僅供瀏覽。完整權利、作品資訊與最新資料以典藏機構原頁及 API 回應為準。</p>
      </div>
    </aside>
  )
}
