import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { artworks as localArtworks } from '../data/artworks'
import { loadAicBatch, loadCmaBatch, loadMetBatch } from '../services/museumApi'
import type { Artwork, MuseumId } from '../types'

type MuseumRecord<T> = Record<MuseumId, T>

const museumIds: MuseumId[] = ['met', 'aic', 'cma']
const localIds = new Set(localArtworks.map((artwork) => artwork.id.replace('-api-', '-')))
const loaders = { met: loadMetBatch, aic: loadAicBatch, cma: loadCmaBatch }

function randomCursor(maximum: number) {
  return Math.floor(Math.random() * maximum)
}

export function useMuseumFeed() {
  const [remote, setRemote] = useState<MuseumRecord<Artwork[]>>({ met: [], aic: [], cma: [] })
  const [totals, setTotals] = useState<MuseumRecord<number | null>>({ met: null, aic: null, cma: null })
  const [loading, setLoading] = useState<MuseumRecord<boolean>>({ met: false, aic: false, cma: false })
  const [errors, setErrors] = useState<MuseumRecord<string | null>>({ met: null, aic: null, cma: null })
  const cursors = useRef<MuseumRecord<number>>({
    met: randomCursor(3_000),
    aic: randomCursor(9_000),
    cma: 0,
  })
  const loadingNow = useRef(new Set<MuseumId>())

  const loadMore = useCallback(async (museumId: MuseumId) => {
    if (loadingNow.current.has(museumId)) return
    loadingNow.current.add(museumId)
    setLoading((current) => ({ ...current, [museumId]: true }))
    setErrors((current) => ({ ...current, [museumId]: null }))
    try {
      const batch = await loaders[museumId](cursors.current[museumId])
      cursors.current[museumId] = batch.nextCursor
      setTotals((current) => ({ ...current, [museumId]: batch.total }))
      setRemote((current) => {
        const existing = new Set([...localIds, ...current[museumId].map((artwork) => artwork.id)])
        const additions = batch.artworks.filter((artwork) => {
          const localEquivalent = artwork.id.replace('-api-', '-')
          if (existing.has(artwork.id) || existing.has(localEquivalent)) return false
          existing.add(artwork.id)
          return true
        })
        return { ...current, [museumId]: [...current[museumId], ...additions] }
      })
    } catch (error) {
      setErrors((current) => ({
        ...current,
        [museumId]: error instanceof Error ? error.message : 'API 暫時無法連線',
      }))
    } finally {
      loadingNow.current.delete(museumId)
      setLoading((current) => ({ ...current, [museumId]: false }))
    }
  }, [])

  useEffect(() => {
    void Promise.all(museumIds.map(loadMore))
  }, [loadMore])

  const artworks = useMemo(() => museumIds.flatMap((museumId) => [
    ...localArtworks.filter((artwork) => artwork.museumId === museumId),
    ...remote[museumId],
  ]), [remote])

  const loaded = useMemo<MuseumRecord<number>>(() => {
    const counts: MuseumRecord<number> = { met: 0, aic: 0, cma: 0 }
    for (const artwork of artworks) counts[artwork.museumId] += 1
    return counts
  }, [artworks])

  const discardArtwork = useCallback((id: string) => {
    setRemote((current) => ({
      met: current.met.filter((artwork) => artwork.id !== id),
      aic: current.aic.filter((artwork) => artwork.id !== id),
      cma: current.cma.filter((artwork) => artwork.id !== id),
    }))
  }, [])

  return { artworks, totals, loaded, loading, errors, loadMore, discardArtwork }
}
