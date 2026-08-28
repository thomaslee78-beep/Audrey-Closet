/* Audrey Closet v13.23 — production release bootstrap
 * Keeps the accepted share renderer synchronous, then loads the accepted
 * Decorate/Draw/Focus runtime after the existing Shape stack has finished.
 */
(function(){
  'use strict';

  document.write('<script src="share-render-v13.21-dev12-core.js?v=13.23-release"><\/script>');

  const modules=[
    'draw-studio-v13.22-dev10.js?v=13.23-release',
    'draw-studio-v13.22-dev11.js?v=13.23-release',
    'draw-studio-v13.22-dev12.js?v=13.23-release',
    'draw-studio-v13.22-dev13.js?v=13.23-release',
    'draw-studio-v13.22-dev14.js?v=13.23-release',
    'draw-studio-v13.22-dev15.js?v=13.23-release',
    'draw-studio-v13.22-dev16.js?v=13.23-release',
    'draw-studio-v13.22-dev17.js?v=13.23-release',
    'board-focus-v13.22-dev1.js?v=13.23-release',
    'board-focus-v13.22-dev2.js?v=13.23-release',
    'board-focus-v13.22-dev7.js?v=13.23-release',
    'board-focus-v13.22-dev10.js?v=13.23-release',
    'sticker-studio-v13.22-release.js?v=13.23-release',
    'decorate-rail-v13.22-proto1.js?v=13.23-release',
    'decorate-function-layout-v13.22-proto1.js?v=13.23-release',
    'share-export-compat-v13.22-dev1.js?v=13.23-release'
  ];

  function loadSequentially(){
    if(window.__audreyReleaseV1323Bootstrapped)return;
    window.__audreyReleaseV1323Bootstrapped=true;
    let chain=Promise.resolve();
    modules.forEach(src=>{
      chain=chain.then(()=>new Promise((resolve,reject)=>{
        const s=document.createElement('script');
        s.src=src;
        s.async=false;
        s.onload=resolve;
        s.onerror=()=>reject(new Error('Failed to load '+src));
        document.body.appendChild(s);
      }));
    });
    chain.catch(err=>console.error('Audrey v13.23 release bootstrap failed',err));
  }

  if(document.readyState==='complete')loadSequentially();
  else window.addEventListener('load',loadSequentially,{once:true});
})();
