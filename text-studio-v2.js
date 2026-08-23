/* =========================================================
   Audrey Closet — v13.20-dev20
   TEXT STUDIO v2
   Single-authority text architecture.

   Intent:
   - preserve dev12-visible behavior
   - keep one canonical TextPiece/TextStyle model
   - keep create-draft state separate from selected-text edit state
   - use one typography resolver for Board, Portfolio and canvas export
   - use one stable Text Studio controller/view
   ========================================================= */
(function(){
  'use strict';

  const TEXT_FONTS_V2={
    script:{label:'Signature Script',css:'"Snell Roundhand","Segoe Script","Bradley Hand",cursive'},
    editorial:{label:'Editorial Serif',css:'"Iowan Old Style","Palatino Linotype",Palatino,Georgia,serif'},
    classic:{label:'Classic Serif',css:'Georgia,"Times New Roman",serif'},
    modern:{label:'Modern Sans',css:'"Avenir Next","Helvetica Neue",Arial,sans-serif'},
    clean:{label:'Clean System',css:'-apple-system,BlinkMacSystemFont,"Segoe UI",Arial,sans-serif'},
    thin:{label:'Modern Thin',css:'"Avenir Next Ultra Light","Avenir Next","Helvetica Neue",Arial,sans-serif',weight:300},
    rounded:{label:'Soft Rounded',css:'"Avenir Next Rounded","Trebuchet MS",Arial,sans-serif'},
    handwritten:{label:'Pencil / Handwritten',css:'"Bradley Hand","Noteworthy","Marker Felt",cursive'},
    typewriter:{label:'Typewriter',css:'Menlo,"Courier New",monospace'},
    fun:{label:'Fun / Chalk',css:'"Chalkboard SE","Comic Sans MS","Marker Felt",cursive'}
  };
  const TEXT_SIZES_V2={
    small:{label:'S',px:20},medium:{label:'M',px:28},large:{label:'L',px:38},xlarge:{label:'XL',px:50}
  };
  const DEFAULT_TEXT_STYLE_V2=Object.freeze({
    font:'script',size:'medium',bold:false,italic:false,underline:false,color:'#7d3547',align:'center'
  });

  function normalizeTextStyleV2(style){
    const s=style&&typeof style==='object'?style:{};
    const color=String(s.color||'').trim();
    return {
      font:TEXT_FONTS_V2[s.font]?s.font:'script',
      size:TEXT_SIZES_V2[s.size]?s.size:'medium',
      bold:!!s.bold,
      italic:!!s.italic,
      underline:!!s.underline,
      color:/^#[0-9a-f]{6}$/i.test(color)?color:'#7d3547',
      align:['left','center','right'].includes(s.align)?s.align:'center'
    };
  }
  function cloneTextStyleV2(style){return {...normalizeTextStyleV2(style)};}
  function normalizeTextPieceV2(piece){
    if(!piece||piece.kind!=='text')return piece;
    piece.value=String(piece.value||'');
    piece.textStyle=normalizeTextStyleV2(piece.textStyle);
    return piece;
  }
  function textPresentationV2(pieceOrStyle,scale=1){
    const style=normalizeTextStyleV2(pieceOrStyle?.kind==='text'?pieceOrStyle.textStyle:pieceOrStyle);
    const font=TEXT_FONTS_V2[style.font],size=TEXT_SIZES_V2[style.size];
    const px=size.px*Math.max(.15,Number(scale)||1);
    return {
      style,
      fontFamily:font.css,
      fontSize:px+'px',
      fontPx:px,
      fontWeight:String(style.bold?700:(font.weight||400)),
      fontStyle:style.italic?'italic':'normal',
      textDecoration:style.underline?'underline':'none',
      color:style.color,
      textAlign:style.align,
      lineHeight:1.08
    };
  }
  function textStyleAttributeV2(piece,scale=1){
    const p=textPresentationV2(piece,scale);
    return [
      'font-family:'+p.fontFamily,
      'font-size:'+p.fontSize,
      'font-weight:'+p.fontWeight,
      'font-style:'+p.fontStyle,
      'text-decoration:'+p.textDecoration,
      'color:'+p.color,
      'text-align:'+p.textAlign,
      'line-height:'+p.lineHeight,
      'white-space:pre-wrap',
      'overflow-wrap:anywhere'
    ].join(';');
  }

  // ----- Canonical Board model -----
  const normalizeBoardItemBeforeTextV2=normalizeBoardItem;
  normalizeBoardItem=function(item){
    return normalizeTextPieceV2(normalizeBoardItemBeforeTextV2.apply(this,arguments));
  };

  // ----- Canonical DOM typography -----
  const boardItemContentBeforeTextV2=boardItemContent;
  boardItemContent=function(item){
    if(item?.kind!=='text')return boardItemContentBeforeTextV2.apply(this,arguments);
    normalizeTextPieceV2(item);
    return '<div class="board-text text-object-v2" style="'+textStyleAttributeV2(item)+'">'+esc(item.value||'')+'</div>';
  };

  const renderSnapshotPieceBeforeTextV2=renderSnapshotPiece;
  renderSnapshotPiece=function(board,piece,scaleX,scaleY,offsetX=0,offsetY=0){
    const before=board?.children?.length||0;
    const result=renderSnapshotPieceBeforeTextV2.apply(this,arguments);
    if(piece?.kind==='text'&&board){
      const host=board.children[before]||board.lastElementChild;
      const text=host?.querySelector?.('.board-text');
      if(text){
        const scale=Math.min(Number(scaleX)||1,Number(scaleY)||1);
        text.setAttribute('style',textStyleAttributeV2(normalizeTextPieceV2({...piece}),scale));
      }
    }
    return result;
  };

  // ----- Canvas export adapter -----
  function canvasFontV2(style,px){
    const s=normalizeTextStyleV2(style),font=TEXT_FONTS_V2[s.font];
    return (s.italic?'italic ':'')+(s.bold?700:(font.weight||400))+' '+Math.max(7,px)+'px '+font.css;
  }
  function wrapCanvasTextV2(ctx,text,maxWidth,maxLines=12){
    const lines=[];
    for(const paragraph of String(text||'').split(/\n/)){
      if(lines.length>=maxLines)break;
      if(!paragraph){lines.push('');continue;}
      let line='';
      for(const word of paragraph.split(/\s+/)){
        const test=line?line+' '+word:word;
        if(ctx.measureText(test).width>maxWidth&&line){lines.push(line);line=word;if(lines.length>=maxLines)break;}
        else line=test;
      }
      if(line&&lines.length<maxLines)lines.push(line);
    }
    return lines;
  }
  function drawBoardTextToContextV2(ctx,piece,w,h,scale){
    const item=normalizeTextPieceV2({...piece}),p=textPresentationV2(item,scale);
    const lineHeight=p.fontPx*1.12,maxWidth=w*.94;
    ctx.save();
    ctx.fillStyle=p.color;
    ctx.textAlign=p.textAlign;
    ctx.textBaseline='middle';
    ctx.font=canvasFontV2(p.style,p.fontPx);
    const lines=wrapCanvasTextV2(ctx,item.value,maxWidth,12);
    const visible=lines.slice(0,Math.max(1,Math.floor(h*.94/lineHeight)));
    const start=h/2-(visible.length-1)*lineHeight/2;
    const x=p.style.align==='left'?w*.03:(p.style.align==='right'?w*.97:w/2);
    visible.forEach(function(line,index){
      const y=start+index*lineHeight;
      ctx.fillText(line,x,y,maxWidth);
      if(p.style.underline&&line){
        const width=Math.min(maxWidth,ctx.measureText(line).width);
        let left=x-width/2,right=x+width/2;
        if(p.style.align==='left'){left=x;right=x+width;}
        if(p.style.align==='right'){left=x-width;right=x;}
        ctx.strokeStyle=p.color;
        ctx.lineWidth=Math.max(1,p.fontPx*.055);
        ctx.beginPath();ctx.moveTo(left,y+p.fontPx*.48);ctx.lineTo(right,y+p.fontPx*.48);ctx.stroke();
      }
    });
    ctx.restore();
  }
  window.__audreyDrawBoardTextV2=drawBoardTextToContextV2;
  window.__audreyDrawBoardTextV132011=drawBoardTextToContextV2;

  // ----- Undo bridge -----
  function cloneBoardForTextUndoV2(){
    return boardItems.map(function(item){
      const copy={...item};
      if(item.textStyle)copy.textStyle={...item.textStyle};
      return copy;
    });
  }
  function pushTextUndoV2(snapshot,selectedUid,label){
    if(!snapshot||!Array.isArray(boardUndoStack))return;
    boardUndoStack.push({type:'state',items:snapshot,selectedUid:selectedUid||null,label});
    if(boardUndoStack.length>20)boardUndoStack.shift();
    updateUndoButton?.();
  }

  // ----- Editor/controller state -----
  const textStudioStateV2={
    selectedUid:null,
    createDraft:{value:'',textStyle:cloneTextStyleV2(DEFAULT_TEXT_STYLE_V2)},
    editDraft:null
  };
  function selectedTextPieceV2(){
    const item=boardItems.find(function(x){return String(x.uid)===String(selectedBoardUid)});
    return item?.kind==='text'?normalizeTextPieceV2(item):null;
  }
  function beginEditV2(item){
    textStudioStateV2.selectedUid=item.uid;
    textStudioStateV2.editDraft={value:item.value||'',textStyle:cloneTextStyleV2(item.textStyle)};
  }
  function endEditV2(){
    textStudioStateV2.selectedUid=null;
    textStudioStateV2.editDraft=null;
  }
  function activeStyleV2(){
    const selected=selectedTextPieceV2();
    return selected?selected.textStyle:textStudioStateV2.createDraft.textStyle;
  }
  function applyTextStyleChangeV2(patch,label){
    const selected=selectedTextPieceV2();
    if(selected){
      const before=cloneBoardForTextUndoV2(),selectedBefore=selectedBoardUid;
      selected.textStyle=normalizeTextStyleV2({...selected.textStyle,...patch});
      if(textStudioStateV2.editDraft)textStudioStateV2.editDraft.textStyle=cloneTextStyleV2(selected.textStyle);
      pushTextUndoV2(before,selectedBefore,label);
      drawBoard();
      return;
    }
    textStudioStateV2.createDraft.textStyle=normalizeTextStyleV2({...textStudioStateV2.createDraft.textStyle,...patch});
    syncTextStudioV2();
  }
  function commitTextV2(){
    const input=$('#boardTextInput'),value=String(input?.value||'').trim();
    if(!value)return toast('Type something first');
    const selected=selectedTextPieceV2();
    if(selected){
      const before=cloneBoardForTextUndoV2(),selectedBefore=selectedBoardUid;
      selected.value=value;
      if(textStudioStateV2.editDraft)textStudioStateV2.editDraft.value=value;
      pushTextUndoV2(before,selectedBefore,'text edit');
      drawBoard();
      toast('Text updated');
      return;
    }
    const before=cloneBoardForTextUndoV2();
    textStudioStateV2.createDraft.value=value;
    const item={
      uid:id(),kind:'text',value,
      textStyle:cloneTextStyleV2(textStudioStateV2.createDraft.textStyle),
      x:55+Math.random()*55,y:65+Math.random()*65,w:220,
      h:(value.length>85||value.includes('\n'))?128:88,
      rotation:0,z:nextZ()
    };
    boardItems.push(item);
    selectedBoardUid=item.uid;
    pushTextUndoV2(before,null,'add text');
    drawBoard();
    toast('Text added');
  }

  // ----- Stable Text Studio DOM -----
  function installTextStylesV2(){
    if($('#textStudioV2Styles'))return;
    const style=document.createElement('style');style.id='textStudioV2Styles';
    style.textContent=[
      '.screen[data-screen="outfits"] .text-studio-v2{display:grid;gap:8px;min-width:0}',
      '.screen[data-screen="outfits"] .text-selection-v2{display:none;padding:7px 9px;border-radius:10px;background:#eef0e8;color:#53604d;font:700 10px/1.25 var(--sans)}',
      '.screen[data-screen="outfits"] .text-studio-v2.is-editing .text-selection-v2{display:block}',
      '.screen[data-screen="outfits"] .text-entry-v2{display:grid;grid-template-columns:minmax(0,1fr) 92px;gap:7px;align-items:stretch}',
      '.screen[data-screen="outfits"] .text-entry-v2 textarea{width:100%;height:68px;min-height:68px;max-height:68px;resize:none;overflow-y:auto;margin:0!important;border:1px solid var(--line);border-radius:12px;background:#fffdf7;color:var(--ink);padding:10px 11px;font:16px/1.35 var(--sans);box-sizing:border-box;outline:none}',
      '.screen[data-screen="outfits"] .text-entry-v2 textarea:focus{border-color:var(--turq);box-shadow:0 0 0 3px rgba(77,142,138,.12)}',
      '.screen[data-screen="outfits"] .text-commit-v2{width:92px;min-width:92px;border:0;border-radius:12px;background:var(--burgundy);color:#fff;font:800 12px/1.18 var(--sans)}',
      '.screen[data-screen="outfits"] .text-font-v2{width:100%;height:40px;min-width:0;border:1px solid var(--line);border-radius:11px;background:#fffdf7;color:var(--ink);padding:0 9px;font:14px var(--sans)}',
      '.screen[data-screen="outfits"] .text-format-v2{display:flex;gap:6px;align-items:center;flex-wrap:nowrap}',
      '.screen[data-screen="outfits"] .text-format-v2 button{height:36px;border:1px solid rgba(108,81,66,.18);border-radius:10px;background:#f8f1e3;color:#5f554a}',
      '.screen[data-screen="outfits"] .text-format-toggle-v2{width:38px;font:800 14px var(--serif)}',
      '.screen[data-screen="outfits"] .text-format-toggle-v2[data-format="italic"]{font-style:italic}',
      '.screen[data-screen="outfits"] .text-format-toggle-v2[data-format="underline"]{text-decoration:underline}',
      '.screen[data-screen="outfits"] .text-format-v2 button.active{background:var(--olive);border-color:var(--olive);color:#fff}',
      '.screen[data-screen="outfits"] .text-size-v2{display:grid;grid-template-columns:repeat(4,1fr);gap:5px;flex:1;min-width:180px}',
      '.screen[data-screen="outfits"] .text-size-v2 button{min-width:0;font:800 11px var(--sans)}',
      '.screen[data-screen="outfits"] .text-object-v2{width:100%;height:100%;display:flex;align-items:center;justify-content:center;padding:5px;box-sizing:border-box;overflow:hidden}',
      '@media(max-width:360px){.screen[data-screen="outfits"] .text-entry-v2{grid-template-columns:minmax(0,1fr) 78px}.screen[data-screen="outfits"] .text-commit-v2{width:78px;min-width:78px;font-size:11px}}'
    ].join('\n');
    document.head.appendChild(style);
  }

  function installTextStudioV2(){
    installTextStylesV2();
    const panel=document.querySelector('.decorate-studio-panel[data-decorate-group="text"] .decorate-studio-content');
    if(!panel)return false;
    let card=panel.querySelector('.decorate-tool-card');
    if(!card){card=document.createElement('div');card.className='decorate-tool-card';panel.appendChild(card);}
    if($('#boardTextStudioV2'))return true;
    const inheritedValue=$('#boardTextInput')?.value||'';
    textStudioStateV2.createDraft.value=inheritedValue;
    card.innerHTML='';
    const studio=document.createElement('div');studio.id='boardTextStudioV2';studio.className='text-studio-v2';
    studio.innerHTML=
      '<div class="text-selection-v2">Editing selected text — changes apply to this object.</div>'+
      '<div class="text-entry-v2"><textarea id="boardTextInput" maxlength="280" rows="2" placeholder="Add a title, caption or note…"></textarea><button type="button" id="boardTextCommitV2" class="text-commit-v2">Add Text</button></div>'+
      '<select id="boardTextFontV2" class="text-font-v2" aria-label="Text font"></select>'+
      '<div class="text-format-v2"><button type="button" class="text-format-toggle-v2" data-format="bold">B</button><button type="button" class="text-format-toggle-v2" data-format="italic">I</button><button type="button" class="text-format-toggle-v2" data-format="underline">U</button><div class="text-size-v2"></div></div>';
    card.appendChild(studio);

    const font=$('#boardTextFontV2');
    Object.entries(TEXT_FONTS_V2).forEach(function([key,def]){const option=document.createElement('option');option.value=key;option.textContent=def.label;font.appendChild(option);});
    const sizes=studio.querySelector('.text-size-v2');
    Object.entries(TEXT_SIZES_V2).forEach(function([key,def]){const button=document.createElement('button');button.type='button';button.dataset.textSize=key;button.textContent=def.label;sizes.appendChild(button);});

    $('#boardTextCommitV2').onclick=commitTextV2;
    font.onchange=function(){applyTextStyleChangeV2({font:font.value},'font change');};
    studio.querySelectorAll('.text-format-toggle-v2').forEach(function(button){button.onclick=function(){const style=activeStyleV2();applyTextStyleChangeV2({[button.dataset.format]:!style[button.dataset.format]},'text format');};});
    studio.querySelectorAll('[data-text-size]').forEach(function(button){button.onclick=function(){applyTextStyleChangeV2({size:button.dataset.textSize},'text size');};});
    $('#boardTextInput').addEventListener('input',function(){
      const selected=selectedTextPieceV2();
      if(selected&&textStudioStateV2.editDraft)textStudioStateV2.editDraft.value=this.value;
      else textStudioStateV2.createDraft.value=this.value;
    });
    $('#boardTextInput').addEventListener('keydown',function(event){if(event.key==='Enter'&&(event.metaKey||event.ctrlKey)){event.preventDefault();commitTextV2();}});
    syncTextStudioV2(true);
    return true;
  }

  function syncTextStudioV2(forceValue=false){
    const studio=$('#boardTextStudioV2');if(!studio)return;
    const selected=selectedTextPieceV2(),input=$('#boardTextInput'),commit=$('#boardTextCommitV2');
    const changed=String(textStudioStateV2.selectedUid||'')!==String(selected?.uid||'');
    if(selected){
      if(changed)beginEditV2(selected);
      else if(textStudioStateV2.editDraft)textStudioStateV2.editDraft.textStyle=cloneTextStyleV2(selected.textStyle);
      if(input&&(forceValue||changed||document.activeElement!==input))input.value=selected.value||'';
      studio.classList.add('is-editing');if(commit)commit.textContent='Update';
    }else{
      if(textStudioStateV2.selectedUid)endEditV2();
      if(input&&(forceValue||changed)&&document.activeElement!==input)input.value=textStudioStateV2.createDraft.value||'';
      studio.classList.remove('is-editing');if(commit)commit.textContent='Add Text';
    }
    const style=activeStyleV2();
    const font=$('#boardTextFontV2');if(font)font.value=style.font;
    studio.querySelectorAll('.text-format-toggle-v2').forEach(function(button){const active=!!style[button.dataset.format];button.classList.toggle('active',active);button.setAttribute('aria-pressed',active?'true':'false');});
    studio.querySelectorAll('[data-text-size]').forEach(function(button){const active=button.dataset.textSize===style.size;button.classList.toggle('active',active);button.setAttribute('aria-pressed',active?'true':'false');});
  }

  // drawBoard remains the Board authority; Text v2 only synchronizes its editor after redraw.
  const drawBoardBeforeTextV2=drawBoard;
  drawBoard=function(){const result=drawBoardBeforeTextV2.apply(this,arguments);syncTextStudioV2();return result;};
  document.addEventListener('pointerup',function(event){if(event.target.closest?.('#outfitBoard .board-piece'))syncTextStudioV2();},true);

  // Normalize compatible dev11/dev12 saved text in memory without timed migration passes.
  (state.outfits||[]).forEach(function(outfit){(outfit.pieces||[]).forEach(function(piece){if(piece?.kind==='text')normalizeTextPieceV2(piece);});});

  if(!installTextStudioV2())setTimeout(function(){installTextStudioV2();syncTextStudioV2(true);},0);
  else syncTextStudioV2(true);

  window.__audreyTextStudioV2={version:'v13.20-dev20',normalizeTextPiece:normalizeTextPieceV2,getPresentation:textPresentationV2,sync:syncTextStudioV2};
})();
