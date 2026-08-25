/* Audrey Closet v13.22 Board Focus Mode dev3
 * Focus refinements over dev1/dev2:
 * - immediate compose-row placement on first focus entry
 * - suppress top/bottom rubber-band bounce in focus scroll panels
 * - pin Decorate sub-tabs while its options scroll
 * - pin Canvas type row while canvas options scroll
 * - move Canvas color picker beside Fun and auto-apply color in focus + normal modes
 */
(function(){
  'use strict';

  const STYLE_ID='boardFocusDev3Styles';
  const FOCUS_CLASS='board-focus-active-dev1';
  const BUTTON_ID='boardFocusToggleDev1';
  const TRAY_ID='boardFocusTrayDev1';
  let touchPanel=null;
  let touchStartY=0;

  function screen(){return document.querySelector('.screen[data-screen="outfits"]');}
  function focused(){return !!screen()?.classList.contains(FOCUS_CLASS);}
  function shell(){return screen()?.querySelector('.board-shell')||null;}
  function compose(){return screen()?.querySelector('.board-compose-bar')||null;}
  function workspace(){return document.getElementById('boardWorkspace');}
  function canvasPanel(){return workspace()?.querySelector('.board-workspace-panel[data-board-panel="canvas"]')||null;}
  function decoratePanel(){return workspace()?.querySelector('.board-workspace-panel[data-board-panel="decorate"]')||null;}

  function installStyles(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      /* Stronger iOS-friendly containment for the single active focus scroller. */
      .screen[data-screen="outfits"].${FOCUS_CLASS} #${TRAY_ID} .board-workspace-panel.active{
        overscroll-behavior-y:none!important;
        overscroll-behavior-x:none!important;
        scroll-behavior:auto!important;
      }

      /* Decorate: pin Text / Draw / Shapes / Stickers, scroll only options below. */
      .screen[data-screen="outfits"].${FOCUS_CLASS} .board-workspace-panel[data-board-panel="decorate"].active{
        display:flex!important;
        flex-direction:column!important;
        overflow:hidden!important;
        padding:0!important;
      }
      .screen[data-screen="outfits"].${FOCUS_CLASS} .board-workspace-panel[data-board-panel="decorate"] .board-decorate-shell{
        display:flex!important;
        flex-direction:column!important;
        flex:1 1 auto!important;
        min-height:0!important;
        padding:0!important;
        overflow:hidden!important;
        background:#f1e7d5!important;
      }
      .screen[data-screen="outfits"].${FOCUS_CLASS} .board-workspace-panel[data-board-panel="decorate"] .decorate-studio-tabs{
        position:relative!important;
        top:auto!important;
        flex:0 0 auto!important;
        z-index:50!important;
        margin:0!important;
        padding:5px 5px 4px!important;
        background:#e6dcc9!important;
        border-bottom:1px solid rgba(108,81,66,.12)!important;
        isolation:isolate!important;
      }
      .screen[data-screen="outfits"].${FOCUS_CLASS} .board-workspace-panel[data-board-panel="decorate"] .decorate-studio-panels{
        flex:1 1 auto!important;
        min-height:0!important;
        overflow-y:auto!important;
        overflow-x:hidden!important;
        -webkit-overflow-scrolling:touch!important;
        overscroll-behavior-y:none!important;
        padding:6px 5px calc(10px + env(safe-area-inset-bottom))!important;
        box-sizing:border-box!important;
        background:#f1e7d5!important;
      }

      /* Canvas: pin canvas-type chips, scroll only controls/patterns beneath. */
      .screen[data-screen="outfits"].${FOCUS_CLASS} .board-workspace-panel[data-board-panel="canvas"].active{
        display:flex!important;
        flex-direction:column!important;
        overflow:hidden!important;
        padding:0!important;
      }
      .screen[data-screen="outfits"].${FOCUS_CLASS} .board-workspace-panel[data-board-panel="canvas"] .board-canvas-shell{
        display:flex!important;
        flex-direction:column!important;
        flex:1 1 auto!important;
        min-height:0!important;
        padding:0!important;
        overflow:hidden!important;
        background:#f1e7d5!important;
      }
      .screen[data-screen="outfits"].${FOCUS_CLASS} .board-workspace-panel[data-board-panel="canvas"] .canvas-category-row{
        position:relative!important;
        top:auto!important;
        flex:0 0 auto!important;
        z-index:50!important;
        margin:0!important;
        padding:6px 5px!important;
        background:#e6dcc9!important;
        border-bottom:1px solid rgba(108,81,66,.12)!important;
        isolation:isolate!important;
      }
      .screen[data-screen="outfits"].${FOCUS_CLASS} .board-workspace-panel[data-board-panel="canvas"] .canvas-scroll-body-dev3{
        flex:1 1 auto!important;
        min-height:0!important;
        overflow-y:auto!important;
        overflow-x:hidden!important;
        -webkit-overflow-scrolling:touch!important;
        overscroll-behavior-y:none!important;
        padding:6px 5px calc(10px + env(safe-area-inset-bottom))!important;
        box-sizing:border-box!important;
        background:#f1e7d5!important;
      }

      /* Canvas color picker becomes a compact chip beside Fun in every mode. */
      .screen[data-screen="outfits"] .canvas-category-row .canvas-inline-color-dev3{
        flex:0 0 34px!important;
        width:34px!important;
        min-width:34px!important;
        height:30px!important;
        min-height:30px!important;
        padding:2px!important;
        border:1px solid rgba(108,81,66,.18)!important;
        border-radius:9px!important;
        background:#f8f0df!important;
        box-sizing:border-box!important;
        overflow:hidden!important;
      }
      .screen[data-screen="outfits"] .canvas-category-row .canvas-inline-color-dev3::-webkit-color-swatch-wrapper{padding:0!important}
      .screen[data-screen="outfits"] .canvas-category-row .canvas-inline-color-dev3::-webkit-color-swatch{border:0!important;border-radius:6px!important}
      .screen[data-screen="outfits"] .canvas-custom-color-label-dev3,
      .screen[data-screen="outfits"] .canvas-use-color-btn-dev3{display:none!important}
    `;
    document.head.appendChild(style);
  }

  function placeComposeImmediately(){
    if(!focused())return;
    const sc=screen(),c=compose(),sh=shell();
    if(sc&&c&&sh&&c.parentElement===sc&&c.nextElementSibling===sh)return;
    if(sc&&c&&sh)sc.insertBefore(c,sh);
  }

  function prepareCanvasScrollBody(){
    const panel=canvasPanel();
    if(!panel)return;
    const shellNode=panel.querySelector('.board-canvas-shell');
    const categories=shellNode?.querySelector('.canvas-category-row');
    if(!shellNode||!categories)return;

    let body=shellNode.querySelector(':scope > .canvas-scroll-body-dev3');
    if(!body){
      body=document.createElement('div');
      body.className='canvas-scroll-body-dev3';
      [...shellNode.children].forEach(child=>{if(child!==categories)body.appendChild(child);});
      shellNode.appendChild(body);
    }
  }

  function findUseColorButton(panel){
    if(!panel)return null;
    return [...panel.querySelectorAll('button')].find(btn=>/use\s*color/i.test(String(btn.textContent||'').trim()))||null;
  }

  function findCustomColorLabel(panel,colorInput){
    if(!panel||!colorInput)return null;
    const labels=[...panel.querySelectorAll('label,.canvas-control-label,.canvas-label,span,strong,p')];
    return labels.find(el=>/custom\s*color/i.test(String(el.textContent||'').replace(/\s+/g,' ').trim()) && (el.contains(colorInput)||el.parentElement?.contains(colorInput)))||
           labels.find(el=>/^custom\s*color$/i.test(String(el.textContent||'').trim()))||null;
  }

  function installCanvasColor(){
    const panel=canvasPanel();
    const categories=panel?.querySelector('.canvas-category-row');
    if(!panel||!categories)return;

    const input=panel.querySelector('input[type="color"]');
    if(!input)return;
    const useBtn=findUseColorButton(panel);
    const label=findCustomColorLabel(panel,input);
    const funBtn=[...categories.querySelectorAll('button')].find(btn=>/^fun$/i.test(String(btn.textContent||'').trim()))||categories.lastElementChild;

    input.classList.add('canvas-inline-color-dev3');
    input.setAttribute('aria-label','Custom canvas color');
    input.title='Custom canvas color';
    if(funBtn&&input.parentElement!==categories)funBtn.insertAdjacentElement('afterend',input);
    else if(funBtn&&funBtn.nextElementSibling!==input)funBtn.insertAdjacentElement('afterend',input);

    if(label&&label!==input){label.classList.add('canvas-custom-color-label-dev3');label.setAttribute('aria-hidden','true');}
    if(useBtn){useBtn.classList.add('canvas-use-color-btn-dev3');useBtn.setAttribute('aria-hidden','true');}

    if(!input.dataset.canvasAutoApplyDev3){
      input.dataset.canvasAutoApplyDev3='1';
      const apply=()=>{
        const btn=findUseColorButton(canvasPanel());
        if(btn){btn.click();return;}
        input.dispatchEvent(new Event('change',{bubbles:true}));
      };
      input.addEventListener('input',()=>{clearTimeout(input._canvasApplyTimerDev3);input._canvasApplyTimerDev3=setTimeout(apply,40);});
      input.addEventListener('change',apply);
    }
  }

  function scrollContainers(){
    if(!focused())return [];
    const items=[];
    const active=workspace()?.querySelector('.board-workspace-panel.active');
    if(active){
      if(active.dataset.boardPanel==='decorate'){
        const nested=active.querySelector('.decorate-studio-panels');if(nested)items.push(nested);
      }else if(active.dataset.boardPanel==='canvas'){
        const nested=active.querySelector('.canvas-scroll-body-dev3');if(nested)items.push(nested);
      }else items.push(active);
    }
    return items;
  }

  function onTouchStart(e){
    if(!focused()||e.touches.length!==1)return;
    const containers=scrollContainers();
    touchPanel=containers.find(el=>el.contains(e.target))||null;
    touchStartY=e.touches[0].clientY;
  }

  function onTouchMove(e){
    if(!touchPanel||!focused()||e.touches.length!==1)return;
    const y=e.touches[0].clientY;
    const dy=y-touchStartY;
    const top=touchPanel.scrollTop<=0;
    const bottom=touchPanel.scrollTop+touchPanel.clientHeight>=touchPanel.scrollHeight-1;
    if((top&&dy>0)||(bottom&&dy<0)){
      e.preventDefault();
      return;
    }
    touchStartY=y;
  }

  function reconcile(){
    installStyles();
    placeComposeImmediately();
    prepareCanvasScrollBody();
    installCanvasColor();
  }

  function schedule(){
    requestAnimationFrame(()=>requestAnimationFrame(reconcile));
    setTimeout(reconcile,20);
    setTimeout(reconcile,90);
  }

  function start(){
    installStyles();
    reconcile();
    [80,220,500,900].forEach(ms=>setTimeout(reconcile,ms));

    /* Capture before dev1's target handler stops propagation; reconcile immediately after activation. */
    document.addEventListener('click',e=>{
      const t=e.target;
      if(t instanceof Element&&t.closest('#'+BUTTON_ID))schedule();
    },true);

    document.addEventListener('click',e=>{
      const t=e.target;
      if(!(t instanceof Element))return;
      if(t.closest('.board-workspace-tab,.canvas-category-chip'))schedule();
    },false);

    document.addEventListener('touchstart',onTouchStart,{capture:true,passive:true});
    document.addEventListener('touchmove',onTouchMove,{capture:true,passive:false});
    document.addEventListener('touchend',()=>{touchPanel=null;},{capture:true,passive:true});
    document.addEventListener('touchcancel',()=>{touchPanel=null;},{capture:true,passive:true});

    window.addEventListener('pageshow',schedule);
    window.addEventListener('resize',schedule);
    window.visualViewport?.addEventListener('resize',schedule);
    document.addEventListener('visibilitychange',()=>{if(!document.hidden)schedule();});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
