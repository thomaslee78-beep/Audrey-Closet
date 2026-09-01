/* Audrey Closet v13.23 Photo Studio Guided Cutout polish dev6c
 * Presentation-only: simplify Guided copy, stabilize Apply/Reapply sizing,
 * move Reset below Apply, and preserve controls scroll when changing garments.
 */
(function(){
'use strict';
const STYLE_ID='photoStudioGuidedPolishDev6cStyles';
let savedScroll=null;

function styles(){
  if(document.getElementById(STYLE_ID))return;
  const s=document.createElement('style');s.id=STYLE_ID;s.textContent=`
#cutoutGuide3B .cutout-guide-apply-wrap-dev6b{
  min-width:104px!important;
  width:104px!important;
}
#cutoutGuide3B .cutout-guide-apply-wrap-dev6b #cutoutGuideApply3B,
#cutoutGuide3B .cutout-guide-apply-wrap-dev6b #cutoutGuideReset3B{
  width:104px!important;
  min-width:104px!important;
  max-width:104px!important;
  min-height:32px!important;
  padding:5px 7px!important;
  white-space:nowrap!important;
  box-sizing:border-box!important;
  border-radius:8px!important;
  font-size:8.6px!important;
}
#cutoutGuide3B .cutout-guide-apply-wrap-dev6b #cutoutGuideReset3B{
  border:1px solid rgba(108,81,66,.18)!important;
  background:#f8f1e3!important;
  color:#675d51!important;
}
#cutoutGuideSettingsCleanup1{display:none!important}
@media(max-width:390px){
  #cutoutGuide3B .cutout-guide-top-dev6b{grid-template-columns:minmax(0,1fr) 100px!important}
  #cutoutGuide3B .cutout-guide-apply-wrap-dev6b,
  #cutoutGuide3B .cutout-guide-apply-wrap-dev6b #cutoutGuideApply3B,
  #cutoutGuide3B .cutout-guide-apply-wrap-dev6b #cutoutGuideReset3B{
    width:100px!important;min-width:100px!important;max-width:100px!important;
  }
}
`;document.head.appendChild(s);
}

function scroller(){return document.querySelector('#photoStudioDialog .studio-controls-scroll');}
function state(){return window.__audreyCutoutState?.getState?.()||null;}
function restoreScroll(){
  if(savedScroll==null)return;
  const el=scroller();if(!el)return;
  const y=savedScroll;
  requestAnimationFrame(()=>{el.scrollTop=y;requestAnimationFrame(()=>{el.scrollTop=y;savedScroll=null;});});
}
function sync(){
  styles();
  const panel=document.getElementById('cutoutGuide3B');if(!panel)return false;
  const head=panel.querySelector('.cutout-guide-head strong');
  const note=panel.querySelector('.cutout-guide-note');
  const apply=document.getElementById('cutoutGuideApply3B');
  const reset=document.getElementById('cutoutGuideReset3B');
  const wrap=panel.querySelector('.cutout-guide-apply-wrap-dev6b');
  if(head)head.textContent='Guided';
  if(note)note.textContent='Choose a garment shape, position the guide around the item, then apply it.';
  if(apply){
    const applied=!!state()?.guide?.applied;
    apply.textContent=applied?'Reapply Guide':'Apply Guide';
    apply.setAttribute('aria-label',apply.textContent);
  }
  if(reset&&wrap&&reset.parentElement!==wrap)wrap.appendChild(reset);
  const settings=document.getElementById('cutoutGuideSettingsCleanup1');
  if(settings)settings.hidden=true;
  restoreScroll();
  return true;
}
function schedule(){requestAnimationFrame(sync)}
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
      schedule();
    } else if(e.target.closest?.('#cutoutGuide3B')) schedule();
  },true);
  const root=document.getElementById('studioPhoto')||document.body;
  const observer=new MutationObserver(records=>{
    if(records.some(r=>r.type==='childList'||r.type==='characterData'||r.attributeName==='class'))schedule();
  });
  observer.observe(root,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['class']});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
