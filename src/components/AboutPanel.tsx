import { useEffect, useRef } from 'react'
import type { Museum } from '../types'
import { CloseIcon, ExternalLinkIcon } from './Icons'

interface AboutPanelProps {
  museums: Museum[]
  onClose: () => void
}

export function AboutPanel({ museums, onClose }: AboutPanelProps) {
  const closeRef = useRef<HTMLButtonElement>(null)
  useEffect(() => closeRef.current?.focus(), [])

  return (
    <section className="overlay-panel about-panel" role="dialog" aria-modal="true" aria-labelledby="about-title">
      <div className="overlay-heading">
        <div>
          <h2 id="about-title">關於光室</h2>
          <p>讓開放典藏回到作品本身：完整觀看、清楚署名、可追溯來源。</p>
        </div>
        <button ref={closeRef} className="icon-button" type="button" onClick={onClose} aria-label="關閉關於頁"><CloseIcon /></button>
      </div>

      <div className="about-layout">
        <div className="about-intro">
          <p>光室是一座純前端數位畫廊，精選三間博物館的公共領域／CC0 作品。本站不裁切、不變形、不以色彩濾鏡改動畫作；畫面不足時只會等比例縮小，且不會超過來源影像的自然尺寸。</p>
          <p>所有作品資料於 2026 年 7 月 16 日由官方 API 核對。影像不存放於本程式庫，而是由博物館官方影像服務即時提供。</p>
        </div>

        <div className="api-list">
          {museums.map((museum) => (
            <article key={museum.id}>
              <h3>{museum.nameZh}</h3>
              <p lang="en">{museum.nameEn}</p>
              <a href={museum.apiDocsUrl} target="_blank" rel="noreferrer">{museum.apiName}<ExternalLinkIcon /></a>
            </article>
          ))}
        </div>

        <div className="about-details">
          <section>
            <h3>影像與授權</h3>
            <p>本展只收錄 API 明確標記為公共領域或 CC0 的作品。個別作品的授權狀態、署名、原始影像與館藏頁均列於「作品資料與來源」。若官方紀錄後續更新，以官方資料為準。</p>
          </section>
          <section>
            <h3>鍵盤操作</h3>
            <p><kbd>←</kbd><kbd>→</kbd> 切換作品 · <kbd>Home</kbd><kbd>End</kbd> 首末件 · <kbd>I</kbd> 資料來源 · <kbd>F</kbd> 全螢幕 · <kbd>Esc</kbd> 關閉面板</p>
          </section>
          <section>
            <h3>技術與隱私</h3>
            <p>本站不使用 Cookie、不設分析追蹤、不收集個人資料。作品影像會向三間博物館的官方網域提出請求，因此其伺服器可能取得一般網路請求資訊。</p>
          </section>
        </div>
      </div>
    </section>
  )
}
