/* Audrey Closet v13.22 Sticker Studio dev0
 * Initial-paint guard for the Standard sticker pack.
 * Loads before dev1 so glyph placeholders never become visible before the final
 * Standard SVG images are mounted by dev6/dev7b.
 */
(function(){
  'use strict';

  const STYLE_ID='stickerStudioV1322Dev0Styles';
  const ROOT_ID='stickerStudioV1322Dev1';
  const EXPECTED_STANDARD=12;

  function installStyles(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      #${ROOT_ID}:not([data-standard-first-paint-ready="1"]) .sticker-pack-btn[data-pack="standard"].active ~ *{}
      #${ROOT_ID}:not([data-standard-first-paint-ready="1"]) .sticker-browser{visibility:hidden!important}
    `;
    document.head.appendChild(style);
  }

  function activePack(root){
    return root?.querySelector('.sticker-pack-btn.active[data-pack]')?.dataset.pack||'standard';
  }

  function standardImagesReady(root){
    if(!root)return false;
    const tiles=[...root.querySelectorAll('.sticker-browser .sticker-tile[data-sticker-id]')];
    if(tiles.length!==EXPECTED_STANDARD)return false;
    return tiles.every(tile=>{
      const img=tile.querySelector('.sticker-preview img');
      return !!img&&!!img.getAttribute('src');
    });
  }

  function reconcile(){
    const root=document.getElementById(ROOT_ID);
    if(!root)return;
    if(root.dataset.standardFirstPaintReady==='1')return;
    if(activePack(root)!=='standard'){
      root.dataset.standardFirstPaintReady='1';
      return;
    }
    if(standardImagesReady(root)){
      requestAnimationFrame(()=>{root.dataset.standardFirstPaintReady='1';});
    }
  }

  function start(){
    installStyles();
    const observer=new MutationObserver(reconcile);
    observer.observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['class','src','data-sticker-asset','data-standard-image-dev7b']});
    reconcile();
    window.addEventListener('pageshow',reconcile);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
