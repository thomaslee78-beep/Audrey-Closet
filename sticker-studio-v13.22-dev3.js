/* Audrey Closet v13.22 Sticker Studio dev3
 * Sticker-specific behavior over dev1 + dev2:
 * - Outline: Off / White session control
 * - white sticker-like halo on Board sticker objects
 * - distinct default Board sizes for small vs medium stickers
 * - slightly stronger add feedback without blocking the picker
 */
(function(){
  'use strict';

  const STYLE_ID='stickerStudioV1322Dev3Styles';
  const CONTROL_ID='stickerOutlineControlDev3';
  const SMALL_BOARD_SIZE=84;
  const MEDIUM_BOARD_SIZE=118;
  let outlineEnabled=false;
  let boardRendererWrapped=false;

  function root(){return document.getElementById('stickerStudioV1322Dev1')}
  function selectedSticker(){
    try{return Array.isArray(boardItems)?boardItems.find(x=>x.uid===selectedBoardUid):null}catch(_){return null}
  }

  function installStyles(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      .screen[data-screen="outfits"] #stickerStudioV1322Dev1 .sticker-outline-row{
        display:flex;align-items:center;justify-content:space-between;gap:10px;
        padding:4px 2px 2px;
      }
      .screen[data-screen="outfits"] #stickerStudioV1322Dev1 .sticker-outline-label{
        display:grid;gap:1px;min-width:0;
      }
      .screen[data-screen="outfits"] #stickerStudioV1322Dev1 .sticker-outline-label strong{
        font-size:10px;line-height:1.1;color:var(--ink);font-weight:800;
      }
      .screen[data-screen="outfits"] #stickerStudioV1322Dev1 .sticker-outline-label small{
        font-size:8px;line-height:1.2;color:#817568;
      }
      .screen[data-screen="outfits"] #stickerStudioV1322Dev1 .sticker-outline-segment{
        display:inline-flex;align-items:center;padding:2px;border:1px solid rgba(108,81,66,.15);
        border-radius:10px;background:rgba(255,250,240,.82);flex:0 0 auto;
      }
      .screen[data-screen="outfits"] #stickerStudioV1322Dev1 .sticker-outline-btn{
        min-width:48px;height:28px;padding:0 9px;border:0;border-radius:8px;background:transparent;
        color:#74695d;font:800 9px/1 var(--sans);-webkit-tap-highlight-color:transparent;
      }
      .screen[data-screen="outfits"] #stickerStudioV1322Dev1 .sticker-outline-btn.active{
        background:var(--olive);color:white;box-shadow:0 1px 4px rgba(63,73,55,.14);
      }
      .screen[data-screen="outfits"] #stickerStudioV1322Dev1 .sticker-tile.adding-dev3{
        animation:stickerPickDev3 .28s ease-out;
        border-color:rgba(102,113,90,.42)!important;
        background:#fffaf0!important;
      }
      @keyframes stickerPickDev3{
        0%{transform:scale(1)}
        46%{transform:scale(.93)}
        100%{transform:scale(1)}
      }

      /* White halo around the sticker artwork itself, never the Board object box. */
      .screen[data-screen="outfits"] #outfitBoard .board-sticker.sticker-outline-dev3{
        text-shadow:
          -2px 0 0 #fff,2px 0 0 #fff,0 -2px 0 #fff,0 2px 0 #fff,
          -1.5px -1.5px 0 #fff,1.5px -1.5px 0 #fff,-1.5px 1.5px 0 #fff,1.5px 1.5px 0 #fff,
          -3px 0 2px rgba(255,255,255,.96),3px 0 2px rgba(255,255,255,.96),
          0 -3px 2px rgba(255,255,255,.96),0 3px 2px rgba(255,255,255,.96)!important;
      }
    `;
    document.head.appendChild(style);
  }

  function renderControlState(){
    document.querySelectorAll(`#${CONTROL_ID} .sticker-outline-btn`).forEach(btn=>{
      const active=(btn.dataset.outline==='white')===outlineEnabled;
      btn.classList.toggle('active',active);
      btn.setAttribute('aria-pressed',active?'true':'false');
    });
  }

  function mountControls(){
    const studio=root();
    if(!studio||document.getElementById(CONTROL_ID))return;
    const head=studio.querySelector('.sticker-pack-head');
    const row=document.createElement('div');
    row.id=CONTROL_ID;
    row.className='sticker-outline-row';
    row.innerHTML=`
      <div class="sticker-outline-label"><strong>Sticker outline</strong><small>Add a white decal-style edge</small></div>
      <div class="sticker-outline-segment" role="group" aria-label="Sticker outline">
        <button type="button" class="sticker-outline-btn active" data-outline="off" aria-pressed="true">Off</button>
        <button type="button" class="sticker-outline-btn" data-outline="white" aria-pressed="false">White</button>
      </div>`;
    if(head)studio.insertBefore(row,head);
    else studio.prepend(row);
    row.querySelectorAll('.sticker-outline-btn').forEach(btn=>btn.addEventListener('click',()=>{
      outlineEnabled=btn.dataset.outline==='white';
      renderControlState();
    }));
    renderControlState();
  }

  function wrapBoardRenderer(){
    if(boardRendererWrapped||typeof boardItemContent!=='function')return;
    const original=boardItemContent;
    boardItemContent=function(b){
      const html=original(b);
      if(!b||b.kind!=='sticker'||!b.stickerOutline)return html;
      return String(html).replace('class="board-sticker"','class="board-sticker sticker-outline-dev3"');
    };
    boardRendererWrapped=true;
    if(typeof drawBoard==='function')drawBoard();
  }

  function applyNewStickerProperties(tile){
    const item=selectedSticker();
    if(!item||item.kind!=='sticker')return;
    const sizeClass=tile?.dataset.sizeClass||item.stickerSizeClass||'small';
    item.stickerSizeClass=sizeClass;
    item.stickerOutline=outlineEnabled;
    const target=sizeClass==='medium'?MEDIUM_BOARD_SIZE:SMALL_BOARD_SIZE;
    item.w=target;
    item.h=target;
    if(typeof drawBoard==='function')drawBoard();
  }

  function bindAddFeedback(){
    if(document.documentElement.dataset.stickerDev3Bound==='1')return;
    document.documentElement.dataset.stickerDev3Bound='1';
    document.addEventListener('click',e=>{
      const target=e.target;
      if(!(target instanceof Element))return;
      const tile=target.closest('#stickerStudioV1322Dev1 .sticker-tile[data-sticker-id]');
      if(!tile)return;
      tile.classList.add('adding-dev3');
      setTimeout(()=>tile.classList.remove('adding-dev3'),330);
      // dev1's own click handler creates/selects the Board item during this click.
      setTimeout(()=>applyNewStickerProperties(tile),0);
      setTimeout(()=>applyNewStickerProperties(tile),45);
    },false);
  }

  function reconcile(){
    installStyles();
    mountControls();
    wrapBoardRenderer();
  }

  function schedule(){
    requestAnimationFrame(()=>requestAnimationFrame(reconcile));
    setTimeout(reconcile,50);
  }

  function start(){
    reconcile();
    bindAddFeedback();
    document.addEventListener('click',e=>{
      const target=e.target;
      if(!(target instanceof Element))return;
      if(target.closest('.decorate-studio-tab[data-decorate-group="stickers"],.board-workspace-tab[data-board-panel="decorate"],#decorateToggle,#stickerStudioV1322Dev1 .sticker-pack-btn'))schedule();
    },false);
    window.addEventListener('pageshow',schedule);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
