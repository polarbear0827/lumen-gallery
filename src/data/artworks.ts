import type { Artwork, Museum } from '../types'
import catalog from './catalog.json'

export const museums: Museum[] = [
  {
    id: 'met',
    shortName: 'The Met',
    nameZh: '大都會藝術博物館',
    nameEn: 'The Metropolitan Museum of Art',
    apiName: 'The Met Collection API',
    apiDocsUrl: 'https://metmuseum.github.io/',
  },
  {
    id: 'aic',
    shortName: '芝加哥',
    nameZh: '芝加哥藝術博物館',
    nameEn: 'Art Institute of Chicago',
    apiName: 'Art Institute of Chicago API',
    apiDocsUrl: 'https://api.artic.edu/docs/',
  },
  {
    id: 'cma',
    shortName: '克里夫蘭',
    nameZh: '克里夫蘭藝術博物館',
    nameEn: 'Cleveland Museum of Art',
    apiName: 'Cleveland Museum of Art Open Access API',
    apiDocsUrl: 'https://openaccess-api.clevelandart.org/',
  },
]

type CatalogArtwork = Omit<Artwork, 'displayImageUrl' | 'thumbnailUrl'> & { assetPath: string }

function assetUrl(path: string) {
  return `${import.meta.env.BASE_URL}${path}`
}

export const artworks: Artwork[] = (catalog as CatalogArtwork[]).map(({ assetPath, ...artwork }) => ({
  ...artwork,
  displayImageUrl: assetUrl(assetPath),
  thumbnailUrl: assetUrl(assetPath),
  sourceKind: 'local',
}))

export const museumById = new Map(museums.map((museum) => [museum.id, museum]))
