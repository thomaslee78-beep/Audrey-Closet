/* Audrey Closet v13.23 background-removal preview — method persistence shim.
 * Keeps the selected experimental cutout method with the existing Photo Studio
 * state without changing the production state schema or cutout algorithm.
 */
(function(){
  'use strict';

  function currentMethod(){
    const value=window.__audreyCutoutMethodPreview?.getMethod?.();
    return ['standard','center','edge','grow','blend'].includes(value)?value:'standard';
  }

  function stampWorkingStudioState(target){
    const method=currentMethod();
    if(target==='wish'){
      if(wishStudioState&&typeof wishStudioState==='object'){
        wishStudioState={...wishStudioState,cutoutMethod:method};
      }
      return;
    }
    if(itemStudioState&&typeof itemStudioState==='object'){
      itemStudioState={...itemStudioState,cutoutMethod:method};
    }
  }

  const applyPhotoStudioV1323Persist=applyPhotoStudio;
  applyPhotoStudio=async function(){
    const target=typeof studioTarget!=='undefined'&&studioTarget==='wish'?'wish':'item';
    const result=await applyPhotoStudioV1323Persist.apply(this,arguments);
    stampWorkingStudioState(target);
    return result;
  };

  const saveItemV1323Persist=saveItem;
  saveItem=async function(){
    stampWorkingStudioState('item');
    return saveItemV1323Persist.apply(this,arguments);
  };

  const saveWishV1323Persist=saveWish;
  saveWish=async function(){
    stampWorkingStudioState('wish');
    return saveWishV1323Persist.apply(this,arguments);
  };

  const openPhotoStudioV1323Persist=openPhotoStudio;
  openPhotoStudio=async function(target='item'){
    const nextTarget=target==='wish'?'wish':'item';
    const saved=nextTarget==='wish'?wishStudioState:itemStudioState;
    const savedMethod=saved&&saved.cutoutMethod;
    const result=await openPhotoStudioV1323Persist.apply(this,arguments);

    // Defensive fallback: if another Photo Studio wrapper normalized the method
    // during opening, re-select the saved option through the existing UI path.
    if(savedMethod&&savedMethod!=='standard'&&currentMethod()!==savedMethod){
      const btn=document.querySelector('[data-cutout-method="'+savedMethod+'"]');
      if(btn&&!btn.disabled)await btn.click();
    }
    return result;
  };
})();
