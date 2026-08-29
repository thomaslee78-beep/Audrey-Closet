/* Audrey Closet v13.22-bugfix1 — light-garment cutout preservation */
(function(){
  'use strict';

  // Keep the existing Photo Studio pipeline, but make the background estimate
  // more representative of the actual scene background. Corners are weighted
  // more heavily than full borders because closet subjects can legitimately
  // touch an edge (shirt hem, shoes, sleeves) without being background.
  borderBackgroundModel=function(d,w,h){
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

    // Dense, double-weighted corner patches.
    const corners=[
      [0,0,1,1],
      [w-1,0,-1,1],
      [0,h-1,1,-1],
      [w-1,h-1,-1,-1]
    ];
    for(const [ox,oy,sx,sy] of corners){
      for(let yy=0;yy<=cornerDepth;yy+=cornerStep){
        for(let xx=0;xx<=cornerDepth;xx+=cornerStep){
          take(ox+sx*xx,oy+sy*yy,2);
        }
      }
    }

    // Sparse border support prevents one unusual corner from dominating while
    // still giving the corners most of the vote.
    const edgeStep=Math.max(8,Math.floor(minDim/24));
    const inset=Math.max(1,Math.min(5,Math.floor(minDim/120)));
    for(let x=cornerDepth;x<w-cornerDepth;x+=edgeStep){
      take(x,inset);take(x,h-1-inset);
    }
    for(let y=cornerDepth;y<h-cornerDepth;y+=edgeStep){
      take(inset,y);take(w-1-inset,y);
    }

    const bg=[median(rs),median(gs),median(bs)];
    const devs=[];
    for(let i=0;i<rs.length;i++){
      const dr=rs[i]-bg[0],dg=gs[i]-bg[1],db=bs[i]-bg[2];
      devs.push(Math.sqrt(dr*dr+dg*dg+db*db));
    }
    return {bg,mad:median(devs)||0};
  };

  // Same downstream cleanup as stable v13.22, with safer classification for
  // low-contrast white/light items:
  //   1) edge flood must start from a confidently background-like border pixel;
  //   2) ambiguous pixels become progressively harder to flood toward center;
  //   3) high local detail gets a small foreground-preservation bonus.
  buildCutoutPass=function(im,w,h,edge=45,mode='quick'){
    const d=im.data;
    const {bg,mad}=borderBackgroundModel(d,w,h);
    const gradient=new Uint8Array(w*h);
    const rawDist=new Float32Array(w*h);
    const strength=new Uint8ClampedArray(w*h);
    const distSample=[];

    const base=mode==='clean'?0.82:0.74;
    const gradBase=(mode==='clean'?26:21)+edge*.28;
    const floodBase=Math.max(18,edge*base+mad*.55);

    for(let y=0;y<h;y++)for(let x=0;x<w;x++){
      const p=y*w+x,i=p*4,r=d[i],g=d[i+1],b=d[i+2];
      const dr=r-bg[0],dg=g-bg[1],db=b-bg[2];
      const dist=Math.sqrt(dr*dr+dg*dg+db*db);
      rawDist[p]=dist;
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
    for(let y=0;y<h;y++)for(let x=0;x<w;x++){
      const p=y*w+x;
      const dist=rawDist[p];
      const grad=gradient[p];
      const edgePx=Math.min(x,y,w-1-x,h-1-y);
      const inward=clamp(edgePx/(minDim*.34),0,1);

      // Protect ambiguous pixels progressively toward the middle. Quick is a
      // little more conservative than Clean so it remains the safer first try.
      const centerPenalty=inward*(mode==='clean'?8:11);
      // Textured/detail-rich light surfaces (shoe panels, seams, fabric folds)
      // should be slightly harder to classify as flat background.
      const detailPenalty=clamp((grad-7)/28,0,1)*(mode==='clean'?3:5);
      const localFlood=floodThresh-centerPenalty-detailPenalty;
      const localGradLimit=gradLimit-inward*(mode==='clean'?1.5:2.5);
      passable[p]=(dist<localFlood&&grad<localGradLimit)?1:0;
      strength[p]=clamp(Math.round((dist-localFlood)/Math.max(1,sureFg-localFlood)*255),0,255);
    }

    const bgFlood=new Uint8Array(w*h),q=new Int32Array(w*h);
    let head=0,tail=0;
    const seedDist=floodThresh*(mode==='clean'?.82:.76);
    const seedGrad=gradLimit*(mode==='clean'?.88:.82);
    const pushSeed=p=>{
      if(p<0||p>=w*h||bgFlood[p]||!passable[p])return;
      if(rawDist[p]>=seedDist||gradient[p]>=seedGrad)return;
      bgFlood[p]=1;q[tail++]=p;
    };
    const push=p=>{
      if(p<0||p>=w*h||bgFlood[p]||!passable[p])return;
      bgFlood[p]=1;q[tail++]=p;
    };

    // Seed from the outer frame only when the pixel is confidently background.
    for(let x=0;x<w;x++){pushSeed(x);pushSeed((h-1)*w+x)}
    for(let y=0;y<h;y++){pushSeed(y*w);pushSeed(y*w+w-1)}

    while(head<tail){
      const p=q[head++],x=p%w,y=(p/w)|0;
      if(x>0)push(p-1);if(x<w-1)push(p+1);if(y>0)push(p-w);if(y<h-1)push(p+w);
    }

    let mask=new Uint8Array(w*h);
    for(let p=0;p<w*h;p++)mask[p]=bgFlood[p]?0:1;

    // Preserve strongly foreground-like pixels exactly as before, with a small
    // extra center allowance for low-contrast subjects.
    for(let y=0;y<h;y++)for(let x=0;x<w;x++){
      const p=y*w+x;
      const edgePx=Math.min(x,y,w-1-x,h-1-y);
      const inward=clamp(edgePx/(minDim*.34),0,1);
      const localProtect=protectThreshold-inward*(mode==='clean'?8:12);
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
    return {alpha,mask};
  };

  window.__audreyCutoutBugfix1=true;
})();
