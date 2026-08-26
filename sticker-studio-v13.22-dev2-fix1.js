/* Audrey Closet v13.22 Sticker Studio dev2 fix1
 * Presentation-only cleanup: remove the legacy Stickers placeholder panel above
 * the new Sticker Studio while preserving the shared Decorate tab row.
 */
(function(){
  'use strict';

  const STYLE_ID='stickerStudioV1322Dev2Fix1Styles';

  function stickerPanel(){
    return document.querySelector('.decorate-studio-panel[data-decorate-group="stickers"]');
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
    `;
    document.head.appendChild(style);
  }

  function cleanup(){
    installStyles();
    const panel=stickerPanel();
    if(!panel)return;
    const content=[...panel.children].find(child=>child.classList?.contains('decorate-studio-content'));
    if(!content)return;

    // The old Sticker placeholder/introduction is rendered as a sibling above
    // the real content area. Hide only siblings before the content container.
    let node=content.previousElementSibling;
    while(node){
      const previous=node.previousElementSibling;
      node.style.display='none';
      node.setAttribute('aria-hidden','true');
      node=previous;
    }
  }

  function schedule(){
    requestAnimationFrame(()=>requestAnimationFrame(cleanup));
    setTimeout(cleanup,40);
  }

  function start(){
    schedule();
    document.addEventListener('click',e=>{
      const t=e.target;
      if(!(t instanceof Element))return;
      if(t.closest('.decorate-studio-tab[data-decorate-group="stickers"],.board-workspace-tab[data-board-panel="decorate"],#decorateToggle'))schedule();
    },false);
    window.addEventListener('pageshow',schedule);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
