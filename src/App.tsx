import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AboutPanel } from './components/AboutPanel'
import { ArtworkMeta } from './components/ArtworkMeta'
import { ArtworkStage } from './components/ArtworkStage'
import { CollectionPanel } from './components/CollectionPanel'
import { Filmstrip } from './components/Filmstrip'
import { GalleryControls } from './components/GalleryControls'
import { Header, type ViewName } from './components/Header'
import { MuseumFilters } from './components/MuseumFilters'
import { SourceDrawer } from './components/SourceDrawer'
import { artworks, museumById, museums } from './data/artworks'
import { useKeyboardNavigation } from './hooks/useKeyboardNavigation'
import type { MuseumId } from './types'

export default function App() {
  const [selectedId, setSelectedId] = useState(artworks[0].id)
  const [museumFilter, setMuseumFilter] = useState<MuseumId | 'all'>('all')
  const [view, setView] = useState<ViewName>('gallery')
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(Boolean(document.fullscreenElement))
  const detailsButtonRef = useRef<HTMLButtonElement>(null)

  const filteredArtworks = useMemo(
    () => museumFilter === 'all' ? artworks : artworks.filter((artwork) => artwork.museumId === museumFilter),
    [museumFilter],
  )

  const selectedIndex = Math.max(0, filteredArtworks.findIndex((artwork) => artwork.id === selectedId))
  const selectedArtwork = filteredArtworks[selectedIndex] ?? filteredArtworks[0]
  const selectedMuseum = museumById.get(selectedArtwork.museumId) ?? museums[0]

  const selectByOffset = useCallback((offset: number) => {
    setSelectedId((currentId) => {
      const currentIndex = filteredArtworks.findIndex((artwork) => artwork.id === currentId)
      const safeIndex = currentIndex < 0 ? 0 : currentIndex
      const nextIndex = (safeIndex + offset + filteredArtworks.length) % filteredArtworks.length
      return filteredArtworks[nextIndex].id
    })
  }, [filteredArtworks])

  const selectFirst = useCallback(() => setSelectedId(filteredArtworks[0].id), [filteredArtworks])
  const selectLast = useCallback(() => setSelectedId(filteredArtworks[filteredArtworks.length - 1].id), [filteredArtworks])

  const handleFilterChange = useCallback((nextFilter: MuseumId | 'all') => {
    setMuseumFilter(nextFilter)
    const nextWorks = nextFilter === 'all' ? artworks : artworks.filter((artwork) => artwork.museumId === nextFilter)
    setSelectedId((currentId) => nextWorks.some((artwork) => artwork.id === currentId) ? currentId : nextWorks[0].id)
  }, [])

  const handleViewChange = useCallback((nextView: ViewName) => {
    setView(nextView)
    setDetailsOpen(false)
    setMobileMenuOpen(false)
  }, [])

  const handleCollectionSelect = useCallback((id: string) => {
    setMuseumFilter('all')
    setSelectedId(id)
    setView('gallery')
  }, [])

  const toggleFullscreen = useCallback(async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen()
      else await document.documentElement.requestFullscreen()
    } catch {
      setIsFullscreen(false)
    }
  }, [])

  const closeDetails = useCallback(() => {
    setDetailsOpen(false)
    window.setTimeout(() => detailsButtonRef.current?.focus(), 0)
  }, [])

  const handleEscape = useCallback(() => {
    if (detailsOpen) closeDetails()
    else if (view !== 'gallery') setView('gallery')
    else if (mobileMenuOpen) setMobileMenuOpen(false)
    else if (document.fullscreenElement) void document.exitFullscreen()
  }, [closeDetails, detailsOpen, mobileMenuOpen, view])

  const keyboardOptions = useMemo(() => ({
    onPrevious: () => selectByOffset(-1),
    onNext: () => selectByOffset(1),
    onFirst: selectFirst,
    onLast: selectLast,
    onDetails: () => setDetailsOpen((open) => !open),
    onFullscreen: () => void toggleFullscreen(),
    onEscape: handleEscape,
  }), [handleEscape, selectByOffset, selectFirst, selectLast, toggleFullscreen])

  useKeyboardNavigation(keyboardOptions)

  useEffect(() => {
    const onFullscreenChange = () => setIsFullscreen(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', onFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange)
  }, [])

  useEffect(() => {
    const previous = filteredArtworks[(selectedIndex - 1 + filteredArtworks.length) % filteredArtworks.length]
    const next = filteredArtworks[(selectedIndex + 1) % filteredArtworks.length]
    for (const artwork of [previous, next]) {
      const image = new Image()
      image.src = artwork.displayImageUrl
    }
  }, [filteredArtworks, selectedIndex])

  return (
    <div className={`app-shell ${detailsOpen ? 'has-drawer' : ''}`}>
      <a className="skip-link" href="#gallery-main">跳至主要內容</a>
      <Header
        activeView={view}
        isFullscreen={isFullscreen}
        isMenuOpen={mobileMenuOpen}
        onViewChange={handleViewChange}
        onFullscreen={() => void toggleFullscreen()}
        onMenuToggle={() => setMobileMenuOpen((open) => !open)}
      />

      <MuseumFilters museums={museums} selected={museumFilter} onChange={handleFilterChange} />

      <main id="gallery-main" className="gallery-main" aria-hidden={view !== 'gallery'}>
        <ArtworkStage
          key={selectedArtwork.id}
          artwork={selectedArtwork}
          onSwipePrevious={() => selectByOffset(-1)}
          onSwipeNext={() => selectByOffset(1)}
        />
        <div className="gallery-lower">
          <ArtworkMeta
            artwork={selectedArtwork}
            museum={selectedMuseum}
            detailsButtonRef={detailsButtonRef}
            onDetails={() => setDetailsOpen(true)}
          />
          <GalleryControls
            current={selectedIndex + 1}
            total={filteredArtworks.length}
            onPrevious={() => selectByOffset(-1)}
            onNext={() => selectByOffset(1)}
          />
        </div>
      </main>

      <Filmstrip artworks={filteredArtworks} selectedId={selectedArtwork.id} onSelect={setSelectedId} />

      <div className="sr-only" aria-live="polite">
        已選擇《{selectedArtwork.titleZh}》，{selectedArtwork.artist}，{selectedArtwork.date}
      </div>

      {detailsOpen ? <SourceDrawer artwork={selectedArtwork} museum={selectedMuseum} onClose={closeDetails} /> : null}
      {view === 'collection' ? <CollectionPanel artworks={artworks} museumById={museumById} onSelect={handleCollectionSelect} onClose={() => setView('gallery')} /> : null}
      {view === 'about' ? <AboutPanel museums={museums} onClose={() => setView('gallery')} /> : null}
    </div>
  )
}
