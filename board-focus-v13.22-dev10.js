/* Audrey Closet v13.22 Board Focus Mode dev10
 * Small polish over clean dev1 + dev2 + dev7 + dev9 baseline.
 * - Preserve Decorate panel scroll position when switching Text/Draw/Shapes/Stickers.
 * - Only reveal Text editor after the actual text input receives focus / keyboard opens.
 * - Use a thinner opaque divider below the fixed main workspace tabs.
 */
(function(){
  'use strict';

  const STYLE_ID='boardFocusDev10Styles';
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
      /* Small opaque landing strip under the fixed primary workspace navigation. */
      .screen[data-screen="outfits"].board-focus-active-dev1 #boardWorkspace>.board-workspace-tabs{
        position:relative!important;
        z-index:70!important;
        margin-bottom:0!important;
        padding-bottom:2px!important;
        background:#e6dcc9!important;
        box-shadow:0 2px 0 #e6dcc9, 0 3px 5px rgba(82,62,51,.06)!important;
      }
      .screen[data-screen="outfits"].board-focus-active-dev1 #boardWorkspace>.board-workspace-panel.active{
        scroll-padding-top:4px!important;
      }
    `;
    document.head.appendChild(style);
  }

  function actualTextInputFocused(){
    const el=document.activeElement;
    if(!el||!(el instanceof Element))return false;
    return el.id==='boardTextInput'||!!el.closest('.decorate-studio-panel[data-decorate-group="text"] textarea, .decorate-studio-panel[data-decorate-group="text"] input[type="text"]');
  }

  function revealTextEditor(){
    clearTimeout(revealTimer);
    revealTimer=setTimeout(()=>{
      if(!textActive()||!actualTextInputFocused())return;
      const panel=decoratePanel();
      const input=document.getElementById('boardTextInput');
      const editor=document.querySelector('.decorate-studio-panel[data-decorate-group="text"].active .decorate-tool-card')||textPanel();
      if(!panel||!editor||!input)return;

      const pr=panel.getBoundingClientRect();
      const er=editor.getBoundingClientRect();
      const ir=input.getBoundingClientRect();
      const vv=window.visualViewport;
      const visibleBottom=vv?Math.min(window.innerHeight,vv.offsetTop+vv.height):window.innerHeight;
      const safeTop=pr.top+8;
      const safeBottom=Math.min(pr.bottom,visibleBottom)-12;

      let delta=0;
      if(ir.bottom>safeBottom)delta=ir.bottom-safeBottom;
      else if(er.bottom>safeBottom)delta=er.bottom-safeBottom;
      else if(ir.top<safeTop)delta=ir.top-safeTop;
      if(Math.abs(delta)>1)panel.scrollTop+=delta;
    },90);
  }

  function preserveDecorateScrollAcrossSubtabClick(e){
    if(!focused())return;
    const t=e.target;
    if(!(t instanceof Element))return;
    const tab=t.closest('.decorate-studio-tab[data-decorate-group]');
    const panel=decoratePanel();
    if(!tab||!panel||!panel.classList.contains('active'))return;

    const keep=panel.scrollTop;
    requestAnimationFrame(()=>{panel.scrollTop=keep;});
    setTimeout(()=>{if(!actualTextInputFocused())panel.scrollTop=keep;},0);
    setTimeout(()=>{if(!actualTextInputFocused())panel.scrollTop=keep;},80);
    setTimeout(()=>{if(!actualTextInputFocused())panel.scrollTop=keep;},180);
  }

  function start(){
    installStyles();

    /* Capture before older compatibility handlers can auto-reveal Text. */
    document.addEventListener('click',preserveDecorateScrollAcrossSubtabClick,true);

    /* Only entering the actual text field should trigger repositioning. */
    document.addEventListener('focusin',e=>{
      const t=e.target;
      if(!(t instanceof Element))return;
      if(t.id==='boardTextInput'||t.matches('.decorate-studio-panel[data-decorate-group="text"] textarea, .decorate-studio-panel[data-decorate-group="text"] input[type="text"]')){
        revealTextEditor();
        setTimeout(revealTextEditor,220);
      }
    },true);

    window.visualViewport?.addEventListener('resize',()=>{if(textActive()&&actualTextInputFocused())revealTextEditor();});
    window.visualViewport?.addEventListener('scroll',()=>{if(textActive()&&actualTextInputFocused())revealTextEditor();});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
