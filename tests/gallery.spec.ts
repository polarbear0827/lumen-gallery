import { expect, test } from '@playwright/test'

test('作品不裁切、不變形，並可切換作品', async ({ page }) => {
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

test('完整來源面板可開啟並以鍵盤關閉', async ({ page }) => {
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

test('行動版沒有水平溢位，控制項符合觸控尺寸', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', '只在行動版專案執行')
  await page.goto('./')
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  expect(overflow).toBeLessThanOrEqual(1)

  const detailsButton = page.getByRole('button', { name: '作品資料與來源' })
  const box = await detailsButton.boundingBox()
  expect(box?.height ?? 0).toBeGreaterThanOrEqual(44)
})
