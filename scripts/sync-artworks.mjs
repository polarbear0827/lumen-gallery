import { execFileSync } from 'node:child_process'
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const assetDirectory = `${root}/public/artworks`
const catalogPath = `${root}/src/data/catalog.json`
const cc0Url = 'https://creativecommons.org/publicdomain/zero/1.0/'

const selection = {
  met: [436535, 436532, 436121, 437998, 436105, 437853, 437329, 436524, 436965, 435882, 436575, 436658],
  aic: [16568, 27992, 28560, 24645, 20684, 14655, 61128, 111436, 111442, 111318, 25865, 11723],
  cma: ['1947.209', '1965.233', '1958.39', '1921.1239', '1922.1133', '1927.1984', '1928.8', '1977.43', '1958.425', '1981.18', '1976.2', '1942.647'],
}

const localizedTitles = {
  'met-436535': '麥田與柏樹',
  'met-436532': '戴草帽的自畫像',
  'met-436121': '坐在花瓶旁的女子',
  'met-437998': '橄欖樹',
  'met-436105': '死亡的蘇格拉底',
  'met-437853': '從聖母健康大殿門廊眺望威尼斯',
  'met-437329': '劫奪薩賓婦女',
  'met-436524': '向日葵',
  'met-436965': '阿讓特伊花園裡的莫內一家',
  'met-435882': '蘋果與報春花盆栽的靜物',
  'met-436575': '托雷多風景',
  'met-436658': '赫爾曼・馮・韋迪希三世肖像',
  'aic-16568': '睡蓮',
  'aic-27992': '大碗島的星期日下午',
  'aic-28560': '臥室',
  'aic-24645': '神奈川沖浪裏（巨浪）',
  'aic-20684': '巴黎街景；雨天',
  'aic-14655': '兩姊妹（露台上）',
  'aic-61128': '紅磨坊',
  'aic-111436': '一籃蘋果',
  'aic-111442': '孩子的沐浴',
  'aic-111318': '麥草堆',
  'aic-25865': '鯡魚網',
  'aic-11723': '梳妝的女子',
  'cma-1947.209': '高大的梧桐樹（聖雷米的修路工）',
  'cma-1965.233': '荒野暮色',
  'cma-1958.39': '紅頭巾',
  'cma-1921.1239': '朵拉・惠勒肖像',
  'cma-1922.1133': '夏基拳擊俱樂部的雄鹿',
  'cma-1927.1984': '比格林兄弟繞過標竿',
  'cma-1928.8': '賽馬場（騎蒼白馬的死神）',
  'cma-1977.43': '教堂街高架鐵路',
  'cma-1958.425': '哈滕費爾斯城堡附近的狩獵',
  'cma-1981.18': '階梯上的聖家族',
  'cma-1976.2': '聖安德烈受難',
  'cma-1942.647': '1834 年 10 月 16 日上、下議院大火',
}

const localizedArtists = {
  'Vincent van Gogh': '文森・梵谷',
  'Edgar Degas': '艾德加・竇加',
  'Jacques Louis David': '雅克-路易・大衛',
  'Joseph Mallord William Turner': '約瑟夫・馬洛德・威廉・透納',
  'Nicolas Poussin': '尼古拉・普桑',
  'Edouard Manet': '愛德華・馬內',
  'Paul Cézanne': '保羅・塞尚',
  'Paul Cezanne': '保羅・塞尚',
  'El Greco (Domenikos Theotokopoulos)': '格列柯',
  'Hans Holbein the Younger': '小漢斯・霍爾拜因',
  'Claude Monet': '克勞德・莫內',
  'Georges Seurat': '喬治・秀拉',
  'Katsushika Hokusai': '葛飾北齋',
  'Gustave Caillebotte': '古斯塔夫・卡耶博特',
  'Pierre-Auguste Renoir': '皮耶-奧古斯特・雷諾瓦',
  'Henri de Toulouse-Lautrec': '亨利・德・土魯斯-羅特列克',
  'Mary Cassatt': '瑪麗・卡薩特',
  'Winslow Homer': '溫斯洛・霍默',
  'Berthe Morisot': '貝爾特・莫里索',
  'Frederic Edwin Church': '弗雷德里克・艾德溫・丘奇',
  'William Merritt Chase': '威廉・梅里特・蔡斯',
  'George Bellows': '喬治・貝洛斯',
  'Thomas Eakins': '湯瑪斯・艾金斯',
  'Albert Pinkham Ryder': '艾伯特・平克漢・萊德',
  'Charles Sheeler': '查爾斯・席勒',
  'Lucas Cranach': '老盧卡斯・克拉納赫',
  'Caravaggio': '卡拉瓦喬',
}

