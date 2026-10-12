import {test,expect} from '@playwright/test';
test.beforeEach(async({page})=>{await page.goto('/');await expect(page.locator('#dictFab')).toBeVisible()});
test('floating dictionary opens, searches built-in glossary, saves and persists',async({page})=>{
 await page.locator('#dictFab').click();await page.getByRole('button',{name:'기본 사전 검색'}).click();
 await expect(page.locator('#dictOverlay')).toBeVisible();
 await page.locator('#dictQuery').fill('Backlash');
 await expect(page.locator('#dictResults')).toContainText('Backlash');
 await page.locator('#dictResults button').first().click();
 await expect(page.locator('#dictMessage')).toContainText('저장했습니다');
 await page.locator('#dictClose').click();
 await page.locator('nav [data-tab="dictionary"]').click();
 await expect(page.locator('#dictShelfList')).toContainText('Backlash');
 await page.reload();await page.locator('nav [data-tab="dictionary"]').click();
 await expect(page.locator('#dictShelfList')).toContainText('Backlash');
});
test('unknown word offers secure external lookup and saves search term',async({page})=>{
 await page.locator('#dictFab').click();await page.getByRole('button',{name:'기본 사전 검색'}).click();
 await page.locator('#dictQuery').fill('unknown_gear_terminology_xyz');
 const a=page.locator('#dictResults a');
 await expect(a).toHaveAttribute('href',/https:\/\/en\.wiktionary\.org\/wiki\//);
 await expect(a).toHaveAttribute('rel','noopener noreferrer');
 await page.locator('#dictResults button').click();
 await page.locator('#dictClose').click();
 await page.locator('nav [data-tab="dictionary"]').click();
 await expect(page.locator('#dictShelfList')).toContainText('unknown_gear_terminology_xyz');
});
test('dictionary memo, review, delete and export controls',async({page})=>{
 await page.locator('#dictFab').click();await page.getByRole('button',{name:'기본 사전 검색'}).click();await page.locator('#dictQuery').fill('Backlash');
 await page.locator('#dictResults button').first().click();await page.locator('#dictClose').click();
 await page.locator('nav [data-tab="dictionary"]').click();
 await page.locator('#dictShelfList textarea').first().fill('Measured at room temperature');
 await page.locator('#dictShelfList button').filter({hasText:'메모 저장'}).first().click();
 await page.locator('#dictShelfList button').filter({hasText:'복습 완료 표시'}).first().click();
 await expect(page.locator('#dictShelfList')).toContainText('✓ 복습 완료');
 await page.locator('details.dict-advanced > summary').click();
 await expect(page.getByRole('button',{name:'JSON 백업'})).toBeVisible();
 page.once('dialog',d=>d.accept());
 await page.locator('#dictShelfList button').filter({hasText:'삭제'}).first().click();
 await expect(page.locator('#dictShelfList')).toContainText('저장된 용어가 없습니다');
});
test('floating button only on learning tab and popup closes with escape',async({page})=>{
 await page.locator('#dictFab').click();await page.getByRole('button',{name:'기본 사전 검색'}).click();await page.keyboard.press('Escape');
 await expect(page.locator('#dictOverlay')).toBeHidden();
 await page.locator('nav .fse-more').click();
 await page.locator('#fse-more-menu button').first().click();
 await expect(page.locator('#dictFab')).toBeHidden();
 await page.locator('nav [data-tab="home"]').click();
 await expect(page.locator('#dictFab')).toBeVisible();
});
