/* Audrey Closet v13.22 Draw Studio dev11 guard
 * Runs after dev10. Keeps dev10 drawing + partial eraser unchanged.
 * Hard-gates drawing to Board workspace=Decorate + Decorate tab=Draw.
 * Adds bounded rebind retries for saved outfit/edit transitions.
 */
(function(){
  'use strict';

  const BOARD_ACTIVE_CLASS='draw-dev10-active';
  const ERASER_ACTIVE_CLASS='draw-dev10-eraser';

  function workspaceDecorateActive(){
    const tab=document.querySelector('.screen[data-screen="outfits"] .board-workspace-tab[data-board-panel="decorate"]');
    const panel=document.querySelector('.screen[data-screen="outfits"] .board-workspace-panel[data-board-panel="decorate"]');
    return !!tab&&tab.classList.contains('active')&&!!panel&&panel.classList.contains('active');
  }

  function drawSubtabActive(){
    const tab=document.querySelector('.decorate-studio-tab[data-decorate-group="draw"]');
    const panel=document.querySelector('.decorate-studio-panel[data-decorate-group="draw"]');
    return !!tab&&tab.classList.contains('active')&&!!panel&&panel.classList.contains('active');
  }

  function selectedLiveTool(){
    const root=document.getElementById('drawStudioDev10');
    const btn=root?.querySelector('.draw-tool-btn.active[data-draw-tool]');
    if(!btn)return '';
    const tool=btn.dataset.drawTool||'';
    return ['pencil','pen','sharpie','highlighter','eraser'].includes(tool)?tool:'';
  }

  function trueDrawContext(){
    return workspaceDecorateActive()&&drawSubtabActive()&&!!selectedLiveTool();
  }

  function stripBoardDrawState(){
    const board=document.getElementById('outfitBoard');
    if(!board)return;
    if(trueDrawContext())return;
    board.classList.remove(BOARD_ACTIVE_CLASS,ERASER_ACTIVE_CLASS);
    board.querySelector('.draw-live-overlay-dev10')?.remove();
  }

  function enforceContext(){
    stripBoardDrawState();
  }

  function requestDev10Reconcile(){
    // dev10 listens to pageshow and uses it to rebind the current #outfitBoard
    // and reconcile the selected tool. Dispatching this event is intentionally
    // bounded and avoids a broad MutationObserver.
    window.dispatchEvent(new Event('pageshow'));
    enforceContext();
  }

  function rebindBurst(){
    [0,80,220,500].forEach(delay=>window.setTimeout(requestDev10Reconcile,delay));
  }

  function likelyBoardLifecycleTarget(target){
    return !!target.closest?.(
      '#savedOutfits .portfolio-card[data-id], .screen[data-screen="portfolio"] .portfolio-card[data-id], '+
      '#outfitViewDialog, #portfolioItemPreviewDialog, .board-workspace-tab, '+
      '.decorate-studio-tab, #decorateToggle'
    );
  }

  function start(){
    enforceContext();

    // Capture before dev10's board pointer listeners. If the user is on Canvas,
    // Tools, Add Items, or any non-Draw context, the drawing engine never sees
    // the gesture even if its private state still thinks Draw is armed.
    document.addEventListener('pointerdown',e=>{
      const board=e.target instanceof Element?e.target.closest('#outfitBoard'):null;
      if(!board)return;
      if(trueDrawContext())return;
      board.classList.remove(BOARD_ACTIVE_CLASS,ERASER_ACTIVE_CLASS);
      e.stopPropagation();
    },true);

    // Workspace switching is the missing lifecycle layer in dev10. Remove draw
    // touch-action immediately when leaving Decorate, then re-check after app
    // handlers finish updating active classes.
    document.addEventListener('click',e=>{
      const target=e.target;
      if(!(target instanceof Element))return;

      const workspaceTab=target.closest('.board-workspace-tab[data-board-panel]');
      if(workspaceTab&&workspaceTab.dataset.boardPanel!=='decorate'){
        const board=document.getElementById('outfitBoard');
        board?.classList.remove(BOARD_ACTIVE_CLASS,ERASER_ACTIVE_CLASS);
      }

      window.setTimeout(enforceContext,0);
      if(likelyBoardLifecycleTarget(target))rebindBurst();
    },true);

    // Saved-board transitions can finish after the original tap/click. These
    // bounded retries make initialization deterministic without polling forever.
    document.addEventListener('click',e=>{
      const target=e.target;
      if(target instanceof Element&&likelyBoardLifecycleTarget(target))rebindBurst();
    },false);

    window.addEventListener('pageshow',()=>window.setTimeout(enforceContext,0));
    document.addEventListener('visibilitychange',()=>{if(!document.hidden)rebindBurst();});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
