/* Audrey Closet v13.24.1 — legacy release compatibility bridge
 * Delivers the previously service-worker-injected release payload as ordinary app code.
 * Hotfix: enforce one Tier selector even when a prior cached Tier wrapper is still present.
 */
(function(){
  'use strict';
  const VERSION='13.24.1-tier-idempotency1';
  const MARKER='v13.21 baseline — dev12 feature set, fresh delivery';
  if(window.AUDREY_RELEASE_COMPAT?.readyPromise)return;

  function dedupeTierSelector(){
    const host=document.querySelector('#itemReviewDetails');
    if(!host)return 0;
    const sections=[...host.querySelectorAll(':scope > .closet-tier-section')];
    sections.slice(1).forEach(section=>section.remove());
    return sections.length;
  }

  function installTierIdempotencyGuard(){
    if(window.__audreyTierIdempotencyGuardInstalled)return;
    window.__audreyTierIdempotencyGuardInstalled=true;

    // The migrated v13.24 runtime can temporarily sit on top of an older cached
    // app.js Tier wrapper. Always dedupe after the complete wrapper chain renders.
    if(typeof window.renderItemReviewDetails==='function'){
      const render=window.renderItemReviewDetails;
      window.renderItemReviewDetails=function(){
        const result=render.apply(this,arguments);
        dedupeTierSelector();
        return result;
      };
    }

    // Defense in depth for delayed DOM mutations from an older cached runtime.
    const host=document.querySelector('#itemReviewDetails');
    if(host&&typeof MutationObserver!=='undefined'){
      let queued=false;
      const observer=new MutationObserver(()=>{
        if(queued)return;
        queued=true;
        queueMicrotask(()=>{queued=false;dedupeTierSelector()});
      });
      observer.observe(host,{childList:true});
      window.__audreyTierIdempotencyObserver=observer;
    }
    dedupeTierSelector();
  }

  const API={version:VERSION,ready:false,source:'legacy-release-payload-source-v13.24.js',error:null,readyPromise:null,dedupeTierSelector,installTierIdempotencyGuard};
  API.readyPromise=(async()=>{
    const response=await fetch('./legacy-release-payload-source-v13.24.js?v=13.24-phase7a8c-source1',{cache:'no-store'});
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
    installTierIdempotencyGuard();
    API.ready=true;
    document.documentElement.dataset.audreyLegacyCompat='ready';
    document.documentElement.dataset.audreyTierIdempotent='true';
    console.info(`Audrey Closet ${VERSION} loaded: legacy release behavior active with Tier idempotency guard.`);
    return API;
  })().catch(err=>{
    API.error=String(err?.message||err);
    document.documentElement.dataset.audreyLegacyCompat='error';
    console.error('Audrey v13.24.1 legacy compatibility payload failed',err);
    throw err;
  });
  window.AUDREY_RELEASE_COMPAT=API;
})();