async function getJson(url) {
  const response = await fetch(url, { headers: { 'User-Agent': 'lumen-gallery-catalog/1.0' } })
  if (!response.ok) throw new Error(`${response.status} ${url}`)
  return response.json()
}

async function download(url, target) {
  const response = await fetch(url, { headers: { 'User-Agent': 'lumen-gallery-catalog/1.0' } })
  if (!response.ok) throw new Error(`${response.status} ${url}`)
  const bytes = new Uint8Array(await response.arrayBuffer())
  if (bytes.length < 10_000) throw new Error(`影像檔案過小：${url}`)
  await writeFile(target, bytes)
}

const aicCookiePath = `${assetDirectory}/.aic-cookies`

async function downloadAic(imageUrl, objectUrl, target) {
  const userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/138 Safari/537.36'
  execFileSync('curl', ['-fsSL', '-A', userAgent, '-c', aicCookiePath, objectUrl, '-o', '/dev/null'])
  execFileSync('curl', ['-fsSL', '-A', userAgent, '-b', aicCookiePath, '-e', objectUrl, imageUrl, '-o', target])
  const bytes = (await readFile(target)).byteLength
  if (bytes < 10_000) throw new Error(`影像檔案過小：${imageUrl}`)
  await new Promise((resolve) => setTimeout(resolve, 1_000))
}

function imageSize(path) {
  const output = execFileSync('sips', ['-g', 'pixelWidth', '-g', 'pixelHeight', path], { encoding: 'utf8' })
  return {
    width: Number(output.match(/pixelWidth: (\d+)/)?.[1]),
    height: Number(output.match(/pixelHeight: (\d+)/)?.[1]),
  }
}

function artistName(name) {
  return localizedArtists[name] ?? name ?? '作者不詳'
}

async function makeMet(id) {
  const data = await getJson(`https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`)
  if (!data.isPublicDomain || !data.primaryImageSmall) throw new Error(`The Met ${id} 不是可用的公共領域影像`)
  const key = `met-${id}`
  const path = `${assetDirectory}/${key}.jpg`
  await download(data.primaryImageSmall, path)
  const size = imageSize(path)
  return {
    id: key,
    museumId: 'met',
    titleZh: localizedTitles[key],
    originalTitle: data.title,
    artist: artistName(data.artistDisplayName),
    artistBio: data.artistDisplayBio || data.artistDisplayName || '作者不詳',
    date: data.objectDate || '年代未詳',
    medium: data.medium || '媒材未詳',
    dimensions: data.dimensions || '尺寸未詳',
    department: data.department || '部門未詳',
    creditLine: data.creditLine || '入藏資訊未詳',
    accessionNumber: data.accessionNumber,
    licenseLabel: 'Public Domain／CC0',
    licenseUrl: cc0Url,
    assetPath: `artworks/${key}.jpg`,
    originalImageUrl: data.primaryImage,
    objectUrl: data.objectURL,
    apiUrl: `https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`,
    aspectWidth: size.width,
    aspectHeight: size.height,
    imageAttribution: 'The Metropolitan Museum of Art, Open Access',
  }
}

