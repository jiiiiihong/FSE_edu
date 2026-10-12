import {test,expect} from '@playwright/test';
test.beforeEach(async({page})=>{await page.goto('/');});
test('AI FAB opens and Escape closes modal',async({page})=>{
 await page.getByRole('button',{name:'통합 기술 사전 검색'}).click();
 await expect(page.getByRole('dialog',{name:'AI 기술사전'})).toBeVisible();
 await page.keyboard.press('Escape');
 await expect(page.getByRole('dialog',{name:'AI 기술사전'})).toBeHidden();
});
test('configured endpoint requires verification and never calls paid API when verification fails',async({page})=>{
 let apiCalls=0;
 await page.route('https://fse-gear-dictionary-api.kimjihong789.workers.dev/**',async route=>{apiCalls++;await route.fulfill({status:500,body:'unexpected API call'});});
 await page.evaluate(()=>{window.FSE_GET_TURNSTILE_TOKEN=async()=>{throw Error('보안 인증 실패')};});
 await page.getByRole('button',{name:'통합 기술 사전 검색'}).click();
 await page.getByRole('textbox',{name:'기술 용어'}).fill('Backlash');
 await page.getByRole('button',{name:'AI 검색'}).click();
 await expect(page.locator('.ai14-status')).toContainText('보안 인증 실패');
 expect(apiCalls).toBe(0);
});
test('mocked AI response saves, survives reload and supports review',async({page})=>{
 await page.route('https://fse-gear-dictionary-api.kimjihong789.workers.dev/**',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({result:{term:'Backlash',korean:'백래시',summary:'기어 유격',definition:'치면 간극',understanding:'방향 전환 유격',principle:'맞물림 원리',importance:'소음과 정밀도',fieldExample:'Check backlash.',translation:'백래시를 확인하세요.',related:['Gear'],caveat:'실제 매뉴얼 확인'}})}));
 await page.evaluate(()=>{window.FSE_GET_TURNSTILE_TOKEN=async()=>'mock-token'});
 await page.getByRole('button',{name:'통합 기술 사전 검색'}).click();
 await page.getByRole('textbox',{name:'기술 용어'}).fill('Backlash');
 await page.getByRole('button',{name:'AI 검색'}).click();
 await expect(page.locator('.ai14-result')).toContainText('치면 간극');
 await page.getByRole('button',{name:'상세 해설 저장'}).click();
 await expect(page.locator('.ai14-status')).toContainText('저장했습니다');
 await page.reload();
 await page.getByRole('button',{name:'통합 기술 사전 검색'}).click();
 await page.getByRole('button',{name:'내 용어장'}).click();
 await expect(page.locator('.ai14-shelf')).toContainText('Backlash');
 await page.locator('.ai14-item input[type=checkbox]').check();
 await expect(page.locator('.ai14-item input[type=checkbox]')).toBeChecked();
});

test('one floating entry and legacy search remain accessible',async({page})=>{await expect(page.locator('.ai14-fab')).toHaveCount(0);await expect(page.locator('#dictFab')).toHaveCount(1);await page.locator('#dictFab').click();await page.getByRole('button',{name:'기본 사전 검색'}).click();await expect(page.locator('#dictOverlay')).toBeVisible();await page.locator('#dictQuery').fill('Backlash');await expect(page.locator('#dictResults')).toContainText('Backlash')});

test('mobile dictionary header buttons remain horizontal and inside viewport',async({page},testInfo)=>{
 await page.getByRole('button',{name:'통합 기술 사전 검색'}).click();
 const dialog=page.getByRole('dialog',{name:'AI 기술사전'});
 await expect(dialog).toBeVisible();
 const basic=dialog.getByRole('button',{name:'기본 사전 검색'});
 const close=dialog.getByRole('button',{name:'닫기'});
 for(const btn of [basic,close]){
  const metrics=await btn.evaluate(el=>{const r=el.getBoundingClientRect();const st=getComputedStyle(el);return {x:r.x,right:r.right,width:r.width,height:r.height,lineHeight:parseFloat(st.lineHeight),whiteSpace:st.whiteSpace,viewport:document.documentElement.clientWidth}});
  expect(metrics.x).toBeGreaterThanOrEqual(0);
  expect(metrics.right).toBeLessThanOrEqual(metrics.viewport+1);
  expect(metrics.whiteSpace).toBe('nowrap');
  expect(metrics.height).toBeLessThan(70);
 }
 await expect(dialog.getByRole('button',{name:'AI 검색'})).toBeVisible();
 await basic.click();
 await expect(page.locator('#dictOverlay')).toBeVisible();
});
