/* Audrey Closet v13.22 Sticker Studio dev7c image core
 * Clean direct-image architecture proof:
 * - generic type:image + src handling for PNG/JPG/SVG stickers
 * - no sprite dependency
 * - no legacy dev6 asset remapping
 * - preserves glyph stickers untouched
 * Intended foundation for future user-uploaded sticker packs.
 */
(function(){
  'use strict';

  const STYLE_ID='stickerStudioV1322Dev7cImageCoreStyles';
  const GUITAR_ASSET='assets/stickers/music/guitar-sketch-dev7c-test.png';
  let rendererWrapped=false;

  function registry(){return window.AUDREY_STICKER_PACKS_V1}
  function activePack(){
    const id=document.querySelector('#stickerStudioV1322Dev1 .sticker-pack-btn.active')?.dataset.pack||'standard';
    return registry()?.packs?.find(pack=>pack.id===id)||null;
  }
  function escAttr(value){return String(value??'').replace(/[&"'<>]/g,ch=>({'&':'&amp;','"':'&quot;',"'":'&#39;','<':'&lt;','>':'&gt;'}[ch]))}

  function installStyles(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      .screen[data-screen="outfits"] #stickerStudioV1322Dev1 .sticker-preview.sticker-image-preview-dev7c-core{
        width:100%!important;height:100%!important;padding:4px!important;box-sizing:border-box!important;
      }
      .screen[data-screen="outfits"] #stickerStudioV1322Dev1 .sticker-preview.sticker-image-preview-dev7c-core img{
        display:block;width:100%;height:100%;object-fit:contain;pointer-events:none;user-select:none;-webkit-user-drag:none;
        filter:drop-shadow(0 1px 1px rgba(72,54,44,.08));
      }
      .screen[data-screen="outfits"] #outfitBoard .board-sticker-image-dev7c-core{
        width:100%!important;height:100%!important;display:grid!important;place-items:center!important;
        overflow:visible!important;box-sizing:border-box!important;
      }
      .screen[data-screen="outfits"] #outfitBoard .board-sticker-image-dev7c-core img{
        display:block;width:100%;height:100%;object-fit:contain;pointer-events:none;user-select:none;-webkit-user-drag:none;
      }
      .screen[data-screen="outfits"] #outfitBoard .board-sticker-image-dev7c-core.sticker-outline-dev7c-core img{
        filter:
          drop-shadow(2px 0 0 #fff) drop-shadow(-2px 0 0 #fff)
          drop-shadow(0 2px 0 #fff) drop-shadow(0 -2px 0 #fff)
          drop-shadow(1.5px 1.5px 0 #fff) drop-shadow(-1.5px -1.5px 0 #fff)
          drop-shadow(-1.5px 1.5px 0 #fff) drop-shadow(1.5px -1.5px 0 #fff)!important;
      }
    `;
    document.head.appendChild(style);
  }

  function configureMusicProof(){
    const music=registry()?.packs?.find(pack=>pack.id==='music');
    const guitar=music?.stickers?.find(sticker=>sticker.id==='guitar');
    if(!guitar)return false;
    guitar.type='image';
    guitar.src=GUITAR_ASSET;
    guitar.alt='Hand-drawn blue Stratocaster-style guitar sticker';
    guitar.sizeClass='medium';
    guitar.dev7cDirectPng=true;
    return true;
  }

  function mountPreview(preview,sticker,tile){
    let img=preview.querySelector(':scope > img[data-dev7c-image-core="1"]');
    if(!img){
      preview.textContent='';
      preview.classList.remove('sticker-image-preview-dev6');
      preview.classList.add('sticker-image-preview-dev7c-core');
      img=document.createElement('img');
      img.dataset.dev7cImageCore='1';
      img.alt='';
      img.setAttribute('aria-hidden','true');
      img.decoding='async';
      img.draggable=false;
      preview.appendChild(img);
    }
    if(img.getAttribute('src')!==sticker.src)img.setAttribute('src',sticker.src);
    tile.dataset.stickerAsset='image';
    tile.dataset.sizeClass=sticker.sizeClass||'small';
  }

  function syncPicker(){
    const pack=activePack();
    if(!pack)return;
    const byId=Object.fromEntries((pack.stickers||[]).map(sticker=>[sticker.id,sticker]));
    document.querySelectorAll('#stickerStudioV1322Dev1 .sticker-tile[data-sticker-id]').forEach(tile=>{
      const sticker=byId[tile.dataset.stickerId];
      const preview=tile.querySelector('.sticker-preview');
      if(!sticker||!preview)return;
      if(sticker.type==='image'&&sticker.src){
        mountPreview(preview,sticker,tile);
      }else if(preview.classList.contains('sticker-image-preview-dev7c-core')){
        preview.classList.remove('sticker-image-preview-dev7c-core');
        preview.textContent=sticker.glyph||'';
        delete tile.dataset.stickerAsset;
      }
    });
  }

  function selectedBoardSticker(){
    try{return Array.isArray(boardItems)?boardItems.find(item=>item.uid===selectedBoardUid):null}catch(_){return null}
  }

  function enrichAddedSticker(tile){
    const pack=activePack();
    if(!pack||!tile)return false;
    const sticker=(pack.stickers||[]).find(item=>item.id===tile.dataset.stickerId);
    if(!sticker||sticker.type!=='image'||!sticker.src)return false;
    const item=selectedBoardSticker();
    if(!item||item.kind!=='sticker'||item.stickerId!==sticker.id)return false;
    if(item.stickerType==='image'&&item.stickerAssetSrc===sticker.src)return true;
    item.stickerType='image';
    item.stickerAssetSrc=sticker.src;
    item.stickerAssetAlt=sticker.alt||sticker.label||'Sticker';
    item.stickerSizeClass=sticker.sizeClass||item.stickerSizeClass||'small';
    if(typeof drawBoard==='function')drawBoard();
    return true;
  }

  function wrapBoardRenderer(){
    if(rendererWrapped||typeof boardItemContent!=='function')return;
    const original=boardItemContent;
    boardItemContent=function(b){
      if(b&&b.kind==='sticker'&&b.stickerType==='image'&&b.stickerAssetSrc){
        const outline=b.stickerOutline?' sticker-outline-dev7c-core':'';
        return `<div class="board-sticker-image-dev7c-core${outline}"><img src="${escAttr(b.stickerAssetSrc)}" alt="${escAttr(b.stickerAssetAlt||'Sticker')}" draggable="false" decoding="async"></div>`;
      }
      return original(b);
    };
    rendererWrapped=true;
    if(typeof drawBoard==='function')drawBoard();
  }

  function bindClicks(){
    if(document.documentElement.dataset.stickerDev7cImageCoreBound==='1')return;
    document.documentElement.dataset.stickerDev7cImageCoreBound='1';
    document.addEventListener('click',e=>{
      const target=e.target;
      if(!(target instanceof Element))return;
      const tile=target.closest('#stickerStudioV1322Dev1 .sticker-tile[data-sticker-id]');
      if(tile){
        setTimeout(()=>{
          if(!enrichAddedSticker(tile))setTimeout(()=>enrichAddedSticker(tile),45);
        },0);
      }
      if(target.closest('#stickerStudioV1322Dev1 .sticker-pack-btn,.decorate-studio-tab[data-decorate-group="stickers"],.board-workspace-tab[data-board-panel="decorate"]')){
        requestAnimationFrame(()=>requestAnimationFrame(syncPicker));
      }
    },false);
  }

  function reconcile(){
    installStyles();
    configureMusicProof();
    wrapBoardRenderer();
    syncPicker();
  }

  function start(){
    reconcile();
    bindClicks();
    window.addEventListener('pageshow',()=>requestAnimationFrame(reconcile));
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