async function makeAic(data) {
  if (!data.is_public_domain || !data.image_id) throw new Error(`AIC ${data.id} 不是可用的公共領域影像`)
  const key = `aic-${data.id}`
  const originalImageUrl = `https://www.artic.edu/iiif/2/${data.image_id}/full/full/0/default.jpg`
  const objectUrl = `https://www.artic.edu/artworks/${data.id}`
  const path = `${assetDirectory}/${key}.jpg`
  await downloadAic(`https://www.artic.edu/iiif/2/${data.image_id}/full/843,/0/default.jpg`, objectUrl, path)
  const size = imageSize(path)
  return {
    id: key,
    museumId: 'aic',
    titleZh: localizedTitles[key],
    originalTitle: data.title,
    artist: artistName(data.artist_title),
    artistBio: data.artist_display || data.artist_title || '作者不詳',
    date: data.date_display || '年代未詳',
    medium: data.medium_display || '媒材未詳',
    dimensions: data.dimensions || '尺寸未詳',
    department: data.department_title || '部門未詳',
    creditLine: data.credit_line || '入藏資訊未詳',
    accessionNumber: data.main_reference_number,
    licenseLabel: 'Public Domain／CC0',
    licenseUrl: cc0Url,
    assetPath: `artworks/${key}.jpg`,
    originalImageUrl,
    objectUrl,
    apiUrl: `https://api.artic.edu/api/v1/artworks/${data.id}`,
    aspectWidth: size.width,
    aspectHeight: size.height,
    imageAttribution: 'Art Institute of Chicago, Public Domain',
  }
}

async function makeCma(accessionNumber) {
  const response = await getJson(`https://openaccess-api.clevelandart.org/api/artworks/${accessionNumber}`)
  const data = response.data
  if (data.share_license_status !== 'CC0' || !data.images?.web?.url) throw new Error(`CMA ${accessionNumber} 不是可用的 CC0 影像`)
  const key = `cma-${accessionNumber}`
  const path = `${assetDirectory}/${key}.jpg`
  await download(data.images.web.url, path)
  const size = imageSize(path)
  const creator = data.creators?.find((item) => item.use_in_caption) ?? data.creators?.[0]
  const creatorName = creator?.description?.split(' (')[0] ?? '作者不詳'
  return {
    id: key,
    museumId: 'cma',
    titleZh: localizedTitles[key],
    originalTitle: data.title,
    artist: artistName(creatorName),
    artistBio: creator?.description || creatorName,
    date: data.creation_date || '年代未詳',
    medium: data.technique || '媒材未詳',
    dimensions: data.measurements || '尺寸未詳',
    department: data.department || '部門未詳',
    creditLine: data.creditline || '入藏資訊未詳',
    accessionNumber: data.accession_number,
    licenseLabel: 'CC0',
    licenseUrl: cc0Url,
    assetPath: `artworks/${key}.jpg`,
    originalImageUrl: data.images.full?.url ?? data.images.print?.url ?? data.images.web.url,
    objectUrl: data.url || `https://clevelandart.org/art/${accessionNumber}`,
    apiUrl: `https://openaccess-api.clevelandart.org/api/artworks/${accessionNumber}`,
    aspectWidth: size.width,
    aspectHeight: size.height,
    imageAttribution: 'Cleveland Museum of Art, Open Access, CC0',
  }
}

await mkdir(assetDirectory, { recursive: true })

const catalog = []
for (const id of selection.met) catalog.push(await makeMet(id))

const fields = [
  'id', 'title', 'artist_title', 'artist_display', 'date_display', 'medium_display', 'dimensions',
  'department_title', 'credit_line', 'main_reference_number', 'image_id', 'is_public_domain',
].join(',')
const aicResponse = await getJson(`https://api.artic.edu/api/v1/artworks?ids=${selection.aic.join(',')}&limit=${selection.aic.length}&fields=${fields}`)
const aicById = new Map(aicResponse.data.map((item) => [item.id, item]))
for (const id of selection.aic) catalog.push(await makeAic(aicById.get(id)))
await rm(aicCookiePath, { force: true })

for (const accessionNumber of selection.cma) catalog.push(await makeCma(accessionNumber))

for (const artwork of catalog) {
  if (!artwork.titleZh) throw new Error(`缺少繁體中文題名：${artwork.id}`)
}

await writeFile(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`)
const totalBytes = (await Promise.all(catalog.map(async (item) => (await readFile(`${assetDirectory}/${item.id}.jpg`)).byteLength))).reduce((sum, bytes) => sum + bytes, 0)
console.log(`已建立 ${catalog.length} 件作品，顯示影像共 ${(totalBytes / 1024 / 1024).toFixed(1)} MB。`)
