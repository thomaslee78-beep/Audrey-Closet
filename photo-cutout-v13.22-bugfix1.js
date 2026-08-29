/* Audrey Closet v13.22-bugfix2 — adaptive light-on-light cutout preservation */
(function(){
  'use strict';

  function rgbLuma(r,g,b){return .2126*r+.7152*g+.0722*b}
  function rgbChroma(r,g,b){return Math.max(r,g,b)-Math.min(r,g,b)}

  function borderBackgroundModel(d,w,h){
    const rs=[],gs=[],bs=[];
    const take=(x,y,weight=1)=>{
      x=Math.max(0,Math.min(w-1,x));
      y=Math.max(0,Math.min(h-1,y));
      const i=(y*w+x)*4;
      if(d[i+3]<24)return;
      for(let n=0;n<weight;n++){
        rs.push(d[i]);gs.push(d[i+1]);bs.push(d[i+2]);
      }
    };

    const minDim=Math.min(w,h);
    const cornerDepth=Math.max(8,Math.min(54,Math.round(minDim*.075)));
    const cornerStep=Math.max(2,Math.round(cornerDepth/9));
    const corners=[[0,0,1,1],[w-1,0,-1,1],[0,h-1,1,-1],[w-1,h-1,-1,-1]];

    for(const [ox,oy,sx,sy] of corners){
      for(let yy=0;yy<=cornerDepth;yy+=cornerStep){
        for(let xx=0;xx<=cornerDepth;xx+=cornerStep){
          take(ox+sx*xx,oy+sy*yy,2);
        }
      }
    }

    const edgeStep=Math.max(8,Math.floor(minDim/24));
    const inset=Math.max(1,Math.min(5,Math.floor(minDim/120)));
    for(let x=cornerDepth;x<w-cornerDepth;x+=edgeStep){take(x,inset);take(x,h-1-inset)}
    for(let y=cornerDepth;y<h-cornerDepth;y+=edgeStep){take(inset,y);take(w-1-inset,y)}

    const bg=[median(rs),median(gs),median(bs)];
    const devs=[];
    for(let i=0;i<rs.length;i++){
      const dr=rs[i]-bg[0],dg=gs[i]-bg[1],db=bs[i]-bg[2];
      devs.push(Math.sqrt(dr*dr+dg*dg+db*db));
    }
    return {bg,mad:median(devs)||0};
  };

  function analyzeLightOnLight(d,w,h,bg){
    const bgLuma=rgbLuma(bg[0],bg[1],bg[2]);
    const bgChroma=rgbChroma(bg[0],bg[1],bg[2]);
    const lumas=[],chromas=[],dists=[];
    const x0=Math.round(w*.22),x1=Math.round(w*.78),y0=Math.round(h*.22),y1=Math.round(h*.78);
    const step=Math.max(2,Math.floor(Math.min(w,h)/90));

    for(let y=y0;y<=y1;y+=step)for(let x=x0;x<=x1;x+=step){
      const i=(y*w+x)*4;
      if(d[i+3]<24)continue;
      const r=d[i],g=d[i+1],b=d[i+2];
      lumas.push(rgbLuma(r,g,b));
      chromas.push(rgbChroma(r,g,b));
      const dr=r-bg[0],dg=g-bg[1],db=b-bg[2];
      dists.push(Math.sqrt(dr*dr+dg*dg+db*db));
    }

    const centerLuma=median(lumas);
    const centerChroma=median(chromas);
    const centerDist=median(dists);
    const brightBg=clamp((bgLuma-205)/42,0,1);
    const neutralBg=1-clamp(bgChroma/42,0,1);
    const brightCenter=clamp((centerLuma-195)/50,0,1);
    const neutralCenter=1-clamp(centerChroma/48,0,1);
    const lowContrast=1-clamp((centerDist-10)/55,0,1);
    const score=brightBg*neutralBg*brightCenter*neutralCenter*lowContrast;

    return {
      score,
      active:score>.24,
      bgLuma,bgChroma,centerLuma,centerChroma,centerDist
    };
  }

  buildCutoutPass=function(im,w,h,edge=45,mode='quick'){
    const d=im.data;
    const {bg,mad}=borderBackgroundModel(d,w,h);
    const light=analyzeLightOnLight(d,w,h,bg);
    const adaptive=Math.pow(clamp(light.score,0,1),.72);

    // On bright neutral low-contrast scenes, compress the sensitivity curve
    // downward rather than changing the UI direction. Normal/colorful scenes
    // keep the stable value almost exactly.
    const effectiveEdge=light.active
      ? Math.max(4,edge*(1-(mode==='clean'?.48:.62)*adaptive))
      : edge;

    const gradient=new Uint8Array(w*h);
    const rawDist=new Float32Array(w*h);
    const lumDelta=new Float32Array(w*h);
    const chromaDelta=new Float32Array(w*h);
    const strength=new Uint8ClampedArray(w*h);
    const distSample=[];

    const base=mode==='clean'?0.82:0.74;
    const gradBase=(mode==='clean'?26:21)+effectiveEdge*.28;
    const floodBase=Math.max(18,effectiveEdge*base+mad*.55);
    const bgLuma=rgbLuma(bg[0],bg[1],bg[2]);
    const bgChroma=rgbChroma(bg[0],bg[1],bg[2]);

    for(let y=0;y<h;y++)for(let x=0;x<w;x++){
      const p=y*w+x,i=p*4,r=d[i],g=d[i+1],b=d[i+2];
      const dr=r-bg[0],dg=g-bg[1],db=b-bg[2];
      const dist=Math.sqrt(dr*dr+dg*dg+db*db);
      rawDist[p]=dist;
      lumDelta[p]=Math.abs(rgbLuma(r,g,b)-bgLuma);
      chromaDelta[p]=Math.abs(rgbChroma(r,g,b)-bgChroma);
      if(((x+y)&7)===0)distSample.push(dist);

      const xl=Math.max(0,x-1),xr=Math.min(w-1,x+1);
      const yu=Math.max(0,y-1),yd=Math.min(h-1,y+1);
      const il=(y*w+xl)*4,ir=(y*w+xr)*4,iu=(yu*w+x)*4,id=(yd*w+x)*4;
      const gx=(Math.abs(d[ir]-d[il])+Math.abs(d[ir+1]-d[il+1])+Math.abs(d[ir+2]-d[il+2]))/6;
      const gy=(Math.abs(d[id]-d[iu])+Math.abs(d[id+1]-d[iu+1])+Math.abs(d[id+2]-d[iu+2]))/6;
      gradient[p]=Math.min(255,Math.max(gx,gy));
    }

    const contrastScore=percentile(distSample,.90)-floodBase;
    const contrastBias=clamp((contrastScore-12)/52,0,1);
    const conservativeBias=1-contrastBias;
    const floodThresh=floodBase+contrastBias*6-conservativeBias*3;
    const gradLimit=gradBase+contrastBias*3-conservativeBias*2;
    const sureFg=floodThresh+(mode==='clean'?20:15)-conservativeBias*2+contrastBias*2;
    const protectThreshold=(mode==='clean'?230:215)-conservativeBias*22+contrastBias*8;

    const passable=new Uint8Array(w*h);
    const minDim=Math.max(1,Math.min(w,h));
    const centerStrength=light.active?(mode==='clean'?13:18)*adaptive:0;
    const structureStrength=light.active?(mode==='clean'?6:9)*adaptive:0;
    const lumaProtect=light.active?(mode==='clean'?7:10)*adaptive:0;

    for(let y=0;y<h;y++)for(let x=0;x<w;x++){
      const p=y*w+x;
      const dist=rawDist[p];
      const grad=gradient[p];
      const edgePx=Math.min(x,y,w-1-x,h-1-y);
      const inward=clamp(edgePx/(minDim*.34),0,1);
      const nx=(x-w*.5)/(w*.5),ny=(y-h*.5)/(h*.5);
      const radial=clamp(1-Math.sqrt(nx*nx+ny*ny),0,1);

      let centerPenalty=inward*(mode==='clean'?8:11);
      let detailPenalty=clamp((grad-7)/28,0,1)*(mode==='clean'?3:5);

      if(light.active){
        centerPenalty+=centerStrength*radial*radial;
        detailPenalty+=structureStrength*clamp((grad-3)/20,0,1);
        // White fabric often differs from a white wall/floor mainly in subtle
        // luminance/shadow structure. Treat that as foreground evidence.
        detailPenalty+=lumaProtect*clamp((lumDelta[p]-2)/20,0,1)*radial;
      }

      const localFlood=floodThresh-centerPenalty-detailPenalty;
      const localGradLimit=gradLimit-inward*(mode==='clean'?1.5:2.5)-(light.active?adaptive*2.5*radial:0);
      passable[p]=(dist<localFlood&&grad<localGradLimit)?1:0;
      strength[p]=clamp(Math.round((dist-localFlood)/Math.max(1,sureFg-localFlood)*255),0,255);
    }

    const bgFlood=new Uint8Array(w*h),q=new Int32Array(w*h);
    let head=0,tail=0;
    const seedDist=floodThresh*(mode==='clean'?.82:.76)*(light.active?(1-.16*adaptive):1);
    const seedGrad=gradLimit*(mode==='clean'?.88:.82)*(light.active?(1-.10*adaptive):1);

    const pushSeed=p=>{
      if(p<0||p>=w*h||bgFlood[p]||!passable[p])return;
      if(rawDist[p]>=seedDist||gradient[p]>=seedGrad)return;
      bgFlood[p]=1;q[tail++]=p;
    };
    const push=p=>{
      if(p<0||p>=w*h||bgFlood[p]||!passable[p])return;
      bgFlood[p]=1;q[tail++]=p;
    };

    for(let x=0;x<w;x++){pushSeed(x);pushSeed((h-1)*w+x)}
    for(let y=0;y<h;y++){pushSeed(y*w);pushSeed(y*w+w-1)}

    while(head<tail){
      const p=q[head++],x=p%w,y=(p/w)|0;
      if(x>0)push(p-1);if(x<w-1)push(p+1);if(y>0)push(p-w);if(y<h-1)push(p+w);
    }

    let mask=new Uint8Array(w*h);
    for(let p=0;p<w*h;p++)mask[p]=bgFlood[p]?0:1;

    for(let y=0;y<h;y++)for(let x=0;x<w;x++){
      const p=y*w+x;
      const edgePx=Math.min(x,y,w-1-x,h-1-y);
      const inward=clamp(edgePx/(minDim*.34),0,1);
      const nx=(x-w*.5)/(w*.5),ny=(y-h*.5)/(h*.5);
      const radial=clamp(1-Math.sqrt(nx*nx+ny*ny),0,1);
      let localProtect=protectThreshold-inward*(mode==='clean'?8:12);
      if(light.active){
        localProtect-=adaptive*(mode==='clean'?18:26)*radial*radial;
        localProtect-=adaptive*(mode==='clean'?5:8)*clamp((lumDelta[p]+chromaDelta[p]-3)/22,0,1)*radial;
      }
      if(strength[p]>=localProtect)mask[p]=1;
    }

    mask=fillMaskHoles(mask,w,h);
    mask=rescueFineCutoutDetails(mask,strength,w,h,mode);
    mask=keepMainForeground(mask,w,h,.05+contrastBias*.04,.012+contrastBias*.012);
    mask=closeMask(mask,w,h);
    mask=removeTinyMaskIslands(mask,w,h,Math.max(mode==='clean'?18:12,Math.round(w*h*((mode==='clean'?.000045:.00003)+(contrastBias*.00004)))));
    mask=fillMaskHoles(mask,w,h);

    const alpha=new Uint8ClampedArray(w*h);
    for(let p=0;p<w*h;p++){
      if(!mask[p]){alpha[p]=0;continue}
      alpha[p]=cutoutBoundaryAlpha(mask,strength,w,h,p,mode);
    }

    window.__audreyLastCutoutProfile={
      lightOnLight:light.active,
      lightScore:Number(light.score.toFixed(3)),
      requestedEdge:edge,
      effectiveEdge:Number(effectiveEdge.toFixed(1)),
      mode
    };

    return {alpha,mask};
  };

  window.__audreyCutoutBugfix1=true;
  window.__audreyCutoutBugfix2=true;
})();
