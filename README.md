# 光室｜開放典藏數位畫廊

「光室」是一個可全螢幕瀏覽的數位畫廊，收錄 The Metropolitan Museum of Art、Art Institute of Chicago 與 Cleveland Museum of Art 三間博物館的開放典藏作品。

本專案的首要原則是尊重作品：不裁切、不拉伸、不加濾鏡、不以滿版裁切犧牲構圖。一般與全螢幕模式都依作品的自然長寬比計算最大可用尺寸；影像會隨可用空間等比例放大或縮小，直到寬或高其中一軸碰到顯示範圍。

## 功能

- 僅作品影像進入全螢幕的沉浸式畫廊與鍵盤導覽。
- 依典藏機構篩選；開站後直接向三館 API 分批載入，接近目前清單尾端時自動取得下一批，不以 36 件為上限。
- 內建 36 件（每館 12 件）已核對且可離線顯示的策展備援；它們是啟動畫面與上游異常時的保底，不是完整館藏。
- 介面同時顯示「目前已載入」與「API 資料池」數量。資料池是上游 API 回傳的候選紀錄總數，最終仍會排除非公共領域、無影像、重複或影像載入失敗的項目。
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

- `<img>` 均帶有 API 或實際影像提供的寬高比例提示，影像載入後再以 `naturalWidth`／`naturalHeight` 校正。
- `ResizeObserver` 監看作品舞台，以「完整容納」演算法計算畫框寬高；不使用 `object-fit: cover`，因此不會裁掉任何邊緣。
- 一般畫廊與作品全螢幕都允許等比例放大或縮小。全螢幕只包含作品舞台，寬或高至少一軸會貼齊螢幕，另一軸保留必要黑邊。
- 桌面版作品舞台與下方資訊列使用固定網格列，橫幅與直幅切換不會推動資料按鈕或上一件／下一件按鈕。
- 題名允許完整換行，不使用 `overflow: hidden`、單行省略或刪節號裁切。
- 行動版會重排作品資訊、導覽與縮圖列，維持至少 44px 的觸控目標且不產生水平溢位。

## 資料架構

資料分成兩層：

1. `src/data/catalog.json` 是 2026-07-16 核對的 36 件本地策展備援；繁體中文策展題名與同步清單定義在 `scripts/sync-artworks.mjs`。
2. `src/services/museumApi.ts` 是瀏覽器端即時 API 轉接層；`src/hooks/useMuseumFeed.ts` 管理分批載入、游標、去重、失敗排除與目前載入數量。動態取得的作品保留 API 原題名，不自行杜撰中文譯名。

開站時三館並行載入；使用者瀏覽到目前清單最後 10 件內時，自動再取一批。資料只存在目前瀏覽器記憶體，不會把數萬張影像複製到 repo，也不會寫入 Cookie 或遠端資料庫。

三館的即時篩選方式如下：

- The Met：先呼叫 `search?hasImages=true&q=*` 取得候選 ID，再逐件讀取資料，只保留 `isPublicDomain: true` 且有官方影像者。
- 芝加哥藝術博物館：從官方 artworks 分頁端點每次讀取 100 筆，再於前端只保留 `is_public_domain: true` 且有 `image_id` 者。這個方式避開複合搜尋 POST 在部分瀏覽器的跨來源 403。
- Cleveland Museum of Art：使用 `cc0` 與 `has_image=1` 條件分頁，只保留 `share_license_status: "CC0"` 且有影像者。

介面的「API 資料池」數字依上游分頁或搜尋回應即時顯示。The Met 與芝加哥的總數是進一步授權／影像過濾前的候選紀錄數；Cleveland 的總數已由 API 以 CC0 與影像條件篩選。因此資料池數字不等同於保證可播放件數，也不宣稱是博物館完整實體館藏數。

為避免 Brave 等瀏覽器的隱私防護、跨站限制或上游短暫異常造成啟動畫面空白，36 件備援作品使用由官方開放影像製作的顯示用 JPG 副本，存放於 `public/artworks/`。API 動態作品直接使用博物館官方影像網址；若影像請求失敗，該筆會自動從目前輪播排除，不留下空白畫框。每件可播放作品的來源面板都保留官方館藏頁、API JSON、原始影像、授權與影像署名。

