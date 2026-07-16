import type { Artwork, MuseumId } from '../types'

const CC0_URL = 'https://creativecommons.org/publicdomain/zero/1.0/'
const MET_API = 'https://collectionapi.metmuseum.org/public/collection/v1'
const AIC_API = 'https://api.artic.edu/api/v1'
const CMA_API = 'https://openaccess-api.clevelandart.org/api'

export interface MuseumBatch {
  museumId: MuseumId
  artworks: Artwork[]
  total: number
  nextCursor: number
}

interface MetSearchResponse {
  total: number
  objectIDs: number[] | null
}

interface MetObject {
  objectID: number
  isPublicDomain: boolean
  primaryImage: string
  primaryImageSmall: string
  title: string
  artistDisplayName: string
  artistDisplayBio: string
  objectDate: string
  medium: string
  dimensions: string
  department: string
  creditLine: string
  accessionNumber: string
  objectURL: string
}

interface AicArtwork {
  id: number
  title: string
  artist_title: string | null
  artist_display: string | null
  date_display: string | null
  medium_display: string | null
  dimensions: string | null
  department_title: string | null
  credit_line: string | null
  main_reference_number: string
  image_id: string
  is_public_domain: boolean
  thumbnail?: { width?: number; height?: number }
}

interface CmaArtwork {
  id: number
  accession_number: string
  title: string
  creation_date: string | null
  creators?: Array<{ description?: string; use_in_caption?: boolean }>
  images?: {
    web?: { url: string; width: string; height: string }
    print?: { url: string }
    full?: { url: string }
  }
  department: string | null
  technique: string | null
  measurements: string | null
  creditline: string | null
  share_license_status: string
  url?: string
}

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { headers: { Accept: 'application/json' } })
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`)
  return response.json() as Promise<T>
}

async function mapConcurrent<T, R>(items: T[], concurrency: number, mapper: (item: T) => Promise<R | null>) {
  const results: R[] = []
  for (let index = 0; index < items.length; index += concurrency) {
    const chunk = items.slice(index, index + concurrency)
    const settled = await Promise.allSettled(chunk.map(mapper))
    for (const result of settled) {
      if (result.status === 'fulfilled' && result.value) results.push(result.value)
    }
  }
  return results
}

let metSearchPromise: Promise<MetSearchResponse> | null = null

function getMetSearch() {
  metSearchPromise ??= getJson<MetSearchResponse>(`${MET_API}/search?hasImages=true&q=*`)
  return metSearchPromise
}

function mapMetArtwork(data: MetObject): Artwork | null {
  if (!data.isPublicDomain || !data.primaryImageSmall) return null
  return {
    id: `met-api-${data.objectID}`,
    museumId: 'met',
    titleZh: data.title || '未命名作品',
    originalTitle: data.title || 'Untitled',
    artist: data.artistDisplayName || '作者不詳',
    artistBio: [data.artistDisplayName, data.artistDisplayBio].filter(Boolean).join('；') || '作者不詳',
    date: data.objectDate || '年代未詳',
    medium: data.medium || '媒材未詳',
    dimensions: data.dimensions || '尺寸未詳',
    department: data.department || '部門未詳',
    creditLine: data.creditLine || '入藏資訊未詳',
    accessionNumber: data.accessionNumber || String(data.objectID),
    licenseLabel: 'Public Domain／CC0',
    licenseUrl: CC0_URL,
    displayImageUrl: data.primaryImage,
    thumbnailUrl: data.primaryImageSmall,
    originalImageUrl: data.primaryImage,
    objectUrl: data.objectURL || `https://www.metmuseum.org/art/collection/search/${data.objectID}`,
    apiUrl: `${MET_API}/objects/${data.objectID}`,
    aspectWidth: 1200,
    aspectHeight: 900,
    imageAttribution: 'The Metropolitan Museum of Art, Open Access',
    sourceKind: 'api',
  }
}

export async function loadMetBatch(cursor: number, batchSize = 12): Promise<MuseumBatch> {
  const search = await getMetSearch()
  const ids = search.objectIDs ?? []
  const candidateCount = Math.max(batchSize * 2, 24)
  const candidates = Array.from({ length: Math.min(candidateCount, ids.length) }, (_, offset) => (
    ids[(cursor + offset) % ids.length]
  ))
  const artworks = await mapConcurrent(candidates, 6, async (id) => {
    const data = await getJson<MetObject>(`${MET_API}/objects/${id}`)
    return mapMetArtwork(data)
  })
  return {
    museumId: 'met',
    artworks: artworks.slice(0, batchSize),
    total: search.total,
    nextCursor: (cursor + candidateCount) % Math.max(1, ids.length),
  }
}

