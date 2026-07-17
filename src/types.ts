export type MuseumId = 'met' | 'aic' | 'cma'
export type ArtworkKind = 'painting' | 'photograph'

export interface Museum {
  id: MuseumId
  shortName: string
  nameZh: string
  nameEn: string
  apiName: string
  apiDocsUrl: string
}

export interface Artwork {
  id: string
  museumId: MuseumId
  kind: ArtworkKind
  titleZh: string
  originalTitle: string
  artist: string
  artistBio: string
  date: string
  medium: string
  dimensions: string
  department: string
  creditLine: string
  accessionNumber: string
  licenseLabel: string
  licenseUrl: string
  displayImageUrl: string
  thumbnailUrl: string
  originalImageUrl: string
  objectUrl: string
  apiUrl: string
  aspectWidth: number
  aspectHeight: number
  imageAttribution: string
  sourceKind?: 'local' | 'api'
}
