/* v1.4 experimental AI detail screen. API integration is disabled until deployment config and Turnstile are approved. */
(()=>{"use strict";
const KEY="fse_ai_dictionary_v1_4",OLD="fse_dictionary_v1_3";
const safe=(v,max=2500)=>String(v??"").slice(0,max);
const fields=[["definition","1. 전문 정의 (Definition)"],["understanding","2. 쉬운 설명 (Understanding)"],["principle","3. 기술 원리"],["importance","4. 왜 중요한가?"],["fieldExample","5. 현장 영어 예문"],["translation","한국어 번역"],["caveat","주의사항"]];
let saved=[];try{const x=JSON.parse(localStorage.getItem(KEY)||"[]");if(Array.isArray(x))saved=x.filter(y=>y&&typeof y.term==="string").slice(0,300)}catch{}
const el=(tag,cls,txt)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(txt!==undefined)e.textContent=txt;return e};
const root=el("section","ai14-overlay");root.hidden=true;root.setAttribute("role","dialog");root.setAttribute("aria-modal","true");root.setAttribute("aria-label","AI 기술사전");
const sheet=el("div","ai14-sheet"),bar=el("div","ai14-bar"),title=el("strong","","AI Engineering Dictionary"),close=el("button","","닫기");close.type="button";bar.append(title,close);
const form=el("form","ai14-search"),input=el("input"),submit=el("button","","AI 검색");input.placeholder="예: Backlash";input.maxLength=120;input.required=true;input.setAttribute("aria-label","기술 용어");const modelLabel=el("label","ai15-model-label","AI 모델"),modelSelect=el("select","ai15-model");modelSelect.setAttribute("aria-label","AI 모델 선택");for(const [id,name] of [["gpt-6-luna","GPT-6 Luna · 경제형"],["gpt-4.1-mini","GPT-4.1 mini"],["gpt-4.1","GPT-4.1 · 고성능"]]){const option=el("option","",name);option.value=id;modelSelect.append(option)}modelLabel.append(modelSelect);try{const preferred=localStorage.getItem("fse_ai_model_v1_5");if([...modelSelect.options].some(o=>o.value===preferred))modelSelect.value=preferred}catch{}modelSelect.onchange=()=>{try{localStorage.setItem("fse_ai_model_v1_5",modelSelect.value)}catch{}};form.append(input,modelLabel,submit);
const status=el("p","ai14-status","AI 연결 설정 전에는 저장된 용어만 확인할 수 있습니다."),result=el("div","ai14-result"),shelf=el("div","ai14-shelf"),tabs=el("div","ai14-tabs"),searchTab=el("button","","검색"),savedTab=el("button","","내 용어장");
searchTab.type=savedTab.type="button";tabs.append(searchTab,savedTab);sheet.append(bar,tabs,form,status,result,shelf);root.append(sheet);document.body.append(root);
let previous=null,active="search";const showTab=t=>{active=t;form.hidden=t!=="search";result.hidden=t!=="search";shelf.hidden=t!=="saved";if(t==="saved")drawShelf()};
const open=()=>{previous=document.activeElement;root.hidden=false;document.body.classList.add("ai14-open");showTab("search");input.focus()};
const hide=()=>{root.hidden=true;document.body.classList.remove("ai14-open");previous?.focus?.()};
close.onclick=hide;root.addEventListener("click",e=>{if(e.target===root)hide()});document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!root.hidden)hide()});
searchTab.onclick=()=>showTab("search");savedTab.onclick=()=>showTab("saved");
function store(){try{localStorage.setItem(KEY,JSON.stringify(saved));return true}catch{status.textContent="저장 공간이 부족하거나 브라우저 저장이 차단되었습니다.";return false}}
function display(item){result.replaceChildren();const h=el("h2","",safe(item.term,120));result.append(h,el("p","",safe(item.korean,200)+" · "+safe(item.summary,500)));
for(const [key,label] of fields){result.append(el("h3","",label),el("p","",safe(item[key])))}
result.append(el("h3","","6. 관련 용어"),el("p","",Array.isArray(item.related)?item.related.map(x=>safe(x,100)).join(" · "):""));
result.append(el("p","ai14-notice","AI 생성 정보입니다. 기술 도식 및 수치는 검증된 출처가 제공될 때만 표시합니다."));
const save=el("button","","상세 해설 저장");save.onclick=()=>{const entry={...item,term:safe(item.term,120),savedAt:new Date().toISOString(),memo:"",reviewed:false};const n=saved.findIndex(x=>x.term.toLowerCase()===entry.term.toLowerCase());if(n>=0){status.textContent="이미 저장된 용어입니다. 기존 메모를 보호하기 위해 덮어쓰지 않았습니다.";return}if(saved.length>=300){status.textContent="용어장 최대 300개입니다.";return}saved.unshift(entry);if(store())status.textContent="상세 해설을 저장했습니다."};result.append(save)}
function drawShelf(){shelf.replaceChildren();const h=el("h2","","내 AI 용어장");shelf.append(h);let old=[];try{old=JSON.parse(localStorage.getItem(OLD)||"null")?.entries||[]}catch{};shelf.append(el("p","ai14-notice",`v1.3 용어장 ${Array.isArray(old)?old.length:0}개는 기존 저장소에 그대로 보존됩니다.`));
for(const item of saved){const row=el("div","ai14-item"),btn=el("button","",safe(item.term,120));btn.onclick=()=>{showTab("search");input.value=item.term;display(item)};row.append(btn);const memo=el("textarea");memo.value=safe(item.memo,2000);memo.placeholder="개인 메모";memo.setAttribute("aria-label",item.term+" 개인 메모");memo.onchange=()=>{item.memo=safe(memo.value,2000);store()};row.append(memo);const check=el("label"),tick=el("input");tick.type="checkbox";tick.checked=item.reviewed===true;tick.onchange=()=>{item.reviewed=tick.checked;store()};check.append(tick,document.createTextNode(" 복습 완료"));row.append(check);const del=el("button","","삭제");del.onclick=()=>{if(confirm(item.term+" 삭제할까요?")){saved=saved.filter(x=>x!==item);store();drawShelf()}};row.append(del);shelf.append(row)}}
form.onsubmit=async e=>{e.preventDefault();const term=input.value.trim();if(!term)return;const existing=saved.find(x=>x.term.toLowerCase()===term.toLowerCase());if(existing){display(existing);status.textContent="저장된 해설을 표시했습니다.";return}
const endpoint=window.FSE_AI_ENDPOINT;if(!endpoint){status.textContent="AI 서버가 아직 연결되지 않았습니다. 서버 보안 설정과 배포 승인 후 활성화됩니다.";return}
const getToken=window.FSE_GET_TURNSTILE_TOKEN;if(typeof getToken!=="function"){status.textContent="보안 인증이 구성되지 않았습니다.";return}
submit.disabled=true;status.textContent="AI 해설 생성 중...";
try{const token=await getToken();const response=await fetch(endpoint,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({term,model:modelSelect.value,turnstileToken:token})});if(!response.ok)throw Error("서버 오류 "+response.status);const data=await response.json();if(!data.result||typeof data.result.term!=="string")throw Error("응답 형식 오류");display(data.result);status.textContent="AI 생성 결과 · "+safe(data.model||modelSelect.value,40)+" · 실제 장비 설정은 매뉴얼과 대조하세요."}catch(err){status.textContent="검색 실패: "+safe(err.message,120)}finally{submit.disabled=false}};

