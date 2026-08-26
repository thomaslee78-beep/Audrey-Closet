/* Audrey Closet v13.22 Sticker Studio dev7c
 * Music art pass using the approved hand-drawn sticker sheet as the source.
 * Eleven Music stickers are cropped from one transparent sprite asset so the
 * picker and Board use the exact approved artwork rather than redrawn proxies.
 * Piano remains the existing placeholder because it was not in the approved sheet.
 */
(function(){
  'use strict';

  const STYLE_ID='stickerStudioV1322Dev7cStyles';
  const SPRITE='assets/stickers/music/music-sketch-sprite-dev7c.png';
  const MUSIC_SPRITES={
    'treble-clef':{col:0,row:0,alt:'Hand-drawn treble clef sticker',sizeClass:'small'},
    'bass-clef':{col:1,row:0,alt:'Hand-drawn bass clef sticker',sizeClass:'small'},
    'microphone':{col:2,row:0,alt:'Hand-drawn microphone sticker',sizeClass:'small'},
    'guitar':{col:3,row:0,alt:'Hand-drawn blue Stratocaster-style guitar sticker',sizeClass:'medium'},
    'notes':{col:0,row:1,alt:'Hand-drawn music note sticker',sizeClass:'small'},
    'double-notes':{col:1,row:1,alt:'Hand-drawn double eighth-note sticker',sizeClass:'small'},
    'drums':{col:2,row:1,alt:'Hand-drawn snare drum sticker',sizeClass:'medium'},
    'headphones':{col:3,row:1,alt:'Hand-drawn black headphones sticker',sizeClass:'medium'},
    'record':{col:0,row:2,alt:'Hand-drawn Technics-style turntable sticker',sizeClass:'medium'},
    'sheet':{col:1,row:2,alt:'Hand-drawn sheet music sticker',sizeClass:'medium'},
    'amp':{col:2,row:2,alt:'Hand-drawn Marshall-style amp stack sticker',sizeClass:'medium'}
  };

  let rendererWrapped=false;

  function registry(){return window.AUDREY_STICKER_PACKS_V1}
  function musicPack(){return registry()?.packs?.find(pack=>pack.id==='music')||null}
  function activePackId(){return document.querySelector('#stickerStudioV1322Dev1 .sticker-pack-btn.active')?.dataset.pack||'standard'}
  function escAttr(value){return String(value??'').replace(/[&"'<>]/g,ch=>({'&':'&amp;','"':'&quot;',"'":'&#39;','<':'&lt;','>':'&gt;'}[ch]))}

  function installStyles(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      .screen[data-screen="outfits"] #stickerStudioV1322Dev1 .sticker-tile[data-music-sketch-dev7c="1"] .sticker-preview{
        padding:3px!important;overflow:visible!important;
      }
      .sticker-sprite-crop-dev7c{
        position:relative;display:block;width:100%;height:100%;overflow:hidden;pointer-events:none;
      }
      .sticker-sprite-crop-dev7c>img{
        position:absolute;display:block;max-width:none!important;width:400%!important;height:300%!important;
        left:calc(var(--sprite-col) * -100%);top:calc(var(--sprite-row) * -100%);
        pointer-events:none;user-select:none;-webkit-user-drag:none;
      }
      .screen[data-screen="outfits"] #stickerStudioV1322Dev1 .sticker-tile[data-music-sketch-dev7c="1"] .sticker-sprite-crop-dev7c{
        filter:drop-shadow(0 1px 1px rgba(72,54,44,.10));
      }
      .screen[data-screen="outfits"] #outfitBoard .board-sticker-sprite-dev7c{
        width:100%!important;height:100%!important;display:grid!important;place-items:center!important;
        overflow:visible!important;box-sizing:border-box!important;
      }
      .screen[data-screen="outfits"] #outfitBoard .board-sticker-sprite-dev7c .sticker-sprite-crop-dev7c{
        width:100%;height:100%;
      }
      .screen[data-screen="outfits"] #outfitBoard .board-sticker-sprite-dev7c.sticker-outline-dev7c .sticker-sprite-crop-dev7c{
        filter:
          drop-shadow(2px 0 0 #fff) drop-shadow(-2px 0 0 #fff)
          drop-shadow(0 2px 0 #fff) drop-shadow(0 -2px 0 #fff)
          drop-shadow(1.5px 1.5px 0 #fff) drop-shadow(-1.5px -1.5px 0 #fff)
          drop-shadow(-1.5px 1.5px 0 #fff) drop-shadow(1.5px -1.5px 0 #fff)!important;
      }
    `;
    document.head.appendChild(style);
  }

  function applyRegistry(){
    const pack=musicPack();
    if(!pack)return false;
    (pack.stickers||[]).forEach(sticker=>{
      const sprite=MUSIC_SPRITES[sticker.id];
      if(!sprite)return;
      sticker.type='sprite';
      sticker.dev7cSprite=true;
      sticker.spriteSrc=SPRITE;
      sticker.spriteCol=sprite.col;
      sticker.spriteRow=sprite.row;
      sticker.alt=sprite.alt;
      sticker.sizeClass=sprite.sizeClass;
    });
    return true;
  }

  function cropMarkup(sticker,decorative){
    const alt=decorative?'':escAttr(sticker.alt||sticker.label||'Music sticker');
    const hidden=decorative?' aria-hidden="true"':'';
    return `<span class="sticker-sprite-crop-dev7c" style="--sprite-col:${Number(sticker.spriteCol)||0};--sprite-row:${Number(sticker.spriteRow)||0}"><img src="${SPRITE}" alt="${alt}"${hidden} draggable="false" decoding="async"></span>`;
  }

  function mountPreview(preview,sticker,tile){
    if(tile.dataset.musicSketchDev7c==='1'&&preview.querySelector('.sticker-sprite-crop-dev7c'))return;
    preview.classList.remove('sticker-image-preview-dev6');
    preview.textContent='';
    preview.insertAdjacentHTML('beforeend',cropMarkup(sticker,true));
    tile.dataset.musicSketchDev7c='1';
    tile.dataset.stickerAsset='sprite';
    tile.dataset.sizeClass=sticker.sizeClass||'small';
  }

  function syncPicker(){
    if(activePackId()!=='music')return;
    const pack=musicPack();
    if(!pack)return;
    const byId=Object.fromEntries((pack.stickers||[]).map(sticker=>[sticker.id,sticker]));
    document.querySelectorAll('#stickerStudioV1322Dev1 .sticker-tile[data-sticker-id]').forEach(tile=>{
      const sticker=byId[tile.dataset.stickerId];
      const preview=tile.querySelector('.sticker-preview');
      if(!sticker||!preview||sticker.type!=='sprite')return;
      mountPreview(preview,sticker,tile);
    });
  }

  function selectedBoardSticker(){
    try{return Array.isArray(boardItems)?boardItems.find(item=>item.uid===selectedBoardUid):null}catch(_){return null}
  }

  function enrichAddedSticker(tile){
    const pack=musicPack();
    if(!pack||!tile)return false;
    const sticker=(pack.stickers||[]).find(item=>item.id===tile.dataset.stickerId);
    if(!sticker||sticker.type!=='sprite')return false;
    const item=selectedBoardSticker();
    if(!item||item.kind!=='sticker'||item.stickerId!==sticker.id)return false;
    if(item.stickerType==='sprite'&&item.stickerSpriteCol===sticker.spriteCol&&item.stickerSpriteRow===sticker.spriteRow)return true;
    item.stickerType='sprite';
    item.stickerSpriteSrc=SPRITE;
    item.stickerSpriteCol=sticker.spriteCol;
    item.stickerSpriteRow=sticker.spriteRow;
    item.stickerAssetAlt=sticker.alt||sticker.label||'Music sticker';
    item.stickerSizeClass=sticker.sizeClass||item.stickerSizeClass||'small';
    if(typeof drawBoard==='function')drawBoard();
    return true;
  }

  function wrapBoardRenderer(){
    if(rendererWrapped||typeof boardItemContent!=='function')return;
    const original=boardItemContent;
    boardItemContent=function(b){
      if(b&&b.kind==='sticker'&&b.stickerType==='sprite'&&Number.isFinite(Number(b.stickerSpriteCol))&&Number.isFinite(Number(b.stickerSpriteRow))){
        const outline=b.stickerOutline?' sticker-outline-dev7c':'';
        const sticker={
          spriteCol:Number(b.stickerSpriteCol),spriteRow:Number(b.stickerSpriteRow),
          alt:b.stickerAssetAlt||'Music sticker'
        };
        return `<div class="board-sticker-sprite-dev7c${outline}">${cropMarkup(sticker,false)}</div>`;
      }
      return original(b);
    };
    rendererWrapped=true;
    if(typeof drawBoard==='function')drawBoard();
  }

  function bindClicks(){
    if(document.documentElement.dataset.stickerDev7cBound==='1')return;
    document.documentElement.dataset.stickerDev7cBound='1';
    document.addEventListener('click',e=>{
      const target=e.target;
      if(!(target instanceof Element))return;
      const tile=target.closest('#stickerStudioV1322Dev1 .sticker-tile[data-sticker-id]');
      if(tile&&MUSIC_SPRITES[tile.dataset.stickerId]){
        setTimeout(()=>{
          if(!enrichAddedSticker(tile))setTimeout(()=>enrichAddedSticker(tile),45);
        },0);
      }
      if(target.closest('#stickerStudioV1322Dev1 .sticker-pack-btn[data-pack="music"],.decorate-studio-tab[data-decorate-group="stickers"],.board-workspace-tab[data-board-panel="decorate"]'))schedule();
    },false);
  }

  function reconcile(){
    installStyles();
    if(!applyRegistry())return;
    wrapBoardRenderer();
    syncPicker();
  }

  function schedule(){
    requestAnimationFrame(()=>requestAnimationFrame(reconcile));
    setTimeout(reconcile,45);
  }

  function start(){
    reconcile();
    bindClicks();
    window.addEventListener('pageshow',schedule);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
