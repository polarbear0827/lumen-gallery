import { expect, test, type Page } from '@playwright/test'

async function useLocalFallbackOnly(page: Page) {
  await page.route(/(collectionapi\.metmuseum|api\.artic|openaccess-api\.clevelandart)/, (route) => route.abort())
}

test('作品不裁切、不變形，並可切換作品', async ({ page }) => {
  await useLocalFallbackOnly(page)
  await page.goto('./')
  await expect(page).toHaveTitle(/光室/)
  await expect(page.getByRole('heading', { name: '麥田與柏樹' })).toBeVisible()

  const image = page.locator('.artwork-frame img')
  await expect(image).toBeVisible()
  await image.evaluate((element: HTMLImageElement) => element.decode())

  const ratios = await image.evaluate((element: HTMLImageElement) => ({
    natural: element.naturalWidth / element.naturalHeight,
    rendered: element.getBoundingClientRect().width / element.getBoundingClientRect().height,
  }))
  expect(Math.abs(ratios.natural - ratios.rendered)).toBeLessThan(0.02)

  await page.getByRole('button', { name: '下一件作品' }).click()
  await expect(page.getByRole('heading', { name: '戴草帽的自畫像' })).toBeVisible()
})

test('API 載入至少一千件且全部是繪畫或攝影', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', '只需在桌面版驗證一次大型 API 批次')
  await page.goto('./')
  await expect.poll(async () => {
    const text = await page.locator('.gallery-count p').textContent()
    return Number(text?.match(/已載入 ([\d,]+)/)?.[1].replaceAll(',', '') ?? 0)
  }, { timeout: 30_000 }).toBeGreaterThanOrEqual(1_000)

  await page.getByRole('button', { name: '典藏' }).click()
  const typeLabels = await page.locator('.collection-copy small').allTextContents()
  expect(typeLabels.length).toBeGreaterThanOrEqual(1_000)
  expect(typeLabels.every((label) => label.startsWith('繪畫') || label.startsWith('攝影'))).toBe(true)
})

test('完整作品題名允許換行且不使用省略裁切', async ({ page }) => {
  await useLocalFallbackOnly(page)
  await page.goto('./')
  await page.getByRole('button', { name: '顯示《大碗島的星期日下午》' }).click()
  const title = page.getByRole('heading', { name: '大碗島的星期日下午' })
  await expect(title).toBeVisible()
  const titleLayout = await title.evaluate((element) => {
    const style = getComputedStyle(element)
    return {
      clientHeight: element.clientHeight,
      scrollHeight: element.scrollHeight,
      overflow: style.overflow,
      textOverflow: style.textOverflow,
      whiteSpace: style.whiteSpace,
    }
  })
  expect(titleLayout.scrollHeight - titleLayout.clientHeight).toBeLessThanOrEqual(4)
  expect(titleLayout.overflow).not.toBe('hidden')
  expect(titleLayout.textOverflow).not.toBe('ellipsis')
  expect(titleLayout.whiteSpace).toBe('normal')
})

test('不同長寬比作品不會推動資料與導覽按鈕', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', '只在桌面版專案執行')
  await useLocalFallbackOnly(page)
  await page.goto('./')

  await expect.poll(() => page.locator('.artwork-frame img').evaluate((element: HTMLImageElement) => (
    element.complete && element.naturalWidth > 0
  ))).toBe(true)
  await page.waitForTimeout(300)

  const detailsButton = page.getByRole('button', { name: '作品資料與來源' })
  const nextButton = page.getByRole('button', { name: '下一件作品' })
  const before = {
    details: (await detailsButton.boundingBox())?.y,
    next: (await nextButton.boundingBox())?.y,
  }

  await nextButton.click()
  await expect(page.getByRole('heading', { name: '戴草帽的自畫像' })).toBeVisible()
  const after = {
    details: (await detailsButton.boundingBox())?.y,
    next: (await nextButton.boundingBox())?.y,
  }

  expect(Math.abs((before.details ?? 0) - (after.details ?? 0))).toBeLessThanOrEqual(1)
  expect(Math.abs((before.next ?? 0) - (after.next ?? 0))).toBeLessThanOrEqual(1)
})

test('完整來源面板可開啟並以鍵盤關閉', async ({ page }) => {
  await useLocalFallbackOnly(page)
  await page.goto('./')
  const detailsButton = page.getByRole('button', { name: '作品資料與來源' })
  await expect(detailsButton).toBeVisible()
  await detailsButton.click()
  const drawer = page.getByRole('dialog', { name: '作品資料與來源' })
  await expect(drawer).toBeVisible()
  await expect(drawer.getByText('1993.132')).toBeVisible()
  await expect(drawer.getByRole('link', { name: '檢視原始 API JSON' })).toHaveAttribute('href', /collectionapi\.metmuseum\.org/)
  await page.keyboard.press('Escape')
  await expect(drawer).toBeHidden()
})

test('全螢幕只套用在作品舞台', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', '只在桌面版專案執行')
  await useLocalFallbackOnly(page)
  await page.goto('./')
  const fullscreenButton = page.getByRole('button', { name: '作品全螢幕' })
  await expect(fullscreenButton).toBeVisible()
  await fullscreenButton.click()
  await expect.poll(() => page.evaluate(() => document.fullscreenElement?.classList.contains('artwork-stage'))).toBe(true)
  expect(await page.evaluate(() => document.fullscreenElement?.contains(document.querySelector('.site-header')))).toBe(false)
  const fullscreenFit = await page.locator('.artwork-frame img').evaluate((element: HTMLImageElement) => {
    const box = element.getBoundingClientRect()
    return {
      fillsOneAxis: Math.abs(box.width - window.innerWidth) <= 2 || Math.abs(box.height - window.innerHeight) <= 2,
      naturalRatio: element.naturalWidth / element.naturalHeight,
      renderedRatio: box.width / box.height,
    }
  })
  expect(fullscreenFit.fillsOneAxis).toBe(true)
  expect(Math.abs(fullscreenFit.naturalRatio - fullscreenFit.renderedRatio)).toBeLessThan(0.02)
  await page.keyboard.press('Escape')
})

test('行動版沒有水平溢位，控制項符合觸控尺寸', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', '只在行動版專案執行')
  await useLocalFallbackOnly(page)
  await page.goto('./')
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  expect(overflow).toBeLessThanOrEqual(1)

  const detailsButton = page.getByRole('button', { name: '作品資料與來源' })
  const box = await detailsButton.boundingBox()
  expect(box?.height ?? 0).toBeGreaterThanOrEqual(44)

  const slideshowBox = await page.getByRole('button', { name: '開啟輪播模式' }).boundingBox()
  expect(slideshowBox?.height ?? 0).toBeGreaterThanOrEqual(44)
})

test('輪播模式可啟動、自動換畫並暫停', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', '只在桌面版驗證計時互動')
  await useLocalFallbackOnly(page)
  await page.goto('./')

  const before = await page.locator('.gallery-count strong').textContent()
  await page.getByRole('button', { name: '開啟輪播模式' }).click()
  await expect(page.getByRole('button', { name: '暫停輪播模式' })).toHaveAttribute('aria-pressed', 'true')
  await page.waitForTimeout(6_300)
  const after = await page.locator('.gallery-count strong').textContent()
  expect(after).not.toBe(before)

  await page.getByRole('button', { name: '暫停輪播模式' }).click()
  await expect(page.getByRole('button', { name: '開啟輪播模式' })).toHaveAttribute('aria-pressed', 'false')
})
