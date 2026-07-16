# 光室｜開放典藏數位畫廊

「光室」是一個可全螢幕瀏覽的數位畫廊，收錄 The Metropolitan Museum of Art、Art Institute of Chicago 與 Cleveland Museum of Art 三間博物館的開放典藏作品。

本專案的首要原則是尊重作品：不裁切、不拉伸、不加濾鏡、不以滿版裁切犧牲構圖。畫面不足時，影像只會等比例縮小；在空間足夠時，影像不會被放大超過來源影像的自然像素尺寸。

## 功能

- 沉浸式全螢幕畫廊與鍵盤導覽。
- 依典藏機構篩選，共 12 件精選公共領域／CC0 作品。
- 所有作品影像均使用 `object-fit: contain`，保留完整畫面與原始長寬比。
- 桌面、短螢幕、平板與手機的響應式版面。
- 觸控滑動、縮圖列、上一件／下一件與首末件鍵盤操作。
- 每件作品都有完整來源抽屜：中英文題名、藝術家、年代、媒材、尺寸、部門、館藏編號、入藏資訊、授權、影像署名、館藏原頁、原始影像與 API JSON。
- 「典藏」總覽與「關於」揭露頁。
- 不使用 Cookie、分析追蹤或使用者資料收集。
- 尊重 `prefers-reduced-motion`，提供清楚焦點狀態與至少 44px 的行動版觸控目標。

## 本機執行

需要 Node.js 22 以上版本。

```bash
npm install
npm run dev
```

正式建置與檢查：

```bash
npm run lint
npm run build
npx playwright install chromium
npm run test:e2e
```

## GitHub Pages

專案使用 GitHub Actions 部署 GitHub Pages。`main` 分支每次推送後會：

1. 安裝鎖定版本的相依套件。
2. 執行 ESLint。
3. 執行 TypeScript 與 Vite 正式建置。
4. 將 `dist/` 發布至 GitHub Pages。

Vite 的 `base` 已設定為 `/lumen-gallery/`。若 repo 改名，必須同步修改 `vite.config.ts`。

## 影像尺寸與比例策略

- `<img>` 均帶有與作品相符的 `width`、`height` 比例提示，避免載入前後版面跳動。
- 主作品與縮圖皆使用 `width: auto; height: auto; object-fit: contain`。
- 主作品以固定上限容納，不使用 `object-fit: cover`，所以不會因螢幕比例不同而裁切。
- 圖片不會用 CSS 強制拉到容器寬度，也不會超過自然尺寸放大。
- 行動版只在容器不足時等比例縮小，作品周圍的資訊、導覽和縮圖列才進行響應式重排。

## 資料架構

作品資料是 2026-07-16 核對的靜態策展快照，放在 `src/data/artworks.ts`。採用靜態快照而非每次開站都即時搜尋 API，目的是避免搜尋排序、限流或上游短暫異常影響展覽順序；每件作品仍直接連結原始 API JSON，可隨時核對最新紀錄。

作品影像沒有複製進本 repo，瀏覽器會直接向以下官方影像網域載入：

- `images.metmuseum.org`
- `www.artic.edu/iiif/2`
- `openaccess-cdn.clevelandart.org`

## API、資料授權與使用條件

### The Metropolitan Museum of Art

