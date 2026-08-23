/* Audrey Closet v13.22-dev1a — Shape Studio basic object model + picker */
(function(){
  'use strict';

  const BASIC_SHAPES=[
    {id:'square',label:'Square',w:96,h:96},
    {id:'circle',label:'Circle',w:96,h:96},
    {id:'rectangle',label:'Rectangle',w:150,h:90},
    {id:'oval',label:'Oval',w:150,h:90},
    {id:'roundedRect',label:'Rounded rectangle',w:150,h:90},
    {id:'star',label:'Star',w:110,h:110},
    {id:'triangle',label:'Triangle',w:120,h:105}
  ];
  const BASIC_IDS=new Set(BASIC_SHAPES.map(x=>x.id));

  function safe(value){
    return String(value??'').replace(/[&<>"']/g,ch=>({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    })[ch]);
  }

  function normalizeShapeStyle(style){
    const s=style&&typeof style==='object'?style:{};
    return {
      fill:typeof s.fill==='string'&&s.fill?s.fill:'rgba(77,142,138,.08)',
      borderColor:typeof s.borderColor==='string'&&s.borderColor?s.borderColor:'#4d8e8a',
      borderWidth:Math.max(0,Math.min(20,Number(s.borderWidth)||4))
    };
  }

  function normalizeShapePiece(piece){
    if(!piece||piece.kind!=='shape')return piece;
    piece.shapeType=String(piece.shapeType||piece.value||'circle');
    piece.value=piece.shapeType;
    piece.shapeStyle=normalizeShapeStyle(piece.shapeStyle);
    return piece;
  }

  function shapeSvgMarkup(piece,{preview=false}={}){
    const p=normalizeShapePiece({...piece});
    const type=p.shapeType;
    const s=p.shapeStyle;
    const fill=preview?'rgba(77,142,138,.07)':s.fill;
    const stroke=preview?'#4d8e8a':s.borderColor;
    const sw=preview?2:s.borderWidth;
    const common=`fill="${safe(fill)}" stroke="${safe(stroke)}" stroke-width="${sw}" vector-effect="non-scaling-stroke"`;
    let body='';
    if(type==='square'||type==='rectangle')body=`<rect x="5" y="5" width="90" height="90" ${common}/>`;
    else if(type==='circle')body=`<circle cx="50" cy="50" r="44" ${common}/>`;
    else if(type==='oval')body=`<ellipse cx="50" cy="50" rx="44" ry="30" ${common}/>`;
    else if(type==='roundedRect')body=`<rect x="5" y="7" width="90" height="86" rx="18" ry="18" ${common}/>`;
    else if(type==='star')body=`<polygon points="50,5 61,36 95,37 68,57 77,91 50,71 23,91 32,57 5,37 39,36" ${common}/>`;
    else if(type==='triangle')body=`<polygon points="50,7 95,92 5,92" ${common}/>`;
    else if(type==='line')body=`<line x1="5" y1="50" x2="95" y2="50" fill="none" stroke="${safe(stroke)}" stroke-width="${Math.max(2,sw)}" stroke-linecap="round" vector-effect="non-scaling-stroke"/>`;
    else if(type==='tape')body=`<rect x="2" y="14" width="96" height="72" rx="5" fill="rgba(198,163,78,.42)" stroke="none"/>`;
    else body=`<rect x="5" y="5" width="90" height="90" ${common}/>`;
    return `<svg class="shape-studio-svg shape-${safe(type)}" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" focusable="false">${body}</svg>`;
  }

  const originalNormalizeBoardItem=window.normalizeBoardItem;
  if(typeof originalNormalizeBoardItem==='function'){
    window.normalizeBoardItem=function(item){
      return normalizeShapePiece(originalNormalizeBoardItem.apply(this,arguments));
    };
  }

  const originalBoardItemContent=window.boardItemContent;
  if(typeof originalBoardItemContent==='function'){
    window.boardItemContent=function(piece){
      if(piece?.kind==='shape')return shapeSvgMarkup(piece);
      return originalBoardItemContent.apply(this,arguments);
    };
  }

  const originalRenderMiniPiece=window.renderMiniPiece;
  if(typeof originalRenderMiniPiece==='function'){
    window.renderMiniPiece=function(piece,outfit){
      if(piece?.kind!=='shape')return originalRenderMiniPiece.apply(this,arguments);
      const p=normalizeShapePiece({...piece});
      const sw=Number(outfit?.boardWidth)||390,sh=Number(outfit?.boardHeight)||420;
      const left=Math.max(-10,Math.min(100,(Number(p.x)||0)/sw*100));
      const top=Math.max(-10,Math.min(100,(Number(p.y)||0)/sh*100));
      const width=Math.max(8,Math.min(70,(Number(p.w)||90)/sw*100));
      const height=Math.max(8,Math.min(70,(Number(p.h)||90)/sh*100));
      const style=`left:${left}%;top:${top}%;width:${width}%;height:${height}%;z-index:${Number(p.z)||1};transform:rotate(${Number(p.rotation)||0}deg)`;
      return `<span class="portfolio-shape shape-studio-mini" style="${style}">${shapeSvgMarkup(p)}</span>`;
    };
  }

  function addShape(shapeType){
    const def=BASIC_SHAPES.find(x=>x.id===shapeType);
    if(!def)return;
    const before=typeof window.cloneBoardStateV13205==='function'?window.cloneBoardStateV13205():null;
    const item={
      uid:id(),
      kind:'shape',
      shapeType:def.id,
      value:def.id,
      shapeStyle:normalizeShapeStyle(null),
      x:55+Math.random()*70,
      y:65+Math.random()*70,
      w:def.w,
      h:def.h,
      rotation:0,
      z:nextZ()
    };
    boardItems.push(item);
    selectedBoardUid=item.uid;
    if(before&&typeof window.pushBoardStateUndoV13205==='function')window.pushBoardStateUndoV13205(before,null,'add shape');
    drawBoard();
    if(typeof toast==='function')toast(def.label+' added');
  }

  function pickerIcon(def){
    return shapeSvgMarkup({kind:'shape',shapeType:def.id,value:def.id,shapeStyle:normalizeShapeStyle(null)},{preview:true});
  }

  function installShapeStudio(){
    const content=document.querySelector('.decorate-studio-panel[data-decorate-group="shapes"] .decorate-studio-content');
    if(!content||document.getElementById('shapeStudioV132201'))return;
    let card=content.querySelector('.decorate-tool-card');
    if(!card){card=document.createElement('div');card.className='decorate-tool-card';content.appendChild(card)}
    card.innerHTML='';

    const studio=document.createElement('div');
    studio.id='shapeStudioV132201';
    studio.className='shape-studio';
    studio.innerHTML=`
      <div class="shape-studio-head">
        <div><strong>Shape Studio</strong><small>Tap a shape to add it to the Board.</small></div>
      </div>
      <div class="shape-studio-section">
        <span class="shape-studio-label">Basic</span>
        <div class="shape-basic-row" role="group" aria-label="Basic shapes"></div>
      </div>
      <p class="shape-studio-hint">Select a shape on the Board to move, rotate, resize, layer or delete it. Independent stretch controls come in the next Shape Studio build.</p>`;
    card.appendChild(studio);

    const row=studio.querySelector('.shape-basic-row');
    BASIC_SHAPES.forEach(def=>{
      const btn=document.createElement('button');
      btn.type='button';
      btn.className='shape-picker-btn';
      btn.dataset.shapeType=def.id;
      btn.setAttribute('aria-label','Add '+def.label);
      btn.title=def.label;
      btn.innerHTML=`<span class="shape-picker-icon">${pickerIcon(def)}</span><small>${safe(def.label==='Rounded rectangle'?'Rounded':def.label)}</small>`;
      btn.addEventListener('click',e=>{e.preventDefault();addShape(def.id)});
      row.appendChild(btn);
    });
  }

  function installStyles(){
    if(document.getElementById('shapeStudioStylesV132201'))return;
    const style=document.createElement('style');
    style.id='shapeStudioStylesV132201';
    style.textContent=`
      .screen[data-screen="outfits"] .shape-studio{display:grid;gap:9px}
      .screen[data-screen="outfits"] .shape-studio-head{display:flex;align-items:flex-end;justify-content:space-between;gap:10px}
      .screen[data-screen="outfits"] .shape-studio-head>div{display:grid;gap:2px}
      .screen[data-screen="outfits"] .shape-studio-head strong{font-family:var(--serif);font-size:17px;font-weight:600;color:var(--ink)}
      .screen[data-screen="outfits"] .shape-studio-head small,.screen[data-screen="outfits"] .shape-studio-hint{font-size:10px;line-height:1.35;color:#817568}
      .screen[data-screen="outfits"] .shape-studio-section{display:grid;gap:5px}
      .screen[data-screen="outfits"] .shape-studio-label{font-size:9px;font-weight:800;letter-spacing:.09em;text-transform:uppercase;color:#817568}
      .screen[data-screen="outfits"] .shape-basic-row{display:grid;grid-template-columns:repeat(7,minmax(38px,1fr));gap:5px;align-items:stretch}
      .screen[data-screen="outfits"] .shape-picker-btn{min-width:0;height:58px;padding:5px 2px 4px;border:1px solid rgba(108,81,66,.18);border-radius:10px;background:#fffaf0;color:#665c50;display:grid;grid-template-rows:32px auto;place-items:center;gap:1px;-webkit-tap-highlight-color:transparent}
      .screen[data-screen="outfits"] .shape-picker-btn:active{transform:scale(.96);background:#f3ead9}
      .screen[data-screen="outfits"] .shape-picker-btn small{font-size:7px;line-height:1.05;font-weight:700;white-space:nowrap;max-width:100%;overflow:hidden;text-overflow:ellipsis}
      .screen[data-screen="outfits"] .shape-picker-icon{display:block;width:30px;height:30px}
      .screen[data-screen="outfits"] .shape-picker-icon svg,.screen[data-screen="outfits"] .shape-studio-svg{display:block;width:100%;height:100%;overflow:visible;pointer-events:none}
      .screen[data-screen="outfits"] .shape-picker-btn[data-shape-type="oval"] .shape-picker-icon{width:34px;height:26px}
      .screen[data-screen="outfits"] .board-shape .shape-studio-svg,.screen[data-screen="outfits"] .board-piece .shape-studio-svg{width:100%;height:100%}
      .snapshot-piece .shape-studio-svg,.portfolio-shape.shape-studio-mini .shape-studio-svg{display:block;width:100%;height:100%;pointer-events:none}
      .portfolio-shape.shape-studio-mini{position:absolute;display:block}
      @media(max-width:390px){.screen[data-screen="outfits"] .shape-basic-row{gap:3px}.screen[data-screen="outfits"] .shape-picker-btn{height:54px}.screen[data-screen="outfits"] .shape-picker-btn small{font-size:6.5px}}
    `;
    document.head.appendChild(style);
  }

  installStyles();
  installShapeStudio();
  setTimeout(installShapeStudio,150);
  setTimeout(installShapeStudio,650);

  window.__audreyShapeStudioV132201={
    basicShapes:BASIC_SHAPES.map(x=>({...x})),
    normalizeShapePiece,
    shapeSvgMarkup,
    addShape
  };
})();
