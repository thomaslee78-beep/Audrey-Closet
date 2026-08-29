/* Audrey Closet v13.23 background-removal preview — Phase 2 Cutout Method lab.
 * Standard preserves the current production cutout path exactly.
 * Center Focus runs the normal production cutout first, then conservatively
 * rescues likely subject pixels near the image center before manual masks apply.
 * Remaining experimental methods stay disabled.
 */
(function(){
  'use strict';

  const METHODS=[
    {id:'standard',label:'Standard',help:'Uses the current background removal method.',enabled:true},
    {id:'center',label:'Center Focus',help:'Protects likely subject pixels near the center after the normal cutout pass.',enabled:true},
    {id:'edge',label:'Edge Guide',help:'Looks for subtle outlines and shadows.',enabled:false},
    {id:'grow',label:'Subject Grow',help:'Builds outward from the main object.',enabled:false},
    {id:'blend',label:'Smart Blend',help:'Combines several subject clues.',enabled:false}
  ];

  let studioCutoutMethod='standard';

  function normalizeMethod(value){
    return METHODS.some(x=>x.id===value)?value:'standard';
  }

  function methodDef(value=studioCutoutMethod){
    return METHODS.find(x=>x.id===normalizeMethod(value))||METHODS[0];
  }

  function ensureMethodStyles(){
    if(document.getElementById('studioCutoutMethodStyles'))return;
    const style=document.createElement('style');
    style.id='studioCutoutMethodStyles';
    style.textContent=`
      .studio-cutout-methods{display:grid;gap:7px;margin-top:9px;padding-top:9px;border-top:1px solid rgba(108,81,66,.12)}
      .studio-cutout-method-heading{display:flex;align-items:center;justify-content:space-between;gap:10px}
      .studio-cutout-method-heading strong{font-size:11px;letter-spacing:.02em;color:#665c50}
      .studio-cutout-method-heading small{font-size:9px;color:#8a7d70}
      .studio-cutout-method-row{display:flex;gap:6px;overflow-x:auto;padding-bottom:2px;-webkit-overflow-scrolling:touch;scrollbar-width:none}
      .studio-cutout-method-row::-webkit-scrollbar{display:none}
      .studio-cutout-method-btn{flex:0 0 auto;min-height:34px;padding:7px 10px;border:1px solid rgba(108,81,66,.18);border-radius:10px;background:#f8f1e3;color:#675d51;font:800 10px/1.05 system-ui,-apple-system,sans-serif}
      .studio-cutout-method-btn.active{background:#6d7863;border-color:#6d7863;color:#fff}
      .studio-cutout-method-btn:disabled{opacity:.42;filter:saturate(.55)}
      .studio-cutout-methods.is-original .studio-cutout-method-row{opacity:.5;pointer-events:none}
      .studio-cutout-method-help{margin:0;font-size:9.5px;line-height:1.3;color:#817568}
    `;
    document.head.appendChild(style);
  }

  function methodHost(){
    const modes=[...document.querySelectorAll('.studio-mode')];
    if(!modes.length)return null;
    return modes[0].parentElement;
  }

  function syncMethodUI(){
    const root=document.getElementById('studioCutoutMethods');
    if(!root)return;
    root.classList.toggle('is-original',typeof studioMode!=='undefined'&&studioMode==='original');
    root.querySelectorAll('[data-cutout-method]').forEach(btn=>{
      const active=btn.dataset.cutoutMethod===studioCutoutMethod;
      btn.classList.toggle('active',active);
      btn.setAttribute('aria-pressed',active?'true':'false');
    });
    const help=root.querySelector('.studio-cutout-method-help');
    if(help)help.textContent=methodDef().help+(methodDef().enabled?'':' Coming in a later preview phase.');
  }

  function installMethodUI(){
    if(document.getElementById('studioCutoutMethods')){syncMethodUI();return;}
    const host=methodHost();
    if(!host)return;
    ensureMethodStyles();
    const root=document.createElement('section');
    root.id='studioCutoutMethods';
    root.className='studio-cutout-methods';
    root.setAttribute('aria-label','Cutout method');
    root.innerHTML=`
      <div class="studio-cutout-method-heading"><strong>Cutout method</strong><small>Preview lab</small></div>
      <div class="studio-cutout-method-row" role="group" aria-label="Choose cutout method"></div>
      <p class="studio-cutout-method-help"></p>`;
    const row=root.querySelector('.studio-cutout-method-row');
    METHODS.forEach(def=>{
      const btn=document.createElement('button');
      btn.type='button';
      btn.className='studio-cutout-method-btn';
      btn.dataset.cutoutMethod=def.id;
      btn.textContent=def.label;
      btn.disabled=!def.enabled;
      btn.setAttribute('aria-pressed','false');
      btn.addEventListener('click',async()=>{
        if(!def.enabled)return;
        studioCutoutMethod=def.id;
        syncMethodUI();
        if(typeof studioMode!=='undefined'&&studioMode!=='original'&&typeof applyStudioMode==='function'){
          await applyStudioMode(studioMode);
        }
      });
      row.appendChild(btn);
    });
    host.insertAdjacentElement('afterend',root);
    syncMethodUI();
  }

  function studioOriginalSourceV1323Center(){
    if(typeof studioTarget!=='undefined'&&studioTarget==='wish'){
      return wishOriginalPhoto||studioSourcePhoto||wishWorkingPhoto||'';
    }
    return itemOriginalPhoto||studioSourcePhoto||itemWorkingPhoto||'';
  }

  function estimateBorderColorV1323Center(data,w,h){
    const band=Math.max(2,Math.round(Math.min(w,h)*.035));
    let r=0,g=0,b=0,count=0;
    const step=Math.max(1,Math.round(Math.min(w,h)/220));
    function take(x,y){
      const i=(y*w+x)*4;
      r+=data[i];g+=data[i+1];b+=data[i+2];count++;
    }
    for(let y=0;y<h;y+=step){
      for(let x=0;x<w;x+=step){
        if(x<band||x>=w-band||y<band||y>=h-band)take(x,y);
      }
    }
    return count?[r/count,g/count,b/count]:[255,255,255];
  }

  function lumaV1323Center(data,i){
    return data[i]*.2126+data[i+1]*.7152+data[i+2]*.0722;
  }

  async function applyCenterFocusRescueV1323(mode){
    const src=studioOriginalSourceV1323Center();
    if(!src||!studioBaseCanvas)return false;

    const originalCanvas=await sourceToStudioCanvas(src);
    if(!originalCanvas)return false;

    const w=studioBaseCanvas.width,h=studioBaseCanvas.height;
    if(!w||!h)return false;

    const source=document.createElement('canvas');
    source.width=w;source.height=h;
    const sourceCtx=source.getContext('2d',{willReadFrequently:true});
    sourceCtx.drawImage(originalCanvas,0,0,w,h);

    const cutCtx=studioBaseCanvas.getContext('2d',{willReadFrequently:true});
    const srcImage=sourceCtx.getImageData(0,0,w,h);
    const cutImage=cutCtx.getImageData(0,0,w,h);
    const s=srcImage.data,c=cutImage.data;
    const bg=estimateBorderColorV1323Center(s,w,h);
    const cx=(w-1)/2,cy=(h-1)/2;
    const rx=Math.max(1,w*.46),ry=Math.max(1,h*.52);
    const threshold=mode==='clean'?.50:.54;
    let rescued=0;

    for(let y=2;y<h-2;y++){
      const ny=(y-cy)/ry;
      for(let x=2;x<w-2;x++){
        const i=(y*w+x)*4;
        if(c[i+3]>=245)continue;

        const nx=(x-cx)/rx;
        const radial=nx*nx+ny*ny;
        if(radial>=1)continue;
        const centerWeight=1-radial;
        if(centerWeight<.10)continue;

        const dr=s[i]-bg[0],dg=s[i+1]-bg[1],db=s[i+2]-bg[2];
        const colorDistance=Math.sqrt(dr*dr+dg*dg+db*db);
        const left=(y*w+(x-2))*4,right=(y*w+(x+2))*4;
        const up=((y-2)*w+x)*4,down=((y+2)*w+x)*4;
        const gradient=Math.max(
          Math.abs(lumaV1323Center(s,left)-lumaV1323Center(s,right)),
          Math.abs(lumaV1323Center(s,up)-lumaV1323Center(s,down))
        );

        const colorSignal=Math.min(1,colorDistance/72);
        const edgeSignal=Math.min(1,gradient/34);
        const score=centerWeight*.60+colorSignal*.24+edgeSignal*.16;
        if(score<threshold)continue;

        // Preserve source RGB and add only enough alpha to rescue plausible
        // centered subject detail. The center weighting keeps this deliberately
        // conservative so broad background areas are not simply restored.
        const confidence=Math.min(1,(score-threshold)/(1-threshold));
        const rescueAlpha=Math.round(95+160*Math.max(centerWeight*.55,confidence));
        c[i]=s[i];c[i+1]=s[i+1];c[i+2]=s[i+2];
        c[i+3]=Math.max(c[i+3],Math.min(255,rescueAlpha));
        rescued++;
      }
    }

    if(!rescued)return false;
    cutCtx.putImageData(cutImage,0,0);
    rebuildStudioWorkCanvas();
    return true;
  }

  const originalOpenPhotoStudioV1323Methods=openPhotoStudio;
  openPhotoStudio=async function(target='item'){
    const nextTarget=target==='wish'?'wish':'item';
    const saved=nextTarget==='wish'?wishStudioState:itemStudioState;
    studioCutoutMethod=normalizeMethod(saved&&saved.cutoutMethod);
    const result=await originalOpenPhotoStudioV1323Methods.apply(this,arguments);
    installMethodUI();
    syncMethodUI();
    return result;
  };

  const originalApplyStudioModeV1323Methods=applyStudioMode;
  applyStudioMode=async function(mode,options){
    // Always run the exact production path first. Standard returns immediately,
    // so choosing Standard is behaviorally identical to the current app.
    const result=await originalApplyStudioModeV1323Methods.apply(this,arguments);
    if(mode!=='original'&&studioCutoutMethod==='center'){
      try{
        const rescued=await applyCenterFocusRescueV1323(mode);
        if(rescued&&document.getElementById('studioStatus')){
          document.getElementById('studioStatus').textContent='Center Focus applied. Compare with Standard to choose the cleaner result.';
        }
      }catch(error){
        console.error('Center Focus preview failed',error);
        if(document.getElementById('studioStatus')){
          document.getElementById('studioStatus').textContent='Center Focus could not improve this photo. Standard cutout is still intact.';
        }
      }
    }
    syncMethodUI();
    return result;
  };

  const originalApplyPhotoStudioV1323Methods=applyPhotoStudio;
  applyPhotoStudio=async function(){
    const target=typeof studioTarget!=='undefined'&&studioTarget==='wish'?'wish':'item';
    const result=await originalApplyPhotoStudioV1323Methods.apply(this,arguments);
    const stateRef=target==='wish'?wishStudioState:itemStudioState;
    if(stateRef&&typeof stateRef==='object')stateRef.cutoutMethod=normalizeMethod(studioCutoutMethod);
    return result;
  };

  window.__audreyCutoutMethodPreview={
    phase:2,
    getMethod:()=>studioCutoutMethod,
    methods:METHODS.map(x=>({...x}))
  };
})();
