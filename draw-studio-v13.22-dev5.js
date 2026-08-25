/* Audrey Closet v13.22 Draw Studio dev5
 * Pencil live with streamlined mode behavior.
 * Fixes color swatch fill, auto-enter Draw mode, and exits Draw mode when leaving Draw tab.
 * Other tools remain UI-only placeholders.
 */
(function(){
  'use strict';

  const ROOT_ID='drawStudioDev5';
  const STYLE_ID='drawStudioDev5Styles';
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
  const state={tool:'pencil',thickness:2,color:'#4f514a',lineStyle:'solid',arrowEnds:'single',drawMode:true};
  let activeStroke=null;
  let rendererInstalled=false;
  let boardListenersInstalled=false;

  function esc(value){
    return String(value??'').replace(/[&<>"']/g,ch=>({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#39;'
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
      .screen[data-screen="outfits"] #${ROOT_ID} .draw-color-wrap{position:relative;display:block;width:42px;height:32px;border:1px solid rgba(102,113,90,.20);border-radius:9px;background:var(--draw-color,#4f514a);overflow:hidden;box-shadow:inset 0 0 0 1px rgba(255,255,255,.22)}
      .screen[data-screen="outfits"] #${ROOT_ID} .draw-color-wrap input[type="color"]{position:absolute;inset:0;width:100%;height:100%;margin:0;padding:0;border:0;opacity:0;cursor:pointer;-webkit-appearance:none;appearance:none}
      .screen[data-screen="outfits"] #${ROOT_ID} .draw-segment{display:flex;gap:3px;justify-content:flex-end}
      .screen[data-screen="outfits"] #${ROOT_ID} .draw-seg-btn{appearance:none;-webkit-appearance:none;height:32px;padding:0 8px;border:1px solid rgba(102,113,90,.20);border-radius:9px;background:rgba(255,255,255,.62);color:#666057;font:800 8px/1 var(--sans,system-ui,sans-serif);white-space:nowrap}
      .screen[data-screen="outfits"] #${ROOT_ID} .draw-seg-btn.active{border-color:#66715a;background:rgba(102,113,90,.15);color:#4f5949}
      .screen[data-screen="outfits"] #${ROOT_ID} .draw-secondary-row{display:flex;gap:6px;align-items:center;justify-content:space-between;min-height:34px}
      .screen[data-screen="outfits"] #${ROOT_ID} .draw-status-wrap{display:grid;gap:2px;min-width:0}
      .screen[data-screen="outfits"] #${ROOT_ID} .draw-tool-status{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font:600 9px/1.25 var(--sans,system-ui,sans-serif);color:#756d63}
      .screen[data-screen="outfits"] #${ROOT_ID} .draw-mode-hint{font:700 8px/1.2 var(--sans,system-ui,sans-serif);color:#81786d}
      .screen[data-screen="outfits"] #${ROOT_ID} .draw-mode-btn{appearance:none;-webkit-appearance:none;min-width:66px;height:34px;padding:0 11px;border:1px solid #66715a;border-radius:10px;background:#66715a;color:white;font:800 9px/1 var(--sans,system-ui,sans-serif);-webkit-tap-highlight-color:transparent}
      .screen[data-screen="outfits"] #${ROOT_ID} .draw-mode-btn.active{background:#4f5949;box-shadow:inset 0 0 0 1px rgba(255,255,255,.18)}
      .screen[data-screen="outfits"] #${ROOT_ID} .draw-mode-btn:disabled{opacity:.38}
      .screen[data-screen="outfits"] #${ROOT_ID} .draw-arrow-settings{display:flex;gap:3px;align-items:center}
      .screen[data-screen="outfits"] #${ROOT_ID} .draw-arrow-settings.hidden{display:none}
      .screen[data-screen="outfits"] .decorate-studio-panel[data-decorate-group="draw"] .decorate-draw-current{display:none!important}
      #outfitBoard.draw-dev5-active{touch-action:none!important;cursor:crosshair}
      #outfitBoard .draw-live-overlay-dev5{position:absolute;inset:0;width:100%;height:100%;z-index:2147483000;pointer-events:none;overflow:visible}
      .board-piece .drawing-svg-dev5{display:block;width:100%;height:100%;overflow:visible;pointer-events:none}
      @media (max-width:430px){
        .screen[data-screen="outfits"] #${ROOT_ID} .draw-control-row{grid-template-columns:minmax(104px,1fr) 38px auto}
        .screen[data-screen="outfits"] #${ROOT_ID} .draw-color-wrap{width:38px}
        .screen[data-screen="outfits"] #${ROOT_ID} .draw-seg-btn{padding:0 6px;font-size:7px}
      }
    `;
    document.head.appendChild(style);
  }

  function installDrawingRenderer(){
    if(rendererInstalled)return true;
    if(typeof boardItemContent!=='function'||typeof normalizeBoardItem!=='function')return false;
    const originalContent=boardItemContent;
    boardItemContent=function(b){
      if(b&&b.kind==='drawing'&&b.drawingType==='freeform'){
        const w=Math.max(1,Number(b.w)||1);
        const h=Math.max(1,Number(b.h)||1);
        const color=esc(b.strokeColor||'#4f514a');
        const width=Math.max(1,Number(b.strokeWidth)||2);
        const opacity=Math.max(0,Math.min(1,Number(b.opacity??1)));
        const dash=b.strokeStyle==='dotted'?`${Math.max(1,width*.6)} ${Math.max(2,width*2.2)}`:'';
        return `<svg class="drawing-svg-dev5" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true"><polyline points="${esc(b.points||'')}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"${dash?` stroke-dasharray="${dash}"`:''} opacity="${opacity}" vector-effect="non-scaling-stroke"/></svg>`;
      }
      return originalContent(b);
    };
    const originalNormalize=normalizeBoardItem;
    normalizeBoardItem=function(b){
      b=originalNormalize(b);
      if(b&&b.kind==='drawing'){
        b.drawingType=b.drawingType||'freeform';
        b.tool=b.tool||'pencil';
        b.strokeColor=b.strokeColor||'#4f514a';
        b.strokeWidth=Math.max(1,Number(b.strokeWidth)||2);
        b.strokeStyle=b.strokeStyle==='dotted'?'dotted':'solid';
        b.opacity=Math.max(0,Math.min(1,Number(b.opacity??1)));
        b.points=String(b.points||'');
      }
      return b;
    };
    rendererInstalled=true;
    return true;
  }

  function pointOnBoard(board,e){
    const rect=board.getBoundingClientRect();
    const sx=rect.width?board.clientWidth/rect.width:1;
    const sy=rect.height?board.clientHeight/rect.height:1;
    return {x:Math.max(0,Math.min(board.clientWidth,(e.clientX-rect.left)*sx)),y:Math.max(0,Math.min(board.clientHeight,(e.clientY-rect.top)*sy))};
  }

  function ensureOverlay(board){
    let svg=board.querySelector('.draw-live-overlay-dev5');
    if(svg)svg.remove();
    svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
    svg.setAttribute('class','draw-live-overlay-dev5');
    svg.setAttribute('viewBox',`0 0 ${Math.max(1,board.clientWidth)} ${Math.max(1,board.clientHeight)}`);
    svg.setAttribute('preserveAspectRatio','none');
    const line=document.createElementNS('http://www.w3.org/2000/svg','polyline');
    line.setAttribute('fill','none');
    line.setAttribute('stroke',state.color);
    line.setAttribute('stroke-width',String(state.thickness));
    line.setAttribute('stroke-linecap','round');
    line.setAttribute('stroke-linejoin','round');
    if(state.lineStyle==='dotted')line.setAttribute('stroke-dasharray',`${Math.max(1,state.thickness*.6)} ${Math.max(2,state.thickness*2.2)}`);
    svg.appendChild(line);
    board.appendChild(svg);
    return {svg,line};
  }

  function updateLiveStroke(){
    if(!activeStroke)return;
    activeStroke.line.setAttribute('points',activeStroke.points.map(p=>`${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' '));
  }

  function beginStroke(board,e){
    if(!state.drawMode||state.tool!=='pencil'||e.button>0)return;
    e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();
    const point=pointOnBoard(board,e);
    const overlay=ensureOverlay(board);
    activeStroke={pointerId:e.pointerId,points:[point],svg:overlay.svg,line:overlay.line};
    try{board.setPointerCapture(e.pointerId)}catch(_){ }
    updateLiveStroke();
  }

  function moveStroke(board,e){
    if(!activeStroke||e.pointerId!==activeStroke.pointerId)return;
    e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();
    const point=pointOnBoard(board,e);
    const last=activeStroke.points[activeStroke.points.length-1];
    const dx=point.x-last.x,dy=point.y-last.y;
    if(dx*dx+dy*dy<1.5)return;
    activeStroke.points.push(point);
    updateLiveStroke();
  }

  function finishStroke(board,e,cancelled){
    if(!activeStroke||e.pointerId!==activeStroke.pointerId)return;
    e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();
    const stroke=activeStroke;activeStroke=null;
    try{board.releasePointerCapture(e.pointerId)}catch(_){ }
    stroke.svg?.remove();
    if(cancelled)return;
    if(stroke.points.length===1){const p=stroke.points[0];stroke.points.push({x:p.x+.01,y:p.y+.01});}
    if(typeof boardItems==='undefined'||typeof id!=='function'||typeof nextZ!=='function'||typeof drawBoard!=='function')return;
    const pad=Math.max(3,state.thickness*1.5);
    const xs=stroke.points.map(p=>p.x),ys=stroke.points.map(p=>p.y);
    const minX=Math.max(0,Math.min(...xs)-pad),minY=Math.max(0,Math.min(...ys)-pad);
    const maxX=Math.min(board.clientWidth,Math.max(...xs)+pad),maxY=Math.min(board.clientHeight,Math.max(...ys)+pad);
    const w=Math.max(2,maxX-minX),h=Math.max(2,maxY-minY);
    const relative=stroke.points.map(p=>`${(p.x-minX).toFixed(1)},${(p.y-minY).toFixed(1)}`).join(' ');
    boardItems.push({uid:id(),kind:'drawing',drawingType:'freeform',tool:'pencil',strokeColor:state.color,strokeWidth:state.thickness,strokeStyle:state.lineStyle,opacity:1,points:relative,x:minX,y:minY,w,h,rotation:0,z:nextZ()});
    if(typeof selectedBoardUid!=='undefined')selectedBoardUid=null;
    drawBoard();
  }

  function cancelActiveStroke(){if(!activeStroke)return;activeStroke.svg?.remove();activeStroke=null;}

  function installBoardListeners(){
    if(boardListenersInstalled)return true;
    const board=document.getElementById('outfitBoard');
    if(!board)return false;
    board.addEventListener('pointerdown',e=>beginStroke(board,e),true);
    board.addEventListener('pointermove',e=>moveStroke(board,e),true);
    board.addEventListener('pointerup',e=>finishStroke(board,e,false),true);
    board.addEventListener('pointercancel',e=>finishStroke(board,e,true),true);
    boardListenersInstalled=true;
    return true;
  }

  function applyDrawMode(){
    const board=document.getElementById('outfitBoard');
    if(board)board.classList.toggle('draw-dev5-active',state.drawMode&&state.tool==='pencil');
    if(!(state.drawMode&&state.tool==='pencil'))cancelActiveStroke();
  }

  function sync(root){
    root.querySelectorAll('.draw-tool-btn').forEach(btn=>{const active=btn.dataset.drawTool===state.tool;btn.classList.toggle('active',active);btn.setAttribute('aria-pressed',active?'true':'false');});
    root.querySelectorAll('[data-line-style]').forEach(btn=>{const active=btn.dataset.lineStyle===state.lineStyle;btn.classList.toggle('active',active);btn.setAttribute('aria-pressed',active?'true':'false');});
    root.querySelectorAll('[data-arrow-ends]').forEach(btn=>{const active=btn.dataset.arrowEnds===state.arrowEnds;btn.classList.toggle('active',active);btn.setAttribute('aria-pressed',active?'true':'false');});
    const slider=root.querySelector('#drawThicknessDev5');
    const value=root.querySelector('.draw-thickness-value');
    const color=root.querySelector('#drawColorDev5');
    const colorWrap=root.querySelector('.draw-color-wrap');
    if(slider)slider.value=String(state.thickness);
    if(value)value.textContent=String(state.thickness);
    if(color)color.value=state.color;
    if(colorWrap)colorWrap.style.setProperty('--draw-color',state.color);
    const arrowSettings=root.querySelector('.draw-arrow-settings');
    if(arrowSettings)arrowSettings.classList.toggle('hidden',state.tool!=='arrow');
    const modeBtn=root.querySelector('.draw-mode-btn');
    const pencilReady=state.tool==='pencil';
    if(modeBtn){modeBtn.disabled=!pencilReady;modeBtn.classList.toggle('active',state.drawMode&&pencilReady);modeBtn.textContent=state.drawMode&&pencilReady?'Done':'Draw';modeBtn.setAttribute('aria-pressed',state.drawMode&&pencilReady?'true':'false');}
    const match=TOOLS.find(([id])=>id===state.tool);
    const status=root.querySelector('.draw-tool-status');
    const hint=root.querySelector('.draw-mode-hint');
    if(status){const stylePart=state.tool==='eraser'?'':` · ${state.lineStyle}`;status.textContent=`${match?match[1]:state.tool} · ${state.thickness}px${stylePart}`;}
    if(hint){if(state.tool==='pencil')hint.textContent=state.drawMode?'Draw continuously on the board · tap Done to select objects':'Tap Pencil or Draw to resume drawing';else hint.textContent='This tool is UI-only in dev5';}
    applyDrawMode();
  }

  function exitDrawMode(){
    state.drawMode=false;
    cancelActiveStroke();
    applyDrawMode();
    const root=document.getElementById(ROOT_ID);
    if(root)sync(root);
  }

  function enterDrawMode(){
    if(state.tool!=='pencil')return;
    state.drawMode=true;
    const root=document.getElementById(ROOT_ID);
    if(root)sync(root);else applyDrawMode();
  }

  function buildRoot(){
    const root=document.createElement('div');
    root.id=ROOT_ID;
    root.innerHTML=`
      <div class="draw-clean-head"><span>Draw Studio</span><small>dev5 · Pencil live</small></div>
      <div class="draw-tool-strip" role="toolbar" aria-label="Draw tools">
        ${TOOLS.map(([id,label,icon])=>`<button type="button" class="draw-tool-btn" data-draw-tool="${esc(id)}" aria-pressed="false"><span class="draw-tool-icon" aria-hidden="true">${icon}</span><span>${esc(label)}</span></button>`).join('')}
      </div>
      <div class="draw-control-row">
        <label class="draw-thickness"><span class="draw-control-label">Size</span><input id="drawThicknessDev5" type="range" min="1" max="24" step="1" value="2" aria-label="Draw thickness"><span class="draw-thickness-value">2</span></label>
        <label class="draw-color-wrap" aria-label="Draw color"><input id="drawColorDev5" type="color" value="#4f514a"></label>
        <div class="draw-segment" role="group" aria-label="Line style"><button type="button" class="draw-seg-btn" data-line-style="solid" aria-pressed="true">Solid</button><button type="button" class="draw-seg-btn" data-line-style="dotted" aria-pressed="false">Dotted</button></div>
      </div>
      <div class="draw-secondary-row">
        <div class="draw-status-wrap"><div class="draw-tool-status" aria-live="polite"></div><div class="draw-mode-hint"></div></div>
        <div class="draw-arrow-settings hidden" role="group" aria-label="Arrow ends"><span class="draw-control-label">Arrow</span><button type="button" class="draw-seg-btn" data-arrow-ends="single" aria-pressed="true">Single</button><button type="button" class="draw-seg-btn" data-arrow-ends="double" aria-pressed="false">Double</button></div>
        <button type="button" class="draw-mode-btn" aria-pressed="true">Done</button>
      </div>`;
    root.querySelectorAll('.draw-tool-btn').forEach(btn=>{
      btn.addEventListener('click',()=>{
        state.tool=btn.dataset.drawTool||'pencil';
        state.thickness=DEFAULT_THICKNESS[state.tool]||3;
        state.drawMode=state.tool==='pencil';
        sync(root);
      });
    });
    root.querySelector('#drawThicknessDev5')?.addEventListener('input',e=>{state.thickness=Math.max(1,Math.min(24,Number(e.target.value)||1));sync(root);});
    root.querySelector('#drawColorDev5')?.addEventListener('input',e=>{state.color=e.target.value||'#4f514a';sync(root);});
    root.querySelectorAll('[data-line-style]').forEach(btn=>btn.addEventListener('click',()=>{state.lineStyle=btn.dataset.lineStyle||'solid';sync(root);}));
    root.querySelectorAll('[data-arrow-ends]').forEach(btn=>btn.addEventListener('click',()=>{state.arrowEnds=btn.dataset.arrowEnds||'single';sync(root);}));
    root.querySelector('.draw-mode-btn')?.addEventListener('click',()=>{if(state.tool!=='pencil')return;state.drawMode=!state.drawMode;sync(root);});
    sync(root);
    return root;
  }

  function install(){
    installStyles();installDrawingRenderer();installBoardListeners();
    const panel=document.querySelector('.decorate-studio-panel[data-decorate-group="draw"]');
    if(!panel)return false;
    const content=panel.querySelector('.decorate-studio-content')||panel;
    let root=document.getElementById(ROOT_ID);
    if(root&&content.contains(root)){sync(root);return true;}
    if(root)root.remove();
    root=buildRoot();
    content.prepend(root);
    return true;
  }

  function scheduleInstall(){requestAnimationFrame(()=>requestAnimationFrame(()=>{install();enterDrawMode();}));}

  function start(){
    install();
    document.addEventListener('click',e=>{
      const tab=e.target.closest?.('.decorate-studio-tab[data-decorate-group]');
      if(tab){
        if(tab.dataset.decorateGroup==='draw')scheduleInstall();
        else exitDrawMode();
      }
      if(e.target.closest?.('#decorateToggle'))window.setTimeout(install,0);
    },true);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
