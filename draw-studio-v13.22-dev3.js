/* Audrey Closet v13.22 Draw Studio dev3
 * Tool strip + local Draw control state only.
 * No drawing engine, Board pointer handlers, Board data, or persistence changes.
 */
(function(){
  'use strict';

  const ROOT_ID='drawStudioDev3';
  const STYLE_ID='drawStudioDev3Styles';
  const TOOLS=[
    ['line','Line','╱'],
    ['arrow','Arrow','➜'],
    ['pencil','Pencil','✎'],
    ['pen','Pen','✒'],
    ['sharpie','Sharpie','▬'],
    ['highlighter','Highlight','▰'],
    ['eraser','Eraser','⌫']
  ];
  const DEFAULT_THICKNESS={line:3,arrow:3,pencil:2,pen:4,sharpie:9,highlighter:16,eraser:18};
  const state={
    tool:'pencil',
    thickness:2,
    color:'#4f514a',
    lineStyle:'solid',
    arrowEnds:'single'
  };

  function safe(value){
    return String(value??'').replace(/[&<>"']/g,ch=>({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    })[ch]);
  }

  function installStyles(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      .screen[data-screen="outfits"] #${ROOT_ID}{display:grid!important;gap:6px;margin:0 0 6px;padding:7px 9px;border:1px solid rgba(102,113,90,.18);border-radius:10px;background:rgba(238,240,232,.68);color:#5d6657;font:600 10px/1.2 var(--sans,system-ui,sans-serif)}
      .screen[data-screen="outfits"] #${ROOT_ID} .draw-clean-head{display:flex;align-items:center;justify-content:space-between;gap:8px}
      .screen[data-screen="outfits"] #${ROOT_ID} .draw-clean-head small{font:700 9px/1 var(--sans,system-ui,sans-serif);opacity:.72}
      .screen[data-screen="outfits"] #${ROOT_ID} .draw-tool-strip{display:flex!important;gap:5px;max-width:100%;overflow-x:auto;overflow-y:hidden;padding:1px 0 3px;scrollbar-width:none;-webkit-overflow-scrolling:touch;touch-action:pan-x}
      .screen[data-screen="outfits"] #${ROOT_ID} .draw-tool-strip::-webkit-scrollbar{display:none}
      .screen[data-screen="outfits"] #${ROOT_ID} .draw-tool-btn{appearance:none;-webkit-appearance:none;display:grid!important;place-items:center;grid-template-rows:24px auto;gap:2px;flex:0 0 58px;min-width:58px;height:48px;padding:4px 3px;border:1px solid rgba(102,113,90,.22);border-radius:9px;background:rgba(255,255,255,.62);color:#5b6356;font:700 8px/1 var(--sans,system-ui,sans-serif);-webkit-tap-highlight-color:transparent}
      .screen[data-screen="outfits"] #${ROOT_ID} .draw-tool-btn .draw-tool-icon{display:grid;place-items:center;width:24px;height:24px;font:700 16px/1 var(--sans,system-ui,sans-serif)}
      .screen[data-screen="outfits"] #${ROOT_ID} .draw-tool-btn.active{border-color:#66715a;background:rgba(102,113,90,.15);color:#4f5949;box-shadow:inset 0 0 0 1px rgba(102,113,90,.18)}
      .screen[data-screen="outfits"] #${ROOT_ID} .draw-control-row{display:grid;grid-template-columns:minmax(116px,1.35fr) 42px auto;gap:5px;align-items:center}
      .screen[data-screen="outfits"] #${ROOT_ID} .draw-thickness{display:grid;grid-template-columns:auto minmax(60px,1fr) 24px;gap:5px;align-items:center;min-width:0}
      .screen[data-screen="outfits"] #${ROOT_ID} .draw-control-label{font:800 8px/1 var(--sans,system-ui,sans-serif);text-transform:uppercase;letter-spacing:.05em;color:#786f64;white-space:nowrap}
      .screen[data-screen="outfits"] #${ROOT_ID} .draw-thickness input[type="range"]{width:100%;min-width:0;margin:0;accent-color:#66715a}
      .screen[data-screen="outfits"] #${ROOT_ID} .draw-thickness-value{display:grid;place-items:center;min-width:24px;height:24px;border-radius:7px;background:rgba(255,255,255,.65);font:800 9px/1 var(--sans,system-ui,sans-serif);color:#56604f}
      .screen[data-screen="outfits"] #${ROOT_ID} .draw-color-wrap{display:grid;place-items:center;width:42px;height:32px;border:1px solid rgba(102,113,90,.20);border-radius:9px;background:rgba(255,255,255,.62);overflow:hidden}
      .screen[data-screen="outfits"] #${ROOT_ID} .draw-color-wrap input[type="color"]{width:50px;height:42px;border:0;padding:0;background:transparent}
      .screen[data-screen="outfits"] #${ROOT_ID} .draw-segment{display:flex;gap:3px;justify-content:flex-end}
      .screen[data-screen="outfits"] #${ROOT_ID} .draw-seg-btn{appearance:none;-webkit-appearance:none;height:32px;padding:0 8px;border:1px solid rgba(102,113,90,.20);border-radius:9px;background:rgba(255,255,255,.62);color:#666057;font:800 8px/1 var(--sans,system-ui,sans-serif);white-space:nowrap}
      .screen[data-screen="outfits"] #${ROOT_ID} .draw-seg-btn.active{border-color:#66715a;background:rgba(102,113,90,.15);color:#4f5949}
      .screen[data-screen="outfits"] #${ROOT_ID} .draw-secondary-row{display:flex;gap:5px;align-items:center;justify-content:space-between;min-height:32px}
      .screen[data-screen="outfits"] #${ROOT_ID} .draw-arrow-settings{display:flex;gap:3px;align-items:center}
      .screen[data-screen="outfits"] #${ROOT_ID} .draw-arrow-settings.hidden{visibility:hidden;pointer-events:none}
      .screen[data-screen="outfits"] #${ROOT_ID} .draw-tool-status{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font:600 9px/1.25 var(--sans,system-ui,sans-serif);color:#756d63}
      @media (max-width:430px){
        .screen[data-screen="outfits"] #${ROOT_ID} .draw-control-row{grid-template-columns:minmax(104px,1fr) 38px auto}
        .screen[data-screen="outfits"] #${ROOT_ID} .draw-color-wrap{width:38px}
        .screen[data-screen="outfits"] #${ROOT_ID} .draw-seg-btn{padding:0 6px;font-size:7px}
      }
    `;
    document.head.appendChild(style);
  }

  function sync(root){
    root.querySelectorAll('.draw-tool-btn').forEach(btn=>{
      const active=btn.dataset.drawTool===state.tool;
      btn.classList.toggle('active',active);
      btn.setAttribute('aria-pressed',active?'true':'false');
    });
    root.querySelectorAll('[data-line-style]').forEach(btn=>{
      const active=btn.dataset.lineStyle===state.lineStyle;
      btn.classList.toggle('active',active);
      btn.setAttribute('aria-pressed',active?'true':'false');
    });
    root.querySelectorAll('[data-arrow-ends]').forEach(btn=>{
      const active=btn.dataset.arrowEnds===state.arrowEnds;
      btn.classList.toggle('active',active);
      btn.setAttribute('aria-pressed',active?'true':'false');
    });

    const slider=root.querySelector('#drawThicknessDev3');
    const value=root.querySelector('.draw-thickness-value');
    const color=root.querySelector('#drawColorDev3');
    if(slider)slider.value=String(state.thickness);
    if(value)value.textContent=String(state.thickness);
    if(color)color.value=state.color;

    const arrowSettings=root.querySelector('.draw-arrow-settings');
    if(arrowSettings)arrowSettings.classList.toggle('hidden',state.tool!=='arrow');

    const match=TOOLS.find(([id])=>id===state.tool);
    const status=root.querySelector('.draw-tool-status');
    if(status){
      const stylePart=state.tool==='eraser'?'':` · ${state.lineStyle}`;
      status.textContent=`${match?match[1]:state.tool} · ${state.thickness}px${stylePart} · UI only`;
    }
  }

  function buildRoot(){
    const root=document.createElement('div');
    root.id=ROOT_ID;
    root.innerHTML=`
      <div class="draw-clean-head"><span>Draw Studio</span><small>dev3</small></div>
      <div class="draw-tool-strip" role="toolbar" aria-label="Draw tools">
        ${TOOLS.map(([id,label,icon])=>`<button type="button" class="draw-tool-btn" data-draw-tool="${safe(id)}" aria-pressed="false"><span class="draw-tool-icon" aria-hidden="true">${icon}</span><span>${safe(label)}</span></button>`).join('')}
      </div>
      <div class="draw-control-row">
        <label class="draw-thickness"><span class="draw-control-label">Size</span><input id="drawThicknessDev3" type="range" min="1" max="24" step="1" value="2" aria-label="Draw thickness"><span class="draw-thickness-value">2</span></label>
        <label class="draw-color-wrap" aria-label="Draw color"><input id="drawColorDev3" type="color" value="#4f514a"></label>
        <div class="draw-segment" role="group" aria-label="Line style"><button type="button" class="draw-seg-btn" data-line-style="solid" aria-pressed="true">Solid</button><button type="button" class="draw-seg-btn" data-line-style="dotted" aria-pressed="false">Dotted</button></div>
      </div>
      <div class="draw-secondary-row">
        <div class="draw-tool-status" aria-live="polite"></div>
        <div class="draw-arrow-settings hidden" role="group" aria-label="Arrow ends"><span class="draw-control-label">Arrow</span><button type="button" class="draw-seg-btn" data-arrow-ends="single" aria-pressed="true">Single</button><button type="button" class="draw-seg-btn" data-arrow-ends="double" aria-pressed="false">Double</button></div>
      </div>`;

    root.querySelectorAll('.draw-tool-btn').forEach(btn=>{
      btn.addEventListener('click',()=>{
        state.tool=btn.dataset.drawTool||'pencil';
        state.thickness=DEFAULT_THICKNESS[state.tool]||3;
        sync(root);
      });
    });
    root.querySelector('#drawThicknessDev3')?.addEventListener('input',e=>{
      state.thickness=Math.max(1,Math.min(24,Number(e.target.value)||1));
      sync(root);
    });
    root.querySelector('#drawColorDev3')?.addEventListener('input',e=>{
      state.color=e.target.value||'#4f514a';
      sync(root);
    });
    root.querySelectorAll('[data-line-style]').forEach(btn=>{
      btn.addEventListener('click',()=>{
        state.lineStyle=btn.dataset.lineStyle||'solid';
        sync(root);
      });
    });
    root.querySelectorAll('[data-arrow-ends]').forEach(btn=>{
      btn.addEventListener('click',()=>{
        state.arrowEnds=btn.dataset.arrowEnds||'single';
        sync(root);
      });
    });
    sync(root);
    return root;
  }

  function install(){
    installStyles();
    const panel=document.querySelector('.decorate-studio-panel[data-decorate-group="draw"]');
    if(!panel)return false;
    const content=panel.querySelector('.decorate-studio-content')||panel;
    let root=document.getElementById(ROOT_ID);
    if(root && content.contains(root)){
      sync(root);
      return true;
    }
    if(root)root.remove();
    content.prepend(buildRoot());
    return true;
  }

  function scheduleInstall(){
    requestAnimationFrame(()=>requestAnimationFrame(install));
  }

  function start(){
    install();
    document.addEventListener('click',e=>{
      if(e.target.closest?.('.decorate-studio-tab[data-decorate-group="draw"]'))scheduleInstall();
      if(e.target.closest?.('#decorateToggle'))window.setTimeout(install,0);
    },true);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
