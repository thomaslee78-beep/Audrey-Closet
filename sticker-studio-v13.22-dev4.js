/* Audrey Closet v13.22 Sticker Studio dev4
 * Refinement over dev1 + dev2 + dev3:
 * - sticker artwork scales with the Board object's resized container
 * - compact Outline control
 * - cohesive tinted sticker-sheet presentation
 */
(function(){
  'use strict';

  const STYLE_ID='stickerStudioV1322Dev4Styles';
  const observed=new WeakSet();
  let resizeObserver=null;

  function installStyles(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      /* Compact dev3 outline control into one quiet tool line. */
      .screen[data-screen="outfits"] #stickerStudioV1322Dev1 #stickerOutlineControlDev3{
        min-height:28px!important;
        padding:0 2px!important;
        margin:0!important;
        gap:6px!important;
        justify-content:flex-start!important;
      }
      .screen[data-screen="outfits"] #stickerStudioV1322Dev1 #stickerOutlineControlDev3 .sticker-outline-label{
        display:block!important;
        flex:0 0 auto!important;
      }
      .screen[data-screen="outfits"] #stickerStudioV1322Dev1 #stickerOutlineControlDev3 .sticker-outline-label strong{
        font-size:9px!important;
        line-height:24px!important;
        letter-spacing:.02em!important;
      }
      .screen[data-screen="outfits"] #stickerStudioV1322Dev1 #stickerOutlineControlDev3 .sticker-outline-label small{
        display:none!important;
      }
      .screen[data-screen="outfits"] #stickerStudioV1322Dev1 #stickerOutlineControlDev3 .sticker-outline-segment{
        padding:1px!important;
        border-radius:8px!important;
        background:rgba(255,255,255,.32)!important;
        border-color:rgba(102,113,90,.18)!important;
      }
      .screen[data-screen="outfits"] #stickerStudioV1322Dev1 #stickerOutlineControlDev3 .sticker-outline-btn{
        min-width:42px!important;
        height:23px!important;
        padding:0 7px!important;
        border-radius:7px!important;
        font-size:8px!important;
      }

      /* Make the whole pack read like one physical sticker sheet. */
      .screen[data-screen="outfits"] #stickerStudioV1322Dev1{
        background:linear-gradient(145deg,rgba(224,231,217,.94),rgba(235,230,215,.92))!important;
        border:1px solid rgba(102,113,90,.25)!important;
        box-shadow:inset 0 1px 0 rgba(255,255,255,.55),0 2px 6px rgba(82,62,51,.06)!important;
      }
      .screen[data-screen="outfits"] #stickerStudioV1322Dev1 .sticker-pack-strip{
        padding-bottom:2px!important;
      }
      .screen[data-screen="outfits"] #stickerStudioV1322Dev1 .sticker-pack-head{
        padding:1px 3px 0!important;
      }
      .screen[data-screen="outfits"] #stickerStudioV1322Dev1 .sticker-browser{
        padding:8px!important;
        border:1px solid rgba(102,113,90,.18)!important;
        border-radius:14px!important;
        background:rgba(217,226,211,.64)!important;
        box-shadow:inset 0 1px 2px rgba(72,82,65,.035)!important;
      }
      .screen[data-screen="outfits"] #stickerStudioV1322Dev1 .sticker-tile{
        background:rgba(255,255,255,.22)!important;
        border-color:rgba(96,107,88,.16)!important;
        box-shadow:none!important;
      }
      .screen[data-screen="outfits"] #stickerStudioV1322Dev1 .sticker-tile:active,
      .screen[data-screen="outfits"] #stickerStudioV1322Dev1 .sticker-tile.adding-dev3{
        background:rgba(255,255,255,.52)!important;
        border-color:rgba(96,107,88,.36)!important;
      }
      .screen[data-screen="outfits"] #stickerStudioV1322Dev1 .sticker-footnote{
        opacity:.72!important;
      }

      /* Board sticker content fills its object; JS below computes font size from the
         live object dimensions so pinch/resize scales the artwork as well as the box. */
      .screen[data-screen="outfits"] #outfitBoard .board-sticker{
        width:100%!important;
        height:100%!important;
        display:grid!important;
        place-items:center!important;
        line-height:1!important;
        box-sizing:border-box!important;
        transform-origin:center!important;
      }
    `;
    document.head.appendChild(style);
  }

  function stickerContainer(sticker){
    let node=sticker.parentElement;
    while(node&&node.id!=='outfitBoard'){
      const rect=node.getBoundingClientRect();
      if(rect.width>0&&rect.height>0&&node!==sticker)return node;
      node=node.parentElement;
    }
    return sticker.parentElement;
  }

  function sizeSticker(sticker){
    if(!(sticker instanceof HTMLElement))return;
    const box=stickerContainer(sticker);
    if(!box)return;
    const w=box.clientWidth||box.getBoundingClientRect().width;
    const h=box.clientHeight||box.getBoundingClientRect().height;
    const size=Math.max(18,Math.min(w,h)*0.72);
    sticker.style.fontSize=size+'px';
    sticker.style.setProperty('--sticker-dev4-size',size+'px');
  }

  function observeSticker(sticker){
    if(!(sticker instanceof HTMLElement)||observed.has(sticker))return;
    observed.add(sticker);
    sizeSticker(sticker);
    const box=stickerContainer(sticker);
    if(box&&resizeObserver)resizeObserver.observe(box);
  }

  function syncBoardStickers(){
    document.querySelectorAll('#outfitBoard .board-sticker').forEach(sticker=>{
      observeSticker(sticker);
      sizeSticker(sticker);
    });
  }

  function installResizeObserver(){
    if(resizeObserver||typeof ResizeObserver==='undefined')return;
    resizeObserver=new ResizeObserver(()=>requestAnimationFrame(syncBoardStickers));
  }

  function installBoardObserver(){
    const board=document.getElementById('outfitBoard');
    if(!board||board.dataset.stickerDev4Observer==='1')return;
    board.dataset.stickerDev4Observer='1';
    const observer=new MutationObserver(()=>requestAnimationFrame(syncBoardStickers));
    observer.observe(board,{childList:true,subtree:true,attributes:true,attributeFilter:['style','class']});
  }

  function reconcile(){
    installStyles();
    installResizeObserver();
    installBoardObserver();
    syncBoardStickers();
  }

  function schedule(){
    requestAnimationFrame(()=>requestAnimationFrame(reconcile));
    setTimeout(reconcile,60);
  }

  function start(){
    reconcile();
    document.addEventListener('pointermove',e=>{
      if(e.buttons)requestAnimationFrame(syncBoardStickers);
    },{passive:true});
    document.addEventListener('pointerup',schedule,{passive:true});
    document.addEventListener('click',e=>{
      const target=e.target;
      if(!(target instanceof Element))return;
      if(target.closest('#stickerStudioV1322Dev1,.decorate-studio-tab[data-decorate-group="stickers"],.board-workspace-tab[data-board-panel="decorate"]'))schedule();
    },false);
    window.addEventListener('resize',schedule,{passive:true});
    window.addEventListener('pageshow',schedule);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
