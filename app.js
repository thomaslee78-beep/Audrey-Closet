/* Audrey Closet — v13.20-dev20 bootstrap
 *
 * Keep the known-good dev12 application core immutable while the dev20 Text
 * architecture is evaluated. The existing service worker still appends the
 * current Board/Decorate patch to this entry file. Once that patch has finished
 * executing, Text Studio v2 loads as the final Text controller/renderer layer.
 */
(function(){
  'use strict';

  // Parser-blocking load keeps the original classic-script globals available to
  // the service-worker patch that is appended immediately after this bootstrap.
  document.write('<script src="./app-core-v13.20-dev12.js"><\/script>');

  // The service-worker patch executes synchronously after this file. Defer v2 by
  // one task so it installs only after Board + Decorate Studio are fully defined.
  setTimeout(function(){
    if(window.__audreyTextStudioV2)return;
    const script=document.createElement('script');
    script.src='./text-studio-v2.js?v13.20-dev20';
    script.dataset.textStudioV2='true';
    script.onerror=function(){console.error('Text Studio v2 failed to load');};
    document.head.appendChild(script);
  },0);
})();