// Public Turnstile site key only. Secrets stay in Cloudflare Worker settings.
// A callback is supplied to the AI search screen; the API endpoint remains disabled until approved.
const TURNSTILE_SITE_KEY="0x4AAAAAAFUajcjDlrVxMABK";
let turnstileLoader=null;
function loadTurnstile(){
 if(window.turnstile)return Promise.resolve(window.turnstile);
 if(turnstileLoader)return turnstileLoader;
 turnstileLoader=new Promise((resolve,reject)=>{
  const script=document.createElement("script");
  script.src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
  script.async=true;script.defer=true;
  script.onload=()=>window.turnstile?resolve(window.turnstile):reject(Error("Turnstile unavailable"));
  script.onerror=()=>reject(Error("Turnstile load failed"));
  document.head.append(script);
 }).catch(e=>{turnstileLoader=null;throw e});
 return turnstileLoader;
}
window.FSE_GET_TURNSTILE_TOKEN=async()=>{
 const api=await loadTurnstile();
 return new Promise((resolve,reject)=>{
  const holder=document.createElement("div");
  holder.className="ai14-turnstile";
  holder.setAttribute("aria-label","보안 인증");
  sheet.insertBefore(holder,status);
  let widgetId,done=false;
  const cleanup=()=>{try{if(widgetId!==undefined)api.remove(widgetId)}catch{}holder.remove()};
  const finish=(err,token)=>{if(done)return;done=true;cleanup();if(err)reject(err);else resolve(token)};
  try{widgetId=api.render(holder,{sitekey:TURNSTILE_SITE_KEY,callback:token=>finish(null,token),"error-callback":()=>finish(Error("보안 인증 실패")),"expired-callback":()=>finish(Error("인증 만료"))})}
  catch(e){finish(e)}
 });
};

