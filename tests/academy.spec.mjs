import { test, expect } from '@playwright/test';
async function openTab(page,tab){
 if(['quiz','cases','notes'].includes(tab)){
  await page.locator('nav .fse-more').click();
  const index={quiz:0,cases:1,notes:2}[tab];
  await page.locator('#fse-more-menu button').nth(index).click();
  await expect(page.locator('nav [data-tab="'+tab+'"]')).toHaveClass(/active/);
 }else{
  await page.locator('nav [data-tab="'+tab+'"]').click();
 }
}

test.beforeEach(async ({page})=>{
 await page.goto('/legacy.html');
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
  await expect(units.nth(i).locator('details.term').first()).toBeVisible();
  await units.nth(i).locator('details.term summary').first().click();
  await expect(units.nth(i).locator('details.term').first()).toHaveAttribute('open','');
 }
});
test('quiz answers update feedback and score',async ({page})=>{
 await openTab(page,'quiz');
 await expect(page.locator('[data-q]').first()).toBeVisible();
 await page.locator('[data-q="0"][data-choice="1"]').click();
 await expect(page.locator('#ex0')).toContainText('정답');
 await expect(page.locator('#score')).toContainText('정답 1개');
 await page.locator('[data-q="0"][data-choice="0"]').click();
 await expect(page.locator('#ex0')).toContainText('오답');
});
test('calculator gives correct result and rejects invalid inputs',async ({page})=>{
 await openTab(page,'calc');
 await page.locator('#mn').fill('2');await page.locator('#z').fill('40');
 await page.locator('#beta').fill('0');await page.locator('#alpha').fill('20');
 await page.locator('#calculate').click();
 await expect(page.locator('#result')).toContainText('80.0000 mm');
 await page.locator('#z').fill('0');await page.locator('#calculate').click();
 await expect(page.locator('#result')).toContainText('입력값을 확인하세요');
});
test('all eight calculation exercises grade correctly',async ({page})=>{
 await openTab(page,'cases');
 const values=['80','6.283','69.282','60','40','150.796','0.04','300'];
 for(let i=0;i<values.length;i++){
  await page.locator('#case'+i).fill(values[i]);
  await page.locator('button[data-check="'+i+'"]').click();
  await expect(page.locator('#caseResult'+i)).toContainText('정답');
 }
});
test('notes can be saved and restored',async ({page})=>{
 await openTab(page,'notes');
 await page.locator('#memo').fill('verification sample');
 await page.locator('#saveMemo').click();
 await page.reload();await openTab(page,'notes');
 await expect(page.locator('#memo')).toHaveValue('verification sample');
});

