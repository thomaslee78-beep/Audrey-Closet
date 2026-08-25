/* Audrey Closet v13.22 Board Focus Mode dev6
 * Finalize the simplified scrolling model:
 * - only main Add Items / Tools / Decorate / Canvas row remains fixed
 * - Decorate sub-tabs and Canvas type row are ordinary content in the same scroller
 * - explicitly overrides dev3/dev4/dev5 sticky/flex rules that kept them pinned
 */
(function(){
  'use strict';

  const STYLE_ID='boardFocusDev6Styles';
  const FOCUS_CLASS='board-focus-active-dev1';

  function screen(){return document.querySelector('.screen[data-screen="outfits"]');}
  function focused(){return !!screen()?.classList.contains(FOCUS_CLASS);}
  function workspace(){return document.getElementById('boardWorkspace');}
  function activePanel(){return workspace()?.querySelector(':scope > .board-workspace-panel.active')||null;}

  function installStyles(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      /* Main selected panel remains the only vertical scroller. */
      .screen[data-screen="outfits"].${FOCUS_CLASS} #boardWorkspace>.board-workspace-panel.active{
        display:block!important;
        overflow-y:auto!important;
        overflow-x:hidden!important;
        -webkit-overflow-scrolling:touch!important;
        overscroll-behavior-y:none!important;
        touch-action:pan-y!important;
        min-height:0!important;
        padding:7px 5px calc(10px + env(safe-area-inset-bottom))!important;
        box-sizing:border-box!important;
      }

      /* Decorate nested tabs must scroll away with the content. */
      .screen[data-screen="outfits"].${FOCUS_CLASS} #boardWorkspace>.board-workspace-panel[data-board-panel="decorate"] .decorate-studio-tabs{
        position:static!important;
        top:auto!important;
        bottom:auto!important;
        inset:auto!important;
        z-index:auto!important;
        flex:none!important;
        margin:0 0 5px!important;
        padding:0!important;
        background:transparent!important;
        border:0!important;
        box-shadow:none!important;
        isolation:auto!important;
      }
      .screen[data-screen="outfits"].${FOCUS_CLASS} #boardWorkspace>.board-workspace-panel[data-board-panel="decorate"] .board-decorate-shell{
        display:grid!important;
        min-height:auto!important;
        height:auto!important;
        overflow:visible!important;
      }
      .screen[data-screen="outfits"].${FOCUS_CLASS} #boardWorkspace>.board-workspace-panel[data-board-panel="decorate"] .decorate-studio-panels{
        display:block!important;
        min-height:auto!important;
        height:auto!important;
        overflow:visible!important;
      }
      .screen[data-screen="outfits"].${FOCUS_CLASS} #boardWorkspace>.board-workspace-panel[data-board-panel="decorate"] .decorate-studio-panel.active{
        display:grid!important;
        min-height:auto!important;
        height:auto!important;
        overflow:visible!important;
        touch-action:auto!important;
      }

      /* Canvas type row must also scroll away with its controls. */
      .screen[data-screen="outfits"].${FOCUS_CLASS} #boardWorkspace>.board-workspace-panel[data-board-panel="canvas"] .canvas-category-row{
        position:static!important;
        top:auto!important;
        bottom:auto!important;
        inset:auto!important;
        z-index:auto!important;
        flex:none!important;
        margin:0 0 6px!important;
        padding:0 0 2px!important;
        background:transparent!important;
        border:0!important;
        box-shadow:none!important;
        isolation:auto!important;
      }
      .screen[data-screen="outfits"].${FOCUS_CLASS} #boardWorkspace>.board-workspace-panel[data-board-panel="canvas"] .board-canvas-shell{
        display:grid!important;
        min-height:auto!important;
        height:auto!important;
        overflow:visible!important;
      }
      .screen[data-screen="outfits"].${FOCUS_CLASS} #boardWorkspace>.board-workspace-panel[data-board-panel="canvas"] .canvas-scroll-body-dev3{
        display:contents!important;
        min-height:auto!important;
        height:auto!important;
        overflow:visible!important;
      }

      /* Drawing itself still owns Board touch gestures while armed. */
      .screen[data-screen="outfits"].${FOCUS_CLASS} #outfitBoard.draw-dev10-active{touch-action:none!important}
    `;
    document.head.appendChild(style);
  }

  function reconcile(){
    installStyles();
    if(!focused())return;
    const panel=activePanel();
    if(panel&&panel.scrollTop<0)panel.scrollTop=0;
    if(panel?.dataset.boardPanel==='decorate'){
      const drawTab=document.querySelector('.decorate-studio-tab[data-decorate-group="draw"]');
      const drawPanel=document.querySelector('.decorate-studio-panel[data-decorate-group="draw"]');
      if(drawTab?.classList.contains('active')&&drawPanel?.classList.contains('active'))window.dispatchEvent(new Event('pageshow'));
    }
  }

  function schedule(){
    requestAnimationFrame(()=>requestAnimationFrame(reconcile));
    setTimeout(reconcile,30);
    setTimeout(reconcile,100);
  }

  function start(){
    installStyles();
    schedule();
    document.addEventListener('click',e=>{
      const t=e.target;
      if(!(t instanceof Element))return;
      if(t.closest('.board-workspace-tab,.decorate-studio-tab,.canvas-category-chip,#boardFocusToggleDev1'))schedule();
    },true);
    window.addEventListener('pageshow',()=>setTimeout(reconcile,0));
    document.addEventListener('visibilitychange',()=>{if(!document.hidden)schedule();});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
