import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const readmePath = `${root}/README.md`
const catalog = JSON.parse(await readFile(`${root}/src/data/catalog.json`, 'utf8'))
const museumNames = {
  met: 'The Met',
  aic: '芝加哥藝術博物館',
  cma: '克里夫蘭藝術博物館',
}

const escapeCell = (value) => String(value).replaceAll('|', '\\|').replaceAll('\n', ' ')
const rows = catalog.map((artwork) => (
  `| ${museumNames[artwork.museumId]} | ${escapeCell(artwork.titleZh)}／*${escapeCell(artwork.originalTitle)}* | ${escapeCell(artwork.artist)} | ${escapeCell(artwork.accessionNumber)} | [館藏頁](${artwork.objectUrl}) · [API JSON](${artwork.apiUrl}) · [原始影像](${artwork.originalImageUrl}) |`
))

const section = `## 收錄作品與逐件影像來源

中文題名是本站為繁體中文介面所做的編輯翻譯，並非典藏機構官方譯名。本站顯示用 JPG 副本位於 \`public/artworks/\`，均由下表官方開放來源製作；原文題名、館藏編號、官方館藏頁、API JSON 與最高解析度原始影像連結逐件保留。

| 典藏機構 | 本站題名／原文題名 | 藝術家 | 館藏編號 | 官方資料與原始影像 |
| --- | --- | --- | --- | --- |
${rows.join('\n')}

`

const readme = await readFile(readmePath, 'utf8')
const start = readme.indexOf('## 收錄作品與逐件影像來源')
const end = readme.indexOf('## 授權界線')
if (start < 0 || end < 0 || end <= start) throw new Error('找不到 README 作品來源區段')
await writeFile(readmePath, `${readme.slice(0, start)}${section}${readme.slice(end)}`)
console.log(`README 已列出 ${catalog.length} 件作品的完整來源。`)
