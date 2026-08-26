/* Audrey Closet v13.22 share export compatibility dev3
 * Export current creative objects without changing saved Board/Portfolio data.
 *
 * dev3 removes the brittle function-string/eval patch from dev2.
 * Shapes are rendered through the exact Shape Studio SVG renderer already used
 * by Board/Portfolio, then exposed temporarily to the existing share canvas as
 * image-backed pieces. This preserves fill, border color, border width,
 * solid/dashed style and all supported fun-shape geometry.
 */
(function(){
  'use strict';

  let installed=false;

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

  function svgDataUrl(markup){
    if(!markup)return '';
    const svg=markup.replace('<svg ','<svg xmlns="http://www.w3.org/2000/svg" ');
    return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);
  }

  function makeTempShapePiece(item,tempItems){
    const photo=svgDataUrl(styleAwareShapeMarkup(item));
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
        else out.push(item); // fail safe: legacy share renderer may still draw old shape types
      }else if(item.kind==='drawing'){
        out.push(...drawingPieces(item));
      }else{
        out.push(item);
      }
    }
    return out;
  }

  function install(){
    if(installed||typeof makeOutfitShareBlob!=='function')return false;
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
    window.AUDREY_SHARE_EXPORT_COMPAT_V3={transformPieces,styleAwareShapeMarkup};
    installed=true;
    return true;
  }

  function start(){
    if(install())return;
    let tries=0;const timer=setInterval(()=>{tries++;if(install()||tries>40)clearInterval(timer);},50);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
