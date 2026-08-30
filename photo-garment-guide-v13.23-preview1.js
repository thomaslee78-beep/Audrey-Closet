/* Audrey Closet v13.23 background-removal preview — Garment Guide Phase 1C.
 * Shirt-only prototype. Persists guide state with Photo Studio, adds shirt presets,
 * clearer guide controls, explicit Apply Quick behavior, and clean coexistence
 * with Erase / Restore / Adjust. The underlying Phase 1B Quick rescue algorithm
 * remains unchanged so this iteration tests workflow and usability, not a new cutout.
 */
(function(){
  'use strict';

  const GUIDE_DEFAULT={x:360,y:360,w:330,h:430};
  const GUIDE_PRESETS={
    slim:{label:'Slim',w:285,h:440,protection:68},
    regular:{label:'Regular',w:330,h:430,protection:70},
    relaxed:{label:'Relaxed',w:390,h:445,protection:74}
  };

  let guideEnabled=false;
  let guideEditing=false;
  let guide={...GUIDE_DEFAULT};
  let guideProtection=70;
  let guidePreset='regular';
  let drag=null;
  let lastQuickGuideStats=null;
  let guideDirty=false;

  function clamp(v,min,max){return Math.max(min,Math.min(max,v));}
  function canvasEl(){return document.getElementById('studioCanvas');}
  function wrapEl(){return canvasEl()?.closest('.studio-canvas-wrap')||null;}
  function studioToolOwnsCanvas(){return !!((typeof studioBrushMode!=='undefined'&&studioBrushMode)||(typeof studioMoveMode!=='undefined'&&studioMoveMode));}
  function currentTarget(){return typeof studioTarget!=='undefined'&&studioTarget==='wish'?'wish':'item';}

  function normalizeSavedState(value){
    if(!value||value.type!=='shirt')return null;
    return {
      enabled:value.enabled!==false,
      preset:GUIDE_PRESETS[value.preset]?value.preset:'custom',
      x:clamp(Number(value.x)||360,70,650),
      y:clamp(Number(value.y)||360,80,640),
      w:clamp(Number(value.w)||330,150,620),
      h:clamp(Number(value.h)||430,190,650),
      protection:clamp(Number(value.protection)||70,0,100)
    };
  }

  function guideState(){
    return {
      version:1,
      type:'shirt',
      enabled:!!guideEnabled,
      preset:guidePreset,
      x:Math.round(guide.x),y:Math.round(guide.y),
      w:Math.round(guide.w),h:Math.round(guide.h),
      protection:Math.round(guideProtection)
    };
  }

  function stampWorkingState(){
    window.__audreyPhotoStudioPreviewPersistence?.stampWorkingStudioState?.(currentTarget());
  }

  function markGuideChanged({preset='custom'}={}){
    guidePreset=preset;
    guideDirty=true;
    syncUI();
  }

  function ensureStyles(){
    if(document.getElementById('studioGarmentGuideStyles'))return;
    const style=document.createElement('style');
    style.id='studioGarmentGuideStyles';
    style.textContent=`
      .studio-garment-guide-panel{display:grid;gap:10px;margin-top:9px;padding:10px;border:1px solid rgba(108,81,66,.15);border-radius:14px;background:rgba(255,250,240,.84);box-shadow:0 1px 0 rgba(255,255,255,.55) inset}
      .studio-garment-guide-head{display:flex;align-items:flex-start;justify-content:space-between;gap:9px}
      .studio-garment-guide-title{display:grid;gap:2px}.studio-garment-guide-title strong{font-size:12px;color:#5d5348}.studio-garment-guide-title span{font-size:9px;line-height:1.3;color:#8a7d70}
      .studio-garment-guide-head small{font-size:9px;color:#7d3547;background:rgba(125,53,71,.07);padding:4px 6px;border-radius:999px;white-space:nowrap}
      .studio-garment-guide-actions{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px}
      .studio-garment-guide-btn{min-height:38px;padding:6px;border:1px solid rgba(108,81,66,.18);border-radius:10px;background:#f8f1e3;color:#675d51;font:800 9.5px/1.15 system-ui,-apple-system,sans-serif;-webkit-tap-highlight-color:transparent}
      .studio-garment-guide-btn.active{background:#6d7863;border-color:#6d7863;color:#fff}.studio-garment-guide-btn:disabled{opacity:.42}
      .studio-garment-guide-presets{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px}
      .studio-garment-guide-preset{min-height:34px;padding:6px;border:1px solid rgba(108,81,66,.15);border-radius:999px;background:#fffaf0;color:#706357;font:800 9.5px/1 system-ui,-apple-system,sans-serif}
      .studio-garment-guide-preset.active{background:#e4e8dc;border-color:#7b866f;color:#4f5a49;box-shadow:inset 0 0 0 1px rgba(109,120,99,.10)}
      .studio-garment-guide-sliders{display:grid;gap:7px;padding:8px 9px;border-radius:11px;background:rgba(109,120,99,.07)}
      .studio-garment-guide-sliders label{display:grid;grid-template-columns:74px 1fr 34px;align-items:center;gap:7px;font-size:9.5px;font-weight:800;color:#675d51}
      .studio-garment-guide-sliders input[type="range"]{width:100%;accent-color:#7d3547}.studio-garment-guide-sliders output{text-align:right;font-variant-numeric:tabular-nums;color:#7d3547}
      .studio-garment-guide-apply{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:7px;align-items:center}
      .studio-garment-guide-apply button{min-height:42px;border:0;border-radius:12px;background:#7d3547;color:#fff;font:850 11px/1 system-ui,-apple-system,sans-serif;padding:9px 13px;box-shadow:0 2px 6px rgba(125,53,71,.16)}
      .studio-garment-guide-apply button:disabled{opacity:.45}.studio-garment-guide-apply span{font-size:9px;line-height:1.25;color:#817568;text-align:right;max-width:92px}
      .studio-garment-guide-note{margin:0;font-size:9.5px;line-height:1.4;color:#817568}
      .studio-shirt-guide{position:absolute;z-index:14;transform:translate(-50%,-50%);box-sizing:border-box;touch-action:none;pointer-events:none}
      .studio-shirt-guide.hidden{display:none!important}.studio-shirt-guide.editing{pointer-events:auto}
      .studio-shirt-guide-shape{position:absolute;inset:0;box-sizing:border-box;border:2px dashed rgba(125,53,71,.88);background:rgba(125,53,71,.075);filter:drop-shadow(0 2px 4px rgba(72,46,50,.08));clip-path:polygon(30% 5%,42% 0,58% 0,70% 5%,96% 22%,84% 41%,73% 32%,73% 100%,27% 100%,27% 32%,16% 41%,4% 22%);pointer-events:none}
      .studio-shirt-guide-label{position:absolute;left:50%;top:45%;transform:translate(-50%,-50%);font:800 10px/1 system-ui,-apple-system,sans-serif;letter-spacing:.08em;color:rgba(125,53,71,.72);white-space:nowrap;pointer-events:none}
      .studio-shirt-guide:not(.editing) .studio-shirt-guide-shape{border-color:rgba(125,53,71,.48);background:rgba(125,53,71,.035)}.studio-shirt-guide:not(.editing) .studio-shirt-guide-label{opacity:.55}
      .studio-shirt-guide.dirty .studio-shirt-guide-shape{border-color:rgba(125,53,71,.98);background:rgba(125,53,71,.095)}
      .studio-shirt-guide-handle{position:absolute;right:-17px;bottom:-17px;width:34px;height:34px;box-sizing:border-box;border:3px solid #fff;border-radius:50%;background:#7d3547;box-shadow:0 2px 8px rgba(72,46,50,.28);touch-action:none;cursor:nwse-resize}
      .studio-shirt-guide-handle::before{content:'↘';position:absolute;inset:0;display:grid;place-items:center;color:#fff;font:900 15px/1 system-ui}.studio-shirt-guide:not(.editing) .studio-shirt-guide-handle{display:none}
      .studio-canvas-wrap.guide-editing{touch-action:none}
      @media(max-width:410px){.studio-garment-guide-actions{grid-template-columns:1fr 1fr}.studio-garment-guide-sliders label{grid-template-columns:66px 1fr 30px}.studio-garment-guide-apply{grid-template-columns:1fr}.studio-garment-guide-apply span{text-align:left;max-width:none}}
    `;
    document.head.appendChild(style);
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

  function applyPreset(name){
    const preset=GUIDE_PRESETS[name];if(!preset)return;
    guideEnabled=true;guideEditing=true;guidePreset=name;
    guide={x:360,y:360,w:preset.w,h:preset.h};
    guideProtection=preset.protection;
    guideDirty=true;
    syncUI();
  }

  function centerGuide(){
    guide.x=360;guide.y=360;guideDirty=true;syncUI();
  }

  async function applyGuideQuickFromUI(){
    if(!guideEnabled)return;
    const btn=document.getElementById('studioShirtGuideApply');
    if(btn)btn.disabled=true;
    try{
      if(typeof applyStudioMode==='function')await applyStudioMode('quick',{showBusy:true});
      guideDirty=false;
      stampWorkingState();
      syncUI();
    }finally{if(btn)btn.disabled=false;}
  }

  function installUI(){
    ensureStyles();
    const methods=document.getElementById('studioCutoutMethods');
    if(methods&&!document.getElementById('studioGarmentGuidePanel')){
      const panel=document.createElement('section');
      panel.id='studioGarmentGuidePanel';
      panel.className='studio-garment-guide-panel';
      panel.innerHTML=`
        <div class="studio-garment-guide-head"><div class="studio-garment-guide-title"><strong>Shirt Guide</strong><span>Shape-assisted Quick cutout</span></div><small>Phase 1C</small></div>
        <div class="studio-garment-guide-actions">
          <button type="button" id="studioShirtGuideToggle" class="studio-garment-guide-btn">Guide off</button>
          <button type="button" id="studioShirtGuideEdit" class="studio-garment-guide-btn">Edit guide</button>
          <button type="button" id="studioShirtGuideCenter" class="studio-garment-guide-btn">Center</button>
          <button type="button" id="studioShirtGuideReset" class="studio-garment-guide-btn">Reset</button>
        </div>
        <div class="studio-garment-guide-presets" role="group" aria-label="Shirt guide presets">
          <button type="button" class="studio-garment-guide-preset" data-shirt-guide-preset="slim">Slim</button>
          <button type="button" class="studio-garment-guide-preset" data-shirt-guide-preset="regular">Regular</button>
          <button type="button" class="studio-garment-guide-preset" data-shirt-guide-preset="relaxed">Relaxed</button>
        </div>
        <div class="studio-garment-guide-sliders">
          <label><span>Width</span><input id="studioShirtGuideWidth" type="range" min="150" max="620" step="5" value="330"><output id="studioShirtGuideWidthValue">330</output></label>
          <label><span>Height</span><input id="studioShirtGuideHeight" type="range" min="190" max="650" step="5" value="430"><output id="studioShirtGuideHeightValue">430</output></label>
          <label><span>Protect</span><input id="studioShirtGuideProtection" type="range" min="0" max="100" step="5" value="70"><output id="studioShirtGuideProtectionValue">70</output></label>
        </div>
        <div class="studio-garment-guide-apply"><button type="button" id="studioShirtGuideApply">Apply Quick with Shirt Guide</button><span id="studioShirtGuideApplyHint">Adjust the guide, then apply.</span></div>
        <p class="studio-garment-guide-note">Choose the closest shirt preset, position or resize the guide, then tap Apply Quick. Protect controls how strongly Quick preserves likely garment pixels. Erase, Restore and Adjust still work afterward for cleanup.</p>`;
      methods.insertAdjacentElement('afterend',panel);

      document.getElementById('studioShirtGuideToggle')?.addEventListener('click',()=>{
        guideEnabled=!guideEnabled;guideEditing=guideEnabled;guideDirty=guideEnabled;
        syncUI();
      });
      document.getElementById('studioShirtGuideEdit')?.addEventListener('click',()=>setGuideEditing(!guideEditing));
      document.getElementById('studioShirtGuideCenter')?.addEventListener('click',centerGuide);
      document.getElementById('studioShirtGuideReset')?.addEventListener('click',()=>{
        guide={...GUIDE_DEFAULT};guideProtection=70;guidePreset='regular';guideDirty=true;syncUI();
      });
      document.getElementById('studioShirtGuideApply')?.addEventListener('click',applyGuideQuickFromUI);
      document.querySelectorAll('[data-shirt-guide-preset]').forEach(btn=>btn.addEventListener('click',()=>applyPreset(btn.dataset.shirtGuidePreset)));

      const width=document.getElementById('studioShirtGuideWidth');
      const height=document.getElementById('studioShirtGuideHeight');
      const protect=document.getElementById('studioShirtGuideProtection');
      width?.addEventListener('input',()=>{guide.w=clamp(Number(width.value)||330,150,620);markGuideChanged();syncGuideOverlay();syncSliderLabels();});
      height?.addEventListener('input',()=>{guide.h=clamp(Number(height.value)||430,190,650);markGuideChanged();syncGuideOverlay();syncSliderLabels();});
      protect?.addEventListener('input',()=>{guideProtection=clamp(Number(protect.value)||0,0,100);markGuideChanged();syncSliderLabels();});
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
          guide.x=clamp(drag.startGuide.x+dx,70,650);guide.y=clamp(drag.startGuide.y+dy,80,640);
        }else{
          guide.w=clamp(drag.startGuide.w+dx*2,150,620);guide.h=clamp(drag.startGuide.h+dy*2,190,650);
        }
        guidePreset='custom';guideDirty=true;syncGuideOverlay();syncSliderLabels();syncUI();
      });
      const finish=e=>{
        if(!drag||drag.pointerId!==e.pointerId)return;
        drag=null;e.preventDefault();e.stopPropagation();syncUI();
      };
      overlay.addEventListener('pointerup',finish);overlay.addEventListener('pointercancel',finish);
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
    if(toggle){toggle.classList.toggle('active',guideEnabled);toggle.textContent=guideEnabled?'Guide on':'Guide off';}
    const edit=document.getElementById('studioShirtGuideEdit');
    if(edit){edit.disabled=!guideEnabled;edit.classList.toggle('active',guideEditing);edit.textContent=guideEditing?'Editing guide':'Edit guide';}
    const center=document.getElementById('studioShirtGuideCenter');if(center)center.disabled=!guideEnabled;
    const reset=document.getElementById('studioShirtGuideReset');if(reset)reset.disabled=!guideEnabled;
    const apply=document.getElementById('studioShirtGuideApply');if(apply)apply.disabled=!guideEnabled;
    document.querySelectorAll('#studioGarmentGuidePanel input').forEach(input=>input.disabled=!guideEnabled);
    document.querySelectorAll('[data-shirt-guide-preset]').forEach(btn=>{btn.disabled=!guideEnabled&&false;btn.classList.toggle('active',guidePreset===btn.dataset.shirtGuidePreset);});
    const hint=document.getElementById('studioShirtGuideApplyHint');
    if(hint)hint.textContent=!guideEnabled?'Turn the guide on to use it.':guideDirty?'Guide changed · Apply Quick to update cutout.':'Guide applied · manual cleanup is still available.';
    wrapEl()?.classList.toggle('guide-editing',guideEnabled&&guideEditing);
    syncSliderLabels();syncGuideOverlay();
  }

  function syncGuideOverlay(){
    const overlay=document.getElementById('studioShirtGuide');
    const canvas=canvasEl();
    if(!overlay||!canvas)return;
    overlay.classList.toggle('hidden',!guideEnabled);
    overlay.classList.toggle('editing',guideEnabled&&guideEditing&&!studioToolOwnsCanvas());
    overlay.classList.toggle('dirty',guideEnabled&&guideDirty);
    if(!guideEnabled)return;
    const rect=canvas.getBoundingClientRect();
    const sx=rect.width/720,sy=rect.height/720;
    const zoom=typeof studioViewZoom==='number'?studioViewZoom:1;
    const screenX=(360+(guide.x-360)*zoom+(typeof studioViewX==='number'?studioViewX:0))*sx;
    const screenY=(360+(guide.y-360)*zoom+(typeof studioViewY==='number'?studioViewY:0))*sy;
    overlay.style.left=screenX+'px';overlay.style.top=screenY+'px';overlay.style.width=(guide.w*zoom*sx)+'px';overlay.style.height=(guide.h*zoom*sy)+'px';
  }

  function pointInShirt(wx,wy){
    const nx=(wx-(guide.x-guide.w/2))/guide.w;
    const ny=(wy-(guide.y-guide.h/2))/guide.h;
    if(nx<0||nx>1||ny<0||ny>1)return false;
    const pts=[[.30,.05],[.42,0],[.58,0],[.70,.05],[.96,.22],[.84,.41],[.73,.32],[.73,1],[.27,1],[.27,.32],[.16,.41],[.04,.22]];
    let inside=false;
    for(let i=0,j=pts.length-1;i<pts.length;j=i++){
      const xi=pts[i][0],yi=pts[i][1],xj=pts[j][0],yj=pts[j][1];
      const hit=((yi>ny)!==(yj>ny))&&(nx<(xj-xi)*(ny-yi)/((yj-yi)||1e-6)+xi);if(hit)inside=!inside;
    }
    return inside;
  }

  function sourcePixelToWorld(x,y){
    const scale=typeof studioObjectScale==='number'?studioObjectScale:1;
    const rot=(typeof studioObjectRotation==='number'?studioObjectRotation:0)*Math.PI/180;
    const dx=(x-360)*scale,dy=(y-360)*scale;const cr=Math.cos(rot),sr=Math.sin(rot);
    return {x:360+(typeof studioObjectX==='number'?studioObjectX:0)+dx*cr-dy*sr,y:360+(typeof studioObjectY==='number'?studioObjectY:0)+dx*sr+dy*cr};
  }

  function estimateBorderColor(data,w,h){
    const band=Math.max(2,Math.round(Math.min(w,h)*.035));const step=Math.max(1,Math.round(Math.min(w,h)/220));
    let r=0,g=0,b=0,count=0;
    for(let y=0;y<h;y+=step)for(let x=0;x<w;x+=step){if(x>=band&&x<w-band&&y>=band&&y<h-band)continue;const i=(y*w+x)*4;r+=data[i];g+=data[i+1];b+=data[i+2];count++;}
    return count?[r/count,g/count,b/count]:[255,255,255];
  }

  async function applyShirtGuideQuick(){
    if(!guideEnabled||typeof studioMode==='undefined'||studioMode!=='quick'||!studioBaseCanvas)return false;
    const src=currentTarget()==='wish'?(wishOriginalPhoto||studioSourcePhoto||wishWorkingPhoto):(itemOriginalPhoto||studioSourcePhoto||itemWorkingPhoto);
    if(!src)return false;
    const original=await sourceToStudioCanvas(src);if(!original)return false;
    const w=studioBaseCanvas.width,h=studioBaseCanvas.height;if(!w||!h)return false;
    const source=document.createElement('canvas');source.width=w;source.height=h;
    const sctx=source.getContext('2d',{willReadFrequently:true});sctx.drawImage(original,0,0,w,h);
    const cctx=studioBaseCanvas.getContext('2d',{willReadFrequently:true});
    const srcImage=sctx.getImageData(0,0,w,h),cutImage=cctx.getImageData(0,0,w,h);
    const s=srcImage.data,c=cutImage.data,bg=estimateBorderColor(s,w,h);
    let rescued=0,insideCount=0;const radius=2;const protection=guideProtection/100;
    const scoreThreshold=.53-protection*.17;const bgFloor=30-protection*12;const alphaAt=(x,y)=>c[(y*w+x)*4+3];
    for(let y=2;y<h-2;y++)for(let x=2;x<w-2;x++){
      const world=sourcePixelToWorld(x,y);if(!pointInShirt(world.x,world.y))continue;insideCount++;
      const i=(y*w+x)*4;if(c[i+3]>=230)continue;
      const dr=s[i]-bg[0],dg=s[i+1]-bg[1],db=s[i+2]-bg[2];const bgDistance=Math.sqrt(dr*dr+dg*dg+db*db);
      let strong=0,near=0;
      for(let dy=-radius;dy<=radius;dy++)for(let dx=-radius;dx<=radius;dx++){if(!dx&&!dy)continue;const a=alphaAt(x+dx,y+dy);if(a>35)near++;if(a>150)strong++;}
      const nx=Math.abs((world.x-guide.x)/(guide.w/2)),ny=Math.abs((world.y-guide.y)/(guide.h/2));
      const central=Math.max(0,1-Math.max(nx,ny));const continuity=Math.min(1,strong/5);const colorSignal=Math.min(1,bgDistance/66);
      const score=central*(.28+.10*protection)+continuity*.40+colorSignal*(.32-.10*protection);
      if(bgDistance<bgFloor&&strong<(protection>.75?2:3))continue;if(score<scoreThreshold&&near<(protection>.75?2:3))continue;
      const alpha=Math.round(Math.max(90,Math.min(250,95+protection*36+continuity*76+colorSignal*34+central*20)));
      c[i]=s[i];c[i+1]=s[i+1];c[i+2]=s[i+2];c[i+3]=Math.max(c[i+3],alpha);rescued++;
    }
    if(!rescued){lastQuickGuideStats={rescued:0,insideCount,protection:guideProtection};return false;}
    cctx.putImageData(cutImage,0,0);rebuildStudioWorkCanvas();lastQuickGuideStats={rescued,insideCount,protection:guideProtection};return true;
  }

  const previousOpenPhotoStudio=openPhotoStudio;
  openPhotoStudio=async function(target='item'){
    const nextTarget=target==='wish'?'wish':'item';
    const savedState=normalizeSavedState((nextTarget==='wish'?wishStudioState:itemStudioState)?.garmentGuide);
    guideEnabled=false;guideEditing=false;guide={...GUIDE_DEFAULT};guideProtection=70;guidePreset='regular';guideDirty=false;lastQuickGuideStats=null;
    const result=await previousOpenPhotoStudio.apply(this,arguments);
    if(savedState){
      guideEnabled=savedState.enabled;guideEditing=false;guidePreset=savedState.preset;
      guide={x:savedState.x,y:savedState.y,w:savedState.w,h:savedState.h};guideProtection=savedState.protection;guideDirty=false;
    }
    installUI();syncUI();return result;
  };

  const previousApplyStudioMode=applyStudioMode;
  applyStudioMode=async function(mode,options){
    const result=await previousApplyStudioMode.apply(this,arguments);
    if(mode==='quick'&&guideEnabled){
      try{
        const changed=await applyShirtGuideQuick();guideDirty=false;
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
    updateStudioToolUI=function(){const result=previousUpdateStudioToolUI.apply(this,arguments);if(studioToolOwnsCanvas())guideEditing=false;syncUI();return result;};
  }

  document.addEventListener('click',e=>{
    if(!guideEnabled)return;const tool=e.target.closest?.('.brush-btn,#studioMoveToggle');if(tool){guideEditing=false;syncUI();}
  },true);

  window.__audreyGarmentGuidePreview={
    phase:'1C',type:'shirt',
    get enabled(){return guideEnabled;},get editing(){return guideEditing;},get protection(){return guideProtection;},get preset(){return guidePreset;},
    get guide(){return {...guide};},get stats(){return lastQuickGuideStats?{...lastQuickGuideStats}:null;},
    getState:guideState,
    applyQuick:applyGuideQuickFromUI
  };
})();
