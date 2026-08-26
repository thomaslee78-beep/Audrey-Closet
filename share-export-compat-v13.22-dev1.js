/* Audrey Closet v13.22 share export compatibility dev1
 * Translates current Board creative objects into geometry understood by the
 * existing canvas share renderer. Saved Board/Portfolio data is never mutated.
 * Covers current drawing objects plus modern Shape Studio types.
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

  function ellipsePoints(w,h,count=32){
    const pts=[];for(let i=0;i<=count;i++){const t=i/count*Math.PI*2;pts.push([w/2+Math.cos(t)*w*.46,h/2+Math.sin(t)*h*.46]);}return pts;
  }
  function roundedRectPoints(w,h){
    // Export-safe approximation; the existing share renderer draws this as a polyline.
    const x=w*.05,y=h*.05,r=Math.min(w,h)*.16,rw=w*.9,rh=h*.9,pts=[];
    const arc=(cx,cy,a0,a1)=>{for(let i=0;i<=5;i++){const t=a0+(a1-a0)*i/5;pts.push([cx+Math.cos(t)*r,cy+Math.sin(t)*r]);}};
    arc(x+r,y+r,Math.PI,Math.PI*1.5);arc(x+rw-r,y+r,Math.PI*1.5,Math.PI*2);arc(x+rw-r,y+rh-r,0,Math.PI*.5);arc(x+r,y+rh-r,Math.PI*.5,Math.PI);pts.push(pts[0]);return pts;
  }
  function starPoints(w,h){const pts=[];for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,r=i%2?0.22:0.46;pts.push([w/2+Math.cos(a)*w*r,h/2+Math.sin(a)*h*r]);}pts.push(pts[0]);return pts;}
  function shapePieces(item){
    const type=String(item.shapeType||item.value||'circle'),w=Math.max(2,num(item.w,90)),h=Math.max(2,num(item.h,90));
    // Keep the legacy types on the native share path.
    if(type==='circle'||type==='line'||type==='tape')return [clone(item)];
    let pts;
    if(type==='square'||type==='rectangle')pts=[[w*.05,h*.05],[w*.95,h*.05],[w*.95,h*.95],[w*.05,h*.95],[w*.05,h*.05]];
    else if(type==='oval')pts=ellipsePoints(w,h);
    else if(type==='roundedRect')pts=roundedRectPoints(w,h);
    else if(type==='triangle')pts=[[w*.5,h*.06],[w*.95,h*.94],[w*.05,h*.94],[w*.5,h*.06]];
    else if(type==='star')pts=starPoints(w,h);
    else return [clone(item)];
    return [doodleFrom(item,pts,'shape-outline')];
  }

  function exportPieces(source){
    const out=[];
    for(const raw of source||[]){
      const item=clone(raw);
      if(item.kind==='drawing')out.push(...drawingPieces(item));
      else if(item.kind==='shape')out.push(...shapePieces(item));
      else out.push(item);
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
      const transformed=exportPieces(sourceOutfit?.pieces||livePieces);
      const synthetic=sourceOutfit||{
        name:document.getElementById('outfitName')?.value?.trim()||'My outfit',
        notes:document.getElementById('outfitNotes')?.value?.trim()||'',
        boardWidth:board?.clientWidth||390,
        boardHeight:board?.clientHeight||420
      };
      synthetic.pieces=transformed;
      return original({...options,outfit:synthetic});
    };
    window.AUDREY_SHARE_EXPORT_COMPAT_V1={exportPieces};
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
