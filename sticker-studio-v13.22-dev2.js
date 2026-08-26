/* Audrey Closet v13.22 Sticker Studio dev2
 * Mixed-size dense sticker browser over dev1 architecture.
 * - small stickers occupy 1 grid cell
 * - medium stickers occupy 2x2 cells (about four small stickers)
 * - dense packing lets small tiles fill gaps around medium tiles
 * - rebalances pack size metadata so each pack mixes small + medium stickers
 * - removes the legacy Stickers placeholder above the new browser
 */
(function(){
  'use strict';

  const STYLE_ID='stickerStudioV1322Dev2Styles';

  const SIZE_OVERRIDES={
    standard:{heart:'small',diamond:'small',star:'small',happy:'medium',sparkle:'small',lightning:'small',flower:'medium',rainbow:'medium',cloud:'medium',sun:'small',moon:'small',butterfly:'medium'},
    music:{'treble-clef':'medium','bass-clef':'small',guitar:'medium',piano:'medium',drums:'medium',microphone:'small',notes:'small','double-notes':'small',headphones:'medium',record:'small',amp:'medium',sheet:'medium'},
    'cute-animals':{dog:'medium',cat:'medium',lion:'small',tiger:'medium',fish:'small',frog:'small',mouse:'small',bunny:'medium',bear:'medium',panda:'medium',fox:'small',penguin:'small'},
    fashion:{button:'small',pin:'small',swatch:'medium',watch:'small',necklace:'medium',sunglasses:'medium',bag:'medium',thread:'small',needle:'small',bow:'medium',shoe:'medium',hanger:'small'}
  };

  function registry(){return window.AUDREY_STICKER_PACKS_V1}

  function applyRegistrySizes(){
    const reg=registry();
    if(!reg||!Array.isArray(reg.packs))return false;
    reg.packs.forEach(pack=>{
      const overrides=SIZE_OVERRIDES[pack.id]||{};
      (pack.stickers||[]).forEach(sticker=>{
        if(overrides[sticker.id])sticker.sizeClass=overrides[sticker.id];
      });
    });
    return true;
  }

  function installStyles(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      .screen[data-screen="outfits"] .decorate-studio-panel[data-decorate-group="stickers"]{
        gap:0!important;
      }
      .screen[data-screen="outfits"] .decorate-studio-panel[data-decorate-group="stickers"]>.decorate-studio-content{
        margin-top:0!important;
        padding-top:0!important;
      }
      .screen[data-screen="outfits"] #stickerStudioV1322Dev1 .sticker-browser{
        display:grid!important;
        grid-template-columns:repeat(4,minmax(0,1fr))!important;
        grid-auto-flow:dense!important;
        grid-auto-rows:68px!important;
        gap:7px!important;
        align-items:stretch!important;
      }
      .screen[data-screen="outfits"] #stickerStudioV1322Dev1 .sticker-tile{
        min-height:0!important;
        height:auto!important;
        transform:none!important;
      }
      .screen[data-screen="outfits"] #stickerStudioV1322Dev1 .sticker-tile:nth-child(4n+2),
      .screen[data-screen="outfits"] #stickerStudioV1322Dev1 .sticker-tile:nth-child(4n+4){
        transform:none!important;
      }
      .screen[data-screen="outfits"] #stickerStudioV1322Dev1 .sticker-tile[data-size-class="small"]{
        grid-column:span 1!important;
        grid-row:span 1!important;
        padding:5px 3px 4px!important;
      }
      .screen[data-screen="outfits"] #stickerStudioV1322Dev1 .sticker-tile[data-size-class="medium"]{
        grid-column:span 2!important;
        grid-row:span 2!important;
        min-height:143px!important;
        padding:9px 7px 7px!important;
      }
      .screen[data-screen="outfits"] #stickerStudioV1322Dev1 .sticker-tile[data-size-class="small"] .sticker-preview{
        width:42px!important;
        height:38px!important;
        font-size:26px!important;
      }
      .screen[data-screen="outfits"] #stickerStudioV1322Dev1 .sticker-tile[data-size-class="medium"] .sticker-preview{
        width:86px!important;
        height:92px!important;
        font-size:54px!important;
      }
      .screen[data-screen="outfits"] #stickerStudioV1322Dev1 .sticker-tile[data-size-class="medium"] small{
        font-size:9px!important;
      }
      @media(max-width:370px){
        .screen[data-screen="outfits"] #stickerStudioV1322Dev1 .sticker-browser{
          grid-template-columns:repeat(4,minmax(0,1fr))!important;
          grid-auto-rows:62px!important;
          gap:6px!important;
        }
        .screen[data-screen="outfits"] #stickerStudioV1322Dev1 .sticker-tile[data-size-class="medium"]{
          min-height:130px!important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function stickerPanel(){
    return document.querySelector('.decorate-studio-panel[data-decorate-group="stickers"]');
  }

  function removeLegacyPlaceholder(){
    const panel=stickerPanel();
    if(!panel)return;
    const content=[...panel.children].find(child=>child.classList?.contains('decorate-studio-content'));
    if(!content)return;
    let node=content.previousElementSibling;
    while(node){
      const previous=node.previousElementSibling;
      node.style.display='none';
      node.setAttribute('aria-hidden','true');
      node=previous;
    }
  }

  function activePackId(){
    const active=document.querySelector('#stickerStudioV1322Dev1 .sticker-pack-btn.active');
    return active?.dataset.pack||'standard';
  }

  function syncRenderedSizes(){
    removeLegacyPlaceholder();
    applyRegistrySizes();
    const pack=(registry()?.packs||[]).find(x=>x.id===activePackId());
    if(!pack)return;
    const byId=Object.fromEntries((pack.stickers||[]).map(x=>[x.id,x]));
    document.querySelectorAll('#stickerStudioV1322Dev1 .sticker-tile[data-sticker-id]').forEach(tile=>{
      const sticker=byId[tile.dataset.stickerId];
      if(sticker)tile.dataset.sizeClass=sticker.sizeClass||'small';
    });
  }

  function scheduleSync(){
    requestAnimationFrame(()=>requestAnimationFrame(syncRenderedSizes));
    setTimeout(syncRenderedSizes,40);
  }

  function start(){
    installStyles();
    removeLegacyPlaceholder();
    applyRegistrySizes();
    scheduleSync();
    document.addEventListener('click',e=>{
      const t=e.target;
      if(!(t instanceof Element))return;
      if(t.closest('#stickerStudioV1322Dev1 .sticker-pack-btn,.decorate-studio-tab[data-decorate-group="stickers"],.board-workspace-tab[data-board-panel="decorate"]'))scheduleSync();
    },false);
    window.addEventListener('pageshow',scheduleSync);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
