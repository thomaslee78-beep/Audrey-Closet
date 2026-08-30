/* Audrey Closet v13.23.6.3 — production release bootstrap
 * Loads high-fidelity Share, shared Text Layout, accepted Decorate/Draw/Focus
 * runtime, Sticker compatibility, scaled full-size Portfolio Mini Fidelity,
 * accepted Photo Studio/upload bug fixes, and Share modal scroll locking.
 */
(function(){
  'use strict';

  const HOTFIX='13.23.6.3-photo-fixes';
  const BG_PREVIEW='13.23-bg-phase2b-fix1';
  document.write('<script src="share-render-v13.21-dev12-core.js?v='+HOTFIX+'"><\/script>');

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
    'board-text-layout-v13.23.5.js?v='+HOTFIX,
    'sticker-studio-v13.22-release.js?v='+HOTFIX,
    'sticker-render-compat-v13.23.1.js?v='+HOTFIX,
    'portfolio-mini-fidelity-v13.23.6.2.js?v='+HOTFIX,
    'decorate-rail-v13.22-proto1.js?v=13.23-release',
    'decorate-function-layout-v13.22-proto1.js?v=13.23-release',
    'share-export-compat-v13.22-dev1.js?v=13.23-release',
    'photo-studio-bugfix-v13.23.6.3.js?v='+HOTFIX,
    'photo-upload-v13.23.6.3.js?v='+HOTFIX,
    'photo-cutout-methods-v13.23-preview1.js?v='+BG_PREVIEW,
    'photo-cutout-method-persist-v13.23-preview2.js?v='+BG_PREVIEW,
    'photo-garment-guide-v13.23-preview2b.js?v='+BG_PREVIEW,
    'photo-garment-guide-phase2b-persist-fix-v13.23.js?v='+BG_PREVIEW,
    'share-modal-lock-v13.23.3.js?v='+HOTFIX
  ];

  const releaseAssets=[
    'share-render-v13.21-dev12-core.js?v='+HOTFIX,
    ...modules,
    'assets/stickers/fashion/button-sewing.svg','assets/stickers/fashion/fabric-swatch-floral.svg','assets/stickers/fashion/hanger-wood.svg','assets/stickers/fashion/necklace-pendant.svg',
    'assets/stickers/music/amp-stack.svg','assets/stickers/music/headphones.svg','assets/stickers/music/record.svg','assets/stickers/music/sheet-music.svg',
    'assets/stickers/standard/butterfly-cartoon.svg','assets/stickers/standard/cloud-puffy.svg','assets/stickers/standard/diamond-blue.svg','assets/stickers/standard/flower-detailed.svg','assets/stickers/standard/happy-day.svg','assets/stickers/standard/heart-pop.svg','assets/stickers/standard/lightning-triple.svg','assets/stickers/standard/moon-crescent.svg','assets/stickers/standard/rainbow-soft.svg','assets/stickers/standard/sparkle-burst.svg','assets/stickers/standard/star-burst.svg','assets/stickers/standard/sun-happy.svg'
  ];

  function warmReleaseCache(){if(!('caches' in window))return Promise.resolve();return caches.open('audrey-closet-v13.22-dev26').then(cache=>Promise.allSettled(releaseAssets.map(asset=>cache.add(asset)))).catch(err=>console.warn('Audrey v13.23.6.3 release cache warm skipped',err));}
  function loadSequentially(){if(window.__audreyReleaseV1323Bootstrapped)return;window.__audreyReleaseV1323Bootstrapped=true;let chain=Promise.resolve();modules.forEach(src=>{chain=chain.then(()=>new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src;s.async=false;s.onload=resolve;s.onerror=()=>reject(new Error('Failed to load '+src));document.body.appendChild(s);}));});chain.then(warmReleaseCache).catch(err=>console.error('Audrey v13.23.6.3 release bootstrap failed',err));}
  if(document.readyState==='complete')loadSequentially();else window.addEventListener('load',loadSequentially,{once:true});
})();
