/* =========================================================
   Audrey Closet — v13.20-dev20
   TEXT STUDIO v2
   Single-authority text architecture.

   Goals:
   - one canonical TextPiece schema
   - one normalizer/default path
   - one typography resolver shared by live/snapshot/canvas renderers
   - one editor/controller path
   - no delayed DOM style repair and no capture-phase legacy Add Text interception
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
    small:{label:'S',px:20},
    medium:{label:'M',px:28},
    large:{label:'L',px:38},
    xlarge:{label:'XL',px:50}
  };
  const DEFAULT_TEXT_STYLE_V2=Object.freeze({
    font:'script',
    size:'medium',
    bold:false,
    italic:false,
    underline:false,
    color:'#7d3547',
    align:'center'
  });

  function normalizeColorV2(value){
    const v=String(value||'').trim();
    return /^#[0-9a-f]{6}$/i.test(v)?v:DEFAULT_TEXT_STYLE_V2.color;
  }
  function normalizeAlignV2(value){
    return ['left','center','right'].includes(value)?value:'center';
  }
  function normalizeTextStyleV2(style){
    const s=style&&typeof style==='object'?style:{};
    return {
      font:TEXT_FONTS_V2[s.font]?s.font:DEFAULT_TEXT_STYLE_V2.font,
      size:TEXT_SIZES_V2[s.size]?s.size:DEFAULT_TEXT_STYLE_V2.size,
      bold:!!s.bold,
      italic:!!s.italic,
      underline:!!s.underline,
      color:normalizeColorV2(s.color),
      align:normalizeAlignV2(s.align)
    };
  }
  function normalizeTextPieceV2(piece){
    if(!piece||piece.kind!=='text')return piece;
    piece.value=String(piece.value||'');
    piece.textStyle=normalizeTextStyleV2(piece.textStyle);
    return piece;
  }
  function textPresentationV2(pieceOrStyle,scale=1){
    const style=normalizeTextStyleV2(pieceOrStyle?.kind==='text'?pieceOrStyle.textStyle:pieceOrStyle);
    const font=TEXT_FONTS_V2[style.font];
    const size=TEXT_SIZES_V2[style.size];
    return {
      fontFamily:font.css,
      fontSize:(size.px*Math.max(.15,Number(scale)||1))+'px',
      fontPx:size.px*Math.max(.15,Number(scale)||1),
      fontWeight:String(style.bold?700:(font.weight||400)),
      fontStyle:style.italic?'italic':'normal',
      textDecoration:style.underline?'underline':'none',
      color:style.color,
      textAlign:style.align,
      lineHeight:1.08,
      style
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

  // ---------- Model authority ----------
  const baseNormalizeBoardItemV2=normalizeBoardItem;
  normalizeBoardItem=function(item){
    const normalized=baseNormalizeBoardItemV2.apply(this,arguments);
    return normalizeTextPieceV2(normalized);
  };

  // ---------- DOM renderer authority ----------
  const baseBoardItemContentV2=boardItemContent;
  boardItemContent=function(item){
    if(item?.kind!=='text')return baseBoardItemContentV2.apply(this,arguments);
    normalizeTextPieceV2(item);
    return '<div class="board-text text-object-v2" style="'+textStyleAttributeV2(item,1)+'">'+esc(item.value||'')+'</div>';
  };

  // Snapshot layout belongs to the Board renderer; Text v2 only supplies scaled typography.
  const baseRenderSnapshotPieceV2=renderSnapshotPiece;
  renderSnapshotPiece=function(board,piece,scaleX,scaleY,offsetX=0,offsetY=0){
    const before=board?.children?.length||0;
    const result=baseRenderSnapshotPieceV2.apply(this,arguments);
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

  // ---------- Canvas adapter ----------
  function canvasFontV2(style,px){
    const s=normalizeTextStyleV2(style),font=TEXT_FONTS_V2[s.font];
    return (s.italic?'italic ':'')+(s.bold?700:(font.weight||400))+' '+Math.max(7,px)+'px '+font.css;
  }
  function wrapCanvasTextV2(ctx,text,maxWidth,maxLines=12){
    const lines=[];
    String(text||'').split(/\n/).forEach(function(paragraph){
      if(lines.length>=maxLines)return;
      if(!paragraph){lines.push('');return;}
      let line='';
      paragraph.split(/\s+/).forEach(function(word){
        if(lines.length>=maxLines)return;
        const test=line?line+' '+word:word;
        if(ctx.measureText(test).width>maxWidth&&line){
          lines.push(line);
          line=word;
        }else line=test;
      });
      if(line&&lines.length<maxLines)lines.push(line);
    });
    return lines;
  }
  function drawBoardTextToContextV2(ctx,piece,w,h,scale){
    const normalized=normalizeTextPieceV2({...piece});
    const presentation=textPresentationV2(normalized,scale);
    const size=presentation.fontPx;
    const lineHeight=size*1.12;
    const maxWidth=w*.94;
    ctx.save();
    ctx.fillStyle=presentation.color;
    ctx.textAlign=presentation.textAlign;
    ctx.textBaseline='middle';
    ctx.font=canvasFontV2(presentation.style,size);
    const lines=wrapCanvasTextV2(ctx,normalized.value,maxWidth,12);
    const visible=lines.slice(0,Math.max(1,Math.floor(h*.94/lineHeight)));
    const start=h/2-(visible.length-1)*lineHeight/2;
    const x=presentation.style.align==='left'?w*.03:(presentation.style.align==='right'?w*.97:w/2);
    visible.forEach(function(line,index){
      const y=start+index*lineHeight;
      ctx.fillText(line,x,y,maxWidth);
      if(presentation.style.underline&&line){
        const width=Math.min(maxWidth,ctx.measureText(line).width);
        let left=x-width/2,right=x+width/2;
        if(presentation.style.align==='left'){left=x;right=x+width;}
        if(presentation.style.align==='right'){left=x-width;right=x;}
        ctx.strokeStyle=presentation.color;
        ctx.lineWidth=Math.max(1,size*.055);
        ctx.beginPath();
        ctx.moveTo(left,y+size*.48);
        ctx.lineTo(right,y+size*.48);
        ctx.stroke();
      }
    });
    ctx.restore();
  }
  window.__audreyDrawBoardTextV2=drawBoardTextToContextV2;
  // Compatibility name used by the existing share/export bridge in the dev patch.
  window.__audreyDrawBoardTextV132011=drawBoardTextToContextV2;

  // ---------- Controller/editor state ----------
  const textStudioStateV2={
    mode:'create',
    selectedUid:null,
    draft:{value:'',textStyle:normalizeTextStyleV2(DEFAULT_TEXT_STYLE_V2)}
  };
  function selectedTextPieceV2(){
    const selected=boardItems.find(function(item){return String(item.uid)===String(selectedBoardUid)});
    return selected?.kind==='text'?normalizeTextPieceV2(selected):null;
  }
  function cloneTextStyleV2(style){return {...normalizeTextStyleV2(style)};}
  function pushTextUndoV2(label){
    if(typeof cloneBoardStateV13205==='function'&&typeof pushBoardStateUndoV13205==='function'){
      pushBoardStateUndoV13205(cloneBoardStateV13205(),selectedBoardUid,label);
    }
  }
  function setDraftFromSelectedV2(selected){
    textStudioStateV2.mode='edit';
    textStudioStateV2.selectedUid=selected.uid;
    textStudioStateV2.draft={value:selected.value||'',textStyle:cloneTextStyleV2(selected.textStyle)};
  }
  function setCreateModeV2(){
    textStudioStateV2.mode='create';
    textStudioStateV2.selectedUid=null;
  }
  function applyTextStyleChangeV2(patch,label){
    const selected=selectedTextPieceV2();
    if(selected){
      pushTextUndoV2(label);
      selected.textStyle=normalizeTextStyleV2({...selected.textStyle,...patch});
      textStudioStateV2.draft.textStyle=cloneTextStyleV2(selected.textStyle);
      drawBoard();
    }else{
      textStudioStateV2.draft.textStyle=normalizeTextStyleV2({...textStudioStateV2.draft.textStyle,...patch});
      syncTextStudioV2();
    }
  }
  function commitTextV2(){
    const input=$('#boardTextInput');
    const value=String(input?.value||'').trim();
    if(!value)return toast('Type something first');
    const selected=selectedTextPieceV2();
    if(selected){
      pushTextUndoV2('text edit');
      selected.value=value;
      selected.textStyle=cloneTextStyleV2(textStudioStateV2.draft.textStyle);
      textStudioStateV2.draft.value=value;
      drawBoard();
      toast('Text updated');
      return;
    }
    const before=typeof cloneBoardStateV13205==='function'?cloneBoardStateV13205():null;
    const item={
      uid:id(),
      kind:'text',
      value,
      textStyle:cloneTextStyleV2(textStudioStateV2.draft.textStyle),
      x:55+Math.random()*55,
      y:65+Math.random()*65,
      w:220,
      h:(value.length>85||value.includes('\n'))?128:88,
      rotation:0,
      z:nextZ()
    };
    boardItems.push(item);
    selectedBoardUid=item.uid;
    if(before&&typeof pushBoardStateUndoV13205==='function')pushBoardStateUndoV13205(before,null,'add text');
    drawBoard();
    toast('Text added');
  }

  // ---------- Stable Text Studio view ----------
  function installTextStudioStylesV2(){
    if($('#textStudioV2Styles'))return;
    const style=document.createElement('style');
    style.id='textStudioV2Styles';
    style.textContent=[
      '.screen[data-screen="outfits"] .text-studio-v2{display:grid;gap:8px;min-width:0}',
      '.screen[data-screen="outfits"] .text-studio-v2 .text-selection-v2{display:none;padding:7px 9px;border-radius:10px;background:#eef0e8;color:#53604d;font:700 10px/1.25 var(--sans)}',
      '.screen[data-screen="outfits"] .text-studio-v2.is-editing .text-selection-v2{display:block}',
      '.screen[data-screen="outfits"] .text-entry-v2{display:grid;grid-template-columns:minmax(0,1fr) 92px;gap:7px;align-items:stretch}',
      '.screen[data-screen="outfits"] .text-entry-v2 textarea{width:100%;height:68px;min-height:68px;max-height:68px;resize:none;overflow-y:auto;margin:0!important;border:1px solid var(--line);border-radius:12px;background:#fffdf7;color:var(--ink);padding:10px 11px;font:16px/1.35 var(--sans);box-sizing:border-box;outline:none}',
      '.screen[data-screen="outfits"] .text-entry-v2 textarea:focus{border-color:var(--turq);box-shadow:0 0 0 3px rgba(77,142,138,.12)}',
      '.screen[data-screen="outfits"] .text-commit-v2{width:92px;min-width:92px;border:0;border-radius:12px;background:var(--burgundy);color:#fff;font:800 12px/1.18 var(--sans)}',
      '.screen[data-screen="outfits"] .text-font-v2{width:100%;min-width:0;height:40px;border:1px solid var(--line);border-radius:11px;background:#fffdf7;color:var(--ink);padding:0 9px;font:14px var(--sans)}',
      '.screen[data-screen="outfits"] .text-format-v2{display:flex;gap:6px;align-items:center;flex-wrap:nowrap}',
      '.screen[data-screen="outfits"] .text-format-v2 button{height:36px;border:1px solid rgba(108,81,66,.18);border-radius:10px;background:#f8f1e3;color:#5f554a}',
      '.screen[data-screen="outfits"] .text-format-toggle-v2{width:38px;font:800 14px var(--serif)}',
      '.screen[data-screen="outfits"] .text-format-toggle-v2[data-format="italic"]{font-style:italic}',
      '.screen[data-screen="outfits"] .text-format-toggle-v2[data-format="underline"]{text-decoration:underline}',
      '.screen[data-screen="outfits"] .text-format-v2 button.active{background:var(--olive);border-color:var(--olive);color:#fff}',
      '.screen[data-screen="outfits"] .text-size-v2{display:grid;grid-template-columns:repeat(4,1fr);gap:5px;flex:1;min-width:180px}',
      '.screen[data-screen="outfits"] .text-size-v2 button{min-width:0;font:800 11px var(--sans)}',
      '.screen[data-screen="outfits"] .text-object-v2{width:100%;height:100%;display:flex;align-items:center;justify-content:center;box-sizing:border-box;padding:5px;overflow:hidden}',
      '@media(max-width:360px){.screen[data-screen="outfits"] .text-entry-v2{grid-template-columns:minmax(0,1fr) 78px}.screen[data-screen="outfits"] .text-commit-v2{width:78px;min-width:78px;font-size:11px}}'
    ].join('\n');
    document.head.appendChild(style);
  }
  function installTextStudioV2(){
    installTextStudioStylesV2();
    const panel=document.querySelector('.decorate-studio-panel[data-decorate-group="text"] .decorate-studio-content');
    if(!panel)return false;
    let card=panel.querySelector('.decorate-tool-card');
    if(!card){card=document.createElement('div');card.className='decorate-tool-card';panel.appendChild(card);}
    if($('#boardTextStudioV2'))return true;

    const priorValue=$('#boardTextInput')?.value||'';
    card.innerHTML='';
    const studio=document.createElement('div');
    studio.id='boardTextStudioV2';
    studio.className='text-studio-v2';
    studio.innerHTML=
      '<div class="text-selection-v2">Editing selected text — changes apply to this object.</div>'+
      '<div class="text-entry-v2">'+
        '<textarea id="boardTextInput" maxlength="280" rows="2" placeholder="Add a title, caption or note…"></textarea>'+
        '<button type="button" id="boardTextCommitV2" class="text-commit-v2">Add Text</button>'+
      '</div>'+
      '<select id="boardTextFontV2" class="text-font-v2" aria-label="Text font"></select>'+
      '<div class="text-format-v2">'+
        '<button type="button" class="text-format-toggle-v2" data-format="bold" aria-label="Bold">B</button>'+
        '<button type="button" class="text-format-toggle-v2" data-format="italic" aria-label="Italic">I</button>'+
        '<button type="button" class="text-format-toggle-v2" data-format="underline" aria-label="Underline">U</button>'+
        '<div class="text-size-v2"></div>'+
      '</div>';
    card.appendChild(studio);

    const input=$('#boardTextInput');
    input.value=priorValue;
    textStudioStateV2.draft.value=priorValue;
    const font=$('#boardTextFontV2');
    Object.entries(TEXT_FONTS_V2).forEach(function(entry){
      const option=document.createElement('option');option.value=entry[0];option.textContent=entry[1].label;font.appendChild(option);
    });
    const sizes=studio.querySelector('.text-size-v2');
    Object.entries(TEXT_SIZES_V2).forEach(function(entry){
      const button=document.createElement('button');button.type='button';button.dataset.textSize=entry[0];button.textContent=entry[1].label;sizes.appendChild(button);
    });

    $('#boardTextCommitV2').onclick=commitTextV2;
    font.onchange=function(){applyTextStyleChangeV2({font:font.value},'font change');};
    studio.querySelectorAll('.text-format-toggle-v2').forEach(function(button){
      button.onclick=function(){
        const current=selectedTextPieceV2()?.textStyle||textStudioStateV2.draft.textStyle;
        applyTextStyleChangeV2({[button.dataset.format]:!current[button.dataset.format]},'text format');
      };
    });
    studio.querySelectorAll('[data-text-size]').forEach(function(button){
      button.onclick=function(){applyTextStyleChangeV2({size:button.dataset.textSize},'text size');};
    });
    input.addEventListener('input',function(){textStudioStateV2.draft.value=input.value;});
    input.addEventListener('keydown',function(event){
      if(event.key==='Enter'&&(event.metaKey||event.ctrlKey)){event.preventDefault();commitTextV2();}
    });
    syncTextStudioV2(true);
    return true;
  }
  function syncTextStudioV2(forceValue=false){
    const studio=$('#boardTextStudioV2');
    if(!studio)return;
    const selected=selectedTextPieceV2();
    const input=$('#boardTextInput');
    const commit=$('#boardTextCommitV2');
    const selectionChanged=String(textStudioStateV2.selectedUid||'')!==String(selected?.uid||'');

    if(selected){
      if(selectionChanged)setDraftFromSelectedV2(selected);
      else textStudioStateV2.draft.textStyle=cloneTextStyleV2(selected.textStyle);
      if(input&&(forceValue||selectionChanged||document.activeElement!==input))input.value=selected.value||'';
      studio.classList.add('is-editing');
      if(commit)commit.textContent='Update';
    }else{
      if(textStudioStateV2.mode==='edit'||textStudioStateV2.selectedUid)setCreateModeV2();
      if(input&&forceValue&&document.activeElement!==input)input.value=textStudioStateV2.draft.value||'';
      studio.classList.remove('is-editing');
      if(commit)commit.textContent='Add Text';
    }

    const style=selected?selected.textStyle:textStudioStateV2.draft.textStyle;
    const font=$('#boardTextFontV2');if(font)font.value=style.font;
    studio.querySelectorAll('.text-format-toggle-v2').forEach(function(button){
      const active=!!style[button.dataset.format];
      button.classList.toggle('active',active);button.setAttribute('aria-pressed',active?'true':'false');
    });
    studio.querySelectorAll('[data-text-size]').forEach(function(button){
      const active=button.dataset.textSize===style.size;
      button.classList.toggle('active',active);button.setAttribute('aria-pressed',active?'true':'false');
    });
  }

  // Board redraw remains the selection synchronization event. No style repair is performed here.
  const baseDrawBoardV2=drawBoard;
  drawBoard=function(){
    const result=baseDrawBoardV2.apply(this,arguments);
    syncTextStudioV2();
    return result;
  };

  document.addEventListener('pointerup',function(event){
    if(event.target.closest?.('#outfitBoard .board-piece'))syncTextStudioV2();
  },true);

  // Normalize persisted text lazily through the normal load/render path; no migration timers.
  (state.outfits||[]).forEach(function(outfit){
    (outfit.pieces||[]).forEach(function(piece){if(piece?.kind==='text')normalizeTextPieceV2(piece);});
  });

  // Decorate Studio is already constructed by the main dev patch by the time this file loads.
  // A zero-delay retry covers browsers that defer the DOM relocation pass.
  if(!installTextStudioV2())setTimeout(function(){installTextStudioV2();syncTextStudioV2(true);},0);
  else syncTextStudioV2(true);

  window.__audreyTextStudioV2={
    version:'v13.20-dev20',
    normalizeTextPiece:normalizeTextPieceV2,
    getPresentation:textPresentationV2,
    sync:syncTextStudioV2
  };
})();
