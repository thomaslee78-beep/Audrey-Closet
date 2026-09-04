/* Audrey Closet v13.24 — Smart Scan Phase 5.4 Experimental Spatial Pattern Analyzer
 * Calibration Lab only. Does NOT replace Phase 5.3 or window.analyzeImage.
 * Spatial model: normalized grayscale-like pattern map + left/right edge, center, bottom, repetition analysis.
 */
(function(){
  'use strict';
  const VERSION='13.24-phase5.4-exp-spatial1';
  const P2=window.AUDREY_SMART_SCAN_PHASE2;
  const P4=window.AUDREY_SMART_SCAN_PHASE4;
  if(!P2?.sampleGarmentPixels||!P4?.rgbToLab){console.warn('Smart Scan Phase 5.4 experimental spatial analyzer skipped: dependencies unavailable.');return}

  const GRID=32;
  const TORSO={x0:6,x1:25,y0:4,y1:29};
  const EPS=.0001;
  const DEFAULTS={edgeVariance:.16,edgeSimilarity:.18,centerContrast:.20,bottomUniform:.14,repetitionRegularity:.52,colorblockArea:.22,printCoverage:.28};

  function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
  function mean(a){return a.length?a.reduce((s,v)=>s+v,0)/a.length:0}
  function variance(a){if(a.length<2)return 0;const m=mean(a);return mean(a.map(v=>(v-m)*(v-m)))}
  function std(a){return Math.sqrt(variance(a))}
  function median(a){if(!a.length)return 0;const b=[...a].sort((x,y)=>x-y),m=Math.floor(b.length/2);return b.length%2?b[m]:(b[m-1]+b[m])/2}
  function percentile(a,p){if(!a.length)return 0;const b=[...a].sort((x,y)=>x-y),i=clamp(Math.round((b.length-1)*p),0,b.length-1);return b[i]}

  function buildGrid(sample){
    const cells=Array.from({length:GRID*GRID},()=>({n:0,L:0,C:0,hx:0,hy:0}));
    for(const p of sample.pixels){
      const x=clamp(Math.floor(p.x/sample.width*GRID),0,GRID-1),y=clamp(Math.floor(p.y/sample.height*GRID),0,GRID-1),c=cells[y*GRID+x];
      const lab=P4.rgbToLab(p.r,p.g,p.b),C=Math.hypot(lab.a,lab.b),h=Math.atan2(lab.b,lab.a);
      c.n++;c.L+=lab.L;c.C+=C;c.hx+=Math.cos(h)*C;c.hy+=Math.sin(h)*C;
    }
    const raw=cells.map(c=>c.n?{L:c.L/c.n,C:c.C/c.n,h:Math.atan2(c.hy,c.hx),n:c.n}:null);
    const normalized=raw.map((c,i)=>{
      if(!c)return null;const x=i%GRID,y=Math.floor(i/GRID),near=[];
      for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++){const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=GRID||ny>=GRID)continue;const q=raw[ny*GRID+nx];if(q)near.push(q.L)}
      const local=median(near),illuminationCorrected=clamp((c.L-local+24)/48,0,1);
      // Grayscale-like pattern intensity. Chroma contributes only weakly so shadows/black folds do not dominate,
      // but real colored printing with similar lightness is not completely erased.
      const chromaResidual=clamp(c.C/55,0,1)*.16;
      return{...c,intensity:clamp(illuminationCorrected+chromaResidual,0,1),localL:local};
    });
    return normalized;
  }

  function cellsIn(grid,x0,x1,y0,y1){const out=[];for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const c=grid[y*GRID+x];if(c)out.push({x,y,...c})}return out}
  function zoneSignature(cells){
    const intensities=cells.map(c=>c.intensity),Ls=cells.map(c=>c.L),Cs=cells.map(c=>c.C);
    return{count:cells.length,mean:mean(intensities),std:std(intensities),p10:percentile(intensities,.1),p90:percentile(intensities,.9),range:percentile(intensities,.9)-percentile(intensities,.1),meanL:mean(Ls),meanC:mean(Cs)};
  }
  function signatureDistance(a,b){return Math.abs(a.mean-b.mean)+Math.abs(a.meanC-b.meanC)/100*.35}

  function lineProfile(grid,axis,index,start,end){
    const arr=[];
    if(axis==='vertical')for(let y=start;y<=end;y++){const c=grid[y*GRID+index];if(c)arr.push(c.intensity)}
    else for(let x=start;x<=end;x++){const c=grid[index*GRID+x];if(c)arr.push(c.intensity)}
    return arr;
  }
  function transitions(profile){if(profile.length<3)return{score:0,count:0,positions:[],regularity:0};
    const smooth=profile.map((v,i)=>{const a=profile[Math.max(0,i-1)],b=profile[Math.min(profile.length-1,i+1)];return(a+v+b)/3});
    const diffs=[];for(let i=1;i<smooth.length;i++)diffs.push(Math.abs(smooth[i]-smooth[i-1]));
    const threshold=Math.max(.07,median(diffs)*2.1);const positions=[];for(let i=0;i<diffs.length;i++)if(diffs[i]>=threshold)positions.push(i+1);
    const gaps=[];for(let i=1;i<positions.length;i++)gaps.push(positions[i]-positions[i-1]);
    const reg=gaps.length>=2?clamp(1-std(gaps)/(mean(gaps)+EPS),0,1):0;
    return{score:mean(diffs),count:positions.length,positions,regularity:reg,threshold};
  }

  function centerContrast(grid,edgeSig){
    const cells=cellsIn(grid,10,21,9,23);if(!cells.length)return{share:0,meanDifference:0,detail:0};
    const diffs=cells.map(c=>Math.abs(c.intensity-edgeSig.mean)+Math.abs(c.C-edgeSig.meanC)/100*.28);
    const threshold=Math.max(.14,edgeSig.std*1.6+.06);const contrasting=diffs.filter(d=>d>=threshold).length/cells.length;
    return{share:contrasting,meanDifference:mean(diffs),detail:std(diffs),threshold};
  }

  function connectedContrast(grid,edgeSig){
    const active=[];for(let y=TORSO.y0;y<=TORSO.y1;y++)for(let x=TORSO.x0;x<=TORSO.x1;x++){const c=grid[y*GRID+x];if(!c)continue;const d=Math.abs(c.intensity-edgeSig.mean)+Math.abs(c.C-edgeSig.meanC)/100*.28;if(d>=Math.max(.14,edgeSig.std*1.6+.06))active.push(y*GRID+x)}
    const set=new Set(active),seen=new Set(),parts=[];for(const start of active){if(seen.has(start))continue;const stack=[start];seen.add(start);let n=0,minX=99,maxX=0,minY=99,maxY=0;while(stack.length){const q=stack.pop(),x=q%GRID,y=Math.floor(q/GRID);n++;minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);for(const z of [q-1,q+1,q-GRID,q+GRID])if(set.has(z)&&!seen.has(z)){const zx=z%GRID,zy=Math.floor(z/GRID);if(Math.abs(zx-x)+Math.abs(zy-y)===1){seen.add(z);stack.push(z)}}}parts.push({n,minX,maxX,minY,maxY,width:maxX-minX+1,height:maxY-minY+1})}
    parts.sort((a,b)=>b.n-a.n);const torsoCount=cellsIn(grid,TORSO.x0,TORSO.x1,TORSO.y0,TORSO.y1).length||1;return{largest:parts[0]||null,largestShare:(parts[0]?.n||0)/torsoCount,totalShare:active.length/torsoCount,partCount:parts.length};
  }

  function analyzeGrid(grid){
    const leftCells=[...cellsIn(grid,6,8,7,25),...cellsIn(grid,9,9,10,22)],rightCells=[...cellsIn(grid,23,25,7,25),...cellsIn(grid,22,22,10,22)];
    const left=zoneSignature(leftCells),right=zoneSignature(rightCells),edge={mean:(left.mean+right.mean)/2,std:(left.std+right.std)/2,meanC:(left.meanC+right.meanC)/2};
    const edgeDistance=signatureDistance(left,right),edgesUniform=left.range<=DEFAULTS.edgeVariance&&right.range<=DEFAULTS.edgeVariance,edgesMatch=edgeDistance<=DEFAULTS.edgeSimilarity;
    const center=centerContrast(grid,edge),connected=connectedContrast(grid,edge);
    const leftLines=[7,8,9].map(x=>transitions(lineProfile(grid,'vertical',x,7,25))),rightLines=[22,23,24].map(x=>transitions(lineProfile(grid,'vertical',x,7,25))),bottomLines=[24,25,26].map(y=>transitions(lineProfile(grid,'horizontal',y,7,24)));
    const vertical={score:mean([...leftLines,...rightLines].map(x=>x.score)),count:mean([...leftLines,...rightLines].map(x=>x.count)),regularity:mean([...leftLines,...rightLines].map(x=>x.regularity))};
    const bottom={score:mean(bottomLines.map(x=>x.score)),count:mean(bottomLines.map(x=>x.count)),regularity:mean(bottomLines.map(x=>x.regularity))};
    const edgeMulticolor=!edgesUniform||vertical.count>=2.2;

    let pattern='Other',reason='spatial-fallback',confidence=.42;
    if(edgesUniform&&edgesMatch){
      const graphic=center.share>=DEFAULTS.centerContrast&&(connected.totalShare>=.08||connected.largestShare>=.045);
      const largeSimple=connected.largestShare>=DEFAULTS.colorblockArea&&center.detail<.15;
      if(largeSimple){pattern='Colorblock';reason='spatial-large-simple-contrast-region';confidence=.78}
      else if(graphic){pattern='Graphic';reason='spatial-matching-edges-center-contrast';confidence=.88}
      else{pattern='Solid';reason='spatial-matching-edges-center-similar';confidence=.88}
    }else if(edgeMulticolor){
      const verticalRepeated=vertical.count>=2.2&&vertical.regularity>=.35;
      const bottomQuiet=bottom.count<=1.2||bottom.score<=DEFAULTS.bottomUniform;
      const bottomRepeated=bottom.count>=2&&bottom.regularity>=.30;
      if(verticalRepeated&&bottomQuiet){pattern='Stripe';reason='spatial-edge-variation-bottom-uniform';confidence=.86}
      else if(verticalRepeated&&bottomRepeated){pattern='Plaid';reason='spatial-two-axis-repetition';confidence=.84}
      else if(connected.totalShare>=DEFAULTS.printCoverage||center.share>=.24){pattern='Floral/Print';reason='spatial-distributed-irregular-variation';confidence=.75}
      else{pattern='Other';reason='spatial-irregular-pattern';confidence=.50}
    }else if(center.share>=DEFAULTS.centerContrast){pattern='Graphic';reason='spatial-center-contrast-secondary';confidence=.72}
    else{pattern='Solid';reason='spatial-low-variation-fallback';confidence=.68}

    return{pattern,confidence,reason,zones:{left,right,edgeDistance,edgesUniform,edgesMatch,center,bottom,vertical},connected,thresholds:{...DEFAULTS}};
  }

  async function analyze(dataURL){
    const sample=await P2.sampleGarmentPixels(dataURL);if(!sample?.sampledPixels)return{pattern:'Other',confidence:0,reason:'no-sampled-pixels',diagnostics:null};
    const grid=buildGrid(sample),result=analyzeGrid(grid);result.diagnostics={version:VERSION,sampleSize:P2.sampleSize||sample.sampleSize||256,gridSize:GRID,torso:TORSO,...result};
    window.AUDREY_SMART_SCAN_PHASE54_EXP.lastDiagnostics=result.diagnostics;return result;
  }

  window.AUDREY_SMART_SCAN_PHASE54_EXP={version:VERSION,gridSize:GRID,torso:TORSO,defaults:{...DEFAULTS},buildGrid,analyzeGrid,analyze,lastDiagnostics:null};
  console.info(`Audrey Smart Scan ${VERSION} loaded: spatial pattern experiment available to Calibration Lab only; Phase 5.3 unchanged.`);
})();
