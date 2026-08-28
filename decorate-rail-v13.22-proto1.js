/* Audrey Closet v13.22 Decorate Rail prototype 2
 * Visual/layout polish over prototype 1:
 * - compresses space under Decorate workspace tabs
 * - keeps left tool rail pinned to the upper-left
 * - removes rail chrome and uses tighter square tab buttons
 * - active tab visually blends into the tool stage
 * - keeps the stage header edge anchored in Board Focus while content scrolls
 */
(function(){
  'use strict';

  const STYLE_ID='decorateRailProto2Styles';
  const LAYOUT_CLASS='decorate-rail-layout-proto1';
  const RAIL_CLASS='decorate-rail-proto1';
  const STAGE_CLASS='decorate-stage-proto1';
  const ICONS={text:'T',draw:'✎',shapes:'○',stickers:'✦'};
  const LABELS={text:'Text',draw:'Draw',shapes:'Shapes',stickers:'Stickers'};

  function screen(){return document.querySelector('.screen[data-screen="outfits"]');}
  function decorateWorkspace(){return screen()?.querySelector('.board-workspace-panel[data-board-panel="decorate"]')||null;}
  function decorateShell(){return decorateWorkspace()?.querySelector('.board-decorate-shell')||decorateWorkspace();}
  function decorateTabs(){return Array.from(decorateWorkspace()?.querySelectorAll('.decorate-studio-tab[data-decorate-group]')||[]);}
  function decoratePanels(){return Array.from(decorateWorkspace()?.querySelectorAll('.decorate-studio-panel[data-decorate-group]')||[]);}

  function installStyles(){
    let style=document.getElementById(STYLE_ID);
    if(!style){style=document.createElement('style');style.id=STYLE_ID;document.head.appendChild(style);}
    style.textContent=`
      .screen[data-screen="outfits"] .board-workspace-panel[data-board-panel="decorate"]{
        padding-top:0!important;
      }
      .screen[data-screen="outfits"] .board-decorate-shell{
        margin-top:0!important;
        padding-top:0!important;
      }
      .screen[data-screen="outfits"] .${LAYOUT_CLASS}{
        display:grid!important;
        grid-template-columns:54px minmax(0,1fr)!important;
        gap:0!important;
        align-items:start!important;
        width:100%!important;
        min-width:0!important;
        margin-top:0!important;
        padding-top:0!important;
        box-sizing:border-box!important;
      }
      .screen[data-screen="outfits"] .${RAIL_CLASS}{
        position:sticky!important;
        top:0!important;
        z-index:52!important;
        display:flex!important;
        flex-direction:column!important;
        gap:2px!important;
        width:54px!important;
        min-width:54px!important;
        margin:0!important;
        padding:0!important;
        border:0!important;
        border-radius:0!important;
        background:transparent!important;
        box-shadow:none!important;
        box-sizing:border-box!important;
        align-self:start!important;
      }
      .screen[data-screen="outfits"] .${RAIL_CLASS} .decorate-studio-tab{
        appearance:none!important;
        -webkit-appearance:none!important;
        display:grid!important;
        place-items:center!important;
        grid-template-rows:22px auto!important;
        gap:1px!important;
        width:52px!important;
        min-width:52px!important;
        height:50px!important;
        min-height:50px!important;
        margin:0!important;
        padding:4px 1px 3px!important;
        border:0!important;
        border-radius:3px!important;
        background:rgba(225,219,207,.84)!important;
        color:#64685d!important;
        font:800 7px/1.02 var(--sans,system-ui,sans-serif)!important;
        text-align:center!important;
        white-space:normal!important;
        box-shadow:none!important;
        -webkit-tap-highlight-color:transparent!important;
      }
      .screen[data-screen="outfits"] .${RAIL_CLASS} .decorate-studio-tab.active{
        background:rgba(238,240,232,.96)!important;
        color:#4f5949!important;
        border-radius:3px 0 0 3px!important;
        box-shadow:none!important;
      }
      .screen[data-screen="outfits"] .${RAIL_CLASS} .decorate-rail-icon-proto1{
        display:grid!important;
        place-items:center!important;
        width:22px!important;
        height:22px!important;
        font:800 16px/1 var(--sans,system-ui,sans-serif)!important;
      }
      .screen[data-screen="outfits"] .${RAIL_CLASS} .decorate-rail-label-proto1{
        display:block!important;
        max-width:49px!important;
        overflow:hidden!important;
        text-overflow:ellipsis!important;
      }
      .screen[data-screen="outfits"] .${STAGE_CLASS}{
        position:relative!important;
        display:block!important;
        min-width:0!important;
        width:100%!important;
        margin:0!important;
        padding:0!important;
        box-sizing:border-box!important;
      }
      .screen[data-screen="outfits"] .${STAGE_CLASS}>.decorate-studio-panel{
        min-width:0!important;
        width:100%!important;
        margin:0!important;
        padding-left:0!important;
        border-top-left-radius:0!important;
      }
      .screen[data-screen="outfits"] .${STAGE_CLASS}>.decorate-studio-panel.active{
        background:rgba(238,240,232,.96)!important;
      }
      .screen[data-screen="outfits"] .${STAGE_CLASS}>.decorate-studio-panel.active>.decorate-studio-content{
        margin-left:0!important;
        padding-left:0!important;
      }
      .screen[data-screen="outfits"] .${STAGE_CLASS}>.decorate-studio-panel.active .decorate-tool-card,
      .screen[data-screen="outfits"] .${STAGE_CLASS}>.decorate-studio-panel.active #drawStudioDev10,
      .screen[data-screen="outfits"] .${STAGE_CLASS}>.decorate-studio-panel.active #stickerStudioV1322Release{
        margin-left:0!important;
        border-top-left-radius:0!important;
      }

      .screen[data-screen="outfits"].board-focus-active-dev1 #boardWorkspace>.board-workspace-tabs{
        margin-bottom:0!important;
        padding-bottom:0!important;
      }
      .screen[data-screen="outfits"].board-focus-active-dev1 .board-workspace-panel[data-board-panel="decorate"].active{
        padding-top:0!important;
        scroll-padding-top:0!important;
        overflow-y:auto!important;
        overscroll-behavior-y:contain!important;
      }
      .screen[data-screen="outfits"].board-focus-active-dev1 .${LAYOUT_CLASS}{
        min-height:100%!important;
      }
      .screen[data-screen="outfits"].board-focus-active-dev1 .${RAIL_CLASS}{
        top:0!important;
      }
      .screen[data-screen="outfits"].board-focus-active-dev1 .${STAGE_CLASS}{
        min-height:100%!important;
      }
      .screen[data-screen="outfits"].board-focus-active-dev1 .${STAGE_CLASS}>.decorate-studio-panel.active{
        position:relative!important;
        top:0!important;
      }

      @media(max-width:370px){
        .screen[data-screen="outfits"] .${LAYOUT_CLASS}{grid-template-columns:50px minmax(0,1fr)!important}
        .screen[data-screen="outfits"] .${RAIL_CLASS}{width:50px!important;min-width:50px!important}
        .screen[data-screen="outfits"] .${RAIL_CLASS} .decorate-studio-tab{width:48px!important;min-width:48px!important;height:48px!important;min-height:48px!important}
      }
    `;
  }

  function decorateButton(btn){
    const group=btn.dataset.decorateGroup||'';
    const label=LABELS[group]||btn.textContent.trim()||group;
    const icon=ICONS[group]||'•';
    btn.dataset.decorateRailProto1='1';
    btn.setAttribute('aria-label',label);
    btn.innerHTML=`<span class="decorate-rail-icon-proto1" aria-hidden="true">${icon}</span><span class="decorate-rail-label-proto1">${label}</span>`;
  }

  function installLayout(){
    installStyles();
    const workspace=decorateWorkspace();
    const shell=decorateShell();
    const tabs=decorateTabs();
    const panels=decoratePanels();
    if(!workspace||!shell||tabs.length<4||panels.length<4)return false;

    let layout=shell.querySelector(':scope > .'+LAYOUT_CLASS);
    if(!layout){
      layout=document.createElement('div');
      layout.className=LAYOUT_CLASS;
      const rail=document.createElement('nav');
      rail.className=RAIL_CLASS;
      rail.setAttribute('aria-label','Decorate tools');
      const stage=document.createElement('div');
      stage.className=STAGE_CLASS;
      layout.append(rail,stage);
      const firstRelevant=[...tabs,...panels].find(node=>node.parentNode===shell);
      if(firstRelevant)shell.insertBefore(layout,firstRelevant);else shell.appendChild(layout);
    }

    const rail=layout.querySelector('.'+RAIL_CLASS);
    const stage=layout.querySelector('.'+STAGE_CLASS);
    if(!rail||!stage)return false;

    tabs.forEach(btn=>{decorateButton(btn);if(btn.parentNode!==rail)rail.appendChild(btn);});
    panels.forEach(panel=>{if(panel.parentNode!==stage)stage.appendChild(panel);});
    workspace.classList.add('decorate-rail-enabled-proto1');
    return true;
  }

  function lockTopOnTabChange(){
    const sc=screen();
    const panel=decorateWorkspace();
    if(!sc?.classList.contains('board-focus-active-dev1')||!panel)return;
    queueMicrotask(()=>{panel.scrollTop=0;});
  }

  function schedule(){requestAnimationFrame(()=>requestAnimationFrame(installLayout));}

  function start(){
    installLayout();
    [80,220,500,900].forEach(ms=>setTimeout(installLayout,ms));
    document.addEventListener('click',e=>{
      const t=e.target;if(!(t instanceof Element))return;
      if(t.closest('.decorate-studio-tab[data-decorate-group]'))lockTopOnTabChange();
      if(t.closest('.board-workspace-tab[data-board-panel="decorate"],#decorateToggle,.decorate-studio-tab[data-decorate-group]'))schedule();
    },false);
    window.addEventListener('pageshow',schedule);
    document.addEventListener('visibilitychange',()=>{if(!document.hidden)schedule();});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
