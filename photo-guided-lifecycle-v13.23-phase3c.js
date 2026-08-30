/* Audrey Closet v13.23 Cutout Phase 3C — Guided interaction lifecycle.
 * Keeps guide UI attached across Photo Studio sessions and makes guide editing
 * own pointer input so the board cannot pan/zoom underneath the geometry editor.
 */
(function(){
'use strict';
let boundCanvas=null;
let boundGuidedButton=null;
let boundEditButton=null;
let boundShowButton=null;
let boundApplyButton=null;

const api=()=>window.__audreyCutoutWorkflow3B;
const state=()=>window.__audreyCutoutState?.getState?.();
const canvas=()=>document.getElementById('studioCanvas');
const wrap=()=>canvas()?.closest('.studio-canvas-wrap')||null;
const overlay=()=>document.getElementById('cutoutShirtOverlay3B');
const isGuided=()=>state()?.workflow==='guided';
const isEditing=()=>isGuided()&&!!api()?.editing;

function neutralizeStudioNavigation(){
  if(typeof studioMoveMode!=='undefined')studioMoveMode=false;
  if(typeof studioBrushMode!=='undefined')studioBrushMode=null;
  if(typeof studioDrawing!=='undefined')studioDrawing=false;
  if(typeof studioGesture!=='undefined')studioGesture=null;
  if(typeof studioPointers!=='undefined'&&studioPointers?.clear)studioPointers.clear();
  if(typeof studioViewZoom!=='undefined')studioViewZoom=1;
  if(typeof studioViewX!=='undefined')studioViewX=0;
  if(typeof studioViewY!=='undefined')studioViewY=0;
  document.querySelectorAll('.brush-btn').forEach(b=>b.classList.remove('active'));
  document.getElementById('studioMoveToggle')?.classList.remove('active');
  if(typeof updateStudioToolUI==='function')updateStudioToolUI();
  if(typeof updateStudioZoomLabel==='function')updateStudioZoomLabel();
  if(typeof renderStudio==='function')renderStudio();
}

function ensureOverlayAttached(){
  const o=overlay(),w=wrap();
  if(o&&w&&o.parentElement!==w)w.appendChild(o);
}

function ensureGuidedVisible({editing=true}={}){
  if(!isGuided())return;
  ensureOverlayAttached();
  const wf=api();
  if(!wf?.visible)document.getElementById('cutoutGuideShow3B')?.click();
  if(editing&&!wf?.editing)document.getElementById('cutoutGuideEdit3B')?.click();
  if(editing)neutralizeStudioNavigation();
  wf?.sync?.();
}

function blockCanvas(e){
  if(!isEditing())return;
  e.preventDefault();
  e.stopImmediatePropagation();
}
function bindCanvasGuard(){
  const c=canvas();if(!c||c===boundCanvas)return;
  boundCanvas=c;
  ['pointerdown','pointermove','pointerup','pointercancel'].forEach(type=>c.addEventListener(type,blockCanvas,true));
  c.addEventListener('wheel',blockCanvas,{capture:true,passive:false});
  c.addEventListener('gesturestart',blockCanvas,true);
  c.addEventListener('gesturechange',blockCanvas,true);
  c.addEventListener('gestureend',blockCanvas,true);
}

function bindControls(){
  const guided=document.querySelector('#cutoutWorkflow3B [data-workflow="guided"]');
  if(guided&&guided!==boundGuidedButton){
    boundGuidedButton=guided;
    guided.addEventListener('click',()=>queueMicrotask(()=>ensureGuidedVisible({editing:true})));
  }
  const edit=document.getElementById('cutoutGuideEdit3B');
  if(edit&&edit!==boundEditButton){
    boundEditButton=edit;
    edit.addEventListener('click',()=>queueMicrotask(()=>{if(api()?.editing)neutralizeStudioNavigation();}));
  }
  const show=document.getElementById('cutoutGuideShow3B');
  if(show&&show!==boundShowButton){
    boundShowButton=show;
    show.addEventListener('click',()=>queueMicrotask(()=>{ensureOverlayAttached();api()?.sync?.();}));
  }
  const apply=document.getElementById('cutoutGuideApply3B');
  if(apply&&apply!==boundApplyButton){
    boundApplyButton=apply;
    apply.addEventListener('click',()=>queueMicrotask(async()=>{
      try{await window.__audreyCutoutPipeline?.applyCurrentGuide?.();}catch(err){console.error('Guided apply lifecycle failed',err);}
    }));
  }
}

function refresh(){ensureOverlayAttached();bindCanvasGuard();bindControls();api()?.sync?.();}

const open0=openPhotoStudio;
openPhotoStudio=async function(){
  const out=await open0.apply(this,arguments);
  refresh();
  return out;
};

if(typeof renderStudio==='function'){
  const render0=renderStudio;
  renderStudio=async function(){const out=await render0.apply(this,arguments);ensureOverlayAttached();return out;};
}

window.__audreyGuidedLifecycle={phase:'3C-fix1',refresh,ensureGuidedVisible,get canvasLocked(){return isEditing();}};
})();
