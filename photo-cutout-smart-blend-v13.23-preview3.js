/* Audrey Closet v13.23 background-removal preview — Phase 5 Smart Blend.
 * Smart Blend leaves the four existing methods untouched. It begins from the
 * Standard production cutout, applies a Center Focus-style rescue, then refines
 * that result using boundary continuity, local edge strength, foreground color
 * continuity, and separation from the estimated background. Center likelihood
 * is intentionally weighted more heavily than in the first Smart Blend pass.
 */
(function(){
  'use strict';

  let smartBlendSelected=false;
  let savedApi=null;

  function sourceForBlend(){
    if(typeof studioTarget!=='undefined'&&studioTarget==='wish'){
      return wishOriginalPhoto||studioSourcePhoto||wishWorkingPhoto||'';
    }
    return itemOriginalPhoto||studioSourcePhoto||itemWorkingPhoto||'';
  }

  function luma(data,i){return data[i]*.2126+data[i+1]*.7152+data[i+2]*.0722;}

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
    if(smartBlendSelected){
      root.querySelectorAll('[data-cutout-method]').forEach(btn=>{
        if(btn!==blend){btn.classList.remove('active');btn.setAttribute('aria-pressed','false');}
      });
      const help=root.querySelector('.studio-cutout-method-help');
      if(help)help.textContent='Starts with a Center Focus rescue, then blends boundary, edge, color, and region-continuity clues with extra weight on the centered subject.';
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
      updateBlendUI();
      if(typeof studioMode!=='undefined'&&studioMode!=='original'&&typeof applyStudioMode==='function'){
        await applyStudioMode(studioMode);
      }
    },true);
  }

  function applyCenterBiasRescue(s,c,bg,w,h,mode){
    const cx=(w-1)/2,cy=(h-1)/2;
    const rx=Math.max(1,w*.47),ry=Math.max(1,h*.53);
    const threshold=mode==='clean'?.47:.50;
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

        // Option C: use Center Focus as the first rescue layer, with stronger
        // center weighting than the standalone preview method.
        const score=centerSignal*.72+backgroundSignal*.17+edgeSignal*.11;
        if(score<threshold)continue;

        const confidence=Math.min(1,(score-threshold)/(1-threshold));
        const alpha=Math.round(Math.max(95,Math.min(235,105+centerSignal*75+confidence*70)));
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
    const radius=mode==='clean'?3:2;
    const additions=[];

    // Option C pipeline: Standard -> Center Focus-style rescue -> Smart Blend.
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
          continuitySignal=1-Math.min(1,Math.sqrt(rr*rr+gg*gg+bb*bb)/(mode==='clean'?58:50));
        }

        const votes=[
          centerSignal>.36,
          edgeSignal>.34,
          boundarySignal>.30,
          continuitySignal>.48,
          backgroundSignal>.42
        ].filter(Boolean).length;

        // Center-near pixels are allowed through with two agreeing clues; pixels
        // farther from center still require the original three-vote consensus.
        if(votes<3&&centerSignal<.66)continue;
        if(votes<2)continue;
        if(!near||(!strong&&centerSignal<.64))continue;

        const score=centerSignal*.34+edgeSignal*.16+boundarySignal*.18+continuitySignal*.20+backgroundSignal*.12;
        const threshold=mode==='clean'?.45:.48;
        if(score<threshold)continue;

        const confidence=Math.min(1,(score-threshold)/(1-threshold));
        const alpha=Math.round(Math.max(90,Math.min(242,100+confidence*112+centerSignal*22+Math.min(28,strong*3))));
        additions.push([i,alpha]);
      }
    }

    for(const [i,alpha] of additions){
      c[i]=s[i];c[i+1]=s[i+1];c[i+2]=s[i+2];c[i+3]=Math.max(c[i+3],alpha);
    }

    if(!centerRescued&&!additions.length)return false;
    cutCtx.putImageData(cutImage,0,0);
    rebuildStudioWorkCanvas();
    return true;
  }

  const previousApi=window.__audreyCutoutMethodPreview;
  if(previousApi){
    savedApi=previousApi;
    window.__audreyCutoutMethodPreview={
      ...previousApi,
      phase:5,
      getMethod:()=>smartBlendSelected?'blend':previousApi.getMethod(),
      methods:(previousApi.methods||[]).map(x=>x.id==='blend'?{...x,enabled:true,help:'Starts with a Center Focus rescue, then blends several subject clues with extra center weighting.'}:x)
    };
  }

  const openBeforeBlend=openPhotoStudio;
  openPhotoStudio=async function(target='item'){
    const nextTarget=target==='wish'?'wish':'item';
    const saved=nextTarget==='wish'?wishStudioState:itemStudioState;
    smartBlendSelected=!!(saved&&saved.cutoutMethod==='blend');
    const result=await openBeforeBlend.apply(this,arguments);
    installBlendButton();
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
          document.getElementById('studioStatus').textContent='Smart Blend applied. Center Focus protection ran first, then the other subject clues refined the recovered detail.';
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
