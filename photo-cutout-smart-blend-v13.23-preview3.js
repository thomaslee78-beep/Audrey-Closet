/* Audrey Closet v13.23 background-removal preview — Phase 5 Smart Blend.
 * Smart Blend leaves the four existing methods untouched. It begins from the
 * Standard production cutout, applies a Center Focus-style rescue, then refines
 * that result using boundary continuity, local edge strength, foreground color
 * continuity, and separation from the estimated background. Center likelihood
 * is intentionally weighted more heavily than in the first Smart Blend pass.
 *
 * Phase 1 tuning adds three session-level controls:
 * - Keep Subject: increases center protection and lowers rescue thresholds.
 * - Clean Edges: makes boundary cleanup more selective/aggressive.
 * - Recover Detail: increases continuity-based recovery of thin/missing pixels.
 */
(function(){
  'use strict';

  let smartBlendSelected=false;
  let savedApi=null;
  const BLEND_DEFAULTS={keep:90,clean:25,recover:20};
  const blendControls={...BLEND_DEFAULTS};
  let blendRefreshTimer=0;

  function sourceForBlend(){
    if(typeof studioTarget!=='undefined'&&studioTarget==='wish'){
      return wishOriginalPhoto||studioSourcePhoto||wishWorkingPhoto||'';
    }
    return itemOriginalPhoto||studioSourcePhoto||itemWorkingPhoto||'';
  }

  function luma(data,i){return data[i]*.2126+data[i+1]*.7152+data[i+2]*.0722;}
  function control01(name){return Math.max(0,Math.min(1,(Number(blendControls[name])||0)/100));}

  function estimateBorderColor(data,w,h){
    const band=Math.max(2,Math.round(Math.min(w,h)*.035));
    const step=Math.max(1,Math.round(Math.min(w,h)/220));
    let r=0,g=0,b=0,count=0;
    for(let y=0;y<h;y+=step){
      for(let x=0;x<w;x+=step){
        if(x>=band&&x<w-band&&y>=band&&y<h-band)continue;
        const i=(y*w+x)*4;r+=data[i];g+=data[i+1];b+=data[i+2];count++;
      }
    }
    return count?[r/count,g/count,b/count]:[255,255,255];
  }

  function updateBlendUI(){
    const root=document.getElementById('studioCutoutMethods');
    if(!root)return;
    const blend=root.querySelector('[data-cutout-method="blend"]');
    if(blend){
      blend.disabled=false;
      blend.classList.toggle('active',smartBlendSelected);
      blend.setAttribute('aria-pressed',smartBlendSelected?'true':'false');
    }
    const controls=document.getElementById('studioSmartBlendPhase1');
    if(controls)controls.classList.toggle('hidden',!smartBlendSelected);
    if(smartBlendSelected){
      root.querySelectorAll('[data-cutout-method]').forEach(btn=>{
        if(btn!==blend){btn.classList.remove('active');btn.setAttribute('aria-pressed','false');}
      });
      const help=root.querySelector('.studio-cutout-method-help');
      if(help)help.textContent='Smart Blend starts with Center Focus protection. Use Keep Subject, Clean Edges, and Recover Detail to tune the result.';
    }
    [['keep','Keep'],['clean','Clean'],['recover','Recover']].forEach(([key,id])=>{
      const input=document.getElementById('studioBlend'+id);
      const output=document.getElementById('studioBlend'+id+'Value');
      if(input&&Number(input.value)!==blendControls[key])input.value=String(blendControls[key]);
      if(output)output.textContent=String(blendControls[key]);
    });
  }

  function scheduleBlendRefresh(){
    clearTimeout(blendRefreshTimer);
    if(!smartBlendSelected||typeof studioMode==='undefined'||studioMode==='original')return;
    blendRefreshTimer=setTimeout(()=>{
      if(smartBlendSelected&&typeof applyStudioMode==='function')applyStudioMode(studioMode,{showBusy:false});
    },110);
  }

  function installBlendControls(){
    const root=document.getElementById('studioCutoutMethods');
    if(!root||document.getElementById('studioSmartBlendPhase1'))return;
    const panel=document.createElement('div');
    panel.id='studioSmartBlendPhase1';
    panel.className='studio-smart-blend-phase1 hidden';
    panel.innerHTML=
      '<div class="studio-smart-blend-phase1-head"><strong>Smart Blend controls</strong><small>Phase 1</small></div>'+
      '<label><span>Keep Subject <output id="studioBlendKeepValue">90</output></span><input id="studioBlendKeep" type="range" min="0" max="100" value="90"></label>'+
      '<label><span>Clean Edges <output id="studioBlendCleanValue">25</output></span><input id="studioBlendClean" type="range" min="0" max="100" value="25"></label>'+
      '<label><span>Recover Detail <output id="studioBlendRecoverValue">20</output></span><input id="studioBlendRecover" type="range" min="0" max="100" value="20"></label>'+
      '<button type="button" class="text-btn studio-smart-blend-reset" id="studioBlendReset">Reset blend</button>';
    root.appendChild(panel);

    [['keep','Keep'],['clean','Clean'],['recover','Recover']].forEach(([key,id])=>{
      const input=document.getElementById('studioBlend'+id);
      input?.addEventListener('input',()=>{
        blendControls[key]=Math.max(0,Math.min(100,Number(input.value)||0));
        updateBlendUI();
        scheduleBlendRefresh();
      });
    });
    document.getElementById('studioBlendReset')?.addEventListener('click',()=>{
      Object.assign(blendControls,BLEND_DEFAULTS);
      updateBlendUI();
      scheduleBlendRefresh();
    });

    if(!document.getElementById('studioSmartBlendPhase1Styles')){
      const style=document.createElement('style');
      style.id='studioSmartBlendPhase1Styles';
      style.textContent=
        '.studio-smart-blend-phase1{display:grid;gap:9px;margin-top:9px;padding:10px;border:1px solid rgba(108,81,66,.14);border-radius:13px;background:rgba(255,250,240,.74)}'+
        '.studio-smart-blend-phase1.hidden{display:none!important}'+
        '.studio-smart-blend-phase1-head{display:flex;align-items:baseline;justify-content:space-between;gap:10px}'+
        '.studio-smart-blend-phase1-head strong{font-size:12px;color:var(--ink)}'+
        '.studio-smart-blend-phase1-head small{font-size:9px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:#8a7c6e}'+
        '.studio-smart-blend-phase1 label{display:grid;gap:4px}'+
        '.studio-smart-blend-phase1 label>span{display:flex;justify-content:space-between;gap:8px;font-size:10px;font-weight:800;color:#675d52}'+
        '.studio-smart-blend-phase1 output{font-variant-numeric:tabular-nums;color:#7d3547}'+
        '.studio-smart-blend-phase1 input[type="range"]{width:100%;accent-color:var(--olive)}'+
        '.studio-smart-blend-reset{justify-self:end;padding:3px 0;font-size:10px}';
      document.head.appendChild(style);
    }
  }

  function installBlendButton(){
    const root=document.getElementById('studioCutoutMethods');
    const blend=root?.querySelector('[data-cutout-method="blend"]');
    if(!blend||blend.dataset.smartBlendBound==='1')return;
    blend.dataset.smartBlendBound='1';
    blend.disabled=false;
    blend.addEventListener('click',async event=>{
      event.preventDefault();
      event.stopImmediatePropagation();
      const standard=root.querySelector('[data-cutout-method="standard"]');
      if(standard&&!standard.classList.contains('active'))standard.click();
      smartBlendSelected=true;
      installBlendControls();
      updateBlendUI();
      if(typeof studioMode!=='undefined'&&studioMode!=='original'&&typeof applyStudioMode==='function'){
        await applyStudioMode(studioMode);
      }
    },true);
  }

  function applyCenterBiasRescue(s,c,bg,w,h,mode){
    const cx=(w-1)/2,cy=(h-1)/2;
    const rx=Math.max(1,w*.47),ry=Math.max(1,h*.53);
    const keep=control01('keep');
    const recover=control01('recover');
    const threshold=(mode==='clean'?.47:.50)-keep*.08-recover*.025;
    let rescued=0;

    for(let y=2;y<h-2;y++){
      const ny=(y-cy)/ry;
      for(let x=2;x<w-2;x++){
        const i=(y*w+x)*4;
        if(c[i+3]>=245)continue;
        const nx=(x-cx)/rx;
        const radial=nx*nx+ny*ny;
        if(radial>=1)continue;
        const centerSignal=1-radial;
        if(centerSignal<.10)continue;

        const dr=s[i]-bg[0],dg=s[i+1]-bg[1],db=s[i+2]-bg[2];
        const bgDistance=Math.sqrt(dr*dr+dg*dg+db*db);
        const backgroundSignal=Math.min(1,bgDistance/76);
        const left=(y*w+(x-2))*4,right=(y*w+(x+2))*4,up=((y-2)*w+x)*4,down=((y+2)*w+x)*4;
        const edgeSignal=Math.min(1,Math.max(Math.abs(luma(s,left)-luma(s,right)),Math.abs(luma(s,up)-luma(s,down)))/34);

        const centerWeight=.58+keep*.24;
        const remaining=1-centerWeight;
        const score=centerSignal*centerWeight+backgroundSignal*(remaining*.60)+edgeSignal*(remaining*.40);
        if(score<threshold)continue;

        const confidence=Math.min(1,(score-threshold)/(1-threshold));
        const alphaBoost=18*keep+22*recover;
        const alpha=Math.round(Math.max(95,Math.min(245,100+centerSignal*(68+28*keep)+confidence*(62+22*recover)+alphaBoost)));
        c[i]=s[i];c[i+1]=s[i+1];c[i+2]=s[i+2];c[i+3]=Math.max(c[i+3],alpha);
        rescued++;
      }
    }
    return rescued;
  }

  async function applySmartBlend(mode){
    const src=sourceForBlend();
    if(!src||!studioBaseCanvas)return false;
    const original=await sourceToStudioCanvas(src);
    if(!original)return false;
    const w=studioBaseCanvas.width,h=studioBaseCanvas.height;
    if(!w||!h)return false;

    const source=document.createElement('canvas');source.width=w;source.height=h;
    const sourceCtx=source.getContext('2d',{willReadFrequently:true});
    sourceCtx.drawImage(original,0,0,w,h);
    const cutCtx=studioBaseCanvas.getContext('2d',{willReadFrequently:true});
    const srcImage=sourceCtx.getImageData(0,0,w,h),cutImage=cutCtx.getImageData(0,0,w,h);
    const s=srcImage.data,c=cutImage.data,bg=estimateBorderColor(s,w,h);
    const cx=(w-1)/2,cy=(h-1)/2,rx=w*.50,ry=h*.56;
    const clean=control01('clean'),recover=control01('recover'),keep=control01('keep');
    const radius=clean>.62?4:(mode==='clean'?3:2);
    const additions=[];

    const centerRescued=applyCenterBiasRescue(s,c,bg,w,h,mode);

    for(let y=radius+2;y<h-radius-2;y++){
      for(let x=radius+2;x<w-radius-2;x++){
        const i=(y*w+x)*4;
        if(c[i+3]>=245)continue;

        let strong=0,near=0,best=-1,bestAlpha=0;
        for(let dy=-radius;dy<=radius;dy++){
          for(let dx=-radius;dx<=radius;dx++){
            if(!dx&&!dy)continue;
            const ni=((y+dy)*w+(x+dx))*4,a=c[ni+3];
            if(a>35)near++;
            if(a>170){strong++;if(a>bestAlpha){bestAlpha=a;best=ni;}}
          }
        }

        const nx=(x-cx)/Math.max(1,rx),ny=(y-cy)/Math.max(1,ry);
        const radial=nx*nx+ny*ny;
        const centerSignal=radial<1?1-radial:0;
        const dr=s[i]-bg[0],dg=s[i+1]-bg[1],db=s[i+2]-bg[2];
        const bgDistance=Math.sqrt(dr*dr+dg*dg+db*db);
        const backgroundSignal=Math.min(1,bgDistance/76);
        const left=(y*w+(x-2))*4,right=(y*w+(x+2))*4,up=((y-2)*w+x)*4,down=((y+2)*w+x)*4;
        const edgeSignal=Math.min(1,Math.max(Math.abs(luma(s,left)-luma(s,right)),Math.abs(luma(s,up)-luma(s,down)))/30);
        const boundarySignal=Math.min(1,strong/Math.max(3,(radius*2+1)*2));

        let continuitySignal=0;
        if(best>=0){
          const rr=s[i]-s[best],gg=s[i+1]-s[best+1],bb=s[i+2]-s[best+2];
          const tolerance=(mode==='clean'?58:50)+(recover*20)-(clean*9);
          continuitySignal=1-Math.min(1,Math.sqrt(rr*rr+gg*gg+bb*bb)/Math.max(28,tolerance));
        }

        const votes=[
          centerSignal>(.40-keep*.08),
          edgeSignal>(.30+clean*.10),
          boundarySignal>(.25+clean*.12),
          continuitySignal>(.52-recover*.16),
          backgroundSignal>(.38+clean*.10)
        ].filter(Boolean).length;

        const centerPass=.72-keep*.12;
        if(votes<3&&centerSignal<centerPass)continue;
        if(votes<2)continue;
        if(!near||(!strong&&centerSignal<centerPass-.02))continue;

        const centerWeight=.27+keep*.13;
        const edgeWeight=.13+clean*.08;
        const boundaryWeight=.14+clean*.08;
        const continuityWeight=.16+recover*.10;
        const backgroundWeight=Math.max(.07,1-centerWeight-edgeWeight-boundaryWeight-continuityWeight);
        const score=centerSignal*centerWeight+edgeSignal*edgeWeight+boundarySignal*boundaryWeight+continuitySignal*continuityWeight+backgroundSignal*backgroundWeight;
        const threshold=(mode==='clean'?.45:.48)+clean*.035-recover*.025-keep*.018;
        if(score<threshold)continue;

        const confidence=Math.min(1,(score-threshold)/(1-threshold));
        const alpha=Math.round(Math.max(86,Math.min(245,94+confidence*(106+recover*18)+centerSignal*(18+keep*12)+Math.min(32,strong*(2.5+clean)))));
        additions.push([i,alpha]);
      }
    }

    for(const [i,alpha] of additions){
      c[i]=s[i];c[i+1]=s[i+1];c[i+2]=s[i+2];c[i+3]=Math.max(c[i+3],alpha);
    }

    if(!centerRescued&&!additions.length)return false;
    cutCtx.putImageData(cutImage,0,0);
    rebuildStudioWorkCanvas();
    window.__audreySmartBlendPhase1={keep:blendControls.keep,clean:blendControls.clean,recover:blendControls.recover,centerRescued,detailRescued:additions.length};
    return true;
  }

  const previousApi=window.__audreyCutoutMethodPreview;
  if(previousApi){
    savedApi=previousApi;
    window.__audreyCutoutMethodPreview={
      ...previousApi,
      phase:5,
      getMethod:()=>smartBlendSelected?'blend':previousApi.getMethod(),
      methods:(previousApi.methods||[]).map(x=>x.id==='blend'?{...x,enabled:true,help:'Starts with Center Focus protection, then blends several subject clues. Phase 1 adds Keep Subject, Clean Edges, and Recover Detail controls.'}:x)
    };
  }

  const openBeforeBlend=openPhotoStudio;
  openPhotoStudio=async function(target='item'){
    const nextTarget=target==='wish'?'wish':'item';
    const saved=nextTarget==='wish'?wishStudioState:itemStudioState;
    smartBlendSelected=!!(saved&&saved.cutoutMethod==='blend');
    const result=await openBeforeBlend.apply(this,arguments);
    installBlendButton();
    installBlendControls();
    updateBlendUI();
    return result;
  };

  const applyBeforeBlend=applyStudioMode;
  applyStudioMode=async function(mode,options){
    const result=await applyBeforeBlend.apply(this,arguments);
    if(mode!=='original'&&smartBlendSelected){
      try{
        const improved=await applySmartBlend(mode);
        if(improved&&document.getElementById('studioStatus')){
          document.getElementById('studioStatus').textContent='Smart Blend applied. Tune Keep Subject, Clean Edges, or Recover Detail to refine this cutout.';
        }
      }catch(error){
        console.error('Smart Blend preview failed',error);
        if(document.getElementById('studioStatus'))document.getElementById('studioStatus').textContent='Smart Blend could not improve this photo. Standard cutout is still intact.';
      }
      updateBlendUI();
    }
    return result;
  };

  document.addEventListener('click',event=>{
    const btn=event.target.closest?.('[data-cutout-method]');
    if(btn&&btn.dataset.cutoutMethod!=='blend'&&smartBlendSelected){
      smartBlendSelected=false;
      updateBlendUI();
    }
  },true);
})();
