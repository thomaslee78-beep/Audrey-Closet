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
    if(badge&&badge.textContent!=='Phase 2A')badge.textContent='Phase 2A';
    const note=panel?.querySelector('.studio-garment-guide-note');
    const text='Drag the guide to move it, use the lower-right handle to resize, the top handle to rotate, and the small dots to refine shoulders, sleeves, armpits and hem. Lock position when you only want to edit the dots.';
    if(note&&note.textContent!==text)note.textContent=text;

    if(window.__audreyGarmentGuidePreview){
      window.__audreyGarmentGuidePreview.phase='2A';
    }
    return true;
  }

  // Phase 2A previously watched the entire document with MutationObserver.
  // That could self-trigger when install() updated the badge/note and create a
  // continuous DOM mutation loop. Phase 1F already owns Photo Studio creation,
  // so install the two additional handles only after Photo Studio opens.
  if(typeof openPhotoStudio==='function'){
    const openPhotoStudioPhase2A=openPhotoStudio;
    openPhotoStudio=async function(){
      const result=await openPhotoStudioPhase2A.apply(this,arguments);
      install();
      return result;
    };
  }

  // Supports hot-loading the module while Photo Studio is already open.
  install();

  window.__audreyGarmentGuidePhase2A={
    phase:'2A',
    handles:HANDLE_DEFS.map(v=>({...v})),
    install
  };
})();
