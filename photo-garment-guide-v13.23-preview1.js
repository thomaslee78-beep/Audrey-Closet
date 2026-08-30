/* Audrey Closet v13.23 background-removal preview — Garment Guide Phase 1A.
 * Prototype scope: Shirt only, move + resize, Quick only, no point editing.
 * The guide acts as a soft subject-preservation prior after the normal Quick cutout.
 */
(function(){
  'use strict';

  let guideEnabled=false;
  let guide={x:360,y:360,w:330,h:430};
  let drag=null;
  let lastQuickGuideStats=null;

  function clamp(v,min,max){return Math.max(min,Math.min(max,v));}
  function canvasEl(){return document.getElementById('studioCanvas');}
  function wrapEl(){return canvasEl()?.closest('.studio-canvas-wrap')||null;}

  function ensureStyles(){
    if(document.getElementById('studioGarmentGuideStyles'))return;
    const style=document.createElement('style');
    style.id='studioGarmentGuideStyles';
    style.textContent=`
      .studio-garment-guide-panel{display:grid;gap:7px;margin-top:8px;padding:9px;border:1px solid rgba(108,81,66,.14);border-radius:12px;background:rgba(255,250,240,.78)}
      .studio-garment-guide-head{display:flex;align-items:center;justify-content:space-between;gap:8px}
      .studio-garment-guide-head strong{font-size:11px;color:#665c50}.studio-garment-guide-head small{font-size:9px;color:#8a7d70}
      .studio-garment-guide-actions{display:grid;grid-template-columns:1fr 1fr;gap:6px}
      .studio-garment-guide-btn{min-height:34px;border:1px solid rgba(108,81,66,.18);border-radius:10px;background:#f8f1e3;color:#675d51;font:800 10px/1.05 system-ui,-apple-system,sans-serif}
      .studio-garment-guide-btn.active{background:#6d7863;border-color:#6d7863;color:#fff}
      .studio-garment-guide-note{margin:0;font-size:9.5px;line-height:1.3;color:#817568}
      .studio-shirt-guide{position:absolute;z-index:14;pointer-events:auto;touch-action:none;transform:translate(-50%,-50%);box-sizing:border-box;border:2px dashed rgba(125,53,71,.86);background:rgba(125,53,71,.07);filter:drop-shadow(0 2px 4px rgba(72,46,50,.08));clip-path:polygon(30% 5%,42% 0,58% 0,70% 5%,96% 22%,84% 41%,73% 32%,73% 100%,27% 100%,27% 32%,16% 41%,4% 22%)}
      .studio-shirt-guide.hidden{display:none!important}
      .studio-shirt-guide::after{content:'SHIRT GUIDE';position:absolute;left:50%;top:45%;transform:translate(-50%,-50%);font:800 10px/1 system-ui,-apple-system,sans-serif;letter-spacing:.08em;color:rgba(125,53,71,.70);white-space:nowrap;pointer-events:none}
      .studio-shirt-guide-handle{position:absolute;right:-11px;bottom:-11px;width:24px;height:24px;border:2px solid #fff;border-radius:50%;background:#7d3547;box-shadow:0 2px 6px rgba(72,46,50,.22);touch-action:none}
      .studio-shirt-guide-handle::before{content:'↘';position:absolute;inset:0;display:grid;place-items:center;color:#fff;font:800 12px/1 system-ui}
      .studio-canvas-wrap.guide-active #studioCanvas{touch-action:none}
    `;
    document.head.appendChild(style);
  }

  function installUI(){
    ensureStyles();
    const methods=document.getElementById('studioCutoutMethods');
    if(methods&&!document.getElementById('studioGarmentGuidePanel')){
      const panel=document.createElement('section');
      panel.id='studioGarmentGuidePanel';
      panel.className='studio-garment-guide-panel';
      panel.innerHTML=`
        <div class="studio-garment-guide-head"><strong>Garment Guide</strong><small>Phase 1A</small></div>
        <div class="studio-garment-guide-actions">
          <button type="button" id="studioShirtGuideToggle" class="studio-garment-guide-btn">Shirt guide</button>
          <button type="button" id="studioShirtGuideReset" class="studio-garment-guide-btn">Reset guide</button>
        </div>
        <p class="studio-garment-guide-note">Drag the shirt shape over the garment and resize from the lower-right handle. The guide affects Quick only.</p>`;
      methods.insertAdjacentElement('afterend',panel);
      document.getElementById('studioShirtGuideToggle')?.addEventListener('click',()=>{
        guideEnabled=!guideEnabled;
        syncUI();
        if(guideEnabled&&typeof studioMode!=='undefined'&&studioMode==='quick'&&typeof applyStudioMode==='function')applyStudioMode('quick',{showBusy:false});
      });
      document.getElementById('studioShirtGuideReset')?.addEventListener('click',()=>{
        guide={x:360,y:360,w:330,h:430};
        syncGuideOverlay();
        if(guideEnabled&&typeof studioMode!=='undefined'&&studioMode==='quick'&&typeof applyStudioMode==='function')applyStudioMode('quick',{showBusy:false});
      });
    }

    const wrap=wrapEl();
    if(wrap&&!document.getElementById('studioShirtGuide')){
      const overlay=document.createElement('div');
      overlay.id='studioShirtGuide';
      overlay.className='studio-shirt-guide hidden';
      overlay.setAttribute('aria-label','Shirt garment guide');
      const handle=document.createElement('div');
      handle.className='studio-shirt-guide-handle';
      handle.setAttribute('aria-label','Resize shirt guide');
      overlay.appendChild(handle);
      wrap.appendChild(overlay);

      overlay.addEventListener('pointerdown',e=>{
        if(!guideEnabled)return;
        e.preventDefault();e.stopPropagation();
        const rect=canvasEl().getBoundingClientRect();
        const px=(e.clientX-rect.left)*720/Math.max(1,rect.width);
        const py=(e.clientY-rect.top)*720/Math.max(1,rect.height);
        drag={kind:e.target===handle?'resize':'move',pointerId:e.pointerId,startX:px,startY:py,startGuide:{...guide}};
        overlay.setPointerCapture?.(e.pointerId);
      });
      overlay.addEventListener('pointermove',e=>{
        if(!drag||drag.pointerId!==e.pointerId)return;
        e.preventDefault();e.stopPropagation();
        const rect=canvasEl().getBoundingClientRect();
        const px=(e.clientX-rect.left)*720/Math.max(1,rect.width);
        const py=(e.clientY-rect.top)*720/Math.max(1,rect.height);
        const dx=px-drag.startX,dy=py-drag.startY;
        if(drag.kind==='move'){
          guide.x=clamp(drag.startGuide.x+dx,70,650);
          guide.y=clamp(drag.startGuide.y+dy,80,640);
        }else{
          guide.w=clamp(drag.startGuide.w+dx*2,150,620);
          guide.h=clamp(drag.startGuide.h+dy*2,190,650);
        }
        syncGuideOverlay();
      });
      const finish=e=>{
        if(!drag||drag.pointerId!==e.pointerId)return;
        drag=null;
        e.preventDefault();e.stopPropagation();
        if(guideEnabled&&typeof studioMode!=='undefined'&&studioMode==='quick'&&typeof applyStudioMode==='function')applyStudioMode('quick',{showBusy:false});
      };
      overlay.addEventListener('pointerup',finish);
      overlay.addEventListener('pointercancel',finish);
    }
    syncUI();
  }

  function syncUI(){
    const toggle=document.getElementById('studioShirtGuideToggle');
    if(toggle){toggle.classList.toggle('active',guideEnabled);toggle.textContent=guideEnabled?'Shirt guide on':'Shirt guide';}
    wrapEl()?.classList.toggle('guide-active',guideEnabled);
    syncGuideOverlay();
  }

  function syncGuideOverlay(){
    const overlay=document.getElementById('studioShirtGuide');
    const canvas=canvasEl();
    if(!overlay||!canvas)return;
    overlay.classList.toggle('hidden',!guideEnabled);
    if(!guideEnabled)return;
    const rect=canvas.getBoundingClientRect();
    const sx=rect.width/720,sy=rect.height/720;
    const screenX=(360+(guide.x-360)*(typeof studioViewZoom==='number'?studioViewZoom:1)+(typeof studioViewX==='number'?studioViewX:0))*sx;
    const screenY=(360+(guide.y-360)*(typeof studioViewZoom==='number'?studioViewZoom:1)+(typeof studioViewY==='number'?studioViewY:0))*sy;
    overlay.style.left=screenX+'px';
    overlay.style.top=screenY+'px';
    overlay.style.width=(guide.w*(typeof studioViewZoom==='number'?studioViewZoom:1)*sx)+'px';
    overlay.style.height=(guide.h*(typeof studioViewZoom==='number'?studioViewZoom:1)*sy)+'px';
  }

  function pointInShirt(wx,wy){
    const nx=(wx-(guide.x-guide.w/2))/guide.w;
    const ny=(wy-(guide.y-guide.h/2))/guide.h;
    if(nx<0||nx>1||ny<0||ny>1)return false;
    const pts=[[.30,.05],[.42,0],[.58,0],[.70,.05],[.96,.22],[.84,.41],[.73,.32],[.73,1],[.27,1],[.27,.32],[.16,.41],[.04,.22]];
    let inside=false;
    for(let i=0,j=pts.length-1;i<pts.length;j=i++){
      const xi=pts[i][0],yi=pts[i][1],xj=pts[j][0],yj=pts[j][1];
      const hit=((yi>ny)!==(yj>ny))&&(nx<(xj-xi)*(ny-yi)/((yj-yi)||1e-6)+xi);
      if(hit)inside=!inside;
    }
    return inside;
  }

  function sourcePixelToWorld(x,y){
    const scale=typeof studioObjectScale==='number'?studioObjectScale:1;
    const rot=(typeof studioObjectRotation==='number'?studioObjectRotation:0)*Math.PI/180;
    const dx=(x-360)*scale,dy=(y-360)*scale;
    const cr=Math.cos(rot),sr=Math.sin(rot);
    return {
      x:360+(typeof studioObjectX==='number'?studioObjectX:0)+dx*cr-dy*sr,
      y:360+(typeof studioObjectY==='number'?studioObjectY:0)+dx*sr+dy*cr
    };
  }

  function estimateBorderColor(data,w,h){
    const band=Math.max(2,Math.round(Math.min(w,h)*.035));
    const step=Math.max(1,Math.round(Math.min(w,h)/220));
    let r=0,g=0,b=0,count=0;
    for(let y=0;y<h;y+=step)for(let x=0;x<w;x+=step){
      if(x>=band&&x<w-band&&y>=band&&y<h-band)continue;
      const i=(y*w+x)*4;r+=data[i];g+=data[i+1];b+=data[i+2];count++;
    }
    return count?[r/count,g/count,b/count]:[255,255,255];
  }

  async function applyShirtGuideQuick(){
    if(!guideEnabled||typeof studioMode==='undefined'||studioMode!=='quick'||!studioBaseCanvas)return false;
    const src=(typeof studioTarget!=='undefined'&&studioTarget==='wish')?(wishOriginalPhoto||studioSourcePhoto||wishWorkingPhoto):(itemOriginalPhoto||studioSourcePhoto||itemWorkingPhoto);
    if(!src)return false;
    const original=await sourceToStudioCanvas(src);if(!original)return false;
    const w=studioBaseCanvas.width,h=studioBaseCanvas.height;if(!w||!h)return false;
    const source=document.createElement('canvas');source.width=w;source.height=h;
    const sctx=source.getContext('2d',{willReadFrequently:true});sctx.drawImage(original,0,0,w,h);
    const cctx=studioBaseCanvas.getContext('2d',{willReadFrequently:true});
    const srcImage=sctx.getImageData(0,0,w,h),cutImage=cctx.getImageData(0,0,w,h);
    const s=srcImage.data,c=cutImage.data,bg=estimateBorderColor(s,w,h);
    let rescued=0,insideCount=0;
    const radius=2;
    const alphaAt=(x,y)=>c[(y*w+x)*4+3];
    for(let y=2;y<h-2;y++)for(let x=2;x<w-2;x++){
      const world=sourcePixelToWorld(x,y);if(!pointInShirt(world.x,world.y))continue;insideCount++;
      const i=(y*w+x)*4;if(c[i+3]>=230)continue;
      const dr=s[i]-bg[0],dg=s[i+1]-bg[1],db=s[i+2]-bg[2];
      const bgDistance=Math.sqrt(dr*dr+dg*dg+db*db);
      let strong=0,near=0;
      for(let dy=-radius;dy<=radius;dy++)for(let dx=-radius;dx<=radius;dx++){
        if(!dx&&!dy)continue;const a=alphaAt(x+dx,y+dy);if(a>35)near++;if(a>150)strong++;
      }
      const nx=Math.abs((world.x-guide.x)/(guide.w/2)),ny=Math.abs((world.y-guide.y)/(guide.h/2));
      const central=Math.max(0,1-Math.max(nx,ny));
      const continuity=Math.min(1,strong/5);
      const colorSignal=Math.min(1,bgDistance/66);
      const score=central*.34+continuity*.40+colorSignal*.26;
      if(bgDistance<22&&strong<3)continue;
      if(score<.42&&near<3)continue;
      const alpha=Math.round(Math.max(105,Math.min(245,110+continuity*80+colorSignal*40+central*22)));
      c[i]=s[i];c[i+1]=s[i+1];c[i+2]=s[i+2];c[i+3]=Math.max(c[i+3],alpha);rescued++;
    }
    if(!rescued){lastQuickGuideStats={rescued:0,insideCount};return false;}
    cctx.putImageData(cutImage,0,0);rebuildStudioWorkCanvas();
    lastQuickGuideStats={rescued,insideCount};
    return true;
  }

  const previousOpenPhotoStudio=openPhotoStudio;
  openPhotoStudio=async function(){
    guideEnabled=false;guide={x:360,y:360,w:330,h:430};lastQuickGuideStats=null;
    const result=await previousOpenPhotoStudio.apply(this,arguments);
    installUI();syncUI();return result;
  };

  const previousApplyStudioMode=applyStudioMode;
  applyStudioMode=async function(mode,options){
    const result=await previousApplyStudioMode.apply(this,arguments);
    if(mode==='quick'&&guideEnabled){
      try{
        const changed=await applyShirtGuideQuick();
        const status=document.getElementById('studioStatus');
        if(status)status.textContent=changed?'Quick + Shirt Guide applied. Move or resize the guide and release to re-run Quick.':'Quick + Shirt Guide applied; no additional garment pixels needed rescue in the guide.';
      }catch(error){console.error('Shirt Guide preview failed',error);}
    }
    syncUI();return result;
  };

  const previousRenderStudio=renderStudio;
  renderStudio=async function(){const result=await previousRenderStudio.apply(this,arguments);syncGuideOverlay();return result;};

  window.__audreyGarmentGuidePreview={
    phase:'1A',
    type:'shirt',
    get enabled(){return guideEnabled;},
    get guide(){return {...guide};},
    get stats(){return lastQuickGuideStats?{...lastQuickGuideStats}:null;}
  };
})();
