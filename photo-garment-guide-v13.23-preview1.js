/* Audrey Closet v13.23 background-removal preview — Garment Guide Phase 1B.
 * Shirt-only prototype. Adds reliable move/resize controls, guide edit mode,
 * protection strength tuning, and clean coexistence with Photo Studio tools.
 * The guide influences Quick only. Erase/Restore remain non-destructive masks
 * applied by the existing Photo Studio pipeline after the guided Quick base.
 */
(function(){
  'use strict';

  let guideEnabled=false;
  let guideEditing=false;
  let guide={x:360,y:360,w:330,h:430};
  let guideProtection=70;
  let drag=null;
  let lastQuickGuideStats=null;
  let guideRefreshTimer=0;

  function clamp(v,min,max){return Math.max(min,Math.min(max,v));}
  function canvasEl(){return document.getElementById('studioCanvas');}
  function wrapEl(){return canvasEl()?.closest('.studio-canvas-wrap')||null;}
  function studioToolOwnsCanvas(){return !!((typeof studioBrushMode!=='undefined'&&studioBrushMode)||(typeof studioMoveMode!=='undefined'&&studioMoveMode));}

  function ensureStyles(){
    if(document.getElementById('studioGarmentGuideStyles'))return;
    const style=document.createElement('style');
    style.id='studioGarmentGuideStyles';
    style.textContent=`
      .studio-garment-guide-panel{display:grid;gap:8px;margin-top:8px;padding:9px;border:1px solid rgba(108,81,66,.14);border-radius:12px;background:rgba(255,250,240,.78)}
      .studio-garment-guide-head{display:flex;align-items:center;justify-content:space-between;gap:8px}
      .studio-garment-guide-head strong{font-size:11px;color:#665c50}.studio-garment-guide-head small{font-size:9px;color:#8a7d70}
      .studio-garment-guide-actions{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px}
      .studio-garment-guide-btn{min-height:36px;padding:6px;border:1px solid rgba(108,81,66,.18);border-radius:10px;background:#f8f1e3;color:#675d51;font:800 9.5px/1.1 system-ui,-apple-system,sans-serif}
      .studio-garment-guide-btn.active{background:#6d7863;border-color:#6d7863;color:#fff}
      .studio-garment-guide-btn:disabled{opacity:.44}
      .studio-garment-guide-sliders{display:grid;gap:7px;padding:7px 8px;border-radius:10px;background:rgba(109,120,99,.07)}
      .studio-garment-guide-sliders label{display:grid;grid-template-columns:74px 1fr 34px;align-items:center;gap:7px;font-size:9.5px;font-weight:800;color:#675d51}
      .studio-garment-guide-sliders input[type="range"]{width:100%;accent-color:#7d3547}
      .studio-garment-guide-sliders output{text-align:right;font-variant-numeric:tabular-nums;color:#7d3547}
      .studio-garment-guide-note{margin:0;font-size:9.5px;line-height:1.35;color:#817568}
      .studio-shirt-guide{position:absolute;z-index:14;transform:translate(-50%,-50%);box-sizing:border-box;touch-action:none;pointer-events:none}
      .studio-shirt-guide.hidden{display:none!important}
      .studio-shirt-guide.editing{pointer-events:auto}
      .studio-shirt-guide-shape{position:absolute;inset:0;box-sizing:border-box;border:2px dashed rgba(125,53,71,.88);background:rgba(125,53,71,.075);filter:drop-shadow(0 2px 4px rgba(72,46,50,.08));clip-path:polygon(30% 5%,42% 0,58% 0,70% 5%,96% 22%,84% 41%,73% 32%,73% 100%,27% 100%,27% 32%,16% 41%,4% 22%);pointer-events:none}
      .studio-shirt-guide-label{position:absolute;left:50%;top:45%;transform:translate(-50%,-50%);font:800 10px/1 system-ui,-apple-system,sans-serif;letter-spacing:.08em;color:rgba(125,53,71,.72);white-space:nowrap;pointer-events:none}
      .studio-shirt-guide:not(.editing) .studio-shirt-guide-shape{border-color:rgba(125,53,71,.48);background:rgba(125,53,71,.035)}
      .studio-shirt-guide:not(.editing) .studio-shirt-guide-label{opacity:.55}
      .studio-shirt-guide-handle{position:absolute;right:-17px;bottom:-17px;width:34px;height:34px;box-sizing:border-box;border:3px solid #fff;border-radius:50%;background:#7d3547;box-shadow:0 2px 8px rgba(72,46,50,.28);touch-action:none;cursor:nwse-resize}
      .studio-shirt-guide-handle::before{content:'↘';position:absolute;inset:0;display:grid;place-items:center;color:#fff;font:900 15px/1 system-ui}
      .studio-shirt-guide:not(.editing) .studio-shirt-guide-handle{display:none}
      .studio-canvas-wrap.guide-editing{touch-action:none}
      @media(max-width:410px){.studio-garment-guide-actions{grid-template-columns:1fr 1fr}.studio-garment-guide-actions #studioShirtGuideReset{grid-column:1/-1}.studio-garment-guide-sliders label{grid-template-columns:66px 1fr 30px}}
    `;
    document.head.appendChild(style);
  }

  function scheduleQuickRefresh(delay=80){
    clearTimeout(guideRefreshTimer);
    if(!guideEnabled||typeof studioMode==='undefined'||studioMode!=='quick'||typeof applyStudioMode!=='function')return;
    guideRefreshTimer=setTimeout(()=>{
      if(guideEnabled&&typeof studioMode!=='undefined'&&studioMode==='quick')applyStudioMode('quick',{showBusy:false});
    },delay);
  }

  function setGuideEditing(next){
    guideEditing=!!next&&guideEnabled;
    if(guideEditing){
      if(typeof studioBrushMode!=='undefined')studioBrushMode=null;
      if(typeof studioMoveMode!=='undefined')studioMoveMode=false;
      document.querySelectorAll('.brush-btn').forEach(b=>b.classList.remove('active'));
      document.getElementById('studioMoveToggle')?.classList.remove('active');
      if(typeof updateStudioToolUI==='function')updateStudioToolUI();
    }
    syncUI();
  }

  function installUI(){
    ensureStyles();
    const methods=document.getElementById('studioCutoutMethods');
    if(methods&&!document.getElementById('studioGarmentGuidePanel')){
      const panel=document.createElement('section');
      panel.id='studioGarmentGuidePanel';
      panel.className='studio-garment-guide-panel';
      panel.innerHTML=`
        <div class="studio-garment-guide-head"><strong>Garment Guide</strong><small>Shirt test · Phase 1B</small></div>
        <div class="studio-garment-guide-actions">
          <button type="button" id="studioShirtGuideToggle" class="studio-garment-guide-btn">Shirt guide</button>
          <button type="button" id="studioShirtGuideEdit" class="studio-garment-guide-btn">Edit guide</button>
          <button type="button" id="studioShirtGuideReset" class="studio-garment-guide-btn">Reset guide</button>
        </div>
        <div class="studio-garment-guide-sliders">
          <label><span>Width</span><input id="studioShirtGuideWidth" type="range" min="150" max="620" step="5" value="330"><output id="studioShirtGuideWidthValue">330</output></label>
          <label><span>Height</span><input id="studioShirtGuideHeight" type="range" min="190" max="650" step="5" value="430"><output id="studioShirtGuideHeightValue">430</output></label>
          <label><span>Protect</span><input id="studioShirtGuideProtection" type="range" min="0" max="100" step="5" value="70"><output id="studioShirtGuideProtectionValue">70</output></label>
        </div>
        <p class="studio-garment-guide-note">Turn on Shirt guide, tap Edit guide, then drag the shirt or resize with the handle. Width/Height are a touch-friendly fallback. Protect controls how strongly Quick preserves likely garment pixels. Erase, Restore and Adjust temporarily take control of the canvas while the guide stays visible.</p>`;
      methods.insertAdjacentElement('afterend',panel);

      document.getElementById('studioShirtGuideToggle')?.addEventListener('click',()=>{
        guideEnabled=!guideEnabled;
        guideEditing=guideEnabled;
        syncUI();
        scheduleQuickRefresh(0);
      });
      document.getElementById('studioShirtGuideEdit')?.addEventListener('click',()=>setGuideEditing(!guideEditing));
      document.getElementById('studioShirtGuideReset')?.addEventListener('click',()=>{
        guide={x:360,y:360,w:330,h:430};
        guideProtection=70;
        syncUI();
        scheduleQuickRefresh(0);
      });

      const width=document.getElementById('studioShirtGuideWidth');
      const height=document.getElementById('studioShirtGuideHeight');
      const protect=document.getElementById('studioShirtGuideProtection');
      width?.addEventListener('input',()=>{guide.w=clamp(Number(width.value)||330,150,620);syncGuideOverlay();syncSliderLabels();});
      height?.addEventListener('input',()=>{guide.h=clamp(Number(height.value)||430,190,650);syncGuideOverlay();syncSliderLabels();});
      protect?.addEventListener('input',()=>{guideProtection=clamp(Number(protect.value)||0,0,100);syncSliderLabels();});
      width?.addEventListener('change',()=>scheduleQuickRefresh());
      height?.addEventListener('change',()=>scheduleQuickRefresh());
      protect?.addEventListener('change',()=>scheduleQuickRefresh());
    }

    const wrap=wrapEl();
    if(wrap&&!document.getElementById('studioShirtGuide')){
      const overlay=document.createElement('div');
      overlay.id='studioShirtGuide';
      overlay.className='studio-shirt-guide hidden';
      overlay.setAttribute('aria-label','Shirt garment guide');
      overlay.innerHTML='<div class="studio-shirt-guide-shape"></div><div class="studio-shirt-guide-label">SHIRT GUIDE</div><div class="studio-shirt-guide-handle" aria-label="Resize shirt guide"></div>';
      const handle=overlay.querySelector('.studio-shirt-guide-handle');
      wrap.appendChild(overlay);

      overlay.addEventListener('pointerdown',e=>{
        if(!guideEnabled||!guideEditing||studioToolOwnsCanvas())return;
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
        const zoom=typeof studioViewZoom==='number'?Math.max(.01,studioViewZoom):1;
        const dx=(px-drag.startX)/zoom,dy=(py-drag.startY)/zoom;
        if(drag.kind==='move'){
          guide.x=clamp(drag.startGuide.x+dx,70,650);
          guide.y=clamp(drag.startGuide.y+dy,80,640);
        }else{
          guide.w=clamp(drag.startGuide.w+dx*2,150,620);
          guide.h=clamp(drag.startGuide.h+dy*2,190,650);
        }
        syncGuideOverlay();syncSliderLabels();
      });
      const finish=e=>{
        if(!drag||drag.pointerId!==e.pointerId)return;
        drag=null;
        e.preventDefault();e.stopPropagation();
        scheduleQuickRefresh(0);
      };
      overlay.addEventListener('pointerup',finish);
      overlay.addEventListener('pointercancel',finish);
    }
    syncUI();
  }

  function syncSliderLabels(){
    const width=document.getElementById('studioShirtGuideWidth');
    const height=document.getElementById('studioShirtGuideHeight');
    const protect=document.getElementById('studioShirtGuideProtection');
    if(width&&Number(width.value)!==Math.round(guide.w))width.value=String(Math.round(guide.w));
    if(height&&Number(height.value)!==Math.round(guide.h))height.value=String(Math.round(guide.h));
    if(protect&&Number(protect.value)!==Math.round(guideProtection))protect.value=String(Math.round(guideProtection));
    const widthOut=document.getElementById('studioShirtGuideWidthValue');if(widthOut)widthOut.textContent=String(Math.round(guide.w));
    const heightOut=document.getElementById('studioShirtGuideHeightValue');if(heightOut)heightOut.textContent=String(Math.round(guide.h));
    const protectOut=document.getElementById('studioShirtGuideProtectionValue');if(protectOut)protectOut.textContent=String(Math.round(guideProtection));
  }

  function syncUI(){
    if(studioToolOwnsCanvas())guideEditing=false;
    const toggle=document.getElementById('studioShirtGuideToggle');
    if(toggle){toggle.classList.toggle('active',guideEnabled);toggle.textContent=guideEnabled?'Shirt guide on':'Shirt guide';}
    const edit=document.getElementById('studioShirtGuideEdit');
    if(edit){edit.disabled=!guideEnabled;edit.classList.toggle('active',guideEditing);edit.textContent=guideEditing?'Editing guide':'Edit guide';}
    const reset=document.getElementById('studioShirtGuideReset');if(reset)reset.disabled=!guideEnabled;
    document.querySelectorAll('#studioGarmentGuidePanel input').forEach(input=>input.disabled=!guideEnabled);
    wrapEl()?.classList.toggle('guide-editing',guideEnabled&&guideEditing);
    syncSliderLabels();syncGuideOverlay();
  }

  function syncGuideOverlay(){
    const overlay=document.getElementById('studioShirtGuide');
    const canvas=canvasEl();
    if(!overlay||!canvas)return;
    overlay.classList.toggle('hidden',!guideEnabled);
    overlay.classList.toggle('editing',guideEnabled&&guideEditing&&!studioToolOwnsCanvas());
    if(!guideEnabled)return;
    const rect=canvas.getBoundingClientRect();
    const sx=rect.width/720,sy=rect.height/720;
    const zoom=typeof studioViewZoom==='number'?studioViewZoom:1;
    const screenX=(360+(guide.x-360)*zoom+(typeof studioViewX==='number'?studioViewX:0))*sx;
    const screenY=(360+(guide.y-360)*zoom+(typeof studioViewY==='number'?studioViewY:0))*sy;
    overlay.style.left=screenX+'px';
    overlay.style.top=screenY+'px';
    overlay.style.width=(guide.w*zoom*sx)+'px';
    overlay.style.height=(guide.h*zoom*sy)+'px';
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
    const protection=guideProtection/100;
    const scoreThreshold=.53-protection*.17;
    const bgFloor=30-protection*12;
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
      const score=central*(.28+.10*protection)+continuity*.40+colorSignal*(.32-.10*protection);
      if(bgDistance<bgFloor&&strong<(protection>.75?2:3))continue;
      if(score<scoreThreshold&&near<(protection>.75?2:3))continue;
      const alpha=Math.round(Math.max(90,Math.min(250,95+protection*36+continuity*76+colorSignal*34+central*20)));
      c[i]=s[i];c[i+1]=s[i+1];c[i+2]=s[i+2];c[i+3]=Math.max(c[i+3],alpha);rescued++;
    }
    if(!rescued){lastQuickGuideStats={rescued:0,insideCount,protection:guideProtection};return false;}
    cctx.putImageData(cutImage,0,0);rebuildStudioWorkCanvas();
    lastQuickGuideStats={rescued,insideCount,protection:guideProtection};
    return true;
  }

  const previousOpenPhotoStudio=openPhotoStudio;
  openPhotoStudio=async function(){
    guideEnabled=false;guideEditing=false;guide={x:360,y:360,w:330,h:430};guideProtection=70;lastQuickGuideStats=null;
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
        if(status)status.textContent=changed?'Quick + Shirt Guide applied. Manual Erase/Restore masks remain available for cleanup.':'Quick + Shirt Guide applied; no additional garment pixels needed rescue in the guide.';
      }catch(error){console.error('Shirt Guide preview failed',error);}
    }
    syncUI();return result;
  };

  const previousRenderStudio=renderStudio;
  renderStudio=async function(){const result=await previousRenderStudio.apply(this,arguments);syncGuideOverlay();return result;};

  if(typeof updateStudioToolUI==='function'){
    const previousUpdateStudioToolUI=updateStudioToolUI;
    updateStudioToolUI=function(){
      const result=previousUpdateStudioToolUI.apply(this,arguments);
      if(studioToolOwnsCanvas())guideEditing=false;
      syncUI();
      return result;
    };
  }

  document.addEventListener('click',e=>{
    if(!guideEnabled)return;
    const tool=e.target.closest?.('.brush-btn,#studioMoveToggle');
    if(tool){guideEditing=false;syncUI();}
  },true);

  window.__audreyGarmentGuidePreview={
    phase:'1B',
    type:'shirt',
    get enabled(){return guideEnabled;},
    get editing(){return guideEditing;},
    get protection(){return guideProtection;},
    get guide(){return {...guide};},
    get stats(){return lastQuickGuideStats?{...lastQuickGuideStats}:null;}
  };
})();
