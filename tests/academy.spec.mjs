import { test, expect } from '@playwright/test';
test.beforeEach(async ({page})=>{
 await page.goto('/');
 await expect(page.locator('#app')).not.toContainText('학습 자료를 불러오는 중입니다.');
});
test('initial load and no runtime exceptions',async ({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.reload();
 await expect(page.getByRole('heading',{name:/FSE Gear Academy/})).toBeVisible();
 expect(errors).toEqual([]);
});
test('all seven chapters open and DUMPE content exists',async ({page})=>{
 const units=page.locator('details[data-unit]');
 await expect(units).toHaveCount(7);
 for(let i=0;i<7;i++){
  await units.nth(i).locator('summary').first().click();
  await expect(units.nth(i).getByText('D · Definition')).toBeVisible();
  await expect(units.nth(i).getByText('E · Expansion')).toBeVisible();
  await expect(units.nth(i).locator('details.term').first()).toHaveCount(1);
  await units.nth(i).locator('details.term summary').first().click();
  await expect(units.nth(i).locator('details.term').first()).toHaveAttribute('open','');
 }
});
test('quiz answers update feedback and score',async ({page})=>{
 await page.locator('nav button[data-tab="quiz"]').click();
 await expect(page.locator('[data-q]').first()).toBeVisible();
 await page.locator('[data-q="0"][data-choice="1"]').click();
 await expect(page.locator('#ex0')).toContainText('정답');
 await expect(page.locator('#score')).toContainText('정답 1개');
 await page.locator('[data-q="0"][data-choice="0"]').click();
 await expect(page.locator('#ex0')).toContainText('오답');
});
test('calculator gives correct result and rejects invalid inputs',async ({page})=>{
 await page.locator('nav button[data-tab="calc"]').click();
 await page.locator('#mn').fill('2');await page.locator('#z').fill('40');
 await page.locator('#beta').fill('0');await page.locator('#alpha').fill('20');
 await page.locator('#calculate').click();
 await expect(page.locator('#result')).toContainText('80.0000 mm');
 await page.locator('#z').fill('0');await page.locator('#calculate').click();
 await expect(page.locator('#result')).toContainText('입력값을 확인하세요');
});
test('all eight calculation exercises grade correctly',async ({page})=>{
 await page.locator('nav button[data-tab="cases"]').click();
 const values=['80','6.283','69.282','60','40','150.796','0.04','300'];
 for(let i=0;i<values.length;i++){
  await page.locator('#case'+i).fill(values[i]);
  await page.locator('button[data-check="'+i+'"]').click();
  await expect(page.locator('#caseResult'+i)).toContainText('정답');
 }
});
test('notes can be saved and restored',async ({page})=>{
 await page.locator('nav button[data-tab="notes"]').click();
 await page.locator('#memo').fill('verification sample');
 await page.locator('#saveMemo').click();
 await page.reload();await page.locator('nav button[data-tab="notes"]').click();
 await expect(page.locator('#memo')).toHaveValue('verification sample');
});
