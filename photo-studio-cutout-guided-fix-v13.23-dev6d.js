/* Audrey Closet v13.23 Photo Studio Guided Cutout fix dev6d
 * Presentation-only. Restores expandable Guide Settings with Reset Guide and
 * replaces dev6c's broad observer behavior with narrow event-driven syncing.
 */
(function(){
'use strict';
const STYLE_ID='photoStudioGuidedFixDev6dStyles';
let savedScroll=null;

function styles(){
  if(document.getElementById(STYLE_ID))return;
  const s=document.createElement('style');s.id=STYLE_ID;s.textContent=`
#cutoutGuideSettingsCleanup1{
  display:grid!important;
  gap:0!important;
  order:99!important;
  border:1px solid rgba(108,81,66,.12)!important;
  border-radius:9px!important;
  background:rgba(248,241,227,.42)!important;
  overflow:hidden!important;
}
#cutoutGuideSettingsCleanup1 .cutout-guide-settings-toggle{
  width:100%!important;
  min-height:29px!important;
  padding:5px 8px!important;
  border:0!important;
  background:transparent!important;
  color:#675d51!important;
  display:flex!important;
  align-items:center!important;
  justify-content:space-between!important;
  gap:8px!important;
  font:800 8.7px/1 system-ui!important;
  text-align:left!important;
  pointer-events:auto!important;
  cursor:pointer!important;
}
#cutoutGuideSettingsCleanup1 .cutout-guide-settings-toggle span:last-child{
  display:inline!important;
}
#cutoutGuideSettingsCleanup1 .cutout-guide-settings-body{
  display:none!important;
  padding:0 6px 6px!important;
}
#cutoutGuideSettingsCleanup1:not(.is-collapsed) .cutout-guide-settings-body{
  display:grid!important;
  grid-template-columns:1fr!important;
}
#cutoutGuideSettingsCleanup1 #cutoutGuideReset3B{
  width:100%!important;
  min-width:0!important;
  max-width:none!important;
  min-height:31px!important;
  padding:5px 8px!important;
  border:1px solid rgba(108,81,66,.18)!important;
  border-radius:8px!important;
  background:#f8f1e3!important;
  color:#675d51!important;
  font-size:8.6px!important;
}
#cutoutGuide3B .cutout-guide-apply-wrap-dev6b #cutoutGuideReset3B{display:none!important}
`;
document.head.appendChild(s);
}

function scroller(){return document.querySelector('#photoStudioDialog .studio-controls-scroll');}
function state(){return window.__audreyCutoutState?.getState?.()||null;}
function syncCopy(){
  const panel=document.getElementById('cutoutGuide3B');if(!panel)return false;
  const head=panel.querySelector('.cutout-guide-head strong');
  const note=panel.querySelector('.cutout-guide-note');
  const apply=document.getElementById('cutoutGuideApply3B');
  if(head)head.textContent='Guided';
  if(note)note.textContent='Choose a garment shape, position the guide around the item, then apply it.';
  if(apply){
    const applied=!!state()?.guide?.applied;
    const text=applied?'Reapply Guide':'Apply Guide';
    if(apply.textContent!==text)apply.textContent=text;
    apply.setAttribute('aria-label',text);
  }
  return true;
}
function setupSettings(){
  const panel=document.getElementById('cutoutGuide3B');
  const reset=document.getElementById('cutoutGuideReset3B');
  if(!panel||!reset)return false;
  let settings=document.getElementById('cutoutGuideSettingsCleanup1');
  if(!settings){
    settings=document.createElement('section');
    settings.id='cutoutGuideSettingsCleanup1';
    settings.className='cutout-guide-settings is-collapsed';
    settings.innerHTML='<button type="button" class="cutout-guide-settings-toggle" aria-expanded="false"><span>Guide Settings</span><span>⌄</span></button><div class="cutout-guide-settings-body"></div>';
    panel.appendChild(settings);
  }
  settings.hidden=false;
  const body=settings.querySelector('.cutout-guide-settings-body');
  if(body&&reset.parentElement!==body)body.appendChild(reset);
  const toggle=settings.querySelector('.cutout-guide-settings-toggle');
  if(toggle&&!toggle.dataset.dev6dBound){
    toggle.dataset.dev6dBound='1';
    toggle.onclick=e=>{
      e.preventDefault();e.stopPropagation();
      const collapsed=settings.classList.toggle('is-collapsed');
      toggle.setAttribute('aria-expanded',collapsed?'false':'true');
      const chev=toggle.querySelector('span:last-child');if(chev)chev.textContent=collapsed?'⌄':'⌃';
    };
  }
  if(!settings.classList.contains('is-collapsed')&&!settings.dataset.dev6dInitialized){settings.classList.add('is-collapsed');}
  settings.dataset.dev6dInitialized='1';
  toggle?.setAttribute('aria-expanded',settings.classList.contains('is-collapsed')?'false':'true');
  const chev=toggle?.querySelector('span:last-child');if(chev)chev.textContent=settings.classList.contains('is-collapsed')?'⌄':'⌃';
  return true;
}
function restoreScroll(){
  if(savedScroll==null)return;
  const el=scroller();if(!el){savedScroll=null;return;}
  const y=savedScroll;savedScroll=null;
  requestAnimationFrame(()=>{el.scrollTop=y;});
}
function sync(){styles();syncCopy();setupSettings();restoreScroll();}
function start(){
  sync();
  document.addEventListener('pointerdown',e=>{
    if(e.target.closest?.('#garmentTemplatePicker3D .garment-template-btn')){
      const el=scroller();if(el)savedScroll=el.scrollTop;
    }
  },true);
  document.addEventListener('click',e=>{
    if(e.target.closest?.('#garmentTemplatePicker3D .garment-template-btn')){
      const el=scroller();if(el&&savedScroll==null)savedScroll=el.scrollTop;
      requestAnimationFrame(sync);
    }else if(e.target.closest?.('#cutoutGuideApply3B,#cutoutGuideReset3B,[data-workflow="guided"]')){
      requestAnimationFrame(sync);
    }
  },true);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
