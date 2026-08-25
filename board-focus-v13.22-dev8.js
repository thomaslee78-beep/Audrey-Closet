/* Audrey Closet v13.22 Board Focus Mode dev8
 * Small polish pass over clean Focus dev1 + dev2 + dev7 baseline.
 * - improve Text Studio positioning above iPhone keyboard
 * - harmonize Draw color picker with Text/Shapes inset-swatch appearance
 * - tighten Canvas type-to-selection spacing in focus + normal modes
 * No Draw/Text/Shape/Canvas data or event models are replaced.
 */
(function(){
  'use strict';

  const STYLE_ID='boardFocusDev8Styles';
  const KEYBOARD_CLASS='board-focus-keyboard-dev8';
  let baselineViewportHeight=0;
  let keyboardTimer=0;

  function screen(){return document.querySelector('.screen[data-screen="outfits"]');}
  function focused(){return !!screen()?.classList.contains('board-focus-active-dev1');}
  function textPanel(){return document.querySelector('.decorate-studio-panel[data-decorate-group="text"]');}
  function textActive(){
    const workspace=document.querySelector('.board-workspace-panel[data-board-panel="decorate"]');
    const panel=textPanel();
    return focused()&&workspace?.classList.contains('active')&&panel?.classList.contains('active');
  }

  function installStyles(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      /* Shared visual contract for compact Decorate color controls.
         Behavior stays owned by each feature; only outer/inset-swatch appearance is shared. */
      .screen[data-screen="outfits"]{
        --decorate-color-control-w:38px;
        --decorate-color-control-h:34px;
        --decorate-color-control-radius:9px;
        --decorate-color-swatch-inset:4px;
        --decorate-color-control-bg:rgba(255,255,255,.70);
        --decorate-color-control-border:rgba(102,113,90,.22);
      }

      .screen[data-screen="outfits"] #drawStudioDev10 .draw-color-wrap{
        position:relative!important;
        width:var(--decorate-color-control-w)!important;
        min-width:var(--decorate-color-control-w)!important;
        height:var(--decorate-color-control-h)!important;
        min-height:var(--decorate-color-control-h)!important;
        border:1px solid var(--decorate-color-control-border)!important;
        border-radius:var(--decorate-color-control-radius)!important;
        background:var(--decorate-color-control-bg)!important;
        box-shadow:none!important;
        overflow:hidden!important;
        box-sizing:border-box!important;
      }
      .screen[data-screen="outfits"] #drawStudioDev10 .draw-color-wrap::after{
        content:"";
        position:absolute;
        inset:var(--decorate-color-swatch-inset)!important;
        border-radius:6px!important;
        background:var(--draw-color,#6b6b6b)!important;
        box-shadow:inset 0 0 0 1px rgba(0,0,0,.10)!important;
        pointer-events:none!important;
      }
      .screen[data-screen="outfits"] #drawStudioDev10 .draw-color-wrap input[type="color"]{
        position:absolute!important;
        inset:0!important;
        z-index:2!important;
        width:100%!important;
        height:100%!important;
        opacity:0!important;
        cursor:pointer!important;
      }

      /* Tighten Canvas vertical rhythm in both Focus and standard Board modes. */
      .screen[data-screen="outfits"] .board-workspace-panel[data-board-panel="canvas"] .canvas-category-row{
        margin-bottom:2px!important;
        padding-bottom:1px!important;
      }
      .screen[data-screen="outfits"] .board-workspace-panel[data-board-panel="canvas"] .board-canvas-shell{
        row-gap:4px!important;
        gap:4px!important;
      }
      .screen[data-screen="outfits"] .board-workspace-panel[data-board-panel="canvas"] .canvas-category-row + *{
        margin-top:0!important;
      }

      /* When the iPhone keyboard is open in Focus Text mode, reserve more visual room
         for Text Studio and keep its editing card centered in the remaining tray. */
      body.${KEYBOARD_CLASS} .screen[data-screen="outfits"].board-focus-active-dev1{
        height:var(--focus-keyboard-vh,100dvh)!important;
        max-height:var(--focus-keyboard-vh,100dvh)!important;
      }
      body.${KEYBOARD_CLASS} .screen[data-screen="outfits"].board-focus-active-dev1 #outfitBoard{
        max-height:38vh!important;
      }
      body.${KEYBOARD_CLASS} .screen[data-screen="outfits"].board-focus-active-dev1 #boardFocusTrayDev1{
        min-height:150px!important;
      }
      body.${KEYBOARD_CLASS} .screen[data-screen="outfits"].board-focus-active-dev1 .board-workspace-panel[data-board-panel="decorate"].active{
        scroll-padding-top:12px!important;
        scroll-padding-bottom:18px!important;
      }
      body.${KEYBOARD_CLASS} .screen[data-screen="outfits"].board-focus-active-dev1 .decorate-studio-panel[data-decorate-group="text"].active{
        padding-top:clamp(8px,5vh,28px)!important;
        padding-bottom:18px!important;
      }

      @media(max-width:430px){
        .screen[data-screen="outfits"]{--decorate-color-control-w:38px;--decorate-color-control-h:34px}
      }
    `;
    document.head.appendChild(style);
  }

  function currentViewportHeight(){
    return Math.max(1,Math.round(window.visualViewport?.height||window.innerHeight||document.documentElement.clientHeight||700));
  }

  function updateKeyboardState(){
    clearTimeout(keyboardTimer);
    keyboardTimer=setTimeout(()=>{
      const vh=currentViewportHeight();
      if(!baselineViewportHeight||vh>baselineViewportHeight)baselineViewportHeight=vh;
      const activeEl=document.activeElement;
      const editingText=!!activeEl&&(activeEl.id==='boardTextInput'||activeEl.closest?.('.decorate-studio-panel[data-decorate-group="text"]'));
      const keyboardLikely=textActive()&&editingText&&baselineViewportHeight-vh>120;
      document.body.classList.toggle(KEYBOARD_CLASS,keyboardLikely);
      if(keyboardLikely){
        document.body.style.setProperty('--focus-keyboard-vh',vh+'px');
        requestAnimationFrame(()=>{
          const panel=document.querySelector('.board-workspace-panel[data-board-panel="decorate"].active');
          const card=document.querySelector('.decorate-studio-panel[data-decorate-group="text"].active .decorate-tool-card')||textPanel();
          if(panel&&card){
            const target=Math.max(0,card.offsetTop-Math.max(8,(panel.clientHeight-card.clientHeight)/2));
            panel.scrollTo({top:target,behavior:'auto'});
          }
        });
      }else{
        document.body.style.removeProperty('--focus-keyboard-vh');
      }
    },30);
  }

  function start(){
    installStyles();
    baselineViewportHeight=currentViewportHeight();

    document.addEventListener('focusin',e=>{
      const t=e.target;
      if(t instanceof Element&&t.closest('.decorate-studio-panel[data-decorate-group="text"]')){
        setTimeout(updateKeyboardState,40);
        setTimeout(updateKeyboardState,180);
      }
    },true);
    document.addEventListener('focusout',e=>{
      const t=e.target;
      if(t instanceof Element&&t.closest('.decorate-studio-panel[data-decorate-group="text"]'))setTimeout(updateKeyboardState,80);
    },true);

    window.visualViewport?.addEventListener('resize',updateKeyboardState);
    window.visualViewport?.addEventListener('scroll',updateKeyboardState);
    window.addEventListener('resize',updateKeyboardState);
    document.addEventListener('click',e=>{
      const t=e.target;
      if(t instanceof Element&&t.closest('.board-workspace-tab,.decorate-studio-tab,#boardFocusToggleDev1'))setTimeout(updateKeyboardState,0);
    },true);
    document.addEventListener('visibilitychange',()=>{if(!document.hidden)updateKeyboardState();});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