test('chapter quiz navigation and answer persistence',async ({page})=>{
 for(let unit=0;unit<7;unit++){
  await openTab(page,'home');
  const d=page.locator('details[data-unit]').nth(unit);
  await d.locator('summary').first().click();
  await d.locator('button[data-openquiz]').click();
  await expect(page.locator('#unitSelect')).toHaveValue(String(unit));
  await expect(page.locator('[data-q]').first()).toBeVisible();
 }
 await page.locator('#unitSelect').selectOption('0');
 await page.locator('[data-q="0"][data-choice="1"]').click();
 await expect(page.locator('#ex0')).toContainText('정답');
 await page.reload();await openTab(page,'quiz');
 await expect(page.locator('#ex0')).toContainText('정답');
});
test('quiz scoring counts correct, incorrect and completed answers',async ({page})=>{
 await openTab(page,'quiz');
 const ids=await page.locator('button[data-q]').evaluateAll(els=>[...new Set(els.map(e=>e.dataset.q))]);
 await expect(page.locator('#score')).toContainText('단원 풀이 0/');
 for(const id of ids){
  const choice=await page.locator('button[data-q="'+id+'"]').evaluateAll(els=>els.map(e=>Number(e.dataset.choice)));
  await page.locator('button[data-q="'+id+'"][data-choice="'+choice[0]+'"]').click();
 }
 await expect(page.locator('#score')).toContainText('단원 풀이 '+ids.length+'/'+ids.length);
 await expect(page.locator('#score')).toContainText('점');
});
test('calculator independently verified geometry and boundaries',async ({page})=>{
 await openTab(page,'calc');
 await page.locator('#mn').fill('2');await page.locator('#z').fill('30');
 await page.locator('#beta').fill('30');await page.locator('#alpha').fill('20');
 await page.locator('#calculate').click();
 const diameter=30*2/Math.cos(Math.PI/6);
 await expect(page.locator('#result')).toContainText(diameter.toFixed(4)+' mm');
 for(const bad of ['0','-2','2.5']){
  await page.locator('#z').fill(bad);await page.locator('#calculate').click();
  await expect(page.locator('#result')).toContainText('입력값을 확인하세요');
 }
 await page.locator('#z').fill('30');
 for(const beta of ['85','-85']){
  await page.locator('#beta').fill(beta);await page.locator('#calculate').click();
  await expect(page.locator('#result')).toContainText('입력값을 확인하세요');
 }
});
test('exercise incorrect and blank values rejected',async ({page})=>{
 await openTab(page,'cases');
 await page.locator('button[data-check="0"]').click();
 await expect(page.locator('#caseResult0')).toContainText('다시 확인');
 await page.locator('#case0').fill('79');
 await page.locator('button[data-check="0"]').click();
 await expect(page.locator('#caseResult0')).toContainText('다시 확인');
});
test('progress checkbox persists and updates progress',async ({page})=>{
 const unit=page.locator('details[data-unit]').first();
 await unit.locator('summary').first().click();
 await unit.locator('input[data-done]').first().check();
 await expect(page.locator('progress')).toHaveAttribute('value','1');
 await page.reload();
 await expect(page.locator('progress')).toHaveAttribute('value','1');
});
test('mobile layout avoids horizontal overflow and navigation remains operable',async ({page,isMobile})=>{
 if(!isMobile)return;
 const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth+1);
 expect(overflow).toBe(false);
 for(const tab of ['home','calc','quiz','cases','notes']){
  await openTab(page,tab);
  await expect(page.locator('nav [data-tab="'+tab+'"]')).toHaveClass(/active/);
 }
});
test('runtime exceptions absent across all tabs',async ({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 for(const tab of ['home','calc','quiz','cases','notes']){
  await openTab(page,tab);
 }
 expect(errors).toEqual([]);
});

test('every DUMPE phase is present in every chapter',async ({page})=>{
 const labels=['D · Definition','U · Understanding','M · Memorization','P · Practice','E · Expansion'];
 const units=page.locator('details[data-unit]');
 await expect(units).toHaveCount(7);
 for(let i=0;i<7;i++){
  const unit=units.nth(i);
  await unit.locator('summary').first().click();
  for(const label of labels) await expect(unit.getByText(label,{exact:true})).toBeVisible();
  await expect(unit.locator('button[data-openquiz]')).toBeVisible();
 }
});
for(const [unitIndex,count] of [8,9,8,9,8,8,8].entries()){
 test('legacy glossary unit '+(unitIndex+1)+': all '+count+' definitions open',async({page})=>{
  const unit=page.locator('details[data-unit]').nth(unitIndex);
  await unit.locator('summary').first().click();
  const cards=unit.locator('details.term');await expect(cards).toHaveCount(count);
  for(let i=0;i<count;i++){
   const card=cards.nth(i);await card.locator('summary').click();
   await expect(card).toHaveAttribute('open','');await expect(card.locator('p')).not.toBeEmpty();
  }
 });
}
test('all 36 quiz questions have visible choices and grading feedback',async ({page})=>{
 await openTab(page,'quiz');
 const seen=new Set();
 for(let unit=0;unit<7;unit++){
  await page.locator('#unitSelect').selectOption(String(unit));
  const questions=page.locator('[data-q]').filter({has:page.locator('[data-choice]')});
  const ids=await page.locator('button[data-q][data-choice]').evaluateAll(els=>[...new Set(els.map(e=>e.dataset.q))]);
  expect(ids.length).toBeGreaterThan(0);
  for(const id of ids){
   seen.add(id);
   const choices=page.locator('button[data-q="'+id+'"][data-choice]');
   await expect(choices).toHaveCount(3);
   await choices.first().click();
   await expect(page.locator('#ex'+id)).toContainText(/정답|오답/);
  }
 }
 expect(seen.size).toBe(36);
});
