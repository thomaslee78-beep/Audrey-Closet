/* Audrey Closet v13.24.3 — stable release entry shim
 * Preserves the historical index.html filename while handing off to the
 * source-authoritative v13.24 runtime, then installing validated Photo Studio
 * integrity/reopen guards without pulling in v13.25 feature work.
 */
(function(){
  'use strict';
  const ENTRY='13.24.3-photo-integrity1';
  if(!window.AUDREY_SMART_SCAN_SERVICE_CONFIG){
    window.AUDREY_SMART_SCAN_SERVICE_CONFIG={
      enabled:true,
      endpoint:'https://audrey-smartscan-api.thomaslee78.workers.dev',
      channel:'production',
      build:'13.24'
    };
  }
  window.AUDREY_RELEASE_ENTRY={version:ENTRY,target:'share-render-v13.24-release.js'};
  document.write('<script src="share-render-v13.24-release.js?v=13.24-phase7a8c-runtime1"><\/script>');
  document.write('<script src="photo-studio-reopen-snapshot-hotfix-v13.24.js?v=13.24.3-photo-integrity1"><\/script>');
  document.write('<script src="photo-studio-state-integrity-hotfix-v13.24.js?v=13.24.3-photo-integrity1"><\/script>');
  document.write('<script src="v13.25-item-studio-context-fix.js?v=13.24.3-photo-integrity1"><\/script>');
})();
