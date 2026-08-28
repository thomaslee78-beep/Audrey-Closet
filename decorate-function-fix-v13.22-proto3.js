/* Audrey Closet v13.22 Decorate Function fix proto3
 * Reverts Sticker Outline placement to the working below-browser layout.
 * Keeps all existing Sticker handlers intact.
 */
(function(){
  'use strict';
  const STYLE_ID='decorateFunctionFixProto3Styles';

  function installStyles(){
    if(document.getElementById(STYLE_ID))return;
    const s=document.createElement('style');
    s.id=STYLE_ID;
    s.textContent=`
      .screen[data-screen="outfits"] #stickerStudioV1322Release .sticker-pack-meta-proto2{display:contents!important}
      .screen[data-screen="outfits"] #stickerStudioV1322Release .sticker-outline-row.sticker-outline-below-proto3{
        display:flex!important;
        margin-top:2px!important;
        padding-top:5px!important;
        border-top:1px solid rgba(126,105,82,.12)!important;
      }
      .screen[data-screen="outfits"] #stickerStudioV1322Release .sticker-outline-row.sticker-outline-below-proto3 .sticker-outline-label{
        display:block!important;
      }
      .screen[data-screen="outfits"] #stickerStudioV1322Release .sticker-outline-row.sticker-outline-below-proto3 .sticker-outline-segment{
        padding:2px!important;
        border-radius:9px!important;
      }
      .screen[data-screen="outfits"] #stickerStudioV1322Release .sticker-outline-row.sticker-outline-below-proto3 .sticker-outline-btn{
        min-width:0!important;
        height:30px!important;
        padding:0 9px!important;
        border-radius:7px!important;
        font-size:8px!important;
      }
    `;
    document.head.appendChild(s);
  }

  function restoreStickerOutline(){
    const root=document.getElementById('stickerStudioV1322Release');if(!root)return false;
    const outline=root.querySelector('.sticker-outline-row');
    const browser=root.querySelector('.sticker-browser');
    if(!outline||!browser)return false;
    outline.classList.add('sticker-outline-below-proto3');
    outline.classList.remove('sticker-outline-below-proto1');
    const label=outline.querySelector('.sticker-outline-label');
    if(label)label.removeAttribute('aria-hidden');
    if(outline.previousElementSibling!==browser)browser.insertAdjacentElement('afterend',outline);
    return true;
  }

  function reconcile(){installStyles();restoreStickerOutline();}
  function schedule(){requestAnimationFrame(()=>requestAnimationFrame(reconcile));setTimeout(reconcile,100);}
  function start(){
    reconcile();[100,300,700,1200].forEach(ms=>setTimeout(reconcile,ms));
    document.addEventListener('click',e=>{
      const t=e.target;if(!(t instanceof Element))return;
      if(t.closest('.decorate-studio-tab[data-decorate-group="stickers"],.sticker-pack-btn,.board-workspace-tab[data-board-panel="decorate"],#decorateToggle'))schedule();
    },false);
    window.addEventListener('pageshow',schedule);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
