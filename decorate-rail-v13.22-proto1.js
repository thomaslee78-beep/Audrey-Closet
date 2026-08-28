/* Audrey Closet v13.22 Decorate Rail prototype 1
 * Structural-only experiment:
 * - reuses existing Decorate tab buttons and handlers
 * - moves them into a narrow left rail
 * - places existing feature panels in a flexible right stage
 * - keeps Board Focus navigation visible while the tray scrolls
 */
(function(){
  'use strict';

  const STYLE_ID='decorateRailProto1Styles';
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
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      .screen[data-screen="outfits"] .${LAYOUT_CLASS}{
        display:grid!important;
        grid-template-columns:60px minmax(0,1fr)!important;
        gap:7px!important;
        align-items:start!important;
        width:100%!important;
        min-width:0!important;
        box-sizing:border-box!important;
      }
      .screen[data-screen="outfits"] .${RAIL_CLASS}{
        position:sticky!important;
        top:2px!important;
        z-index:48!important;
        display:flex!important;
        flex-direction:column!important;
        gap:5px!important;
        width:60px!important;
        min-width:60px!important;
        padding:4px!important;
        border:1px solid rgba(102,113,90,.16)!important;
        border-radius:11px!important;
        background:rgba(230,220,201,.96)!important;
        box-shadow:0 1px 3px rgba(82,62,51,.05)!important;
        box-sizing:border-box!important;
      }
      .screen[data-screen="outfits"] .${RAIL_CLASS} .decorate-studio-tab{
        appearance:none!important;
        -webkit-appearance:none!important;
        display:grid!important;
        place-items:center!important;
        grid-template-rows:24px auto!important;
        gap:2px!important;
        width:50px!important;
        min-width:50px!important;
        min-height:50px!important;
        margin:0!important;
        padding:5px 2px 4px!important;
        border:1px solid rgba(102,113,90,.17)!important;
        border-radius:9px!important;
        background:rgba(255,255,255,.52)!important;
        color:#64685d!important;
        font:800 7px/1.05 var(--sans,system-ui,sans-serif)!important;
        text-align:center!important;
        white-space:normal!important;
        box-shadow:none!important;
        -webkit-tap-highlight-color:transparent!important;
      }
      .screen[data-screen="outfits"] .${RAIL_CLASS} .decorate-studio-tab.active{
        border-color:#66715a!important;
        background:#66715a!important;
        color:#fff!important;
        box-shadow:inset 0 0 0 1px rgba(255,255,255,.12)!important;
      }
      .screen[data-screen="outfits"] .${RAIL_CLASS} .decorate-rail-icon-proto1{
        display:grid!important;
        place-items:center!important;
        width:24px!important;
        height:24px!important;
        font:800 17px/1 var(--sans,system-ui,sans-serif)!important;
      }
      .screen[data-screen="outfits"] .${RAIL_CLASS} .decorate-rail-label-proto1{
        display:block!important;
        max-width:46px!important;
        overflow:hidden!important;
        text-overflow:ellipsis!important;
      }
      .screen[data-screen="outfits"] .${STAGE_CLASS}{
        display:block!important;
        min-width:0!important;
        width:100%!important;
        box-sizing:border-box!important;
      }
      .screen[data-screen="outfits"] .${STAGE_CLASS}>.decorate-studio-panel{
        min-width:0!important;
        width:100%!important;
        margin-left:0!important;
        margin-right:0!important;
      }
      .screen[data-screen="outfits"].board-focus-active-dev1 .${RAIL_CLASS}{
        top:4px!important;
      }
      .screen[data-screen="outfits"].board-focus-active-dev1 .${LAYOUT_CLASS}{
        align-items:start!important;
      }
      .screen[data-screen="outfits"].board-focus-active-dev1 .board-workspace-panel[data-board-panel="decorate"]{
        scroll-padding-top:4px!important;
      }
      @media(max-width:370px){
        .screen[data-screen="outfits"] .${LAYOUT_CLASS}{grid-template-columns:56px minmax(0,1fr)!important;gap:5px!important}
        .screen[data-screen="outfits"] .${RAIL_CLASS}{width:56px!important;min-width:56px!important;padding:3px!important}
        .screen[data-screen="outfits"] .${RAIL_CLASS} .decorate-studio-tab{width:48px!important;min-width:48px!important;min-height:48px!important}
      }
    `;
    document.head.appendChild(style);
  }

  function decorateButton(btn){
    if(btn.dataset.decorateRailProto1==='1')return;
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
      if(firstRelevant)shell.insertBefore(layout,firstRelevant);
      else shell.appendChild(layout);
    }

    const rail=layout.querySelector('.'+RAIL_CLASS);
    const stage=layout.querySelector('.'+STAGE_CLASS);
    if(!rail||!stage)return false;

    tabs.forEach(btn=>{decorateButton(btn);if(btn.parentNode!==rail)rail.appendChild(btn);});
    panels.forEach(panel=>{if(panel.parentNode!==stage)stage.appendChild(panel);});

    workspace.classList.add('decorate-rail-enabled-proto1');
    return true;
  }

  function schedule(){requestAnimationFrame(()=>requestAnimationFrame(installLayout));}

  function start(){
    installLayout();
    [80,220,500,900].forEach(ms=>setTimeout(installLayout,ms));
    document.addEventListener('click',e=>{
      const t=e.target;if(!(t instanceof Element))return;
      if(t.closest('.board-workspace-tab[data-board-panel="decorate"],#decorateToggle,.decorate-studio-tab[data-decorate-group]'))schedule();
    },false);
    window.addEventListener('pageshow',schedule);
    document.addEventListener('visibilitychange',()=>{if(!document.hidden)schedule();});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
