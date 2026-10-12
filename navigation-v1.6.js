/* v1.6.0 responsive five-slot navigation. Original tab buttons remain for legacy handlers. */
(()=>{"use strict";const init=()=>{const nav=document.querySelector("body > nav");if(!nav||nav.querySelector(".fse-more"))return;
const hiddenTabs=["quiz","cases","notes"];const original=Object.fromEntries(hiddenTabs.map(t=>[t,nav.querySelector('[data-tab="'+t+'"]')]));
if(hiddenTabs.some(t=>!original[t]))return;
const more=document.createElement("button");more.type="button";more.className="fse-more";more.textContent="☰ 더보기";more.setAttribute("aria-expanded","false");more.setAttribute("aria-controls","fse-more-menu");
const menu=document.createElement("div");menu.id="fse-more-menu";menu.className="fse-more-menu";menu.hidden=true;menu.setAttribute("aria-label","추가 메뉴");
for(const [tab,label] of [["quiz","📝 평가"],["cases","🔎 사례"],["notes","📓 기록"]]){const b=document.createElement("button");b.type="button";b.textContent=label;b.onclick=()=>{menu.hidden=true;more.setAttribute("aria-expanded","false");original[tab].click();sync()};menu.append(b)}
for(const b of Object.values(original))b.classList.add("fse-nav-secondary");
nav.append(more);document.body.append(menu);
function sync(){const selected=hiddenTabs.some(t=>original[t].classList.contains("active"));more.classList.toggle("active",selected)}
more.onclick=()=>{menu.hidden=!menu.hidden;more.setAttribute("aria-expanded",String(!menu.hidden));sync()};
document.addEventListener("click",e=>{if(!menu.hidden&&!menu.contains(e.target)&&e.target!==more){menu.hidden=true;more.setAttribute("aria-expanded","false")}if(e.target.closest("nav [data-tab]"))setTimeout(sync,0)});
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!menu.hidden){menu.hidden=true;more.setAttribute("aria-expanded","false");more.focus()}});
sync()};
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();