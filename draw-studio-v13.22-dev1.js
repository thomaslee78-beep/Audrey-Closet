/* Audrey Closet v13.22 Draw Studio clean dev1
 * UI marker only. No Board data, drawing engine, storage, photo, settings,
 * Text, Stickers, Shapes, or service-worker behavior is changed here.
 */
(function(){
  'use strict';

  const MARKER_ID='drawStudioCleanDev1';

  function installDrawMarker(){
    if(document.getElementById(MARKER_ID))return true;

    const panel=document.querySelector('.decorate-studio-panel[data-decorate-group="draw"]');
    if(!panel)return false;

    const content=panel.querySelector('.decorate-studio-content')||panel;
    const marker=document.createElement('div');
    marker.id=MARKER_ID;
    marker.setAttribute('role','status');
    marker.style.cssText=[
      'display:flex',
      'align-items:center',
      'justify-content:space-between',
      'gap:8px',
      'margin:0 0 6px',
      'padding:7px 9px',
      'border:1px solid rgba(102,113,90,.18)',
      'border-radius:10px',
      'background:rgba(238,240,232,.68)',
      'color:#5d6657',
      'font:600 10px/1.2 var(--sans,system-ui,sans-serif)'
    ].join(';');
    marker.innerHTML='<span>Draw Studio</span><small style="font:700 9px/1 var(--sans,system-ui,sans-serif);opacity:.72">clean dev1</small>';
    content.prepend(marker);
    return true;
  }

  function start(){
    if(installDrawMarker())return;
    const observer=new MutationObserver(()=>{
      if(installDrawMarker())observer.disconnect();
    });
    observer.observe(document.documentElement,{childList:true,subtree:true});
    window.setTimeout(()=>observer.disconnect(),10000);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
