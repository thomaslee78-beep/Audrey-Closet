/* Audrey Closet v13.22 Sticker Studio dev7b
 * Completes illustrated artwork for the Standard sticker pack.
 * Stabilized for release candidate: registry assets are seeded once and
 * existing preview image nodes are reused without redundant scheduled remounts.
 */
(function(){
  'use strict';

  const STYLE_ID='stickerStudioV1322Dev7bStyles';
  const STANDARD_ASSETS={
    heart:{src:'assets/stickers/standard/heart-pop.svg',alt:'Pink heart sticker'},
    diamond:{src:'assets/stickers/standard/diamond-blue.svg',alt:'Blue diamond with sparkle sticker'},
    star:{src:'assets/stickers/standard/star-burst.svg',alt:'Golden star sticker'},
    happy:{src:'assets/stickers/standard/happy-day.svg',alt:'Happy face sticker'},
    sparkle:{src:'assets/stickers/standard/sparkle-burst.svg',alt:'Multidimensional sparkle burst sticker'},
    lightning:{src:'assets/stickers/standard/lightning-triple.svg',alt:'Three-prong yellow lightning sticker'},
    flower:{src:'assets/stickers/standard/flower-detailed.svg',alt:'Detailed pink flower sticker'},
    rainbow:{src:'assets/stickers/standard/rainbow-soft.svg',alt:'Six-color rainbow sticker'},
    cloud:{src:'assets/stickers/standard/cloud-puffy.svg',alt:'White puffy cloud sticker'},
    sun:{src:'assets/stickers/standard/sun-happy.svg',alt:'Cartoon sun sticker'},
    moon:{src:'assets/stickers/standard/moon-crescent.svg',alt:'Crescent moon sticker'},
    butterfly:{src:'assets/stickers/standard/butterfly-cartoon.svg',alt:'Cartoon butterfly sticker'}
  };

  let registrySeeded=false;

  function registry(){return window.AUDREY_STICKER_PACKS_V1}
  function standardPack(){return registry()?.packs?.find(pack=>pack.id==='standard')||null}

  function installStyles(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      .screen[data-screen="outfits"] #stickerStudioV1322Dev1 .sticker-tile[data-standard-image-dev7b="1"] .sticker-preview{padding:3px!important}
      .screen[data-screen="outfits"] #stickerStudioV1322Dev1 .sticker-tile[data-standard-image-dev7b="1"] .sticker-preview img{display:block;width:100%;height:100%;object-fit:contain;pointer-events:none;filter:drop-shadow(0 1px 1px rgba(72,54,44,.08))}
    `;
    document.head.appendChild(style);
  }

  function applyRegistryAssets(){
    if(registrySeeded)return true;
    const pack=standardPack();if(!pack)return false;
    (pack.stickers||[]).forEach(sticker=>{const asset=STANDARD_ASSETS[sticker.id];if(!asset)return;sticker.type='image';sticker.src=asset.src;sticker.alt=asset.alt;});
    registrySeeded=true;return true;
  }

  function activePackId(){return document.querySelector('#stickerStudioV1322Dev1 .sticker-pack-btn.active')?.dataset.pack||'standard'}

  function mountPreview(preview,sticker,tile){
    const rendered=tile.dataset.standardRenderedSrc||'';
    let img=preview.querySelector(':scope > img[data-sticker-dev7b-image="1"]');
    if(img&&rendered===sticker.src&&img.getAttribute('src')===sticker.src)return;
    if(!img){preview.textContent='';img=document.createElement('img');img.dataset.stickerDev7bImage='1';img.alt='';img.setAttribute('aria-hidden','true');img.decoding='async';preview.appendChild(img);}
    if(img.getAttribute('src')!==sticker.src)img.setAttribute('src',sticker.src);
    preview.classList.add('sticker-image-preview-dev6');tile.dataset.stickerAsset='image';tile.dataset.standardImageDev7b='1';tile.dataset.standardRenderedSrc=sticker.src;
  }

  function syncStandardPicker(){
    if(activePackId()!=='standard')return;
    const pack=standardPack();if(!pack)return;
    const byId=Object.fromEntries((pack.stickers||[]).map(sticker=>[sticker.id,sticker]));
    document.querySelectorAll('#stickerStudioV1322Dev1 .sticker-tile[data-sticker-id]').forEach(tile=>{const sticker=byId[tile.dataset.stickerId],preview=tile.querySelector('.sticker-preview');if(!sticker||!preview||sticker.type!=='image'||!sticker.src)return;mountPreview(preview,sticker,tile);});
  }

  function reconcile(){installStyles();if(!applyRegistryAssets())return;syncStandardPicker();}
  function schedule(){requestAnimationFrame(()=>requestAnimationFrame(reconcile));}

  function start(){
    reconcile();
    document.addEventListener('click',e=>{
      const target=e.target;if(!(target instanceof Element))return;
      const standardBtn=target.closest('#stickerStudioV1322Dev1 .sticker-pack-btn[data-pack="standard"]');
      if(standardBtn){
        // dev1 owns pack switching. Let it rebuild once, then remount images once.
        // If Standard was already active, dev1 may still rebuild; one RAF pass is enough.
        schedule();return;
      }
      if(target.closest('.decorate-studio-tab[data-decorate-group="stickers"],.board-workspace-tab[data-board-panel="decorate"]'))schedule();
    },false);
    window.addEventListener('pageshow',schedule);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
