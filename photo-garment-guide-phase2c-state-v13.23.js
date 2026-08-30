/* Audrey Closet v13.23 background-removal preview — Shirt Guide Phase 2C.
 * Separates guide visibility/editing from applied protection state.
 * Show/Hide only controls the overlay. Apply Shirt Guide commits protection.
 * Clean may be used afterward; guide protection is reapplied to the Clean base.
 * Erase/Restore remain the existing non-destructive masks above that base.
 */
(function(){
  'use strict';

  let visible=true;
  let applied=false;
  let committedBase='';
  let opening=false;

  const target=()=>typeof studioTarget!=='undefined'&&studioTarget==='wish'?'wish':'item';
  const rawState=t=>t==='wish'?wishStudioState:itemStudioState;
  const setRawState=(t,v)=>{if(t==='wish')wishStudioState=v;else itemStudioState=v;};
  const guideApi=()=>window.__audreyGarmentGuidePreview;
  const guideState=()=>guideApi()?.getState?.()||null;
  const canvas=()=>document.getElementById('studioCanvas');

  function studioCanvasFromData(src){
    return imageFrom(src).then(img=>{const c=newStudioCanvas(),ctx=c.getContext('2d');ctx.clearRect(0,0,720,720);ctx.drawImage(img,0,0,720,720);return c;});
  }
  async function restoreCommitted(){
    if(!committedBase||!committedBase.startsWith('data:image/'))return false;
    try{
      studioBaseCanvas=await studioCanvasFromData(committedBase);
      studioCutoutPhoto=committedBase;
      rebuildStudioWorkCanvas();
      return true;
    }catch(err){console.error('Phase 2C committed Shirt Guide restore failed',err);return false;}
  }
  function captureCommitted(){
    if(!studioBaseCanvas)return '';
    try{committedBase=studioBaseCanvas.toDataURL('image/png');return committedBase;}catch{return '';}
  }

  function persist(t=target()){
    const raw=rawState(t),g=guideState();
    if(!raw||typeof raw!=='object'||!g)return;
    const nextGuide={...g,enabled:applied?true:g.enabled,visible:!!visible,applied:!!applied,committedBase:applied?committedBase:'',acceptedBase:applied?(committedBase||g.acceptedBase||''):(g.acceptedBase||'')};
    setRawState(t,{...raw,garmentGuide:nextGuide});
    window.__audreyPhotoStudioPreviewPersistence?.stampWorkingStudioState?.(t);
    // The older persistence shim may rebuild garmentGuide from getState; write our
    // durable Phase 2C fields last so visibility cannot erase applied protection.
    const after=rawState(t);
    if(after&&typeof after==='object')setRawState(t,{...after,garmentGuide:{...(after.garmentGuide||nextGuide),visible:!!visible,applied:!!applied,enabled:applied?true:(after.garmentGuide?.enabled??g.enabled),committedBase:applied?committedBase:'',acceptedBase:applied?(committedBase||after.garmentGuide?.acceptedBase||''):(after.garmentGuide?.acceptedBase||'')}});
  }

  function setOverlayVisible(v){
    visible=!!v;
    const overlay=document.getElementById('studioShirtGuide');
    if(overlay)overlay.style.visibility=visible?'':'hidden';
    syncUi();
    persist();
  }

  function ensureInternalGuideOn(){
    const api=guideApi();
    if(api?.enabled)return;
    const toggle=document.getElementById('studioShirtGuideToggle');
    const old=toggle?._phase2cOriginalClick;
    if(typeof old==='function')old.call(toggle,new Event('click'));
  }

  function borderColor(d,w,h){
    const band=Math.max(2,Math.round(Math.min(w,h)*.035)),step=Math.max(1,Math.round(Math.min(w,h)/220));
    let r=0,g=0,b=0,n=0;
    for(let y=0;y<h;y+=step)for(let x=0;x<w;x+=step){if(x>=band&&x<w-band&&y>=band&&y<h-band)continue;const i=(y*w+x)*4;r+=d[i];g+=d[i+1];b+=d[i+2];n++;}
    return n?[r/n,g/n,b/n]:[255,255,255];
  }
  function insideGuide(wx,wy,g,pts){
    const r=-(g.rotation||0)*Math.PI/180,dx=wx-g.x,dy=wy-g.y,cr=Math.cos(r),sr=Math.sin(r),x=(dx*cr-dy*sr)/g.w+.5,y=(dx*sr+dy*cr)/g.h+.5;
    let hit=false;
    for(let i=0,j=pts.length-1;i<pts.length;j=i++){
      const a=pts[i],b=pts[j];
      if(((a[1]>y)!==(b[1]>y))&&(x<(b[0]-a[0])*(y-a[1])/((b[1]-a[1])||1e-6)+a[0]))hit=!hit;
    }
    return hit;
  }
  function worldPoint(x,y){
    const s=typeof studioObjectScale==='number'?studioObjectScale:1,r=(typeof studioObjectRotation==='number'?studioObjectRotation:0)*Math.PI/180,dx=(x-360)*s,dy=(y-360)*s,cr=Math.cos(r),sr=Math.sin(r);
    return{x:360+(typeof studioObjectX==='number'?studioObjectX:0)+dx*cr-dy*sr,y:360+(typeof studioObjectY==='number'?studioObjectY:0)+dx*sr+dy*cr};
  }
  async function protectCurrentBase(){
    if(!applied||!studioBaseCanvas)return false;
    const s=guideState();
    const g=guideApi()?.guide;
    const pts=guideApi()?.points;
    if(!s||!g||!Array.isArray(pts)||pts.length!==10)return false;
    const src=target()==='wish'?(wishOriginalPhoto||studioSourcePhoto||wishWorkingPhoto):(itemOriginalPhoto||studioSourcePhoto||itemWorkingPhoto);
    if(!src)return false;
    const orig=await sourceToStudioCanvas(src),w=studioBaseCanvas.width,h=studioBaseCanvas.height;
    if(!w||!h)return false;
    const sc=document.createElement('canvas');sc.width=w;sc.height=h;const sx=sc.getContext('2d',{willReadFrequently:true});sx.drawImage(orig,0,0,w,h);
    const cc=studioBaseCanvas.getContext('2d',{willReadFrequently:true}),si=sx.getImageData(0,0,w,h),ci=cc.getImageData(0,0,w,h),os=si.data,c=ci.data,bg=borderColor(os,w,h),pr=(Number(s.protection)||70)/100,threshold=.53-pr*.17,floor=30-pr*12,alpha=(x,y)=>c[(y*w+x)*4+3];
    let rescued=0;
    for(let y=2;y<h-2;y++)for(let x=2;x<w-2;x++){
      const p=worldPoint(x,y);if(!insideGuide(p.x,p.y,g,pts))continue;
      const i=(y*w+x)*4;if(c[i+3]>=230)continue;
      const dr=os[i]-bg[0],dg=os[i+1]-bg[1],db=os[i+2]-bg[2],dist=Math.sqrt(dr*dr+dg*dg+db*db);
      let strong=0,near=0;for(let yy=-2;yy<=2;yy++)for(let xx=-2;xx<=2;xx++){if(!xx&&!yy)continue;const a=alpha(x+xx,y+yy);if(a>35)near++;if(a>150)strong++;}
      const gr=-(g.rotation||0)*Math.PI/180,gdx=p.x-g.x,gdy=p.y-g.y,gcr=Math.cos(gr),gsr=Math.sin(gr),gx=gdx*gcr-gdy*gsr,gy=gdx*gsr+gdy*gcr,nx=Math.abs(gx/(g.w/2)),ny=Math.abs(gy/(g.h/2)),central=Math.max(0,1-Math.max(nx,ny)),cont=Math.min(1,strong/5),color=Math.min(1,dist/66),score=central*(.28+.10*pr)+cont*.40+color*(.32-.10*pr);
      if(dist<floor&&strong<(pr>.75?2:3))continue;if(score<threshold&&near<(pr>.75?2:3))continue;
      const aa=Math.round(Math.max(90,Math.min(250,95+pr*36+cont*76+color*34+central*20)));c[i]=os[i];c[i+1]=os[i+1];c[i+2]=os[i+2];c[i+3]=Math.max(c[i+3],aa);rescued++;
    }
    if(rescued)cc.putImageData(ci,0,0);
    rebuildStudioWorkCanvas();
    captureCommitted();
    persist();
    return rescued>0;
  }

  function syncUi(){
    const toggle=document.getElementById('studioShirtGuideToggle');
    if(toggle){toggle.textContent=visible?'Hide guide':'Show guide';toggle.classList.toggle('active',visible);}
    const apply=document.getElementById('studioShirtGuideApply');
    if(apply){apply.textContent=applied?'Reapply Shirt Guide':'Apply Shirt Guide';apply.classList.toggle('active',applied);}
    const hint=document.getElementById('studioShirtGuideApplyHint');
    if(hint)hint.textContent=applied?'Protection applied · hide the guide and continue editing safely.':'Adjust the guide, then apply protection.';
    const badge=document.querySelector('#studioGarmentGuidePanel .studio-garment-guide-head small');if(badge)badge.textContent='Phase 2C';
    const note=document.querySelector('#studioGarmentGuidePanel .studio-garment-guide-note');if(note)note.textContent='Show/Hide only controls the outline. Apply Shirt Guide commits protection. After applying, you can hide the guide and continue with Clean, Erase or Restore without losing the protected result.';
  }

  function bindUi(){
    const toggle=document.getElementById('studioShirtGuideToggle');
    if(toggle&&!toggle.dataset.sg2c){
      toggle.dataset.sg2c='1';toggle._phase2cOriginalClick=toggle.onclick;
      toggle.onclick=e=>{e?.preventDefault?.();if(!guideApi()?.enabled)ensureInternalGuideOn();setOverlayVisible(!visible);};
    }
    const apply=document.getElementById('studioShirtGuideApply');
    if(apply&&!apply.dataset.sg2c){
      apply.dataset.sg2c='1';apply._phase2cOriginalClick=apply.onclick;
      apply.onclick=async e=>{
        e?.preventDefault?.();ensureInternalGuideOn();
        const old=apply._phase2cOriginalClick;apply.disabled=true;
        try{if(typeof old==='function')await old.call(apply,e);applied=true;captureCommitted();persist();syncUi();}
        finally{apply.disabled=false;}
      };
    }
    const reset=document.getElementById('studioShirtGuideReset');
    if(reset&&!reset.dataset.sg2c){
      reset.dataset.sg2c='1';const old=reset.onclick;reset.onclick=e=>{if(typeof old==='function')old.call(reset,e);applied=false;committedBase='';visible=true;persist();syncUi();};
    }
    syncUi();setOverlayVisible(visible);
  }

  const open0=openPhotoStudio;
  openPhotoStudio=async function(t='item'){
    const nt=t==='wish'?'wish':'item',before=rawState(nt),saved=before?.garmentGuide||{};
    visible=saved.visible!==false;
    applied=!!(saved.applied||saved.committedBase||saved.acceptedBase);
    committedBase=(saved.committedBase||saved.acceptedBase||'');
    opening=true;
    try{
      const out=await open0.apply(this,arguments);
      if(applied){ensureInternalGuideOn();if(committedBase)await restoreCommitted();}
      bindUi();persist(nt);if(typeof renderStudio==='function')await renderStudio();return out;
    }finally{opening=false;}
  };

  const mode0=applyStudioMode;
  applyStudioMode=async function(mode,options){
    const out=await mode0.apply(this,arguments);
    if(opening)return out;
    if(mode==='original'){
      applied=false;committedBase='';persist();syncUi();return out;
    }
    if(applied&&(mode==='clean'||mode==='quick')){
      // Quick already receives the native Shirt Guide rescue when the internal
      // guide is armed; Clean needs the same protection reapplied afterward.
      if(mode==='clean')await protectCurrentBase();else{captureCommitted();persist();}
    }
    syncUi();return out;
  };

  const applyPhoto0=applyPhotoStudio;
  applyPhotoStudio=async function(){const t=target();if(applied){captureCommitted();persist(t);}const out=await applyPhoto0.apply(this,arguments);persist(t);return out;};

  const saveItem0=saveItem;saveItem=async function(){persist('item');return saveItem0.apply(this,arguments);};
  const saveWish0=saveWish;saveWish=async function(){persist('wish');return saveWish0.apply(this,arguments);};

  window.__audreyGarmentGuidePhase2C={phase:'2C',get visible(){return visible;},get applied(){return applied;},get committedBase(){return committedBase;},persist};
})();