顯示用副本來自以下官方影像網域：

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

## 36 件本地備援作品與逐件影像來源

下表只列出 repo 內 36 件本地備援，不代表即時 API 輪播上限。中文題名是本站為繁體中文介面所做的編輯翻譯，並非典藏機構官方譯名。本站顯示用 JPG 副本位於 `public/artworks/`，均由下表官方開放來源製作；動態作品的完整資料與來源則在網站的「作品資料與來源」面板依該次 API 回應即時揭露。

| 典藏機構 | 本站題名／原文題名 | 藝術家 | 館藏編號 | 官方資料與原始影像 |
| --- | --- | --- | --- | --- |
| The Met | 麥田與柏樹／*Wheat Field with Cypresses* | 文森・梵谷 | 1993.132 | [館藏頁](https://www.metmuseum.org/art/collection/search/436535) · [API JSON](https://collectionapi.metmuseum.org/public/collection/v1/objects/436535) · [原始影像](https://images.metmuseum.org/CRDImages/ep/original/DP-42549-001.jpg) |
| The Met | 戴草帽的自畫像／*Self-Portrait with a Straw Hat (obverse: The Potato Peeler)* | 文森・梵谷 | 67.187.70a | [館藏頁](https://www.metmuseum.org/art/collection/search/436532) · [API JSON](https://collectionapi.metmuseum.org/public/collection/v1/objects/436532) · [原始影像](https://images.metmuseum.org/CRDImages/ep/original/DT1502_cropped2.jpg) |
| The Met | 坐在花瓶旁的女子／*A Woman Seated beside a Vase of Flowers (Madame Paul Valpinçon?)* | 艾德加・竇加 | 29.100.128 | [館藏頁](https://www.metmuseum.org/art/collection/search/436121) · [API JSON](https://collectionapi.metmuseum.org/public/collection/v1/objects/436121) · [原始影像](https://images.metmuseum.org/CRDImages/ep/original/DP-25460-001.jpg) |
| The Met | 橄欖樹／*Olive Trees* | 文森・梵谷 | 1998.325.1 | [館藏頁](https://www.metmuseum.org/art/collection/search/437998) · [API JSON](https://collectionapi.metmuseum.org/public/collection/v1/objects/437998) · [原始影像](https://images.metmuseum.org/CRDImages/ep/original/DT1946.jpg) |
| The Met | 死亡的蘇格拉底／*The Death of Socrates* | 雅克-路易・大衛 | 31.45 | [館藏頁](https://www.metmuseum.org/art/collection/search/436105) · [API JSON](https://collectionapi.metmuseum.org/public/collection/v1/objects/436105) · [原始影像](https://images.metmuseum.org/CRDImages/ep/original/DP-13139-001.jpg) |
| The Met | 從聖母健康大殿門廊眺望威尼斯／*Venice, from the Porch of Madonna della Salute* | 約瑟夫・馬洛德・威廉・透納 | 99.31 | [館藏頁](https://www.metmuseum.org/art/collection/search/437853) · [API JSON](https://collectionapi.metmuseum.org/public/collection/v1/objects/437853) · [原始影像](https://images.metmuseum.org/CRDImages/ep/original/DP169568.jpg) |
| The Met | 劫奪薩賓婦女／*The Abduction of the Sabine Women* | 尼古拉・普桑 | 46.160 | [館藏頁](https://www.metmuseum.org/art/collection/search/437329) · [API JSON](https://collectionapi.metmuseum.org/public/collection/v1/objects/437329) · [原始影像](https://images.metmuseum.org/CRDImages/ep/original/DP-29324-001.jpg) |
| The Met | 向日葵／*Sunflowers* | 文森・梵谷 | 49.41 | [館藏頁](https://www.metmuseum.org/art/collection/search/436524) · [API JSON](https://collectionapi.metmuseum.org/public/collection/v1/objects/436524) · [原始影像](https://images.metmuseum.org/CRDImages/ep/original/DP-41223-001.jpg) |
| The Met | 阿讓特伊花園裡的莫內一家／*The Monet Family in Their Garden at Argenteuil* | 愛德華・馬內 | 1976.201.14 | [館藏頁](https://www.metmuseum.org/art/collection/search/436965) · [API JSON](https://collectionapi.metmuseum.org/public/collection/v1/objects/436965) · [原始影像](https://images.metmuseum.org/CRDImages/ep/original/DP-25465-001.jpg) |
| The Met | 蘋果與報春花盆栽的靜物／*Still Life with Apples and a Pot of Primroses* | 保羅・塞尚 | 51.112.1 | [館藏頁](https://www.metmuseum.org/art/collection/search/435882) · [API JSON](https://collectionapi.metmuseum.org/public/collection/v1/objects/435882) · [原始影像](https://images.metmuseum.org/CRDImages/ep/original/DT47.jpg) |
| The Met | 托雷多風景／*View of Toledo* | 格列柯 | 29.100.6 | [館藏頁](https://www.metmuseum.org/art/collection/search/436575) · [API JSON](https://collectionapi.metmuseum.org/public/collection/v1/objects/436575) · [原始影像](https://images.metmuseum.org/CRDImages/ep/original/DP349564.jpg) |
| The Met | 赫爾曼・馮・韋迪希三世肖像／*Hermann von Wedigh III (died 1560)* | 小漢斯・霍爾拜因 | 50.135.4 | [館藏頁](https://www.metmuseum.org/art/collection/search/436658) · [API JSON](https://collectionapi.metmuseum.org/public/collection/v1/objects/436658) · [原始影像](https://images.metmuseum.org/CRDImages/ep/original/DP164836.jpg) |
| 芝加哥藝術博物館 | 睡蓮／*Water Lilies* | 克勞德・莫內 | 1933.1157 | [館藏頁](https://www.artic.edu/artworks/16568) · [API JSON](https://api.artic.edu/api/v1/artworks/16568) · [原始影像](https://www.artic.edu/iiif/2/3c27b499-af56-f0d5-93b5-a7f2f1ad5813/full/full/0/default.jpg) |
| 芝加哥藝術博物館 | 大碗島的星期日下午／*A Sunday on La Grande Jatte — 1884* | 喬治・秀拉 | 1926.224 | [館藏頁](https://www.artic.edu/artworks/27992) · [API JSON](https://api.artic.edu/api/v1/artworks/27992) · [原始影像](https://www.artic.edu/iiif/2/2d484387-2509-5e8e-2c43-22f9981972eb/full/full/0/default.jpg) |
| 芝加哥藝術博物館 | 臥室／*The Bedroom* | 文森・梵谷 | 1926.417 | [館藏頁](https://www.artic.edu/artworks/28560) · [API JSON](https://api.artic.edu/api/v1/artworks/28560) · [原始影像](https://www.artic.edu/iiif/2/6644829f-f292-c5c4-a73c-0356a6fdbf0d/full/full/0/default.jpg) |
| 芝加哥藝術博物館 | 神奈川沖浪裏（巨浪）／*Under the Wave off Kanagawa (Kanagawa oki nami ura), also known as The Great Wave, from the series "Thirty-Six Views of Mount Fuji (Fugaku sanjūrokkei)"* | 葛飾北齋 | 1925.3245 | [館藏頁](https://www.artic.edu/artworks/24645) · [API JSON](https://api.artic.edu/api/v1/artworks/24645) · [原始影像](https://www.artic.edu/iiif/2/b3974542-b9b4-7568-fc4b-966738f61d78/full/full/0/default.jpg) |
| 芝加哥藝術博物館 | 巴黎街景；雨天／*Paris Street; Rainy Day* | 古斯塔夫・卡耶博特 | 1964.336 | [館藏頁](https://www.artic.edu/artworks/20684) · [API JSON](https://api.artic.edu/api/v1/artworks/20684) · [原始影像](https://www.artic.edu/iiif/2/f8fd76e9-c396-5678-36ed-6a348c904d27/full/full/0/default.jpg) |
| 芝加哥藝術博物館 | 兩姊妹（露台上）／*Two Sisters (On the Terrace)* | 皮耶-奧古斯特・雷諾瓦 | 1933.455 | [館藏頁](https://www.artic.edu/artworks/14655) · [API JSON](https://api.artic.edu/api/v1/artworks/14655) · [原始影像](https://www.artic.edu/iiif/2/3a608f55-d76e-fa96-d0b1-0789fbc48f1e/full/full/0/default.jpg) |
| 芝加哥藝術博物館 | 紅磨坊／*At the Moulin Rouge* | 亨利・德・土魯斯-羅特列克 | 1928.610 | [館藏頁](https://www.artic.edu/artworks/61128) · [API JSON](https://api.artic.edu/api/v1/artworks/61128) · [原始影像](https://www.artic.edu/iiif/2/defb4004-b500-218d-3d9b-9a02423f097d/full/full/0/default.jpg) |
| 芝加哥藝術博物館 | 一籃蘋果／*The Basket of Apples* | 保羅・塞尚 | 1926.252 | [館藏頁](https://www.artic.edu/artworks/111436) · [API JSON](https://api.artic.edu/api/v1/artworks/111436) · [原始影像](https://www.artic.edu/iiif/2/52ac8996-3460-cf71-cb42-5c4d0aa29b74/full/full/0/default.jpg) |
| 芝加哥藝術博物館 | 孩子的沐浴／*The Child's Bath* | 瑪麗・卡薩特 | 1910.2 | [館藏頁](https://www.artic.edu/artworks/111442) · [API JSON](https://api.artic.edu/api/v1/artworks/111442) · [原始影像](https://www.artic.edu/iiif/2/3b885ae0-4d46-5fe4-d70a-00474827f02c/full/full/0/default.jpg) |
| 芝加哥藝術博物館 | 麥草堆／*Stack of Wheat* | 克勞德・莫內 | 1983.29 | [館藏頁](https://www.artic.edu/artworks/111318) · [API JSON](https://api.artic.edu/api/v1/artworks/111318) · [原始影像](https://www.artic.edu/iiif/2/27c1d720-8ca5-79a4-5e51-530bf75c1591/full/full/0/default.jpg) |
| 芝加哥藝術博物館 | 鯡魚網／*The Herring Net* | 溫斯洛・霍默 | 1937.1039 | [館藏頁](https://www.artic.edu/artworks/25865) · [API JSON](https://api.artic.edu/api/v1/artworks/25865) · [原始影像](https://www.artic.edu/iiif/2/5dca7347-c6dc-24dd-d073-d705b9cdc575/full/full/0/default.jpg) |
| 芝加哥藝術博物館 | 梳妝的女子／*Woman at Her Toilette* | 貝爾特・莫里索 | 1924.127 | [館藏頁](https://www.artic.edu/artworks/11723) · [API JSON](https://api.artic.edu/api/v1/artworks/11723) · [原始影像](https://www.artic.edu/iiif/2/78c80988-6524-cec7-c661-a4c0a706d06f/full/full/0/default.jpg) |
| 克里夫蘭藝術博物館 | 高大的梧桐樹（聖雷米的修路工）／*The Large Plane Trees (Road Menders at Saint-Rémy)* | 文森・梵谷 | 1947.209 | [館藏頁](https://clevelandart.org/art/1947.209) · [API JSON](https://openaccess-api.clevelandart.org/api/artworks/1947.209) · [原始影像](https://openaccess-cdn.clevelandart.org/1947.209/1947.209_full.tif) |
| 克里夫蘭藝術博物館 | 荒野暮色／*Twilight in the Wilderness* | 弗雷德里克・艾德溫・丘奇 | 1965.233 | [館藏頁](https://clevelandart.org/art/1965.233) · [API JSON](https://openaccess-api.clevelandart.org/api/artworks/1965.233) · [原始影像](https://openaccess-cdn.clevelandart.org/1965.233/1965.233_full.tif) |
| 克里夫蘭藝術博物館 | 紅頭巾／*The Red Kerchief* | 克勞德・莫內 | 1958.39 | [館藏頁](https://clevelandart.org/art/1958.39) · [API JSON](https://openaccess-api.clevelandart.org/api/artworks/1958.39) · [原始影像](https://openaccess-cdn.clevelandart.org/1958.39/1958.39_full.tif) |
| 克里夫蘭藝術博物館 | 朵拉・惠勒肖像／*Portrait of Dora Wheeler* | 威廉・梅里特・蔡斯 | 1921.1239 | [館藏頁](https://clevelandart.org/art/1921.1239) · [API JSON](https://openaccess-api.clevelandart.org/api/artworks/1921.1239) · [原始影像](https://openaccess-cdn.clevelandart.org/1921.1239/1921.1239_full.tif) |
| 克里夫蘭藝術博物館 | 夏基拳擊俱樂部的雄鹿／*Stag at Sharkey's* | 喬治・貝洛斯 | 1922.1133 | [館藏頁](https://clevelandart.org/art/1922.1133) · [API JSON](https://openaccess-api.clevelandart.org/api/artworks/1922.1133) · [原始影像](https://openaccess-cdn.clevelandart.org/1922.1133/1922.1133_full.tif) |
| 克里夫蘭藝術博物館 | 比格林兄弟繞過標竿／*The Biglin Brothers Turning the Stake* | 湯瑪斯・艾金斯 | 1927.1984 | [館藏頁](https://clevelandart.org/art/1927.1984) · [API JSON](https://openaccess-api.clevelandart.org/api/artworks/1927.1984) · [原始影像](https://openaccess-cdn.clevelandart.org/1927.1984/1927.1984_full.tif) |
| 克里夫蘭藝術博物館 | 賽馬場（騎蒼白馬的死神）／*The Race Track (Death on a Pale Horse)* | 艾伯特・平克漢・萊德 | 1928.8 | [館藏頁](https://clevelandart.org/art/1928.8) · [API JSON](https://openaccess-api.clevelandart.org/api/artworks/1928.8) · [原始影像](https://openaccess-cdn.clevelandart.org/1928.8/1928.8_full.tif) |
| 克里夫蘭藝術博物館 | 教堂街高架鐵路／*Church Street El* | 查爾斯・席勒 | 1977.43 | [館藏頁](https://clevelandart.org/art/1977.43) · [API JSON](https://openaccess-api.clevelandart.org/api/artworks/1977.43) · [原始影像](https://openaccess-cdn.clevelandart.org/1977.43/1977.43_full.tif) |
| 克里夫蘭藝術博物館 | 哈滕費爾斯城堡附近的狩獵／*Hunting near Hartenfels Castle* | 老盧卡斯・克拉納赫 | 1958.425 | [館藏頁](https://clevelandart.org/art/1958.425) · [API JSON](https://openaccess-api.clevelandart.org/api/artworks/1958.425) · [原始影像](https://openaccess-cdn.clevelandart.org/1958.425/1958.425_full.tif) |
| 克里夫蘭藝術博物館 | 階梯上的聖家族／*The Holy Family on the Steps* | 尼古拉・普桑 | 1981.18 | [館藏頁](https://clevelandart.org/art/1981.18) · [API JSON](https://openaccess-api.clevelandart.org/api/artworks/1981.18) · [原始影像](https://openaccess-cdn.clevelandart.org/1981.18/1981.18_full.tif) |
| 克里夫蘭藝術博物館 | 聖安德烈受難／*The Crucifixion of Saint Andrew* | 卡拉瓦喬 | 1976.2 | [館藏頁](https://clevelandart.org/art/1976.2) · [API JSON](https://openaccess-api.clevelandart.org/api/artworks/1976.2) · [原始影像](https://openaccess-cdn.clevelandart.org/1976.2/1976.2_full.tif) |
| 克里夫蘭藝術博物館 | 1834 年 10 月 16 日上、下議院大火／*The Burning of the Houses of Lords and Commons, 16 October 1834* | 約瑟夫・馬洛德・威廉・透納 | 1942.647 | [館藏頁](https://clevelandart.org/art/1942.647) · [API JSON](https://openaccess-api.clevelandart.org/api/artworks/1942.647) · [原始影像](https://openaccess-cdn.clevelandart.org/1942.647/1942.647_full.tif) |

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
