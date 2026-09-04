/* Audrey Closet v13.24 — Smart Scan Phase 5.4C Experimental Hybrid Pattern Classifier
 * Calibration Lab only. Priority: strong Stripe/Plaid/Floral-Print, otherwise four-patch Solid/Graphic.
 * Does NOT replace Phase 5.3 or window.analyzeImage.
 */
(function(){
  'use strict';
  const VERSION='13.24-phase5.4c-exp-hybrid1';
  const P53=window.AUDREY_SMART_SCAN_PHASE53;
  const P54B=window.AUDREY_SMART_SCAN_PHASE54B_EXP;
  const LAB=window.AUDREY_SMART_SCAN_CALIBRATION;
  if(!P53||!P54B||!LAB){console.warn('Smart Scan Phase 5.4C hybrid skipped: dependencies unavailable.');return}

  function stage1(diag){
    const f=diag?.features;if(!f)return null;
    const s=LAB.getSettings().pattern,g=f.graphic||{},p=f.plaid||{},fl=f.floral||{},stripe=f.stripe||{};
    const stripeStrong=stripe?.best?.score>=s.stripeMinScore&&stripe.best.avgRuns>=4.5&&stripe.best.agreement>=.35;
    if(stripeStrong)return{pattern:'Stripe',confidence:.90,reason:'hybrid-strong-stripe'};
    const plaidStrong=p.axes?.horizontal>=s.plaidMinAxis&&p.axes?.vertical>=s.plaidMinAxis&&p.runs?.rows>=.12&&p.runs?.cols>=.12&&p.nonDominantCoverage>=s.plaidMinCoverage&&p.edgeReach>=.50&&g.localizedCoverage>=.38;
    if(plaidStrong)return{pattern:'Plaid',confidence:.88,reason:'hybrid-strong-plaid'};
    const floralStrong=fl.meaningful>=3&&fl.coverage>=.38&&fl.smallComponents>=7;
    if(floralStrong)return{pattern:'Floral/Print',confidence:.86,reason:'hybrid-strong-floral-print'};
    return null;
  }

  async function analyze(dataURL){
    await P53.analyzeImage(dataURL);
    const diag=JSON.parse(JSON.stringify(P53.lastDiagnostics||{}));
    const early=stage1(diag);
    if(early)return{...early,stage:'structure-first',diagnostics:{version:VERSION,phase53:diag,solidGraphic:null}};
    const sg=await P54B.analyze(dataURL);
    const out=(sg.pattern==='Graphic')?{pattern:'Graphic',confidence:sg.confidence,reason:'hybrid-solid-graphic-graphic'}:{pattern:'Solid',confidence:sg.confidence||.80,reason:'hybrid-solid-graphic-solid'};
    return{...out,stage:'solid-graphic',diagnostics:{version:VERSION,phase53:diag,solidGraphic:sg.diagnostics}};
  }

  window.AUDREY_SMART_SCAN_PHASE54C_EXP={version:VERSION,analyze,stage1,lastDiagnostics:null};
  console.info(`Audrey Smart Scan ${VERSION} loaded: strong Stripe/Plaid/Floral first, then four-patch Solid/Graphic.`);
})();
