/* Audrey Closet v13.22 Draw Studio clean dev2
 * Draw tool strip + local UI selection state only.
 * No Board data, drawing engine, storage, photo, settings, Text, Stickers,
 * Shapes, or service-worker behavior is changed here.
 */
(function(){
  'use strict';

  const ROOT_ID='drawStudioCleanDev1';
  const STYLE_ID='drawStudioCleanDev2Styles';
  const TOOLS=[
    ['line','Line','╱'],
    ['arrow','Arrow','➜'],
    ['pencil','Pencil','✎'],
    ['pen','Pen','✒'],
    ['sharpie','Sharpie','▬'],
    ['highlighter','Highlight','▰'],
    ['eraser','Eraser','⌫']
  ];
  let selectedTool='pencil';

  function installStyles(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      .screen[data-screen="outfits"] #${ROOT_ID}{display:grid;gap:6px;margin:0 0 6px;padding:7px 9px;border:1px solid rgba(102,113,90,.18);border-radius:10px;background:rgba(238,240,232,.68);color:#5d6657;font:600 10px/1.2 var(--sans,system-ui,sans-serif)}
      .screen[data-screen="outfits"] #${ROOT_ID} .draw-clean-head{display:flex;align-items:center;justify-content:space-between;gap:8px}
      .screen[data-screen="outfits"] #${ROOT_ID} .draw-clean-head small{font:700 9px/1 var(--sans,system-ui,sans-serif);opacity:.72}
      .screen[data-screen="outfits"] #${ROOT_ID} .draw-tool-strip{display:flex;gap:5px;max-width:100%;overflow-x:auto;overflow-y:hidden;padding:1px 0 3px;scrollbar-width:none;-webkit-overflow-scrolling:touch;touch-action:pan-x}
      .screen[data-screen="outfits"] #${ROOT_ID} .draw-tool-strip::-webkit-scrollbar{display:none}
      .screen[data-screen="outfits"] #${ROOT_ID} .draw-tool-btn{appearance:none;-webkit-appearance:none;display:grid;place-items:center;grid-template-rows:24px auto;gap:2px;flex:0 0 58px;min-width:58px;height:48px;padding:4px 3px;border:1px solid rgba(102,113,90,.22);border-radius:9px;background:rgba(255,255,255,.62);color:#5b6356;font:700 8px/1 var(--sans,system-ui,sans-serif);-webkit-tap-highlight-color:transparent}
      .screen[data-screen="outfits"] #${ROOT_ID} .draw-tool-btn .draw-tool-icon{display:grid;place-items:center;width:24px;height:24px;font:700 16px/1 var(--sans,system-ui,sans-serif)}
      .screen[data-screen="outfits"] #${ROOT_ID} .draw-tool-btn.active{border-color:#66715a;background:rgba(102,113,90,.15);color:#4f5949;box-shadow:inset 0 0 0 1px rgba(102,113,90,.18)}
      .screen[data-screen="outfits"] #${ROOT_ID} .draw-tool-status{font:600 9px/1.25 var(--sans,system-ui,sans-serif);color:#756d63}
    `;
    document.head.appendChild(style);
  }

  function syncSelection(root){
    root.querySelectorAll('.draw-tool-btn').forEach(btn=>{
      const active=btn.dataset.drawTool===selectedTool;
      btn.classList.toggle('active',active);
      btn.setAttribute('aria-pressed',active?'true':'false');
    });
    const status=root.querySelector('.draw-tool-status');
    const match=TOOLS.find(([id])=>id===selectedTool);
    if(status)status.textContent=`Selected: ${match?match[1]:selectedTool} · UI only`;
  }

  function installDrawStudio(){
    const existing=document.getElementById(ROOT_ID);
    if(existing){
      installStyles();
      syncSelection(existing);
      return true;
    }

    const panel=document.querySelector('.decorate-studio-panel[data-decorate-group="draw"]');
    if(!panel)return false;

    installStyles();
    const content=panel.querySelector('.decorate-studio-content')||panel;
    const root=document.createElement('div');
    root.id=ROOT_ID;
    root.innerHTML=`
      <div class="draw-clean-head"><span>Draw Studio</span><small>clean dev2</small></div>
      <div class="draw-tool-strip" role="toolbar" aria-label="Draw tools">
        ${TOOLS.map(([id,label,icon])=>`<button type="button" class="draw-tool-btn" data-draw-tool="${id}" aria-pressed="false"><span class="draw-tool-icon" aria-hidden="true">${icon}</span><span>${label}</span></button>`).join('')}
      </div>
      <div class="draw-tool-status" aria-live="polite"></div>`;

    root.querySelectorAll('.draw-tool-btn').forEach(btn=>{
      btn.addEventListener('click',()=>{
        selectedTool=btn.dataset.drawTool||'pencil';
        syncSelection(root);
      });
    });

    content.prepend(root);
    syncSelection(root);
    return true;
  }

  function start(){
    if(installDrawStudio())return;
    const observer=new MutationObserver(()=>{
      if(installDrawStudio())observer.disconnect();
    });
    observer.observe(document.documentElement,{childList:true,subtree:true});
    window.setTimeout(()=>observer.disconnect(),10000);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
