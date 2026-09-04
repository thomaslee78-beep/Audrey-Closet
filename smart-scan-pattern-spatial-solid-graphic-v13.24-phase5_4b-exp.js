/* Audrey Closet v13.24 — Smart Scan Phase 5.4B3 Experimental Solid/Graphic Analyzer
 * Calibration Lab only. Uses four upper/middle chest regions and cell-level edge-relative contrast.
 * Detects meaningful non-edge colors without averaging them away inside a large patch.
 * Does NOT replace Phase 5.3 or window.analyzeImage.
 */
(function(){
  'use strict';
  const VERSION='13.24-phase5.4b3-exp-edge-contrast1';
  const P2=window.AUDREY_SMART_SCAN_PHASE2;
  const P54=window.AUDREY_SMART_SCAN_PHASE54_EXP;
  if(!P2?.sampleGarmentPixels||!P54?.buildGrid){console.warn('Smart Scan Phase 5.4B3 experiment skipped: dependencies unavailable.');return}

  const GRID=32;
  const TORSO=P54.torso||{x0:6,x1:25,y0:4,y1:29};
  const DEFAULTS={edgeMatchDistance:.24,cellDifference:.145,patchContrastShare:.16,totalContrastShare:.10,maxShadowOnlyShare:.72,minGraphicPatches:1};
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const mean=a=>a.length?a.reduce((s,v)=>s+v,0)/a.length:0;
  const variance=a=>{if(a.length<2)return 0;const m=mean(a);return mean(a.map(v=>(v-m)*(v-m)))};
  const std=a=>Math.sqrt(variance(a));

  function cellsIn(grid,x0,x1,y0,y1){const out=[];for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const c=grid[y*GRID+x];if(c)out.push({x,y,...c})}return out}
  function circularHue(cells){let x=0,y=0,w=0;for(const c of cells){const weight=Math.max(0,c.C||0);x+=Math.cos(c.h||0)*weight;y+=Math.sin(c.h||0)*weight;w+=weight}return w?Math.atan2(y,x):0}
  function signature(cells){const intens=cells.map(c=>c.intensity),Ls=cells.map(c=>c.L),Cs=cells.map(c=>c.C);return{count:cells.length,intensity:mean(intens),intensityStd:std(intens),L:mean(Ls),C:mean(Cs),h:circularHue(cells)}}
  function hueDistance(a,b){let d=Math.abs(a-b);if(d>Math.PI)d=2*Math.PI-d;return d/Math.PI}
  function appearanceDistance(a,b){const intensity=Math.abs(a.intensity-b.intensity),chroma=Math.abs(a.C-b.C)/60,hue=hueDistance(a.h,b.h)*clamp(Math.min(a.C,b.C)/28,0,1);return intensity*.42+chroma*.28+hue*.30}
  function shadowOnly(a,b){const intensity=Math.abs(a.intensity-b.intensity),chroma=Math.abs(a.C-b.C)/60,hue=hueDistance(a.h,b.h)*clamp(Math.min(a.C,b.C)/28,0,1);return intensity>.09&&chroma<.09&&hue<.08}
  function cellSig(c){return{intensity:c.intensity,L:c.L,C:c.C,h:c.h}}

  function colorFamily(c){
    if((c.C||0)<10)return 'neutral';
    let deg=(c.h||0)*180/Math.PI;if(deg<0)deg+=360;
    if(deg<20||deg>=345)return'red';if(deg<50)return'orange';if(deg<85)return'yellow';if(deg<155)return'green';if(deg<205)return'cyan';if(deg<265)return'blue';if(deg<325)return'purple';return'pink';
  }

  function buildEdgeSignatures(grid){
    // Multiple upper/mid/lower edge strips establish the shirt fabric while avoiding sleeves/background.
    const ys=[[7,11],[12,16],[17,21],[22,25]];
    const leftCells=ys.flatMap(([y0,y1])=>cellsIn(grid,6,9,y0,y1)),rightCells=ys.flatMap(([y0,y1])=>cellsIn(grid,22,25,y0,y1));
    const left=signature(leftCells),right=signature(rightCells),distance=appearanceDistance(left,right);
    return{left,right,distance,match:distance<=DEFAULTS.edgeMatchDistance};
  }

  function chestRegions(grid){
    // Shifted upward: most T-shirt graphics live in the upper/middle two-thirds of the torso.
    const defs=[
      {id:'upper-left',x0:10,x1:15,y0:7,y1:13},
      {id:'upper-right',x0:16,x1:21,y0:7,y1:13},
      {id:'mid-left',x0:10,x1:15,y0:14,y1:20},
      {id:'mid-right',x0:16,x1:21,y0:14,y1:20}
    ];
    return defs.map(d=>({...d,cells:cellsIn(grid,d.x0,d.x1,d.y0,d.y1)})).filter(p=>p.cells.length>=8);
  }

  function evaluateCell(c,edges){
    const s=cellSig(c),dl=appearanceDistance(s,edges.left),dr=appearanceDistance(s,edges.right),differentFromBoth=Math.min(dl,dr)>=DEFAULTS.cellDifference;
    const shadow=shadowOnly(s,edges.left)&&shadowOnly(s,edges.right);
    return{...c,leftDistance:dl,rightDistance:dr,differentFromBoth,shadowOnly:shadow,graphicEvidence:differentFromBoth&&!shadow,family:colorFamily(c)};
  }

  function evaluateRegion(region,edges){
    const cells=region.cells.map(c=>evaluateCell(c,edges)),contrast=cells.filter(c=>c.graphicEvidence),different=cells.filter(c=>c.differentFromBoth),shadow=cells.filter(c=>c.shadowOnly);
    const familyCounts={};for(const c of contrast)familyCounts[c.family]=(familyCounts[c.family]||0)+1;
    const meaningfulFamilies=Object.entries(familyCounts).filter(([,n])=>n>=2).map(([f])=>f);
    return{id:region.id,count:cells.length,contrastCount:contrast.length,contrastShare:contrast.length/Math.max(1,cells.length),differentShare:different.length/Math.max(1,cells.length),shadowOnlyShare:shadow.length/Math.max(1,different.length),meaningfulFamilies,familyCounts,cells};
  }

  function analyzeGrid(grid){
    const edges=buildEdgeSignatures(grid),regions=chestRegions(grid).map(r=>evaluateRegion(r,edges));
    const totalCells=regions.reduce((n,r)=>n+r.count,0)||1,totalContrast=regions.reduce((n,r)=>n+r.contrastCount,0),totalDifferent=regions.reduce((n,r)=>n+Math.round(r.differentShare*r.count),0);
    const contrastShare=totalContrast/totalCells,differentShare=totalDifferent/totalCells;
    const graphicRegions=regions.filter(r=>r.contrastShare>=DEFAULTS.patchContrastShare&&r.shadowOnlyShare<=DEFAULTS.maxShadowOnlyShare);
    const allFamilies=new Set(graphicRegions.flatMap(r=>r.meaningfulFamilies));
    const nonNeutralFamilies=[...allFamilies].filter(f=>f!=='neutral');
    const strongestRegion=regions.reduce((m,r)=>Math.max(m,r.contrastShare),0);
    const shadowWeighted=regions.reduce((n,r)=>n+r.shadowOnlyShare*r.differentShare*r.count,0)/Math.max(1,totalDifferent);
    const edgeStable=edges.match;

    // Graphic requires meaningful edge-relative contrast in at least one upper/mid chest region.
    // Multiple chromatic families strengthen the result, but a high-contrast monochrome print can still qualify.
    const chromaticEvidence=nonNeutralFamilies.length>=1;
    const strongCoverage=contrastShare>=DEFAULTS.totalContrastShare||strongestRegion>=.24;
    const graphic=edgeStable&&graphicRegions.length>=DEFAULTS.minGraphicPatches&&strongCoverage&&shadowWeighted<=DEFAULTS.maxShadowOnlyShare&&(chromaticEvidence||strongestRegion>=.28);

    let pattern='Solid',confidence=.86,reason='edge-contrast-chest-remains-fabric-like';
    if(graphic){pattern='Graphic';confidence=nonNeutralFamilies.length>=2?.94:.90;reason='edge-contrast-cells-form-chest-graphic'}
    else if(!edges.match){pattern='Other';confidence=.45;reason='edges-do-not-form-single-fabric-baseline'}

    return{pattern,confidence,reason,edgeStable,edges,regions,summary:{regionCount:regions.length,graphicRegionCount:graphicRegions.length,totalContrastShare:contrastShare,differentFromBothShare:differentShare,shadowOnlyShare:shadowWeighted,strongestRegionContrast:strongestRegion,contrastFamilies:[...allFamilies],nonNeutralFamilyCount:nonNeutralFamilies.length},thresholds:{...DEFAULTS}};
  }

  async function analyze(dataURL){const sample=await P2.sampleGarmentPixels(dataURL);if(!sample?.sampledPixels)return{pattern:'Other',confidence:0,reason:'no-sampled-pixels',diagnostics:null};const grid=P54.buildGrid(sample),result=analyzeGrid(grid);result.diagnostics={version:VERSION,sampleSize:P2.sampleSize||sample.sampleSize||256,gridSize:GRID,torso:TORSO,...result};window.AUDREY_SMART_SCAN_PHASE54B_EXP.lastDiagnostics=result.diagnostics;return result}

  window.AUDREY_SMART_SCAN_PHASE54B_EXP={version:VERSION,defaults:{...DEFAULTS},analyzeGrid,analyze,lastDiagnostics:null};
  console.info(`Audrey Smart Scan ${VERSION} loaded: cell-level edge-contrast Solid/Graphic experiment available to Calibration Lab only.`);
})();
