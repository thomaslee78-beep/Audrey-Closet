/* Audrey Closet v13.22 Sticker Studio dev7c PNG proof
 * Narrow architecture test:
 * - no sprite renderer
 * - one standalone transparent PNG Music sticker (guitar)
 * - direct type:image + src path, same model intended for future user-uploaded PNG/JPG packs
 * - leaves all other Music items as existing placeholders
 */
(function(){
  'use strict';

  const STYLE_ID='stickerStudioV1322Dev7cPngTestStyles';
  const ASSET='assets/stickers/music/guitar-sketch-dev7c-test.png';
  const STICKER_ID='guitar';

  function registry(){return window.AUDREY_STICKER_PACKS_V1}
  function musicPack(){return registry()?.packs?.find(pack=>pack.id==='music')||null}
  function activePackId(){return document.querySelector('#stickerStudioV1322Dev1 .sticker-pack-btn.active')?.dataset.pack||'standard'}

  function installStyles(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      .screen[data-screen="outfits"] #stickerStudioV1322Dev1 .sticker-tile[data-sticker-id="guitar"] .sticker-preview{
        padding:3px!important;
      }
      .screen[data-screen="outfits"] #stickerStudioV1322Dev1 .sticker-tile[data-sticker-id="guitar"] .sticker-preview img[data-dev7c-png-test="1"]{
        display:block;width:100%;height:100%;object-fit:contain;pointer-events:none;user-select:none;-webkit-user-drag:none;
        filter:drop-shadow(0 1px 1px rgba(72,54,44,.10));
      }
    `;
    document.head.appendChild(style);
  }

  function setRegistry(){
    const pack=musicPack();
    if(!pack)return false;
    const sticker=(pack.stickers||[]).find(item=>item.id===STICKER_ID);
    if(!sticker)return false;
    sticker.type='image';
    sticker.src=ASSET;
    sticker.alt='Hand-drawn blue Stratocaster-style guitar sticker';
    sticker.sizeClass='medium';
    sticker.dev7cPngTest=true;
    return true;
  }

  function mountPicker(){
    if(activePackId()!=='music')return;
    const tile=document.querySelector('#stickerStudioV1322Dev1 .sticker-tile[data-sticker-id="guitar"]');
    const preview=tile?.querySelector('.sticker-preview');
    if(!tile||!preview)return;
    let img=preview.querySelector(':scope > img[data-dev7c-png-test="1"]');
    if(!img){
      preview.textContent='';
      preview.classList.add('sticker-image-preview-dev6');
      img=document.createElement('img');
      img.dataset.dev7cPngTest='1';
      img.alt='';
      img.setAttribute('aria-hidden','true');
      img.decoding='async';
      img.draggable=false;
      preview.appendChild(img);
    }
    if(img.getAttribute('src')!==ASSET)img.setAttribute('src',ASSET);
    tile.dataset.stickerAsset='image';
    tile.dataset.sizeClass='medium';
  }

  function selectedBoardSticker(){
    try{return Array.isArray(boardItems)?boardItems.find(item=>item.uid===selectedBoardUid):null}catch(_){return null}
  }

  function forceBoardAsset(){
    const item=selectedBoardSticker();
    if(!item||item.kind!=='sticker'||item.stickerId!==STICKER_ID||item.stickerPack!=='music')return false;
    if(item.stickerType==='image'&&item.stickerAssetSrc===ASSET)return true;
    item.stickerType='image';
    item.stickerAssetSrc=ASSET;
    item.stickerAssetAlt='Hand-drawn blue Stratocaster-style guitar sticker';
    item.stickerSizeClass='medium';
    if(typeof drawBoard==='function')drawBoard();
    return true;
  }

  function reconcile(){
    installStyles();
    if(!setRegistry())return;
    mountPicker();
  }

  function schedule(){
    reconcile();
    requestAnimationFrame(()=>requestAnimationFrame(reconcile));
    setTimeout(reconcile,60);
  }

  function start(){
    schedule();
    document.addEventListener('click',e=>{
      const target=e.target;
      if(!(target instanceof Element))return;
      const tile=target.closest('#stickerStudioV1322Dev1 .sticker-tile[data-sticker-id="guitar"]');
      if(tile){
        // dev1 creates the compatible Board object first. dev6 may also attempt
        // its old Music mapping at 0ms, so this proof deliberately wins last.
        setTimeout(forceBoardAsset,30);
        setTimeout(forceBoardAsset,90);
      }
      if(target.closest('#stickerStudioV1322Dev1 .sticker-pack-btn[data-pack="music"],.decorate-studio-tab[data-decorate-group="stickers"],.board-workspace-tab[data-board-panel="decorate"]'))schedule();
    },false);
    window.addEventListener('pageshow',schedule);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
