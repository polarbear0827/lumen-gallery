import { ExpandIcon, MenuIcon } from './Icons'

export type ViewName = 'gallery' | 'collection' | 'about'

interface HeaderProps {
  activeView: ViewName
  isFullscreen: boolean
  isMenuOpen: boolean
  onViewChange: (view: ViewName) => void
  onFullscreen: () => void
  onMenuToggle: () => void
}

export function Header({ activeView, isFullscreen, isMenuOpen, onViewChange, onFullscreen, onMenuToggle }: HeaderProps) {
  return (
    <header className="site-header">
      <button className="brand" type="button" onClick={() => onViewChange('gallery')} aria-label="返回展覽">
        光室
      </button>

      <nav className="desktop-nav" aria-label="主要導覽">
        <button className={activeView === 'gallery' ? 'is-active' : ''} onClick={() => onViewChange('gallery')}>展覽</button>
        <button className={activeView === 'collection' ? 'is-active' : ''} onClick={() => onViewChange('collection')}>典藏</button>
        <button className={activeView === 'about' ? 'is-active' : ''} onClick={() => onViewChange('about')}>關於</button>
      </nav>

      <div className="header-actions">
        <button
          className="icon-button mobile-menu-button"
          type="button"
          onClick={onMenuToggle}
          aria-label={isMenuOpen ? '關閉選單' : '開啟選單'}
          aria-expanded={isMenuOpen}
        >
          <MenuIcon />
        </button>
        <button
          className="fullscreen-button"
          type="button"
          onClick={onFullscreen}
          aria-label={isFullscreen ? '離開作品全螢幕' : '作品全螢幕'}
        >
          <ExpandIcon />
          <span>{isFullscreen ? '離開作品全螢幕' : '作品全螢幕'}</span>
        </button>
      </div>

      {isMenuOpen ? (
        <nav className="mobile-nav" aria-label="行動版主要導覽">
          <button className={activeView === 'gallery' ? 'is-active' : ''} onClick={() => onViewChange('gallery')}>展覽</button>
          <button className={activeView === 'collection' ? 'is-active' : ''} onClick={() => onViewChange('collection')}>典藏</button>
          <button className={activeView === 'about' ? 'is-active' : ''} onClick={() => onViewChange('about')}>關於</button>
        </nav>
      ) : null}
    </header>
  )
}
