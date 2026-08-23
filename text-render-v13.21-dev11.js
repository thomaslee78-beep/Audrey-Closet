/* Audrey Closet v13.21-dev11 — Portfolio + Share text rendering consistency */
(function(){
  'use strict';

  const FONTS={
    script:{css:'"Snell Roundhand","Segoe Script","Bradley Hand",cursive',canvas:'"Snell Roundhand","Segoe Script",cursive',weight:400},
    editorial:{css:'"Iowan Old Style","Palatino Linotype",Palatino,Georgia,serif',canvas:'"Iowan Old Style",Palatino,Georgia,serif',weight:400},
    classic:{css:'Georgia,"Times New Roman",serif',canvas:'Georgia,"Times New Roman",serif',weight:400},
    modern:{css:'"Avenir Next","Helvetica Neue",Arial,sans-serif',canvas:'"Avenir Next","Helvetica Neue",Arial,sans-serif',weight:400},
    clean:{css:'-apple-system,BlinkMacSystemFont,"Segoe UI",Arial,sans-serif',canvas:'system-ui,"Segoe UI",Arial,sans-serif',weight:400},
    thin:{css:'"Avenir Next Ultra Light","Avenir Next","Helvetica Neue",Arial,sans-serif',canvas:'"Avenir Next","Helvetica Neue",Arial,sans-serif',weight:300},
    rounded:{css:'"Avenir Next Rounded","Trebuchet MS",Arial,sans-serif',canvas:'"Avenir Next Rounded","Trebuchet MS",Arial,sans-serif',weight:400},
    handwritten:{css:'"Bradley Hand","Noteworthy","Marker Felt",cursive',canvas:'"Bradley Hand",Noteworthy,"Marker Felt",cursive',weight:400},
    typewriter:{css:'Menlo,"Courier New",monospace',canvas:'Menlo,"Courier New",monospace',weight:400},
    fun:{css:'"Chalkboard SE","Comic Sans MS","Marker Felt",cursive',canvas:'"Chalkboard SE","Marker Felt","Comic Sans MS",cursive',weight:400}
  };
  const SIZES={small:20,medium:28,large:38,xlarge:50};

  function normalize(style){
    const s=style&&typeof style==='object'?style:{};
    const font=FONTS[s.font]?s.font:'script';
    const size=SIZES[s.size]?s.size:'medium';
    const color=/^#[0-9a-f]{6}$/i.test(String(s.color||''))?String(s.color).toLowerCase():'#7d3547';
    const align=['left','center','right'].includes(s.align)?s.align:'center';
    return {font,size,bold:!!s.bold,italic:!!s.italic,underline:!!s.underline,color,align};
  }

  function presentation(style,scale){
    const s=normalize(style),f=FONTS[s.font],px=SIZES[s.size]*Math.max(.1,Number(scale)||1);
    return {
      s,
      fontFamily:f.css,
      fontSize:Math.max(7,px)+'px',
      fontWeight:String(s.bold?700:f.weight),
      fontStyle:s.italic?'italic':'normal',
      textDecoration:s.underline?'underline':'none',
      color:s.color,
      textAlign:s.align,
      justifyContent:s.align==='left'?'flex-start':s.align==='right'?'flex-end':'center',
      canvasFont:(s.italic?'italic ':'')+(s.bold?700:f.weight)+' '+Math.max(7,px)+'px '+f.canvas
    };
  }

  function styleTextNode(node,style,scale){
    if(!node)return;
    const p=presentation(style,scale);
    Object.assign(node.style,{
      fontFamily:p.fontFamily,
      fontSize:p.fontSize,
      fontWeight:p.fontWeight,
      fontStyle:p.fontStyle,
      textDecoration:p.textDecoration,
      color:p.color,
      textAlign:p.textAlign,
      justifyContent:p.justifyContent,
      whiteSpace:'pre-wrap'
    });
  }

  if(typeof window.renderMiniPiece==='function'){
    const originalRenderMiniPiece=window.renderMiniPiece;
    window.renderMiniPiece=function(piece,outfit){
      const p=piece&&typeof piece==='object'?piece:null;
      if(!p||p.kind!=='text')return originalRenderMiniPiece.apply(this,arguments);
      const sw=Number(outfit&&outfit.boardWidth)||390,sh=Number(outfit&&outfit.boardHeight)||420;
      const left=Math.max(-10,Math.min(100,(Number(p.x)||0)/sw*100));
      const top=Math.max(-10,Math.min(100,(Number(p.y)||0)/sh*100));
      const width=Math.max(8,Math.min(70,(Number(p.w)||132)/sw*100));
      const height=Math.max(8,Math.min(70,(Number(p.h)||156)/sh*100));
      const t=presentation(p.textStyle,.38);
      const style=[
        'left:'+left+'%','top:'+top+'%','width:'+width+'%','height:'+height+'%',
        'z-index:'+(Number(p.z)||1),'transform:rotate('+(Number(p.rotation)||0)+'deg)',
        'font-family:'+t.fontFamily,'font-size:'+t.fontSize,'font-weight:'+t.fontWeight,
        'font-style:'+t.fontStyle,'text-decoration:'+t.textDecoration,'color:'+t.color,
        'text-align:'+t.textAlign,'display:flex','align-items:center','justify-content:'+t.justifyContent,
        'white-space:pre-wrap','line-height:1.08','overflow:hidden'
      ].join(';');
      const value=typeof window.esc==='function'?window.esc(String(p.value||'')):String(p.value||'').replace(/[&<>"']/g,function(ch){return({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[ch]});
      return '<span class="portfolio-deco mini-deco" style="'+style+'">'+value+'</span>';
    };
  }

  if(typeof window.renderSnapshotPiece==='function'){
    const originalRenderSnapshotPiece=window.renderSnapshotPiece;
    window.renderSnapshotPiece=function(board,piece,scaleX,scaleY,offsetX,offsetY){
      const before=board&&board.children?board.children.length:0;
      const result=originalRenderSnapshotPiece.apply(this,arguments);
      if(piece&&piece.kind==='text'&&board){
        const el=board.children[before]||board.lastElementChild;
        const node=el&&el.querySelector?el.querySelector('.board-text'):null;
        styleTextNode(node,piece.textStyle,Math.min(Number(scaleX)||1,Number(scaleY)||1));
      }
      return result;
    };
  }

  function wrapLines(ctx,text,maxWidth,maxLines){
    const lines=[];
    for(const para of String(text||'').split(/\n/)){
      if(!para){lines.push('');continue;}
      let line='';
      for(const word of para.split(/\s+/)){
        const test=line?line+' '+word:word;
        if(ctx.measureText(test).width>maxWidth&&line){lines.push(line);line=word;if(lines.length>=maxLines)return lines;}
        else line=test;
      }
      if(line)lines.push(line);
      if(lines.length>=maxLines)return lines;
    }
    return lines;
  }

  window.__audreyDrawBoardTextV132011=function(ctx,b,w,h,scale){
    const t=presentation(b&&b.textStyle,scale),s=t.s;
    const size=parseFloat(t.fontSize),lineHeight=size*1.12,pad=w*.03;
    const x=s.align==='left'?pad:s.align==='right'?w-pad:w/2;
    ctx.fillStyle=t.color;
    ctx.textAlign=s.align;
    ctx.textBaseline='middle';
    ctx.font=t.canvasFont;
    const lines=wrapLines(ctx,b&&b.value,w*.94,12);
    const visible=lines.slice(0,Math.max(1,Math.floor(h*.94/lineHeight)));
    const start=h/2-(visible.length-1)*lineHeight/2;
    visible.forEach(function(line,i){
      const y=start+i*lineHeight;
      ctx.fillText(line,x,y,w*.94);
      if(s.underline&&line){
        const ww=Math.min(w*.94,ctx.measureText(line).width);
        let x1=x-ww/2,x2=x+ww/2;
        if(s.align==='left'){x1=x;x2=x+ww;}
        else if(s.align==='right'){x1=x-ww;x2=x;}
        ctx.save();ctx.strokeStyle=t.color;ctx.lineWidth=Math.max(1,size*.055);ctx.beginPath();ctx.moveTo(x1,y+size*.48);ctx.lineTo(x2,y+size*.48);ctx.stroke();ctx.restore();
      }
    });
  };
})();