function mapAicArtwork(data: AicArtwork): Artwork {
  const width = Number(data.thumbnail?.width) || 843
  const height = Number(data.thumbnail?.height) || 843
  const imageUrl = `https://www.artic.edu/iiif/2/${data.image_id}/full/843,/0/default.jpg`
  return {
    id: `aic-api-${data.id}`,
    museumId: 'aic',
    titleZh: data.title || '未命名作品',
    originalTitle: data.title || 'Untitled',
    artist: data.artist_title || '作者不詳',
    artistBio: data.artist_display || data.artist_title || '作者不詳',
    date: data.date_display || '年代未詳',
    medium: data.medium_display || '媒材未詳',
    dimensions: data.dimensions || '尺寸未詳',
    department: data.department_title || '部門未詳',
    creditLine: data.credit_line || '入藏資訊未詳',
    accessionNumber: data.main_reference_number || String(data.id),
    licenseLabel: 'Public Domain／CC0',
    licenseUrl: CC0_URL,
    displayImageUrl: imageUrl,
    thumbnailUrl: imageUrl,
    originalImageUrl: `https://www.artic.edu/iiif/2/${data.image_id}/full/full/0/default.jpg`,
    objectUrl: `https://www.artic.edu/artworks/${data.id}`,
    apiUrl: `${AIC_API}/artworks/${data.id}`,
    aspectWidth: width,
    aspectHeight: height,
    imageAttribution: 'Art Institute of Chicago, Public Domain',
    sourceKind: 'api',
  }
}

export async function loadAicBatch(cursor: number, batchSize = 24): Promise<MuseumBatch> {
  const fields = [
    'id', 'title', 'artist_title', 'artist_display', 'date_display', 'medium_display', 'dimensions',
    'department_title', 'credit_line', 'main_reference_number', 'image_id', 'is_public_domain', 'thumbnail',
  ].join(',')
  const page = Math.floor((cursor % 9_900) / 100) + 1
  const params = new URLSearchParams({ page: String(page), limit: '100', fields })
  const response = await getJson<{ pagination: { total: number }; data: AicArtwork[] }>(`${AIC_API}/artworks?${params}`)
  return {
    museumId: 'aic',
    artworks: response.data
      .filter((item) => item.is_public_domain && item.image_id)
      .slice(0, batchSize)
      .map(mapAicArtwork),
    total: response.pagination.total,
    nextCursor: (cursor + 100) % 9_900,
  }
}

function mapCmaArtwork(data: CmaArtwork): Artwork | null {
  const image = data.images?.web
  if (data.share_license_status !== 'CC0' || !image?.url) return null
  const creator = data.creators?.find((item) => item.use_in_caption) ?? data.creators?.[0]
  const creatorName = creator?.description?.split(' (')[0] || '作者不詳'
  return {
    id: `cma-api-${data.accession_number}`,
    museumId: 'cma',
    titleZh: data.title || '未命名作品',
    originalTitle: data.title || 'Untitled',
    artist: creatorName,
    artistBio: creator?.description || creatorName,
    date: data.creation_date || '年代未詳',
    medium: data.technique || '媒材未詳',
    dimensions: data.measurements || '尺寸未詳',
    department: data.department || '部門未詳',
    creditLine: data.creditline || '入藏資訊未詳',
    accessionNumber: data.accession_number,
    licenseLabel: 'CC0',
    licenseUrl: CC0_URL,
    displayImageUrl: image.url,
    thumbnailUrl: image.url,
    originalImageUrl: data.images?.full?.url ?? data.images?.print?.url ?? image.url,
    objectUrl: data.url || `https://clevelandart.org/art/${data.accession_number}`,
    apiUrl: `${CMA_API}/artworks/${data.accession_number}`,
    aspectWidth: Number(image.width) || 900,
    aspectHeight: Number(image.height) || 900,
    imageAttribution: 'Cleveland Museum of Art, Open Access, CC0',
    sourceKind: 'api',
  }
}

export async function loadCmaBatch(cursor: number, batchSize = 24): Promise<MuseumBatch> {
  const params = new URLSearchParams({ cc0: '', has_image: '1', skip: String(cursor), limit: String(batchSize) })
  const response = await getJson<{ info: { total: number }; data: CmaArtwork[] }>(`${CMA_API}/artworks/?${params}`)
  return {
    museumId: 'cma',
    artworks: response.data.map(mapCmaArtwork).filter((artwork): artwork is Artwork => Boolean(artwork)),
    total: response.info.total,
    nextCursor: (cursor + batchSize) % Math.max(1, response.info.total),
  }
}
