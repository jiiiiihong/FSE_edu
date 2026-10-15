import { test, expect } from '@playwright/test';
test('homepage loads', async ({ page }) => {
  await page.goto('/legacy.html');
  await expect(page.locator('h1')).toContainText('FSE Gear Academy');
  await expect(page.locator('nav .fse-more')).toBeVisible();
});
test('more menu opens quiz and returns to calculator', async ({ page }) => {
  await page.goto('/legacy.html');
  await page.locator('nav .fse-more').click();
  await expect(page.locator('#fse-more-menu')).toBeVisible();
  await page.locator('#fse-more-menu button').first().click();
  await expect(page.locator('nav .fse-more')).toHaveClass(/active/);
  await page.locator('nav [data-tab="calc"]').click();
  await expect(page.locator('nav [data-tab="calc"]')).toHaveClass(/active/);
});
for (const width of [320, 375, 390, 430]) {
  test('no horizontal overflow at '+width, async ({ page }) => {
    await page.setViewportSize({width,height:800});
    await page.goto('/legacy.html');
    await expect.poll(async () => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });
}
test('AI dictionary saved explanation is preserved', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('fse_ai_dictionary_v1_4', JSON.stringify([{
      term:'Hobbing cutter',korean:'호브 커터',summary:'기어 가공용 공구',
      definition:'절삭 공구',understanding:'기어 치형을 생성',principle:'창성 가공',
      importance:'치형 정밀도',fieldExample:'Check the cutter',translation:'커터 확인',
      related:['Hobbing'],caveat:'설정 확인',memo:'보존 메모',reviewed:true
    }]));
  });
  await page.goto('/legacy.html');
  await page.locator('#dictFab').click();
  await page.locator('.ai14-tabs button').filter({hasText:'내 용어장'}).click();
  await page.locator('.ai14-shelf button').filter({hasText:'Hobbing cutter'}).click();
  await expect(page.locator('.ai16-summary')).toContainText('기어 가공용 공구');
  await expect(page.locator('.ai16-section')).toHaveCount(8);
  await expect(page.locator('.ai16-save')).toBeDisabled();
  await page.reload();
  const item = await page.evaluate(() => JSON.parse(localStorage.getItem('fse_ai_dictionary_v1_4'))[0]);
  expect(item.memo).toBe('보존 메모');
  expect(item.reviewed).toBe(true);
});
