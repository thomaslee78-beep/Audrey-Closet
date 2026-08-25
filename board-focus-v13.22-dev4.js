/* Audrey Closet v13.22 Board Focus Mode dev4
 * Compatibility fix over Focus dev3:
 * - active Decorate sub-panel is the scroller (not the shared panels wrapper)
 * - Draw / Shapes get full scroll height in Focus Mode
 * - selecting Draw explicitly reconciles the existing dev10/dev11 draw lifecycle
 * No drawing or shape engine logic is replaced.
 */
(function(){
  'use strict';

  const STYLE_ID='boardFocusDev4Styles';
  const FOCUS_CLASS='board-focus-active-dev1';

  function screen(){return document.querySelector('.screen[data-screen="outfits"]');}
  function focused(){return !!screen()?.classList.contains(FOCUS_CLASS);}
  function decorateWorkspace(){return document.querySelector('.screen[data-screen="outfits"] .board-workspace-panel[data-board-panel="decorate"]');}
  function decorateShell(){return decorateWorkspace()?.querySelector('.board-decorate-shell')||null;}
  function panelsWrap(){return decorateWorkspace()?.querySelector('.decorate-studio-panels')||null;}
  function activeDecoratePanel(){return decorateWorkspace()?.querySelector('.decorate-studio-panel.active')||null;}

  function installStyles(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      /* dev4 overrides dev3's shared-wrapper scrolling model. */
      .screen[data-screen="outfits"].${FOCUS_CLASS} .board-workspace-panel[data-board-panel="decorate"].active{
        display:flex!important;
        flex-direction:column!important;
        min-height:0!important;
        overflow:hidden!important;
        padding:0!important;
      }
      .screen[data-screen="outfits"].${FOCUS_CLASS} .board-workspace-panel[data-board-panel="decorate"] .board-decorate-shell{
        display:flex!important;
        flex-direction:column!important;
        flex:1 1 auto!important;
        min-height:0!important;
        overflow:hidden!important;
      }
      .screen[data-screen="outfits"].${FOCUS_CLASS} .board-workspace-panel[data-board-panel="decorate"] .decorate-studio-tabs{
        flex:0 0 auto!important;
        position:relative!important;
        top:auto!important;
        z-index:60!important;
        background:#e6dcc9!important;
        border-bottom:1px solid rgba(108,81,66,.12)!important;
      }
      .screen[data-screen="outfits"].${FOCUS_CLASS} .board-workspace-panel[data-board-panel="decorate"] .decorate-studio-panels{
        display:block!important;
        flex:1 1 auto!important;
        min-height:0!important;
        height:100%!important;
        overflow:hidden!important;
        padding:0!important;
        margin:0!important;
        background:#f1e7d5!important;
      }
      .screen[data-screen="outfits"].${FOCUS_CLASS} .board-workspace-panel[data-board-panel="decorate"] .decorate-studio-panel{
        display:none!important;
        width:100%!important;
        height:100%!important;
        min-height:0!important;
        overflow:hidden!important;
        margin:0!important;
        padding:0!important;
        box-sizing:border-box!important;
      }
      .screen[data-screen="outfits"].${FOCUS_CLASS} .board-workspace-panel[data-board-panel="decorate"] .decorate-studio-panel.active{
        display:block!important;
        overflow-y:auto!important;
        overflow-x:hidden!important;
        -webkit-overflow-scrolling:touch!important;
        overscroll-behavior-y:none!important;
        touch-action:pan-y!important;
        padding:6px 5px calc(10px + env(safe-area-inset-bottom))!important;
        background:#f1e7d5!important;
      }

      /* Let Draw and Shapes content expand naturally inside their own scroller. */
      .screen[data-screen="outfits"].${FOCUS_CLASS} .decorate-studio-panel[data-decorate-group="draw"] .decorate-studio-content,
      .screen[data-screen="outfits"].${FOCUS_CLASS} .decorate-studio-panel[data-decorate-group="shapes"] .decorate-studio-content{
        overflow:visible!important;
        max-height:none!important;
        height:auto!important;
      }
      .screen[data-screen="outfits"].${FOCUS_CLASS} .decorate-studio-panel[data-decorate-group="draw"] #drawStudioDev10,
      .screen[data-screen="outfits"].${FOCUS_CLASS} .decorate-studio-panel[data-decorate-group="shapes"] #shapeStudioV132201{
        overflow:visible!important;
        max-height:none!important;
      }

      /* Drawing Board itself must keep its gesture override; do not let Focus scroll CSS win. */
      .screen[data-screen="outfits"].${FOCUS_CLASS} #outfitBoard.draw-dev10-active{
        touch-action:none!important;
      }
    `;
    document.head.appendChild(style);
  }

  function clampDecorateScroll(){
    if(!focused())return;
    const panel=activeDecoratePanel();
    if(!panel)return;
    if(panel.scrollTop<0)panel.scrollTop=0;
    const max=Math.max(0,panel.scrollHeight-panel.clientHeight);
    if(panel.scrollTop>max)panel.scrollTop=max;
  }

  function reconcileDrawLifecycle(){
    if(!focused())return;
    const workspaceTab=document.querySelector('.board-workspace-tab[data-board-panel="decorate"]');
    const workspacePanel=decorateWorkspace();
    const drawTab=document.querySelector('.decorate-studio-tab[data-decorate-group="draw"]');
    const drawPanel=document.querySelector('.decorate-studio-panel[data-decorate-group="draw"]');
    if(!workspaceTab?.classList.contains('active')||!workspacePanel?.classList.contains('active'))return;
    if(!drawTab?.classList.contains('active')||!drawPanel?.classList.contains('active'))return;

    /* dev10/dev11 already own binding and selected-tool state. Their pageshow
       reconciliation is the safest way to re-arm after Focus DOM/layout changes. */
    window.dispatchEvent(new Event('pageshow'));
    [0,60,160].forEach(ms=>setTimeout(()=>window.dispatchEvent(new Event('pageshow')),ms));
  }

  function reconcile(){
    installStyles();
    if(!focused())return;
    clampDecorateScroll();
    const drawActive=document.querySelector('.decorate-studio-tab[data-decorate-group="draw"]')?.classList.contains('active');
    if(drawActive)reconcileDrawLifecycle();
  }

  function schedule(){
    requestAnimationFrame(()=>requestAnimationFrame(reconcile));
    setTimeout(reconcile,30);
    setTimeout(reconcile,120);
  }

  function start(){
    installStyles();
    schedule();

    document.addEventListener('click',e=>{
      const target=e.target;
      if(!(target instanceof Element))return;
      if(target.closest('.decorate-studio-tab[data-decorate-group], .board-workspace-tab[data-board-panel="decorate"]'))schedule();
    },true);

    /* Focus dev3's bounce guard targeted the wrapper. Keep active individual
       sub-panels pinned at their real boundaries instead. */
    let touchPanel=null,startY=0;
    document.addEventListener('touchstart',e=>{
      if(!focused()||e.touches.length!==1)return;
      const p=activeDecoratePanel();
      touchPanel=p&&p.contains(e.target)?p:null;
      startY=e.touches[0].clientY;
    },{capture:true,passive:true});
    document.addEventListener('touchmove',e=>{
      if(!touchPanel||!focused()||e.touches.length!==1)return;
      const y=e.touches[0].clientY,dy=y-startY;
      const top=touchPanel.scrollTop<=0;
      const bottom=touchPanel.scrollTop+touchPanel.clientHeight>=touchPanel.scrollHeight-1;
      if((top&&dy>0)||(bottom&&dy<0))e.preventDefault();
      else startY=y;
    },{capture:true,passive:false});
    document.addEventListener('touchend',()=>{touchPanel=null;},{capture:true,passive:true});
    document.addEventListener('touchcancel',()=>{touchPanel=null;},{capture:true,passive:true});

    window.addEventListener('pageshow',()=>setTimeout(reconcile,0));
    document.addEventListener('visibilitychange',()=>{if(!document.hidden)schedule();});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
