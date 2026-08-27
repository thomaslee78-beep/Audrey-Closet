/* Audrey Closet v13.22 share export compatibility dev4
 * Export current creative objects without changing saved Board/Portfolio data.
 *
 * dev4:
 * - gives temporary Shape Studio SVGs the exact saved w/h intrinsic ratio so the
 *   existing share image renderer fills the same board box without letterboxing
 * - keeps x/y/w/h/rotation in the saved board coordinate system
 * - aligns common patterned canvas backgrounds with the same fixed CSS pattern
 *   dimensions used by the editor/Portfolio (checker, gingham, plaid, tic-tac-toe)
 */
(function(){
  'use strict';

  let installed=false;
  let canvasPainterInstalled=false;

  function clone(v){return JSON.parse(JSON.stringify(v));}
  function num(v,d=0){const n=Number(v);return Number.isFinite(n)?n:d;}
  function parsePoints(value){return String(value||'').trim().split(/\s+/).map(pair=>pair.split(',').map(Number)).filter(p=>p.length===2&&p.every(Number.isFinite));}
  function pointString(points){return points.map(([x,y])=>`${x.toFixed(1)},${y.toFixed(1)}`).join(' ');}

  function doodleFrom(item,points,suffix='share'){
    const out=clone(item);
    out.uid=String(item.uid||'creative')+'-'+suffix;
    out.kind='doodle';
    out.points=pointString(points);
    return out;
  }

  function arrowHead(a,b,size){
    const [x1,y1]=a,[x2,y2]=b,dx=x2-x1,dy=y2-y1,len=Math.hypot(dx,dy)||1;
    const ux=dx/len,uy=dy/len,px=-uy,py=ux;
    const bx=x2-ux*size,by=y2-uy*size,half=size*.5;
    return [[x2,y2],[bx+px*half,by+py*half],[x2,y2],[bx-px*half,by-py*half]];
  }

  function drawingPieces(item){
    const pts=parsePoints(item.points);
    if(pts.length<2)return [];
    const shaft=doodleFrom(item,pts,'shaft');
    if(item.tool!=='arrow'&&item.drawingType!=='arrow')return [shaft];
    const a=pts[0],b=pts[pts.length-1],size=Math.max(9,num(item.strokeWidth,3)*3.2),out=[shaft];
    out.push(doodleFrom(item,arrowHead(a,b,size),'arrow-end'));
    if(item.arrowStart)out.push(doodleFrom(item,arrowHead(b,a,size),'arrow-start'));
    return out;
  }

  function styleAwareShapeMarkup(item){
    const styleApi=window.__audreyShapeStudioV132206;
    if(typeof styleApi?.shapeMarkup==='function')return styleApi.shapeMarkup(item);
    const funApi=window.__audreyShapeStudioV132204;
    const type=String(item?.shapeType||item?.value||'');
    if(funApi?.funShapes?.some(x=>x.id===type)&&typeof funApi.funSvgMarkup==='function')return funApi.funSvgMarkup(item);
    const basicApi=window.__audreyShapeStudioV132201;
    if(typeof basicApi?.shapeSvgMarkup==='function')return basicApi.shapeSvgMarkup(item);
    return '';
  }

  function svgDataUrl(markup,item){
    if(!markup)return '';
    const w=Math.max(1,num(item?.w,100)),h=Math.max(1,num(item?.h,100));
    let svg=markup;
    // Shape Studio SVGs use viewBox + preserveAspectRatio="none" so the Board
    // deliberately stretches them to the saved item box. Give the temporary SVG
    // the same intrinsic ratio to prevent the share image renderer from fitting it
    // inside a different default SVG ratio (Safari commonly assumes 300x150).
    svg=svg.replace('<svg ','<svg xmlns="http://www.w3.org/2000/svg" width="'+w+'" height="'+h+'" ');
    return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);
  }

  function makeTempShapePiece(item,tempItems){
    const photo=svgDataUrl(styleAwareShapeMarkup(item),item);
    if(!photo)return null;
    const tempId='share-shape-'+String(item.uid||Math.random().toString(36).slice(2));
    tempItems.push({id:tempId,name:'Shape',type:'Shape',category:'Misc',photo});
    return {...clone(item),kind:'piece',source:'closet',id:tempId};
  }

  function transformPieces(source,tempItems){
    const out=[];
    for(const raw of source||[]){
      const item=clone(raw);
      if(item.kind==='shape'){
        const converted=makeTempShapePiece(item,tempItems);
        if(converted)out.push(converted);
        else out.push(item);
      }else if(item.kind==='drawing'){
        out.push(...drawingPieces(item));
      }else{
        out.push(item);
      }
    }
    return out;
  }

  function normalizedCanvas(value){
    if(typeof value==='string')return {id:value||'default',color:''};
    if(value&&typeof value==='object')return {id:value.id||'default',color:value.color||''};
    return {id:'default',color:''};
  }

  function paintFixedPattern(ctx,x,y,w,h,value,originalPainter){
    const v=normalizedCanvas(value),id=v.id;
    if(!['checker','gingham','plaid','tic-tac-toe'].includes(id)){
      return originalPainter(ctx,x,y,w,h,value);
    }
    ctx.save();ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();
    if(id==='checker'){
      ctx.fillStyle='#efe7d8';ctx.fillRect(x,y,w,h);
      // Editor CSS: conic checker with background-size 28px 28px => 14px cells.
      const cell=14;ctx.fillStyle='rgba(74,67,60,.20)';
      let row=0;for(let yy=y;yy<y+h;yy+=cell,row++){
        for(let xx=x+(row%2?cell:0);xx<x+w;xx+=cell*2)ctx.fillRect(xx,yy,cell,cell);
      }
    }else if(id==='gingham'){
      ctx.fillStyle='#f6eee0';ctx.fillRect(x,y,w,h);
      // Editor CSS: two 50/50 linear gradients at 22px 22px.
      const tile=22,band=11;ctx.fillStyle='rgba(125,70,83,.14)';
      for(let xx=x;xx<x+w;xx+=tile)ctx.fillRect(xx,y,band,h);
      for(let yy=y;yy<y+h;yy+=tile)ctx.fillRect(x,yy,w,band);
    }else if(id==='plaid'){
      ctx.fillStyle='#d8c8a7';ctx.fillRect(x,y,w,h);
      // Match the repeating-gradient stop positions used by the editor.
      ctx.fillStyle='rgba(91,70,53,.15)';
      for(let yy=y+13;yy<y+h;yy+=31)ctx.fillRect(x,yy,w,4);
      for(let xx=x+15;xx<x+w;xx+=34)ctx.fillRect(xx,y,4,h);
      ctx.fillStyle='rgba(125,53,71,.11)';
      for(let yy=y+27;yy<y+h;yy+=31)ctx.fillRect(x,yy,w,4);
      for(let xx=x+30;xx<x+w;xx+=34)ctx.fillRect(xx,y,4,h);
    }else if(id==='tic-tac-toe'){
      ctx.fillStyle='#f4eddc';ctx.fillRect(x,y,w,h);
      const tile=76;ctx.fillStyle='rgba(109,120,99,.15)';
      for(let tx=x;tx<x+w;tx+=tile){ctx.fillRect(tx+tile*.32,y,Math.max(1,tile*.02),h);ctx.fillRect(tx+tile*.65,y,Math.max(1,tile*.02),h);}
      for(let ty=y;ty<y+h;ty+=tile){ctx.fillRect(x,ty+tile*.32,w,Math.max(1,tile*.02));ctx.fillRect(x,ty+tile*.65,w,Math.max(1,tile*.02));}
    }
    ctx.restore();
  }

  function installCanvasPainter(){
    if(canvasPainterInstalled||typeof window.__audreyPaintBoardCanvasV1320!=='function')return;
    const original=window.__audreyPaintBoardCanvasV1320;
    window.__audreyPaintBoardCanvasV1320=function(ctx,x,y,w,h,value){return paintFixedPattern(ctx,x,y,w,h,value,original);};
    canvasPainterInstalled=true;
  }

  function install(){
    if(installed||typeof makeOutfitShareBlob!=='function')return false;
    installCanvasPainter();
    const original=makeOutfitShareBlob;
    makeOutfitShareBlob=async function(options={}){
      const sourceOutfit=options?.outfit?clone(options.outfit):null;
      const board=document.getElementById('outfitBoard');
      const livePieces=typeof boardItems!=='undefined'?boardItems:[];
      const tempItems=[];
      const transformed=transformPieces(sourceOutfit?.pieces||livePieces,tempItems);
      const synthetic=sourceOutfit||{
        name:document.getElementById('outfitName')?.value?.trim()||'My outfit',
        notes:document.getElementById('outfitNotes')?.value?.trim()||'',
        boardWidth:board?.clientWidth||390,
        boardHeight:board?.clientHeight||420
      };
      synthetic.pieces=transformed;

      const originalLength=Array.isArray(state?.items)?state.items.length:0;
      try{
        if(Array.isArray(state?.items)&&tempItems.length)state.items.push(...tempItems);
        return await original({...options,outfit:synthetic});
      }finally{
        if(Array.isArray(state?.items)&&state.items.length>originalLength)state.items.splice(originalLength);
      }
    };
    window.AUDREY_SHARE_EXPORT_COMPAT_V4={transformPieces,styleAwareShapeMarkup,paintFixedPattern};
    installed=true;
    return true;
  }

  function start(){
    installCanvasPainter();
    if(install())return;
    let tries=0;const timer=setInterval(()=>{tries++;installCanvasPainter();if(install()||tries>40)clearInterval(timer);},50);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
