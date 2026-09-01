/* Audrey Closet v13.23.6.3 — production release bootstrap
 * Loads high-fidelity Share, shared Text Layout, accepted Decorate/Draw/Focus
 * runtime, Sticker compatibility, scaled full-size Portfolio Mini Fidelity,
 * accepted Photo Studio/upload bug fixes, final Cutout release candidate,
 * Photo Studio layout dev5 + Clean polish dev5a-dev5f + rail blend dev5h + Cutout dev6-dev6h + Adjust dev7 + Background dev8,
 * and Share modal scroll locking.
 */
(function(){
  'use strict';

  const HOTFIX='13.23.6.3-photo-fixes';
  const CUTOUT_RELEASE='13.23-cutout-release1';
  const PHOTO_STUDIO_LAYOUT='13.23-photo-studio-layout-dev8';
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
    'photo-cutout-methods-v13.23-preview1.js?v='+CUTOUT_RELEASE,
    'photo-cutout-state-v13.23-phase3a.js?v='+CUTOUT_RELEASE,
    'photo-cutout-workflow-v13.23-phase3b.js?v='+CUTOUT_RELEASE,
    'photo-cutout-pipeline-v13.23-phase3c.js?v='+CUTOUT_RELEASE,
    'photo-guided-lifecycle-v13.23-phase3c.js?v='+CUTOUT_RELEASE,
    'photo-cutout-save-restore-v13.23-phase3c.js?v='+CUTOUT_RELEASE,
    'photo-guided-manual-tools-v13.23-phase3c.js?v='+CUTOUT_RELEASE,
    'photo-garment-guides-v13.23-phase3d-a.js?v='+CUTOUT_RELEASE,
    'photo-garment-template-picker-v13.23-phase3d-b.js?v='+CUTOUT_RELEASE,
    'photo-cutout-ui-cleanup-v13.23.js?v='+CUTOUT_RELEASE,
    'photo-cutout-ui-cleanup-v13.23-iter2.js?v='+CUTOUT_RELEASE,
    'photo-studio-layout-v13.23-dev5.js?v='+PHOTO_STUDIO_LAYOUT,
    'photo-studio-clean-help-v13.23-dev5a.js?v='+PHOTO_STUDIO_LAYOUT,
    'photo-studio-clean-brush-v13.23-dev5b.js?v='+PHOTO_STUDIO_LAYOUT,
    'photo-studio-clean-brush-layout-v13.23-dev5c.js?v='+PHOTO_STUDIO_LAYOUT,
    'photo-studio-clean-brush-slider-v13.23-dev5d.js?v='+PHOTO_STUDIO_LAYOUT,
    'photo-studio-clean-status-v13.23-dev5e.js?v='+PHOTO_STUDIO_LAYOUT,
    'photo-studio-status-hide-v13.23-dev5f.js?v='+PHOTO_STUDIO_LAYOUT,
    'photo-studio-rail-blend-v13.23-dev5g.js?v='+PHOTO_STUDIO_LAYOUT,
    'photo-studio-cutout-switch-v13.23-dev6.js?v='+PHOTO_STUDIO_LAYOUT,
    'photo-studio-cutout-removal-v13.23-dev6a.js?v='+PHOTO_STUDIO_LAYOUT,
    'photo-studio-cutout-guided-layout-v13.23-dev6b.js?v='+PHOTO_STUDIO_LAYOUT,
    'photo-studio-cutout-surface-polish-v13.23-dev6f.js?v='+PHOTO_STUDIO_LAYOUT,
    'photo-studio-cutout-guide-settings-v13.23-dev6h.js?v='+PHOTO_STUDIO_LAYOUT,
    'photo-studio-adjust-sliders-v13.23-dev7.js?v='+PHOTO_STUDIO_LAYOUT,
    'photo-studio-background-palette-v13.23-dev8.js?v='+PHOTO_STUDIO_LAYOUT,
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
