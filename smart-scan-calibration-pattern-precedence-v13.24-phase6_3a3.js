/* Audrey Closet v13.24 — Smart Scan Phase 6.3A3 Pattern Precedence Experiment
 * Calibration Lab only: allows meaningful Graphic evidence to beat normalized Solid.
 * Phase 5.3 production/local baseline remains unchanged.
 */
(function(){
  'use strict';
  const VERSION='13.24-phase6.3a3-graphic-precedence1';
  const LAB=window.AUDREY_SMART_SCAN_CALIBRATION;
  const P53=window.AUDREY_SMART_SCAN_PHASE53;
  if(!LAB||!P53){console.warn('Smart Scan Calibration pattern precedence experiment skipped: dependencies unavailable.');return}

  function normalizedSolid(diag){
    const shares=diag?.normalization?.after?.shares||{};
    const sorted=Object.values(shares).sort((a,b)=>b-a),top=sorted[0]||0,second=sorted[1]||0;
    if(top>=.86&&second<=.06)return{pattern:'Solid',confidence:.94,reason:'calibration-normalized-solid-strong'};
    if(top>=.76&&second<=.10)return{pattern:'Solid',confidence:.89,reason:'calibration-normalized-solid'};
    return null;
  }

  function calibratedPatternGraphicFirst(diag){
    if(!diag?.features)return{pattern:diag?.pattern||'',reason:'no-pattern-diagnostics'};
    const {graphic:g,plaid:p,floral:f,colorblock:cb,stripe}=diag.features;
    const s=LAB.getSettings().pattern;

    // Preserve explicit small-logo protection before allowing Graphic precedence.
    if(g.dominantShare>=.74&&g.secondaryShare<=.065&&g.largestShare<=s.smallLogoMaxRegion){
      return{pattern:'Solid',confidence:.92,reason:'calibrated-small-logo-solid'};
    }

    const coherent=g.secondaryShare>=.085&&g.secondaryShare<=.48&&g.largestShare>=s.graphicMinRegion&&g.localizedCoverage<=s.graphicMaxCoverage;
    const complex=g.internalVariation>=.35||g.partCount>=2||g.largestBoxShare>=.08;
    const torso=P53.torso||{x0:6,x1:25};
    const centerOrEdge=g.centerDistance<=.34||(g.largest&&((g.largest.minX<=torso.x0+3)||(g.largest.maxX>=torso.x1-3)));

    // Experiment: a coherent, localized, meaningful graphic may challenge Solid first.
    if(coherent&&complex&&centerOrEdge){
      return{pattern:'Graphic',confidence:.87,reason:'calibrated-graphic-precedes-solid'};
    }
    if(g.secondaryShare>=.10&&g.secondaryShare<=.40&&g.largestShare>=Math.max(.09,s.graphicMinRegion)&&g.localizedCoverage<=Math.min(.34,s.graphicMaxCoverage)){
      return{pattern:'Graphic',confidence:.79,reason:'calibrated-substantial-graphic-precedes-solid'};
    }

    // Only after meaningful Graphic evidence fails do we allow normalized Solid to terminate classification.
    const solid=normalizedSolid(diag);if(solid)return solid;

    // Remaining pattern ordering is intentionally unchanged from the existing Calibration Lab.
    if(stripe?.best?.score>=s.stripeMinScore&&stripe.best.avgRuns>=4.5&&stripe.best.agreement>=.35)return{pattern:'Stripe',confidence:.88,reason:'calibrated-repeated-stripe'};
    if(p.axes.horizontal>=s.plaidMinAxis&&p.axes.vertical>=s.plaidMinAxis&&p.runs.rows>=.12&&p.runs.cols>=.12&&p.nonDominantCoverage>=s.plaidMinCoverage&&p.edgeReach>=.50&&g.localizedCoverage>=.38)return{pattern:'Plaid',confidence:.86,reason:'calibrated-torso-wide-plaid'};
    if(cb.meaningfulParts>=2&&cb.meaningfulParts<=4&&g.internalVariation<.35&&g.localizedCoverage>=.28)return{pattern:'Colorblock',confidence:.72,reason:'calibrated-large-simple-regions'};
    if(f.meaningful>=3&&f.coverage>=.38&&f.smallComponents>=7)return{pattern:'Floral/Print',confidence:.84,reason:'calibrated-distributed-print'};
    return{pattern:'Other',confidence:.40,reason:'calibrated-pattern-fallback'};
  }

  LAB.calibratedPattern=calibratedPatternGraphicFirst;
  window.AUDREY_SMART_SCAN_CALIBRATION_PATTERN_PRECEDENCE={version:VERSION,calibratedPattern:calibratedPatternGraphicFirst};
  console.info(`Audrey Smart Scan ${VERSION} loaded: Calibration Lab Graphic precedence enabled; Phase 5.3 baseline unchanged.`);
})();
