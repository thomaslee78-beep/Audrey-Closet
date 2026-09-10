/* Audrey Closet v13.24 — Phase 7A8C legacy release compatibility bridge
 * Delivers the previously service-worker-injected release payload as ordinary app code.
 * This preserves the exact tested Tier / Closet / Board behavior while decoupling it from SW fetch mutation.
 */
(function(){
  'use strict';
  const VERSION='13.24-phase7a8c-legacy-compat1';
  const MARKER='v13.21 baseline — dev12 feature set, fresh delivery';
  if(window.AUDREY_RELEASE_COMPAT?.readyPromise)return;

  const API={version:VERSION,ready:false,source:'legacy-sw-payload',error:null,readyPromise:null};
  API.readyPromise=(async()=>{
    const response=await fetch('./sw.js?v=13.23-legacy-payload-source',{cache:'no-store'});
    if(!response.ok)throw new Error('Could not load legacy release payload source (HTTP '+response.status+').');
    const source=await response.text();
    const prefix='const TIER_PATCH=String.raw`';
    const start=source.indexOf(prefix);
    const withStart=source.indexOf('function withTierPatch(resp){',Math.max(0,start));
    if(start<0||withStart<0)throw new Error('Legacy release payload boundaries were not found.');
    const close=source.lastIndexOf('`;',withStart);
    if(close<start)throw new Error('Legacy release payload terminator was not found.');
    const payload=source.slice(start+prefix.length,close);
    const markerCount=payload.split(MARKER).length-1;
    if(markerCount!==1)throw new Error('Legacy release payload marker count was '+markerCount+'; expected exactly one.');
    (0,eval)(payload+'\n//# sourceURL=audrey-legacy-release-compat-v13.24.js');
    API.ready=true;
    document.documentElement.dataset.audreyLegacyCompat='ready';
    console.info(`Audrey Closet ${VERSION} loaded: legacy release behavior is decoupled from service-worker delivery.`);
    return API;
  })().catch(err=>{
    API.error=String(err?.message||err);
    document.documentElement.dataset.audreyLegacyCompat='error';
    console.error('Audrey v13.24 legacy compatibility payload failed',err);
    throw err;
  });
  window.AUDREY_RELEASE_COMPAT=API;
})();
