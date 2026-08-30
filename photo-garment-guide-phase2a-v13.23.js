/* Audrey Closet v13.23 background-removal preview — Garment Guide Phase 2A.
 * Narrow Shirt Guide refinement: expose the two existing underarm polygon
 * vertices as direct-manipulation edit handles. No geometry, persistence,
 * Quick rescue, or accepted-base behavior is changed.
 */
(function(){
  'use strict';

  const HANDLE_DEFS=[
    {index:6,label:'Right armpit'},
    {index:9,label:'Left armpit'}
  ];

  function positionHandle(button,index){
    const points=window.__audreyGarmentGuidePreview?.points;
    const point=Array.isArray(points)&&Array.isArray(points[index])?points[index]:null;
    if(!point)return;
    button.style.left=(point[0]*100)+'%';
    button.style.top=(point[1]*100)+'%';
  }

  function install(){
    const overlay=document.getElementById('studioShirtGuide');
    if(!overlay)return false;

    HANDLE_DEFS.forEach(meta=>{
      let button=overlay.querySelector('.studio-shirt-guide-point[data-guide-point="'+meta.index+'"]');
      if(!button){
        button=document.createElement('button');
        button.type='button';
        button.className='studio-shirt-guide-point studio-shirt-guide-underarm-point';
        button.dataset.guidePoint=String(meta.index);
        button.setAttribute('aria-label',meta.label);
        button.title=meta.label;
        overlay.appendChild(button);
      }
      positionHandle(button,meta.index);
    });

    const panel=document.getElementById('studioGarmentGuidePanel');
    const badge=panel?.querySelector('.studio-garment-guide-head small');
    if(badge)badge.textContent='Phase 2A';
    const note=panel?.querySelector('.studio-garment-guide-note');
    if(note)note.textContent='Drag the guide to move it, use the lower-right handle to resize, the top handle to rotate, and the small dots to refine shoulders, sleeves, armpits and hem. Lock position when you only want to edit the dots.';

    if(window.__audreyGarmentGuidePreview){
      window.__audreyGarmentGuidePreview.phase='2A';
    }
    return true;
  }

  const observer=new MutationObserver(()=>install());
  const start=()=>{
    install();
    observer.observe(document.body,{childList:true,subtree:true});
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();

  window.__audreyGarmentGuidePhase2A={
    phase:'2A',
    handles:HANDLE_DEFS.map(v=>({...v})),
    install
  };
})();
