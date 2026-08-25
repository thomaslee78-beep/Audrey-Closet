/* Audrey Closet v13.22 Board Focus Mode dev5
 * Simplifies Focus Mode scrolling after dev4 regressions.
 * Main workspace tabs remain fixed; each active workspace panel owns one natural scroller.
 * Decorate + Canvas nested menus scroll together with their content again.
 * Existing Draw/Shapes/Canvas engines remain untouched.
 */
(function(){
  'use strict';

  const STYLE_ID='boardFocusDev5Styles';
  const FOCUS_CLASS='board-focus-active-dev1';

  function screen(){return document.querySelector('.screen[data-screen="outfits"]');}
  function focused(){return !!screen()?.classList.contains(FOCUS_CLASS);}
  function workspace(){return document.getElementById('boardWorkspace');}
  function activePanel(){return workspace()?.querySelector('.board-workspace-panel.active')||null;}

  function installStyles(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      /* Main Focus hierarchy stays: fixed compose + board + main workspace tabs. */
      .screen[data-screen="outfits"].${FOCUS_CLASS} #boardFocusTrayDev1{
        display:flex!important;
        flex-direction:column!important;
        min-height:0!important;
        overflow:hidden!important;
      }
      .screen[data-screen="outfits"].${FOCUS_CLASS} #boardWorkspace{
        display:flex!important;
        flex-direction:column!important;
        flex:1 1 auto!important;
        min-height:0!important;
        overflow:hidden!important;
      }
      .screen[data-screen="outfits"].${FOCUS_CLASS} #boardWorkspace>.board-workspace-tabs{
        flex:0 0 auto!important;
        position:relative!important;
        top:auto!important;
        z-index:60!important;
        background:#e6dcc9!important;
      }

      /* Exactly one vertical scroller: the selected main workspace panel. */
      .screen[data-screen="outfits"].${FOCUS_CLASS} #boardWorkspace>.board-workspace-panel{
        display:none!important;
        flex:1 1 auto!important;
        min-height:0!important;
        height:auto!important;
        overflow:hidden!important;
        margin:0!important;
        background:#f1e7d5!important;
      }
      .screen[data-screen="outfits"].${FOCUS_CLASS} #boardWorkspace>.board-workspace-panel.active{
        display:block!important;
        overflow-y:auto!important;
        overflow-x:hidden!important;
        -webkit-overflow-scrolling:touch!important;
        overscroll-behavior-y:none!important;
        touch-action:pan-y!important;
        padding:7px 5px calc(10px + env(safe-area-inset-bottom))!important;
        box-sizing:border-box!important;
      }

      /* Undo dev3/dev4 nested fixed/scroller treatment for Decorate. */
      .screen[data-screen="outfits"].${FOCUS_CLASS} .board-workspace-panel[data-board-panel="decorate"].active{
        display:block!important;
        overflow-y:auto!important;
        padding:7px 5px calc(10px + env(safe-area-inset-bottom))!important;
      }
      .screen[data-screen="outfits"].${FOCUS_CLASS} .board-workspace-panel[data-board-panel="decorate"] .board-decorate-shell{
        display:grid!important;
        flex:none!important;
        min-height:0!important;
        overflow:visible!important;
        padding:7px!important;
      }
      .screen[data-screen="outfits"].${FOCUS_CLASS} .board-workspace-panel[data-board-panel="decorate"] .decorate-studio-tabs{
        position:sticky!important;
        top:0!important;
        z-index:50!important;
        margin:0!important;
        background:#e6dcc9!important;
        border-bottom:1px solid rgba(108,81,66,.12)!important;
      }
      .screen[data-screen="outfits"].${FOCUS_CLASS} .board-workspace-panel[data-board-panel="decorate"] .decorate-studio-panels{
        display:block!important;
        flex:none!important;
        min-height:0!important;
        height:auto!important;
        overflow:visible!important;
        padding:0!important;
      }
      .screen[data-screen="outfits"].${FOCUS_CLASS} .board-workspace-panel[data-board-panel="decorate"] .decorate-studio-panel{
        display:none!important;
        height:auto!important;
        min-height:0!important;
        overflow:visible!important;
        padding:0!important;
      }
      .screen[data-screen="outfits"].${FOCUS_CLASS} .board-workspace-panel[data-board-panel="decorate"] .decorate-studio-panel.active{
        display:grid!important;
        overflow:visible!important;
        touch-action:auto!important;
      }
      .screen[data-screen="outfits"].${FOCUS_CLASS} .board-workspace-panel[data-board-panel="decorate"] .decorate-studio-content,
      .screen[data-screen="outfits"].${FOCUS_CLASS} .board-workspace-panel[data-board-panel="decorate"] #drawStudioDev10,
      .screen[data-screen="outfits"].${FOCUS_CLASS} .board-workspace-panel[data-board-panel="decorate"] #shapeStudioV132201{
        overflow:visible!important;
        max-height:none!important;
        height:auto!important;
      }

      /* Undo nested Canvas scroll body. Canvas type row + options scroll as one panel. */
      .screen[data-screen="outfits"].${FOCUS_CLASS} .board-workspace-panel[data-board-panel="canvas"].active{
        display:block!important;
        overflow-y:auto!important;
        padding:7px 5px calc(10px + env(safe-area-inset-bottom))!important;
      }
      .screen[data-screen="outfits"].${FOCUS_CLASS} .board-workspace-panel[data-board-panel="canvas"] .board-canvas-shell{
        display:grid!important;
        flex:none!important;
        min-height:0!important;
        overflow:visible!important;
        padding:9px 7px 12px!important;
      }
      .screen[data-screen="outfits"].${FOCUS_CLASS} .board-workspace-panel[data-board-panel="canvas"] .canvas-category-row{
        position:sticky!important;
        top:0!important;
        z-index:50!important;
        margin:0!important;
        background:#e6dcc9!important;
        border-bottom:1px solid rgba(108,81,66,.12)!important;
      }
      .screen[data-screen="outfits"].${FOCUS_CLASS} .board-workspace-panel[data-board-panel="canvas"] .canvas-scroll-body-dev3{
        display:contents!important;
        overflow:visible!important;
        padding:0!important;
      }

      /* Board drawing gesture ownership still wins while armed. */
      .screen[data-screen="outfits"].${FOCUS_CLASS} #outfitBoard.draw-dev10-active{touch-action:none!important}
    `;
    document.head.appendChild(style);
  }

  function reconcileDraw(){
    if(!focused())return;
    const main=activePanel();
    if(main?.dataset.boardPanel!=='decorate')return;
    const drawTab=document.querySelector('.decorate-studio-tab[data-decorate-group="draw"]');
    const drawPanel=document.querySelector('.decorate-studio-panel[data-decorate-group="draw"]');
    if(!drawTab?.classList.contains('active')||!drawPanel?.classList.contains('active'))return;
    window.dispatchEvent(new Event('pageshow'));
  }

  function reconcile(){
    installStyles();
    if(!focused())return;
    const panel=activePanel();
    if(panel&&panel.scrollTop<0)panel.scrollTop=0;
    reconcileDraw();
  }

  function schedule(){
    requestAnimationFrame(()=>requestAnimationFrame(reconcile));
    setTimeout(reconcile,40);
    setTimeout(reconcile,120);
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
    window.addEventListener('resize',()=>{if(focused())schedule();});
    document.addEventListener('visibilitychange',()=>{if(!document.hidden)schedule();});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