// Reuse the v1.3 floating button as the only entry point.
const legacyFab=document.getElementById("dictFab");
if(legacyFab){legacyFab.setAttribute("aria-label","통합 기술 사전 검색");legacyFab.onclick=open;}
const basic=el("button","","기본 사전 검색");basic.type="button";
basic.onclick=()=>{hide();legacyFab?.dispatchEvent(new CustomEvent("fse:open-legacy-dictionary"))};
bar.insertBefore(basic,close);
const style=el("style");style.textContent=`.ai14-fab{position:fixed;right:16px;bottom:calc(94px + env(safe-area-inset-bottom));z-index:80;border-radius:30px;padding:12px 16px;background:#2769cc;color:white;border:2px solid #a5c6ff;box-shadow:0 3px 18px #0008}.ai14-overlay[hidden]{display:none!important}.ai14-overlay{position:fixed;inset:0;z-index:500;background:#000b;display:flex;align-items:stretch;justify-content:center}.ai14-sheet{background:#15253a;color:#f1f5ff;width:min(100%,780px);overflow:auto;padding:calc(18px + env(safe-area-inset-top)) 18px calc(24px + env(safe-area-inset-bottom));font-size:16px}.ai14-bar,.ai14-tabs,.ai14-search{display:flex;align-items:center;gap:10px;justify-content:space-between;margin-bottom:18px}.ai14-search input{min-width:0;flex:1;padding:12px;background:#fff;color:#111;border-radius:8px}.ai14-sheet button{cursor:pointer}.ai14-sheet h2{font-size:28px}.ai14-sheet h3{margin-top:24px;font-size:19px}.ai14-sheet p{line-height:1.7;white-space:pre-wrap}.ai14-item{padding:12px;border-bottom:1px solid #52647c;display:grid;gap:10px}.ai14-item textarea{width:100%;min-height:65px}.ai14-notice{font-size:13px;color:#b7c5d8}.ai14-open{overflow:hidden}
.ai14-sheet{box-sizing:border-box;min-width:0;max-height:100dvh;overscroll-behavior:contain}
.ai14-bar{display:grid;grid-template-columns:minmax(0,1fr) auto auto;align-items:center;justify-content:initial;gap:8px}
.ai14-bar strong{min-width:0;overflow-wrap:anywhere;line-height:1.3}
.ai14-bar button{flex:none;white-space:nowrap;overflow-wrap:normal;word-break:keep-all}
.ai14-tabs{justify-content:flex-start;gap:8px}
.ai14-tabs button{white-space:nowrap;word-break:keep-all}
.ai14-search{justify-content:initial;gap:8px}
.ai14-search input{box-sizing:border-box;width:100%;min-width:0}
.ai14-search button{flex:none;white-space:nowrap;word-break:keep-all}
.ai14-sheet button{max-width:100%;line-height:1.35}
.ai14-sheet [hidden]{display:none!important}
@media(max-width:600px){
 .ai14-sheet{width:100%;height:100dvh;padding:calc(16px + env(safe-area-inset-top)) 16px calc(24px + env(safe-area-inset-bottom));font-size:16px}
 .ai14-bar{grid-template-columns:minmax(0,1fr) auto;gap:8px 10px}
 .ai14-bar strong{grid-column:1/-1;font-size:18px}
 .ai14-bar button{font-size:14px;padding:9px 12px}
 .ai14-bar button:nth-of-type(1){grid-column:1;justify-self:start}
 .ai14-bar button:nth-of-type(2){grid-column:2;justify-self:end}
 .ai14-tabs{margin-top:12px;margin-bottom:16px}
 .ai14-tabs button{flex:1;min-width:0;text-align:center;padding:10px 8px}
 .ai14-search input{padding:12px 10px}
 .ai14-search button{padding:12px 10px}
 .ai14-sheet h2{font-size:23px}
}.ai15-model-label{display:flex;flex-direction:column;gap:4px;font-size:12px;white-space:nowrap}.ai15-model{max-width:185px;min-width:0;padding:10px 6px;background:#fff;color:#111;border-radius:8px;font-size:13px}@media(max-width:600px){.ai14-search{flex-wrap:wrap}.ai14-search input{flex-basis:calc(100% - 110px)}.ai15-model-label{order:3;width:100%;flex-direction:row;align-items:center;gap:12px}.ai15-model{max-width:unset;flex:1}}`;document.head.append(style);
})();
