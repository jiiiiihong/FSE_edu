import {test,expect} from '@playwright/test';
test.beforeEach(async({page})=>{await page.goto('/');});
test('AI FAB opens and Escape closes modal',async({page})=>{
 await page.getByRole('button',{name:'AI 기술사전 검색'}).click();
 await expect(page.getByRole('dialog',{name:'AI 기술사전'})).toBeVisible();
 await page.keyboard.press('Escape');
 await expect(page.getByRole('dialog',{name:'AI 기술사전'})).toBeHidden();
});
test('unconfigured endpoint does not call paid API',async({page})=>{
 await page.getByRole('button',{name:'AI 기술사전 검색'}).click();
 await page.getByRole('textbox',{name:'기술 용어'}).fill('Backlash');
 await page.getByRole('button',{name:'AI 검색'}).click();
 await expect(page.locator('.ai14-status')).toContainText('아직 연결되지 않았습니다');
});
test('mocked AI response saves, survives reload and supports review',async({page})=>{
 await page.addInitScript(()=>{
  window.FSE_AI_ENDPOINT='https://example.invalid/api';

  const nativeFetch=window.fetch.bind(window);
  window.fetch=(url,opts)=>String(url)==='https://example.invalid/api'?Promise.resolve(new Response(JSON.stringify({result:{term:'Backlash',korean:'백래시',summary:'기어 유격',definition:'치면 간극',understanding:'방향 전환 유격',principle:'맞물림 원리',importance:'소음과 정밀도',fieldExample:'Check backlash.',translation:'백래시를 확인하세요.',related:['Gear'],caveat:'실제 매뉴얼 확인'}}),{status:200,headers:{'Content-Type':'application/json'}})):nativeFetch(url,opts);
 });
 await page.goto('/');
 await page.evaluate(()=>{window.FSE_GET_TURNSTILE_TOKEN=async()=>'mock-token'});
 await page.getByRole('button',{name:'AI 기술사전 검색'}).click();
 await page.getByRole('textbox',{name:'기술 용어'}).fill('Backlash');
 await page.getByRole('button',{name:'AI 검색'}).click();
 await expect(page.locator('.ai14-result')).toContainText('치면 간극');
 await page.getByRole('button',{name:'상세 해설 저장'}).click();
 await expect(page.locator('.ai14-status')).toContainText('저장했습니다');
 await page.reload();
 await page.getByRole('button',{name:'AI 기술사전 검색'}).click();
 await page.getByRole('button',{name:'내 용어장'}).click();
 await expect(page.locator('.ai14-shelf')).toContainText('Backlash');
 await page.locator('.ai14-item input[type=checkbox]').check();
 await expect(page.locator('.ai14-item input[type=checkbox]')).toBeChecked();
});
