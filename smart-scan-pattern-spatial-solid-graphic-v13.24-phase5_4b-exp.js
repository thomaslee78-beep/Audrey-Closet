/* Audrey Closet v13.24 — Smart Scan Phase 5.4B2 Experimental Solid/Graphic Analyzer
 * Calibration Lab only. Uses four larger center patches compared against both torso-edge fabric signatures.
 * Does NOT replace Phase 5.3 or window.analyzeImage.
 */
(function(){
  'use strict';
  const VERSION='13.24-phase5.4b2-exp-solid-graphic4patch1';
  const P2=window.AUDREY_SMART_SCAN_PHASE2;
  const P54=window.AUDREY_SMART_SCAN_PHASE54_EXP;
  if(!P2?.sampleGarmentPixels||!P54?.buildGrid){console.warn('Smart Scan Phase 5.4B2 experiment skipped: dependencies unavailable.');return}

  const GRID=32;
  const TORSO=P54.torso||{x0:6,x1:25,y0:4,y1:29};
  const DEFAULTS={edgePatchMaxRange:.22,edgeMatchDistance:.24,patchDifference:.15,minGraphicPatches:1,maxShadowOnlyShare:.70};
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const mean=a=>a.length?a.reduce((s,v)=>s+v,0)/a.length:0;
  const variance=a=>{if(a.length<2)return 0;const m=mean(a);return mean(a.map(v=>(v-m)*(v-m)))};
  const std=a=>Math.sqrt(variance(a));

  function cellsIn(grid,x0,x1,y0,y1){const out=[];for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const c=grid[y*GRID+x];if(c)out.push({x,y,...c})}return out}
  function circularHue(cells){let x=0,y=0,w=0;for(const c of cells){const weight=Math.max(0,c.C||0);x+=Math.cos(c.h||0)*weight;y+=Math.sin(c.h||0)*weight;w+=weight}return w?Math.atan2(y,x):0}
  function signature(cells){const intens=cells.map(c=>c.intensity),Ls=cells.map(c=>c.L),Cs=cells.map(c=>c.C);return{count:cells.length,intensity:mean(intens),intensityStd:std(intens),L:mean(Ls),C:mean(Cs),h:circularHue(cells),range:intens.length?Math.max(...intens)-Math.min(...intens):0}}
  function hueDistance(a,b){let d=Math.abs(a-b);if(d>Math.PI)d=2*Math.PI-d;return d/Math.PI}
  function appearanceDistance(a,b){const intensity=Math.abs(a.intensity-b.intensity),chroma=Math.abs(a.C-b.C)/60,hue=hueDistance(a.h,b.h)*clamp(Math.min(a.C,b.C)/28,0,1);return intensity*.45+chroma*.25+hue*.30}
  function shadowOnlyDistance(a,b){const intensity=Math.abs(a.intensity-b.intensity),chroma=Math.abs(a.C-b.C)/60,hue=hueDistance(a.h,b.h)*clamp(Math.min(a.C,b.C)/28,0,1);return intensity>.10&&chroma<.08&&hue<.08}

  function buildEdgeSignatures(grid){
    const ys=[[7,11],[12,16],[17,21],[22,25]];
    const leftCells=ys.flatMap(([y0,y1])=>cellsIn(grid,6,9,y0,y1)),rightCells=ys.flatMap(([y0,y1])=>cellsIn(grid,22,25,y0,y1));
    const left=signature(leftCells),right=signature(rightCells),distance=appearanceDistance(left,right);
    return{left,right,distance,match:distance<=DEFAULTS.edgeMatchDistance};
  }

  function interiorPatches(grid){
    // Four broad center quadrants. Each patch is large enough to capture a meaningful part of a chest graphic.
    const defs=[
      {id:'upper-left',row:0,col:0,x0:10,x1:15,y0:9,y1:15},
      {id:'upper-right',row:0,col:1,x0:16,x1:21,y0:9,y1:15},
      {id:'lower-left',row:1,col:0,x0:10,x1:15,y0:16,y1:22},
      {id:'lower-right',row:1,col:1,x0:16,x1:21,y0:16,y1:22}
    ];
    return defs.map(d=>{const cells=cellsIn(grid,d.x0,d.x1,d.y0,d.y1);return{...d,sig:signature(cells)}}).filter(p=>p.sig.count>=6);
  }

  function analyzeGrid(grid){
    const edges=buildEdgeSignatures(grid),patches=interiorPatches(grid);
    const evaluated=patches.map(p=>{
      const dl=appearanceDistance(p.sig,edges.left),dr=appearanceDistance(p.sig,edges.right),differentFromBoth=Math.min(dl,dr)>=DEFAULTS.patchDifference;
      const shadowLeft=shadowOnlyDistance(p.sig,edges.left),shadowRight=shadowOnlyDistance(p.sig,edges.right),shadowOnly=shadowLeft&&shadowRight;
      return{...p,leftDistance:dl,rightDistance:dr,differentFromBoth,shadowOnly,graphicEvidence:differentFromBoth&&!shadowOnly};
    });
    const graphic=evaluated.filter(p=>p.graphicEvidence),different=evaluated.filter(p=>p.differentFromBoth),shadow=evaluated.filter(p=>p.shadowOnly),total=evaluated.length||1;
    const graphicShare=graphic.length/total,differentShare=different.length/total,shadowShare=shadow.length/Math.max(1,different.length);
    let touchingPairs=0;for(let i=0;i<graphic.length;i++)for(let j=i+1;j<graphic.length;j++)if(Math.abs(graphic[i].row-graphic[j].row)+Math.abs(graphic[i].col-graphic[j].col)===1)touchingPairs++;
    const coherent=graphic.length>=DEFAULTS.minGraphicPatches&&(graphic.length===1||touchingPairs>=1||graphicShare>=.50);
    const edgeStable=edges.match&&edges.left.range<=DEFAULTS.edgePatchMaxRange&&edges.right.range<=DEFAULTS.edgePatchMaxRange;

    let pattern='Solid',confidence=.84,reason='four-center-patches-match-edge-fabric';
    if(edgeStable&&coherent&&graphicShare>=.25&&shadowShare<=DEFAULTS.maxShadowOnlyShare){pattern='Graphic';confidence=.91;reason='four-center-patches-contrast-with-both-edges'}
    else if(edges.match&&coherent&&graphicShare>=.50){pattern='Graphic';confidence=.82;reason='four-center-patches-graphic-secondary'}
    else if(!edges.match){pattern='Other';confidence=.45;reason='edges-do-not-form-single-fabric-baseline'}

    return{pattern,confidence,reason,edgeStable,edges,patches:evaluated,summary:{patchCount:evaluated.length,graphicPatchCount:graphic.length,graphicPatchShare:graphicShare,differentPatchShare:differentShare,shadowOnlyShare:shadowShare,touchingPairs,coherent},thresholds:{...DEFAULTS}};
  }

  async function analyze(dataURL){const sample=await P2.sampleGarmentPixels(dataURL);if(!sample?.sampledPixels)return{pattern:'Other',confidence:0,reason:'no-sampled-pixels',diagnostics:null};const grid=P54.buildGrid(sample),result=analyzeGrid(grid);result.diagnostics={version:VERSION,sampleSize:P2.sampleSize||sample.sampleSize||256,gridSize:GRID,torso:TORSO,...result};window.AUDREY_SMART_SCAN_PHASE54B_EXP.lastDiagnostics=result.diagnostics;return result}

  window.AUDREY_SMART_SCAN_PHASE54B_EXP={version:VERSION,defaults:{...DEFAULTS},analyzeGrid,analyze,lastDiagnostics:null};
  console.info(`Audrey Smart Scan ${VERSION} loaded: four-patch Solid/Graphic experiment available to Calibration Lab only.`);
})();
