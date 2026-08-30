/* Audrey Closet v13.23 Cutout Phase 3C — generic guided processing pipeline.
 * Algorithms/methods create candidate bases; registered guide processors protect
 * garment geometry afterward; manual Restore/Erase remain downstream in the
 * existing work-canvas rebuild. No reopen recomputation is introduced here.
 */
(function(){
'use strict';

const processors=new Map();
let processing=false;
let applyingGuide=false;
let lastStats=null;
const stateApi=()=>window.__audreyCutoutState;
const target=()=>typeof studioTarget!=='undefined'&&studioTarget==='wish'?'wish':'item';
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
const dataImage=v=>typeof v==='string'&&v.startsWith('data:image/')?v:'';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));

function sourcePhoto(){
  return target()==='wish'
    ?(wishOriginalPhoto||studioSourcePhoto||wishWorkingPhoto||'')
    :(itemOriginalPhoto||studioSourcePhoto||itemWorkingPhoto||'');
}
function currentState(){return stateApi()?.getState?.(target())||null;}
function persistState(next){stateApi()?.persist?.(target(),next);return next;}
function captureBase(){if(!studioBaseCanvas)return '';try{return studioBaseCanvas.toDataURL('image/png');}catch{return '';}}
function registerGuideProcessor(type,fn){if(typeof type!=='string'||!type||typeof fn!=='function')return false;processors.set(type,fn);return true;}

function borderColor(data,w,h){
  const band=Math.max(2,Math.round(Math.min(w,h)*.035));
  const step=Math.max(1,Math.round(Math.min(w,h)/220));
  let r=0,g=0,b=0,n=0;
  for(let y=0;y<h;y+=step)for(let x=0;x<w;x+=step){
    if(x>=band&&x<w-band&&y>=band&&y<h-band)continue;
    const i=(y*w+x)*4;r+=data[i];g+=data[i+1];b+=data[i+2];n++;
  }
  return n?[r/n,g/n,b/n]:[255,255,255];
}
function imagePointToWorld(x,y){
  const scale=typeof studioObjectScale==='number'?studioObjectScale:1;
  const rotation=(typeof studioObjectRotation==='number'?studioObjectRotation:0)*Math.PI/180;
  const dx=(x-360)*scale,dy=(y-360)*scale,cr=Math.cos(rotation),sr=Math.sin(rotation);
  return {
    x:360+(typeof studioObjectX==='number'?studioObjectX:0)+dx*cr-dy*sr,
    y:360+(typeof studioObjectY==='number'?studioObjectY:0)+dx*sr+dy*cr
  };
}
function guideLocalPoint(world,guide){
  const tr=guide.transform||{};
  const width=Math.max(1,Number(tr.width)||330),height=Math.max(1,Number(tr.height)||430);
  const rotation=-(Number(tr.rotation)||0)*Math.PI/180;
  const dx=world.x-(Number(tr.x)||360),dy=world.y-(Number(tr.y)||360),cr=Math.cos(rotation),sr=Math.sin(rotation);
  return {x:(dx*cr-dy*sr)/width+.5,y:(dx*sr+dy*cr)/height+.5};
}
function insidePolygon(local,points){
  let hit=false;
  for(let i=0,j=points.length-1;i<points.length;j=i++){
    const a=points[i],b=points[j];
    if(((a[1]>local.y)!==(b[1]>local.y))&&(local.x<(b[0]-a[0])*(local.y-a[1])/((b[1]-a[1])||1e-6)+a[0]))hit=!hit;
  }
  return hit;
}

async function protectPolygonGuide({guide,mode}){
  if(!studioBaseCanvas||!guide||!Array.isArray(guide.points)||guide.points.length<3)return {changed:false,rescued:0,insideCount:0};
  const src=sourcePhoto();if(!src)return {changed:false,rescued:0,insideCount:0};
  const original=await sourceToStudioCanvas(src);
  const w=studioBaseCanvas.width,h=studioBaseCanvas.height;if(!w||!h)return {changed:false,rescued:0,insideCount:0};
  const source=document.createElement('canvas');source.width=w;source.height=h;
  const sourceCtx=source.getContext('2d',{willReadFrequently:true});sourceCtx.drawImage(original,0,0,w,h);
  const cutCtx=studioBaseCanvas.getContext('2d',{willReadFrequently:true});
  const srcImage=sourceCtx.getImageData(0,0,w,h),cutImage=cutCtx.getImageData(0,0,w,h),s=srcImage.data,c=cutImage.data;
  const bg=borderColor(s,w,h),pr=clamp(Number(guide.protection)||70,0,100)/100;
  // Clean is allowed to be slightly more selective, while the same guide logic
  // remains independent of the algorithm/method that produced this base.
  const modeBias=mode==='clean'?.015:0;
  const threshold=.53-pr*.17+modeBias,floor=30-pr*12,alpha=(x,y)=>c[(y*w+x)*4+3];
  const tr=guide.transform||{},gw=Math.max(1,Number(tr.width)||330),gh=Math.max(1,Number(tr.height)||430);
  let rescued=0,insideCount=0;
  for(let y=2;y<h-2;y++)for(let x=2;x<w-2;x++){
    const world=imagePointToWorld(x,y),local=guideLocalPoint(world,guide);
    if(!insidePolygon(local,guide.points))continue;
    insideCount++;
    const i=(y*w+x)*4;if(c[i+3]>=230)continue;
    const dr=s[i]-bg[0],dg=s[i+1]-bg[1],db=s[i+2]-bg[2],dist=Math.sqrt(dr*dr+dg*dg+db*db);
    let strong=0,near=0;
    for(let yy=-2;yy<=2;yy++)for(let xx=-2;xx<=2;xx++){
      if(!xx&&!yy)continue;const a=alpha(x+xx,y+yy);if(a>35)near++;if(a>150)strong++;
    }
    const gx=(local.x-.5)*gw,gy=(local.y-.5)*gh,nx=Math.abs(gx/(gw/2)),ny=Math.abs(gy/(gh/2));
    const central=Math.max(0,1-Math.max(nx,ny)),continuity=Math.min(1,strong/5),color=Math.min(1,dist/66);
    const score=central*(.28+.10*pr)+continuity*.40+color*(.32-.10*pr);
    if(dist<floor&&strong<(pr>.75?2:3))continue;
    if(score<threshold&&near<(pr>.75?2:3))continue;
    const restoredAlpha=Math.round(Math.max(90,Math.min(250,95+pr*36+continuity*76+color*34+central*20)));
    c[i]=s[i];c[i+1]=s[i+1];c[i+2]=s[i+2];c[i+3]=Math.max(c[i+3],restoredAlpha);rescued++;
  }
  if(rescued)cutCtx.putImageData(cutImage,0,0);
  return {changed:rescued>0,rescued,insideCount,protection:Math.round(pr*100)};
}