- API 文件：[The Met Collection API](https://metmuseum.github.io/)
- 開放資料：[The Met Open Access](https://github.com/metmuseum/openaccess)
- 使用條款：[Terms and Conditions](https://www.metmuseum.org/policies/terms-and-conditions)
- 本展僅使用 API 回應中 `isPublicDomain: true` 且有開放影像的作品。
- 作品資料與開放影像依 The Met Open Access／CC0 政策提供。

### Art Institute of Chicago

- API 文件：[Art Institute of Chicago API](https://api.artic.edu/docs/)
- Image API：官方 [IIIF Image API 2.0](https://api.artic.edu/docs/#iiif-image-api)
- 使用條款：[Terms and Conditions](https://www.artic.edu/terms)
- 影像授權說明：[Image Licensing](https://www.artic.edu/image-licensing)
- 本展僅使用 `is_public_domain: true` 的作品，未使用 API 中採 CC BY 4.0 的 `description` 欄位。
- 其他作品元資料依 API 回應中的 CC0 指定與 Art Institute of Chicago 條款提供。

### Cleveland Museum of Art

- API 文件：[Cleveland Museum of Art Open Access API](https://openaccess-api.clevelandart.org/)
- 開放資料：[CMA Open Access GitHub](https://github.com/ClevelandMuseumArt/openaccess)
- 本展僅使用 `share_license_status: "CC0"` 且具有官方開放影像的作品。
- CMA 資料集以 CC0 提供；只有標記為 CC0 的作品才使用其開放影像。

## 收錄作品與逐件影像來源

中文題名是本站為繁體中文介面所做的編輯翻譯，並非典藏機構官方譯名。作品原文題名、館藏編號及官方館藏頁如下。

| 典藏機構 | 本站題名／原文題名 | 藝術家 | 年代 | 館藏編號 | 官方資料與影像 |
| --- | --- | --- | --- | --- | --- |
| The Met | 麥田與柏樹／*Wheat Field with Cypresses* | Vincent van Gogh | 1889 | 1993.132 | [館藏頁](https://www.metmuseum.org/art/collection/search/436535) · [API JSON](https://collectionapi.metmuseum.org/public/collection/v1/objects/436535) · [原始影像](https://images.metmuseum.org/CRDImages/ep/original/DP-42549-001.jpg) |
| The Met | 戴草帽的自畫像／*Self-Portrait with a Straw Hat* | Vincent van Gogh | 1887 | 67.187.70a | [館藏頁](https://www.metmuseum.org/art/collection/search/436532) · [API JSON](https://collectionapi.metmuseum.org/public/collection/v1/objects/436532) · [原始影像](https://images.metmuseum.org/CRDImages/ep/original/DT1502_cropped2.jpg) |
| The Met | 坐在花瓶旁的女子／*A Woman Seated beside a Vase of Flowers* | Edgar Degas | 1865 | 29.100.128 | [館藏頁](https://www.metmuseum.org/art/collection/search/436121) · [API JSON](https://collectionapi.metmuseum.org/public/collection/v1/objects/436121) · [原始影像](https://images.metmuseum.org/CRDImages/ep/original/DP-25460-001.jpg) |
| The Met | 橄欖樹／*Olive Trees* | Vincent van Gogh | 1889 | 1998.325.1 | [館藏頁](https://www.metmuseum.org/art/collection/search/437998) · [API JSON](https://collectionapi.metmuseum.org/public/collection/v1/objects/437998) · [原始影像](https://images.metmuseum.org/CRDImages/ep/original/DT1946.jpg) |
| 芝加哥藝術博物館 | 睡蓮／*Water Lilies* | Claude Monet | 1906 | 1933.1157 | [館藏頁](https://www.artic.edu/artworks/16568/water-lilies) · [API JSON](https://api.artic.edu/api/v1/artworks/16568) · [IIIF 原始影像](https://www.artic.edu/iiif/2/3c27b499-af56-f0d5-93b5-a7f2f1ad5813/full/full/0/default.jpg) |
| 芝加哥藝術博物館 | 大碗島的星期日下午／*A Sunday on La Grande Jatte — 1884* | Georges Seurat | 1884–1886 | 1926.224 | [館藏頁](https://www.artic.edu/artworks/27992/a-sunday-on-la-grande-jatte-1884) · [API JSON](https://api.artic.edu/api/v1/artworks/27992) · [IIIF 原始影像](https://www.artic.edu/iiif/2/2d484387-2509-5e8e-2c43-22f9981972eb/full/full/0/default.jpg) |
| 芝加哥藝術博物館 | 臥室／*The Bedroom* | Vincent van Gogh | 1889 | 1926.417 | [館藏頁](https://www.artic.edu/artworks/28560/the-bedroom) · [API JSON](https://api.artic.edu/api/v1/artworks/28560) · [IIIF 原始影像](https://www.artic.edu/iiif/2/6644829f-f292-c5c4-a73c-0356a6fdbf0d/full/full/0/default.jpg) |
| 芝加哥藝術博物館 | 神奈川沖浪裏（巨浪）／*Under the Wave off Kanagawa* | Katsushika Hokusai | 1830／1833 | 1925.3245 | [館藏頁](https://www.artic.edu/artworks/24645/under-the-wave-off-kanagawa-kanagawa-oki-nami-ura) · [API JSON](https://api.artic.edu/api/v1/artworks/24645) · [IIIF 原始影像](https://www.artic.edu/iiif/2/b3974542-b9b4-7568-fc4b-966738f61d78/full/full/0/default.jpg) |
| 克里夫蘭藝術博物館 | 高大的梧桐樹／*The Large Plane Trees* | Vincent van Gogh | 1889 | 1947.209 | [館藏頁](https://clevelandart.org/art/1947.209) · [API JSON](https://openaccess-api.clevelandart.org/api/artworks/1947.209) · [原始 TIFF](https://openaccess-cdn.clevelandart.org/1947.209/1947.209_full.tif) |
| 克里夫蘭藝術博物館 | 荒野暮色／*Twilight in the Wilderness* | Frederic Edwin Church | 1860 | 1965.233 | [館藏頁](https://clevelandart.org/art/1965.233) · [API JSON](https://openaccess-api.clevelandart.org/api/artworks/1965.233) · [原始 TIFF](https://openaccess-cdn.clevelandart.org/1965.233/1965.233_full.tif) |
| 克里夫蘭藝術博物館 | 紅頭巾／*The Red Kerchief* | Claude Monet | 約 1868–1873 | 1958.39 | [館藏頁](https://clevelandart.org/art/1958.39) · [API JSON](https://openaccess-api.clevelandart.org/api/artworks/1958.39) · [原始 TIFF](https://openaccess-cdn.clevelandart.org/1958.39/1958.39_full.tif) |
| 克里夫蘭藝術博物館 | 朵拉・惠勒肖像／*Portrait of Dora Wheeler* | William Merritt Chase | 1882–1883 | 1921.1239 | [館藏頁](https://clevelandart.org/art/1921.1239) · [API JSON](https://openaccess-api.clevelandart.org/api/artworks/1921.1239) · [原始 TIFF](https://openaccess-cdn.clevelandart.org/1921.1239/1921.1239_full.tif) |

## 授權界線

- 本 repo 的程式碼採 [MIT License](./LICENSE)。
- MIT License **不涵蓋**博物館作品影像、作品資料、博物館名稱或第三方標誌。
- 作品影像與資料各自受來源機構的 Open Access 政策、CC0 指定及使用條款約束。
- 公共領域／CC0 通常不強制署名，但本站仍保留典藏機構、館藏編號與來源連結，以維持研究與策展脈絡。
- 上游 API、授權狀態或館藏紀錄可能更新；使用者進一步重製前應重新查核官方館藏頁。

## 鍵盤操作

| 按鍵 | 動作 |
| --- | --- |
| `←`／`→` | 上一件／下一件作品 |
| `Home`／`End` | 第一件／最後一件作品 |
| `I` | 開啟／關閉作品資料與來源 |
| `F` | 進入／離開全螢幕 |
| `Esc` | 關閉目前面板或離開全螢幕 |

## 技術

- React + TypeScript + Vite
- CSS Grid／Flexbox、Fullscreen API、原生觸控事件
- Playwright 桌面與行動版端對端測試
- GitHub Actions + GitHub Pages

未使用 UI 元件框架、分析 SDK、第三方字型或額外圖示套件；所有介面圖示都是專案內的輕量 SVG React 元件。
