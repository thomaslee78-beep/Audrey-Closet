/* Audrey Closet v13.22 Board Focus Mode dev9
 * Replaces dev8 keyboard handling while preserving accepted visual polish.
 * - NO fixed-screen / board height mutation when iPhone keyboard appears
 * - reveal Text Studio only by scrolling the existing Decorate panel
 * - preserve Draw inset-swatch color picker
 * - preserve tighter Canvas spacing
 */
(function(){
  'use strict';

  const STYLE_ID='boardFocusDev9Styles';
  let revealTimer=0;

  function screen(){return document.querySelector('.screen[data-screen="outfits"]');}
  function focused(){return !!screen()?.classList.contains('board-focus-active-dev1');}
  function decoratePanel(){return document.querySelector('.board-workspace-panel[data-board-panel="decorate"]');}
  function textPanel(){return document.querySelector('.decorate-studio-panel[data-decorate-group="text"]');}
  function textActive(){return focused()&&decoratePanel()?.classList.contains('active')&&textPanel()?.classList.contains('active');}

  function installStyles(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      /* Shared visual contract for compact Decorate color controls. */
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

      /* Accepted Canvas spacing polish. */
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

      /* Keyboard-safe Text treatment: keep Focus geometry unchanged. */
      .screen[data-screen="outfits"].board-focus-active-dev1 .board-workspace-panel[data-board-panel="decorate"].active{
        scroll-padding-top:10px!important;
        scroll-padding-bottom:18px!important;
      }
      .screen[data-screen="outfits"].board-focus-active-dev1 .decorate-studio-panel[data-decorate-group="text"].active{
        padding-bottom:16px!important;
      }
    `;
    document.head.appendChild(style);
  }

  function revealTextEditor(){
    clearTimeout(revealTimer);
    revealTimer=setTimeout(()=>{
      if(!textActive())return;
      const panel=decoratePanel();
      const editor=document.querySelector('.decorate-studio-panel[data-decorate-group="text"].active .decorate-tool-card')||textPanel();
      if(!panel||!editor)return;

      const pr=panel.getBoundingClientRect();
      const er=editor.getBoundingClientRect();
      const vv=window.visualViewport;
      const visibleBottom=vv?Math.min(window.innerHeight,vv.offsetTop+vv.height):window.innerHeight;
      const safeTop=pr.top+8;
      const safeBottom=Math.min(pr.bottom,visibleBottom)-12;

      let delta=0;
      if(er.bottom>safeBottom)delta=er.bottom-safeBottom;
      else if(er.top<safeTop)delta=er.top-safeTop;
      if(Math.abs(delta)>1)panel.scrollTop+=delta;
    },90);
  }

  function start(){
    installStyles();

    document.addEventListener('focusin',e=>{
      const t=e.target;
      if(t instanceof Element&&t.closest('.decorate-studio-panel[data-decorate-group="text"]')){
        revealTextEditor();
        setTimeout(revealTextEditor,220);
      }
    },true);

    window.visualViewport?.addEventListener('resize',()=>{if(textActive())revealTextEditor();});
    window.visualViewport?.addEventListener('scroll',()=>{if(textActive())revealTextEditor();});
    document.addEventListener('click',e=>{
      const t=e.target;
      if(t instanceof Element&&t.closest('.decorate-studio-tab[data-decorate-group="text"],.board-workspace-tab[data-board-panel="decorate"]'))setTimeout(revealTextEditor,40);
    },true);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
