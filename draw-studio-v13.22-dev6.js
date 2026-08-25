/* Audrey Closet v13.22 Draw Studio dev6 lifecycle patch
 * Keeps dev5 Pencil engine unchanged, but constrains Draw mode to
 * Board -> Decorate -> Draw only.
 */
(function(){
  'use strict';

  const ROOT_ID='drawStudioDev5';

  function modeButton(){
    return document.querySelector(`#${ROOT_ID} .draw-mode-btn`);
  }

  function drawModeIsOn(){
    const btn=modeButton();
    return !!btn && btn.getAttribute('aria-pressed')==='true';
  }

  function forceDone(){
    const btn=modeButton();
    if(btn && drawModeIsOn()) btn.click();
  }

  function drawTabIsActive(){
    const tab=document.querySelector('.decorate-studio-tab[data-decorate-group="draw"]');
    const panel=document.querySelector('.decorate-studio-panel[data-decorate-group="draw"]');
    return !!tab && tab.classList.contains('active') && !!panel && panel.classList.contains('active');
  }

  function targetIsInsideLiveDraw(target){
    return !!target.closest?.(
      `#${ROOT_ID}, #outfitBoard, .decorate-studio-tab[data-decorate-group="draw"]`
    );
  }

  function enforceContext(){
    if(!drawTabIsActive()) forceDone();
  }

  function start(){
    // dev5 defaults to Draw mode ON; dev6 explicitly resets it until the user
    // actually enters Decorate -> Draw.
    requestAnimationFrame(()=>requestAnimationFrame(forceDone));

    document.addEventListener('click',e=>{
      const target=e.target;
      if(!(target instanceof Element))return;

      const decorateTab=target.closest('.decorate-studio-tab[data-decorate-group]');
      if(decorateTab){
        if(decorateTab.dataset.decorateGroup!=='draw') forceDone();
        return;
      }

      // Any Board UI interaction outside the active Draw controls/surface means
      // we are no longer intentionally drawing. This catches Add Items, Tools,
      // Canvas, navigation controls, and any future peer Board section buttons
      // without coupling to fragile button ids.
      if(!targetIsInsideLiveDraw(target)) forceDone();
    },true);

    // Re-check after visibility/navigation changes caused by app code.
    document.addEventListener('click',()=>setTimeout(enforceContext,0),false);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