// Shirt is currently a polygon guide. Future Pants/Skirt/etc. can register a
// different processor without changing any cutout algorithm or this dispatcher.
registerGuideProcessor('shirt',protectPolygonGuide);

async function applyGuideProtection(state,{force=false}={}){
  if(!state||state.workflow!=='guided'||!state.guide||studioMode==='original')return {applied:false,reason:'inactive'};
  const guide=state.guide;
  if(!guide.applied&&!force)return {applied:false,reason:'not-applied'};
  const processor=processors.get(guide.type);if(!processor)return {applied:false,reason:'unsupported-guide'};
  const stats=await processor({guide:clone(guide),mode:studioMode,method:state.method});
  if(typeof rebuildStudioWorkCanvas==='function')rebuildStudioWorkCanvas();
  const next=clone(state);next.algorithm=studioMode;next.baseResult=captureBase();
  next.guide.applied=true;
  if(force)next.guide.dirty=false;
  next.guide.baseResult=next.baseResult;
  persistState(next);lastStats={...stats,type:guide.type,mode:studioMode,method:next.method};
  return {applied:true,stats,lastState:next};
}

async function applyCurrentGuide(){
  const state=currentState();if(!state||state.workflow!=='guided'||!state.guide)return false;
  applyingGuide=true;
  try{
    // Applying while Original is selected records the guide as active, but does
    // not manufacture a cutout. The next Quick/Clean choice will use it.
    if(studioMode==='original'){
      const next=clone(state);next.guide.applied=true;next.guide.dirty=false;persistState(next);
      const status=document.getElementById('studioStatus');if(status)status.textContent='Shirt Guide applied. Choose Quick or Clean to use it.';
      window.__audreyCutoutWorkflow3B?.sync?.();return true;
    }
    // Re-run the selected candidate algorithm/method first. The 3C wrapper below
    // will then perform guide protection exactly once after all method processing.
    await applyStudioMode(studioMode,{showBusy:true,phase3cGuideApply:true});
    const next=currentState();if(next?.guide){next.guide.applied=true;next.guide.dirty=false;next.guide.baseResult=next.baseResult;persistState(next);}
    window.__audreyCutoutWorkflow3B?.sync?.();
    return true;
  }finally{applyingGuide=false;}
}

const mode0=applyStudioMode;
applyStudioMode=async function(mode,options){
  const out=await mode0.apply(this,arguments);
  if(processing||mode==='original')return out;
  const state=currentState();
  if(!state||state.workflow!=='guided'||!state.guide?.applied)return out;
  processing=true;
  try{
    const result=await applyGuideProtection(state,{force:!!options?.phase3cGuideApply});
    if(result.applied){
      const status=document.getElementById('studioStatus');
      if(status){
        const methodLabels={standard:'Standard',center:'Center Focus',edge:'Edge Guide',grow:'Subject Grow'};
        const modeLabel=mode==='clean'?'Clean':'Quick';
        status.textContent=modeLabel+' + '+(methodLabels[result.lastState?.method]||'Standard')+' + Shirt Guide applied.';
      }
      window.__audreyCutoutWorkflow3B?.sync?.();
    }
  }catch(err){console.error('Phase 3C guide protection failed',err);const status=document.getElementById('studioStatus');if(status)status.textContent='Cutout finished, but the garment guide could not be applied. Your original is still safe.';}
  finally{processing=false;}
  return out;
};

window.__audreyCutoutPipeline={
  phase:'3C',registerGuideProcessor,applyGuideProtection,applyCurrentGuide,
  getProcessorTypes:()=>[...processors.keys()],get lastStats(){return lastStats?clone(lastStats):null;}
};
})();
