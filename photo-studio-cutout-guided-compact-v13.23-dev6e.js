/* Audrey Closet v13.23 Photo Studio Guided Cutout compact polish dev6e
 * Presentation-only. Assumes dev6c is no longer loaded. Keeps Guided controls
 * compact, with a minimal expandable Guide Settings disclosure for Reset Guide.
 */
(function(){
'use strict';
const STYLE_ID='photoStudioGuidedCompactDev6eStyles';

function installStyles(){
  if(document.getElementById(STYLE_ID))return;
  const s=document.createElement('style');
  s.id=STYLE_ID;
  s.textContent=`
#cutoutGuide3B .cutout-guide-apply-wrap-dev6b{
  width:104px!important;
  min-width:104px!important;
}
#cutoutGuide3B .cutout-guide-apply-wrap-dev6b #cutoutGuideApply3B{
  width:104px!important;
  min-width:104px!important;
  max-width:104px!important;
  white-space:nowrap!important;
  box-sizing:border-box!important;
}
#cutoutGuideSettingsCleanup1{
  display:grid!important;
  width:max-content!important;
  max-width:100%!important;
  gap:0!important;
  margin:0!important;
  padding:0!important;
  border:0!important;
  border-radius:0!important;
  background:transparent!important;
  overflow:visible!important;
}
#cutoutGuideSettingsCleanup1 .cutout-guide-settings-toggle{
  width:auto!important;
  min-height:22px!important;
  padding:2px 3px!important;
  border:0!important;
  background:transparent!important;
  color:#817568!important;
  display:flex!important;
  align-items:center!important;
  justify-content:flex-start!important;
  gap:4px!important;
  font:800 8.3px/1 system-ui!important;
  text-align:left!important;
  pointer-events:auto!important;
  cursor:pointer!important;
}
#cutoutGuideSettingsCleanup1 .cutout-guide-settings-toggle span:last-child{
  display:inline!important;
  font-size:9px!important;
}
#cutoutGuideSettingsCleanup1 .cutout-guide-settings-body{
  display:none!important;
  padding:3px 0 0!important;
}
#cutoutGuideSettingsCleanup1:not(.is-collapsed) .cutout-guide-settings-body{
  display:block!important;
}
#cutoutGuideSettingsCleanup1 #cutoutGuideReset3B{
  width:auto!important;
  min-width:0!important;
  max-width:none!important;
  min-height:27px!important;
  padding:4px 9px!important;
  border:1px solid rgba(108,81,66,.16)!important;
  border-radius:8px!important;
  background:rgba(248,241,227,.72)!important;
  color:#675d51!important;
  font:800 8.4px/1 system-ui!important;
}
@media(max-width:390px){
  #cutoutGuide3B .cutout-guide-apply-wrap-dev6b,
  #cutoutGuide3B .cutout-guide-apply-wrap-dev6b #cutoutGuideApply3B{
    width:100px!important;min-width:100px!important;max-width:100px!important;
  }
}
`;
  document.head.appendChild(s);
}

function state(){return window.__audreyCutoutState?.getState?.()||null;}
function sync(){
  installStyles();
  const panel=document.getElementById('cutoutGuide3B');if(!panel)return false;
  const head=panel.querySelector('.cutout-guide-head strong');
  const note=panel.querySelector('.cutout-guide-note');
  const apply=document.getElementById('cutoutGuideApply3B');
  const settings=document.getElementById('cutoutGuideSettingsCleanup1');
  const reset=document.getElementById('cutoutGuideReset3B');
  if(head)head.textContent='Guided';
  if(note)note.textContent='Choose a garment shape, position the guide around the item, then apply it.';
  if(apply){
    const text=state()?.guide?.applied?'Reapply Guide':'Apply Guide';
    if(apply.textContent!==text)apply.textContent=text;
  }
  if(settings&&reset){
    settings.hidden=false;
    const body=settings.querySelector('.cutout-guide-settings-body');
    if(body&&reset.parentElement!==body)body.appendChild(reset);
    const toggle=settings.querySelector('.cutout-guide-settings-toggle');
    if(toggle){
      const first=toggle.querySelector('span:first-child');if(first)first.textContent='Guide Settings';
      toggle.style.pointerEvents='auto';
      if(!toggle.dataset.dev6eBound){
        toggle.dataset.dev6eBound='1';
        toggle.onclick=e=>{
          e.preventDefault();e.stopPropagation();
          const collapsed=settings.classList.toggle('is-collapsed');
          toggle.setAttribute('aria-expanded',collapsed?'false':'true');
          const chev=toggle.querySelector('span:last-child');if(chev)chev.textContent=collapsed?'⌄':'⌃';
        };
      }
      if(!settings.dataset.dev6eInit){settings.classList.add('is-collapsed');settings.dataset.dev6eInit='1';}
      toggle.setAttribute('aria-expanded',settings.classList.contains('is-collapsed')?'false':'true');
      const chev=toggle.querySelector('span:last-child');if(chev)chev.textContent=settings.classList.contains('is-collapsed')?'⌄':'⌃';
    }
  }
  return true;
}
function start(){
  sync();
  document.addEventListener('click',e=>{
    if(e.target.closest?.('#cutoutGuideApply3B,#cutoutGuideReset3B,[data-workflow="guided"],#garmentTemplatePicker3D .garment-template-btn'))requestAnimationFrame(sync);
  },true);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
