/* Audrey Closet v13.22 Sticker Studio dev6
 * First real sticker asset proof-of-concept over dev1-dev5.
 * - six transparent SVG stickers across Standard + Music
 * - registry stays backward-compatible with glyph fallbacks
 * - picker previews render image assets where available
 * - Board objects remember asset metadata and render scalable images
 * - white outline works on image silhouettes via drop-shadow halo
 */
(function(){
  'use strict';

  const STYLE_ID='stickerStudioV1322Dev6Styles';
  const ASSETS={
    standard:{
      heart:{src:'assets/stickers/standard/heart-pop.svg',alt:'Pink heart sticker'},
      star:{src:'assets/stickers/standard/star-burst.svg',alt:'Golden star sticker'},
      rainbow:{src:'assets/stickers/standard/rainbow-soft.svg',alt:'Soft rainbow sticker'}
    },
    music:{
      guitar:{src:'assets/stickers/music/guitar-electric.svg',alt:'Electric guitar sticker'},
      headphones:{src:'assets/stickers/music/headphones.svg',alt:'Headphones sticker'},
      record:{src:'assets/stickers/music/record.svg',alt:'Vinyl record sticker'}
    }
  };

  let rendererWrapped=false;

  function registry(){return window.AUDREY_STICKER_PACKS_V1}
  function escAttr(value){return String(value??'').replace(/[&"'<>]/g,ch=>({'&':'&amp;','"':'&quot;',"'":'&#39;','<':'&lt;','>':'&gt;'}[ch]))}

  function installStyles(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      .screen[data-screen="outfits"] #stickerStudioV1322Dev1 .sticker-preview.sticker-image-preview-dev6{
        width:100%!important;height:100%!important;padding:4px!important;box-sizing:border-box!important;
      }
      .screen[data-screen="outfits"] #stickerStudioV1322Dev1 .sticker-preview.sticker-image-preview-dev6 img{
        display:block;width:100%;height:100%;object-fit:contain;pointer-events:none;
        filter:drop-shadow(0 1px 1px rgba(72,54,44,.08));
      }
      .screen[data-screen="outfits"] #stickerStudioV1322Dev1 .sticker-tile[data-size-class="small"] .sticker-preview.sticker-image-preview-dev6{
        width:46px!important;height:42px!important;
      }
      .screen[data-screen="outfits"] #stickerStudioV1322Dev1 .sticker-tile[data-size-class="medium"] .sticker-preview.sticker-image-preview-dev6{
        width:112px!important;height:105px!important;
      }

      .screen[data-screen="outfits"] #outfitBoard .board-sticker.sticker-image-dev6{
        width:100%!important;height:100%!important;display:grid!important;place-items:center!important;
        overflow:visible!important;
      }
      .screen[data-screen="outfits"] #outfitBoard .board-sticker.sticker-image-dev6 img{
        display:block;width:100%;height:100%;object-fit:contain;pointer-events:none;user-select:none;-webkit-user-drag:none;
      }
      .screen[data-screen="outfits"] #outfitBoard .board-sticker.sticker-image-dev6.sticker-outline-dev6 img{
        filter:
          drop-shadow(2px 0 0 #fff) drop-shadow(-2px 0 0 #fff)
          drop-shadow(0 2px 0 #fff) drop-shadow(0 -2px 0 #fff)
          drop-shadow(1.5px 1.5px 0 #fff) drop-shadow(-1.5px -1.5px 0 #fff)
          drop-shadow(-1.5px 1.5px 0 #fff) drop-shadow(1.5px -1.5px 0 #fff)!important;
      }
      .screen[data-screen="outfits"] #outfitBoard .board-sticker.sticker-image-dev6.sticker-outline-dev3{
        text-shadow:none!important;
      }
    `;
    document.head.appendChild(style);
  }

  function applyAssetRegistry(){
    const reg=registry();
    if(!reg||!Array.isArray(reg.packs))return;
    reg.packs.forEach(pack=>{
      const packAssets=ASSETS[pack.id]||{};
      (pack.stickers||[]).forEach(sticker=>{
        const asset=packAssets[sticker.id];
        if(!asset)return;
        sticker.type='image';
        sticker.src=asset.src;
        sticker.alt=asset.alt;
      });
    });
  }

  function activePack(){
    const reg=registry();
    const activeId=document.querySelector('#stickerStudioV1322Dev1 .sticker-pack-btn.active')?.dataset.pack||'standard';
    return (reg?.packs||[]).find(pack=>pack.id===activeId);
  }

  function syncPickerAssets(){
    applyAssetRegistry();
    const pack=activePack();
    if(!pack)return;
    const byId=Object.fromEntries((pack.stickers||[]).map(sticker=>[sticker.id,sticker]));
    document.querySelectorAll('#stickerStudioV1322Dev1 .sticker-tile[data-sticker-id]').forEach(tile=>{
      const sticker=byId[tile.dataset.stickerId];
      const preview=tile.querySelector('.sticker-preview');
      if(!sticker||!preview)return;
      if(sticker.type==='image'&&sticker.src){
        preview.classList.add('sticker-image-preview-dev6');
        preview.innerHTML=`<img src="${escAttr(sticker.src)}" alt="" aria-hidden="true">`;
        tile.dataset.stickerAsset='image';
      }else{
        preview.classList.remove('sticker-image-preview-dev6');
        if(!preview.textContent)preview.textContent=sticker.glyph||'';
        delete tile.dataset.stickerAsset;
      }
    });
  }

  function selectedBoardSticker(){
    try{return Array.isArray(boardItems)?boardItems.find(item=>item.uid===selectedBoardUid):null}catch(_){return null}
  }

  function enrichAddedSticker(tile){
    const pack=activePack();
    if(!pack||!tile)return;
    const sticker=(pack.stickers||[]).find(item=>item.id===tile.dataset.stickerId);
    if(!sticker||sticker.type!=='image'||!sticker.src)return;
    const item=selectedBoardSticker();
    if(!item||item.kind!=='sticker'||item.stickerId!==sticker.id)return;
    item.stickerType='image';
    item.stickerAssetSrc=sticker.src;
    item.stickerAssetAlt=sticker.alt||sticker.label||'Sticker';
    if(typeof drawBoard==='function')drawBoard();
  }

  function wrapBoardRenderer(){
    if(rendererWrapped||typeof boardItemContent!=='function')return;
    const original=boardItemContent;
    boardItemContent=function(b){
      if(b&&b.kind==='sticker'&&b.stickerType==='image'&&b.stickerAssetSrc){
        const outline=b.stickerOutline?' sticker-outline-dev6':'';
        return `<div class="board-sticker sticker-image-dev6${outline}"><img src="${escAttr(b.stickerAssetSrc)}" alt="${escAttr(b.stickerAssetAlt||'Sticker')}" draggable="false"></div>`;
      }
      return original(b);
    };
    rendererWrapped=true;
    if(typeof drawBoard==='function')drawBoard();
  }

  function bindClicks(){
    if(document.documentElement.dataset.stickerDev6Bound==='1')return;
    document.documentElement.dataset.stickerDev6Bound='1';
    document.addEventListener('click',e=>{
      const target=e.target;
      if(!(target instanceof Element))return;
      const tile=target.closest('#stickerStudioV1322Dev1 .sticker-tile[data-sticker-id]');
      if(tile){
        setTimeout(()=>enrichAddedSticker(tile),20);
        setTimeout(()=>enrichAddedSticker(tile),90);
      }
      if(target.closest('#stickerStudioV1322Dev1 .sticker-pack-btn,.decorate-studio-tab[data-decorate-group="stickers"],.board-workspace-tab[data-board-panel="decorate"]'))schedule();
    },false);
  }

  function reconcile(){
    installStyles();
    applyAssetRegistry();
    wrapBoardRenderer();
    syncPickerAssets();
  }

  function schedule(){
    requestAnimationFrame(()=>requestAnimationFrame(reconcile));
    setTimeout(reconcile,55);
  }

  function start(){
    reconcile();
    bindClicks();
    window.addEventListener('pageshow',schedule);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
