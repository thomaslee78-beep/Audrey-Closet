/* Audrey Closet v13.23 background-removal preview — Shirt Guide Phase 2B persistence hotfix.
 * Narrow regression fix only:
 * 1) preserve the exact accepted guided Quick base across reopen/save cycles;
 * 2) stamp the live 10-point guide state at edit completion and save boundaries.
 * No geometry, cutout scoring, masks, or Photo Studio performance observers changed.
 */
(function(){
  'use strict';

  let openingStudio=false;
  const preservedBase={item:'',wish:''};
  const target=()=>typeof studioTarget!=='undefined'&&studioTarget==='wish'?'wish':'item';

  function rawState(t){return t==='wish'?wishStudioState:itemStudioState;}
  function setRawState(t,next){if(t==='wish')wishStudioState=next;else itemStudioState=next;}
  function currentGuide(){const g=window.__audreyGarmentGuidePreview?.getState?.();return g&&g.type==='shirt'?g:null;}

  function forceStamp(t=target()){
    const raw=rawState(t),guide=currentGuide();
    if(!raw||typeof raw!=='object'||!guide)return;
    const exact=preservedBase[t]||guide.acceptedBase||raw?.garmentGuide?.acceptedBase||'';
    setRawState(t,{...raw,garmentGuide:{...guide,acceptedBase:exact}});
  }

  async function restoreExactBase(src){
    if(!src||!src.startsWith('data:image/'))return false;
    try{
      const img=await imageFrom(src),c=newStudioCanvas(),ctx=c.getContext('2d');
      ctx.clearRect(0,0,720,720);ctx.drawImage(img,0,0,720,720);
      studioBaseCanvas=c;studioCutoutPhoto=src;rebuildStudioWorkCanvas();
      return true;
    }catch(err){console.error('Phase 2B exact cutout restore failed',err);return false;}
  }

  const open0=openPhotoStudio;
  openPhotoStudio=async function(t='item'){
    const next=t==='wish'?'wish':'item';
    const before=rawState(next);
    const savedGuide=before?.garmentGuide;
    const savedExact=typeof savedGuide?.acceptedBase==='string'&&savedGuide.acceptedBase.startsWith('data:image/')?savedGuide.acceptedBase:'';
    if(savedExact)preservedBase[next]=savedExact;
    openingStudio=true;
    try{
      const out=await open0.apply(this,arguments);
      // Phase 2B's base open may rebuild Quick while restoring state. Put the
      // previously accepted guided cutout back last so reopen is lossless.
      if(savedExact&&before?.mode==='quick')await restoreExactBase(savedExact);
      forceStamp(next);
      bindGuideStamping();
      return out;
    }finally{openingStudio=false;}
  };

  const mode0=applyStudioMode;
  applyStudioMode=async function(mode,options){
    const out=await mode0.apply(this,arguments);
    if(!openingStudio&&mode==='quick'){
      const t=target(),g=currentGuide();
      if(g?.acceptedBase)preservedBase[t]=g.acceptedBase;
      forceStamp(t);
    }
    return out;
  };

  const applyPhoto0=applyPhotoStudio;
  applyPhotoStudio=async function(){
    const t=target();
    const out=await applyPhoto0.apply(this,arguments);
    forceStamp(t);
    return out;
  };

  const saveItem0=saveItem;
  saveItem=async function(){forceStamp('item');return saveItem0.apply(this,arguments);};
  const saveWish0=saveWish;
  saveWish=async function(){forceStamp('wish');return saveWish0.apply(this,arguments);};

  function bindGuideStamping(){
    const overlay=document.getElementById('studioShirtGuide');
    if(overlay&&!overlay.dataset.sg2bPersistFix){
      overlay.dataset.sg2bPersistFix='1';
      const done=()=>setTimeout(()=>forceStamp(),0);
      overlay.addEventListener('pointerup',done);
      overlay.addEventListener('pointercancel',done);
    }
    const panel=document.getElementById('studioGarmentGuidePanel');
    if(panel&&!panel.dataset.sg2bPersistFix){
      panel.dataset.sg2bPersistFix='1';
      panel.addEventListener('click',e=>{
        if(e.target.closest('#studioShirtGuideToggle,#studioShirtGuideEdit,#studioShirtGuideLock,#studioShirtGuideReset,#studioShirtGuideApply'))setTimeout(()=>forceStamp(),0);
      });
    }
  }

  bindGuideStamping();
  window.__audreyGarmentGuidePhase2BPersistFix={phase:'2B-persist-fix',forceStamp,get preservedBase(){return{...preservedBase};}};
})();
