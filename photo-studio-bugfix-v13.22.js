/* Audrey Closet v13.22 bug-fix — Photo Studio tone adjustment session isolation */
(function(){
  'use strict';

  const originalOpenPhotoStudioV1322Bugfix=openPhotoStudio;

  openPhotoStudio=async function(target='item'){
    const nextTarget=target==='wish'?'wish':'item';
    const original=nextTarget==='wish'?wishOriginalPhoto:itemOriginalPhoto;
    const savedState=nextTarget==='wish'?wishStudioState:itemStudioState;
    const saved=savedState&&savedState.sourceFingerprint===photoFingerprint(original||'')?savedState:null;

    // Tone/detail adjustments belong to the exact source photo being edited.
    // Reopening that same photo restores its saved values. A new item or a
    // replacement/uploaded photo has a different fingerprint and starts neutral.
    studioExposure=saved&&Number.isFinite(Number(saved.exposure))?Number(saved.exposure):0;
    studioContrast=saved&&Number.isFinite(Number(saved.contrast))?Number(saved.contrast):0;
    studioHighlights=saved&&Number.isFinite(Number(saved.highlights))?Number(saved.highlights):0;

    const result=await originalOpenPhotoStudioV1322Bugfix.apply(this,arguments);

    // The original opener builds the canvas using the values above. Sync the
    // controls afterward so slider positions and labels match that session state.
    syncStudioAdjustmentControls();
    return result;
  };
})();
