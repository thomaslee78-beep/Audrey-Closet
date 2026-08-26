/* Audrey Closet v13.22 share export compatibility dev2
 * Share/export compatibility for the current Board creative model.
 * Saved Board/Portfolio data is never mutated.
 *
 * dev2:
 * - current Shape Studio objects stay as real shapes during export
 * - share canvas respects shapeStyle.fill, borderColor, borderWidth, borderStyle
 * - supports basic + fun shapes including Post-it, Caption, Thought Bubble,
 *   Tape, Price Tag, Question Mark and Exclamation Point
 * - current drawing objects are still translated to legacy doodles/arrow pieces
 *   for compatibility with the existing share canvas
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

  function exportPieces(source){
    const out=[];
    for(const raw of source||[]){
      const item=clone(raw);
      if(item.kind==='drawing')out.push(...drawingPieces(item));
      else out.push(item); // Shapes stay shapes so the patched share canvas can honor properties.
    }
    return out;
  }

  function shapeDefaults(type){
    if(type==='tape')return {fill:'rgba(225,196,112,.42)',borderColor:'#b69443',borderWidth:2,borderStyle:'solid'};
    if(type==='postIt')return {fill:'#fff1a8',borderColor:'#d2b758',borderWidth:2,borderStyle:'solid'};
    if(type==='priceTag')return {fill:'#fff8e7',borderColor:'#8b6f52',borderWidth:3,borderStyle:'solid'};
    if(type==='questionMark'||type==='exclamationPoint')return {fill:'#6b5b52',borderColor:'#6b5b52',borderWidth:2,borderStyle:'solid'};
    return {fill:'rgba(77,142,138,.08)',borderColor:'#4d8e8a',borderWidth:4,borderStyle:'solid'};
  }

  function applyStroke(ctx,style,scale){
    ctx.strokeStyle=style.borderColor;
    ctx.lineWidth=Math.max(.75,num(style.borderWidth,2)*scale);
    ctx.lineCap='round';ctx.lineJoin='round';
    if(style.borderStyle==='dashed')ctx.setLineDash([Math.max(3,6*scale),Math.max(2,4*scale)]);
    else ctx.setLineDash([]);
  }

  function finishPath(ctx,style,{fill=true,stroke=true}={}){
    if(fill&&style.fill&&style.fill!=='transparent'){ctx.fillStyle=style.fill;ctx.fill();}
    if(stroke&&num(style.borderWidth,0)>0)ctx.stroke();
  }

  function drawPolygon(ctx,pts,style){
    if(!pts.length)return;ctx.beginPath();ctx.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)ctx.lineTo(pts[i][0],pts[i][1]);ctx.closePath();finishPath(ctx,style);
  }

  function drawShareShape(ctx,b,w,h,scale){
    const type=String(b.shapeType||b.value||'circle');
    const style={...shapeDefaults(type),...(b.shapeStyle||{})};
    style.borderStyle=String(style.borderStyle||b.shapeBorderStyle||'solid')==='dashed'?'dashed':'solid';
    style.borderWidth=Math.max(0,num(style.borderWidth,2));
    applyStroke(ctx,style,scale);

    const x=w*.05,y=h*.05,rw=w*.9,rh=h*.9;
    if(type==='circle'||type==='oval'){
      ctx.beginPath();ctx.ellipse(w/2,h/2,Math.max(1,rw/2),Math.max(1,(type==='circle'?rh:rh*.68)/2),0,0,Math.PI*2);finishPath(ctx,style);
    }else if(type==='square'||type==='rectangle'){
      ctx.beginPath();ctx.rect(x,y,rw,rh);finishPath(ctx,style);
    }else if(type==='roundedRect'){
      const r=Math.min(rw,rh)*.18;ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+rw,y,x+rw,y+rh,r);ctx.arcTo(x+rw,y+rh,x,y+rh,r);ctx.arcTo(x,y+rh,x,y,r);ctx.arcTo(x,y,x+rw,y,r);ctx.closePath();finishPath(ctx,style);
    }else if(type==='triangle'){
      drawPolygon(ctx,[[w*.5,h*.07],[w*.95,h*.92],[w*.05,h*.92]],style);
    }else if(type==='star'){
      const pts=[];for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,rr=i%2?.22:.46;pts.push([w/2+Math.cos(a)*w*rr,h/2+Math.sin(a)*h*rr]);}drawPolygon(ctx,pts,style);
    }else if(type==='line'){
      ctx.beginPath();ctx.moveTo(w*.05,h*.5);ctx.lineTo(w*.95,h*.5);ctx.stroke();
    }else if(type==='thoughtBubble'){
      // Main cloud plus two thought dots, matching the Board's fun-shape composition.
      ctx.beginPath();
      const cloud=[[.20,.69],[.12,.60],[.23,.39],[.23,.39],[.48,.23],[.80,.29],[.93,.55],[.74,.78],[.40,.78]];
      ctx.moveTo(cloud[0][0]*w,cloud[0][1]*h);
      ctx.bezierCurveTo(.08*w,.60*h,.10*w,.45*h,.23*w,.39*h);
      ctx.bezierCurveTo(.19*w,.25*h,.35*w,.16*h,.48*w,.23*h);
      ctx.bezierCurveTo(.57*w,.10*h,.76*w,.15*h,.80*w,.29*h);
      ctx.bezierCurveTo(.95*w,.27*h,1.01*w,.44*h,.93*w,.55*h);
      ctx.bezierCurveTo(1.01*w,.68*h,.88*w,.82*h,.74*w,.78*h);
      ctx.bezierCurveTo(.63*w,.91*h,.45*w,.87*h,.40*w,.78*h);
      ctx.bezierCurveTo(.31*w,.83*h,.21*w,.79*h,.20*w,.69*h);ctx.closePath();finishPath(ctx,style);
      ctx.beginPath();ctx.arc(.26*w,.88*h,Math.max(2,.06*Math.min(w,h)),0,Math.PI*2);finishPath(ctx,style);
      ctx.beginPath();ctx.arc(.14*w,.96*h,Math.max(1.5,.035*Math.min(w,h)),0,Math.PI*2);finishPath(ctx,style);
    }else if(type==='caption'){
      ctx.beginPath();const r=Math.min(w,h)*.06;ctx.moveTo(.08*w,.12*h);ctx.lineTo(.92*w,.12*h);ctx.quadraticCurveTo(.97*w,.12*h,.97*w,.17*h);ctx.lineTo(.97*w,.69*h);ctx.quadraticCurveTo(.97*w,.74*h,.92*w,.74*h);ctx.lineTo(.58*w,.74*h);ctx.lineTo(.44*w,.92*h);ctx.lineTo(.45*w,.74*h);ctx.lineTo(.08*w,.74*h);ctx.quadraticCurveTo(.03*w,.74*h,.03*w,.69*h);ctx.lineTo(.03*w,.17*h);ctx.quadraticCurveTo(.03*w,.12*h,.08*w,.12*h);ctx.closePath();finishPath(ctx,style);
    }else if(type==='tape'){
      const rr=Math.min(w,h)*.07;ctx.beginPath();ctx.moveTo(.04*w,.18*h+rr);ctx.quadraticCurveTo(.04*w,.18*h,.04*w+rr,.18*h);ctx.lineTo(.96*w-rr,.18*h);ctx.quadraticCurveTo(.96*w,.18*h,.96*w,.18*h+rr);ctx.lineTo(.96*w,.82*h-rr);ctx.quadraticCurveTo(.96*w,.82*h,.96*w-rr,.82*h);ctx.lineTo(.04*w+rr,.82*h);ctx.quadraticCurveTo(.04*w,.82*h,.04*w,.82*h-rr);ctx.closePath();finishPath(ctx,style);
      ctx.save();ctx.globalAlpha=.45;ctx.lineWidth=Math.max(.6,style.borderWidth*.7*scale);ctx.beginPath();ctx.moveTo(.04*w,.30*h);ctx.lineTo(.14*w,.18*h);ctx.moveTo(.04*w,.70*h);ctx.lineTo(.14*w,.82*h);ctx.moveTo(.86*w,.18*h);ctx.lineTo(.96*w,.30*h);ctx.moveTo(.86*w,.82*h);ctx.lineTo(.96*w,.70*h);ctx.stroke();ctx.restore();
    }else if(type==='postIt'){
      ctx.beginPath();ctx.moveTo(.08*w,.06*h);ctx.lineTo(.92*w,.06*h);ctx.lineTo(.92*w,.72*h);ctx.lineTo(.70*w,.94*h);ctx.lineTo(.08*w,.94*h);ctx.closePath();finishPath(ctx,style);
      ctx.save();ctx.fillStyle='rgba(255,255,255,.38)';ctx.beginPath();ctx.moveTo(.70*w,.94*h);ctx.lineTo(.70*w,.72*h);ctx.lineTo(.92*w,.72*h);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();
    }else if(type==='priceTag'){
      ctx.beginPath();ctx.moveTo(.08*w,.25*h);ctx.lineTo(.28*w,.07*h);ctx.lineTo(.92*w,.07*h);ctx.lineTo(.92*w,.93*h);ctx.lineTo(.28*w,.93*h);ctx.lineTo(.08*w,.75*h);ctx.closePath();finishPath(ctx,style);
      ctx.save();ctx.fillStyle='#fffaf0';ctx.beginPath();ctx.arc(.27*w,.50*h,Math.max(2,.07*Math.min(w,h)),0,Math.PI*2);ctx.fill();ctx.stroke();ctx.restore();
    }else if(type==='questionMark'||type==='exclamationPoint'){
      ctx.save();ctx.setLineDash([]);ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`800 ${Math.max(18,.82*h)}px -apple-system,BlinkMacSystemFont,"Segoe UI",Arial,sans-serif`;ctx.fillStyle=style.fill;ctx.strokeStyle=style.borderColor;ctx.lineWidth=Math.max(.6,style.borderWidth*.35*scale);ctx.strokeText(type==='questionMark'?'?':'!',w/2,h*.52,w*.95);ctx.fillText(type==='questionMark'?'?':'!',w/2,h*.52,w*.95);ctx.restore();
    }else{
      ctx.beginPath();ctx.rect(x,y,rw,rh);finishPath(ctx,style);
    }
    ctx.setLineDash([]);
  }

  function patchShareShapeRenderer(){
    if(typeof makeOutfitShareBlob!=='function')return false;
    const source=String(makeOutfitShareBlob);
    if(source.includes('__audreyShareDrawShapeV2'))return true;
    const old="else if(b.kind==='shape'){if(b.value==='circle'){ctx.strokeStyle='#4d8e8a';ctx.fillStyle='rgba(77,142,138,.08)';ctx.lineWidth=Math.max(2,6*scale);ctx.beginPath();ctx.ellipse(w/2,h/2,Math.max(2,w/2-7*scale),Math.max(2,h/2-7*scale),0,0,Math.PI*2);ctx.fill();ctx.stroke()}if(b.value==='line'){ctx.save();ctx.translate(w/2,h/2);ctx.rotate(-4*Math.PI/180);ctx.fillStyle='#7d3547';roundRectPath(ctx,-w/2,-4*scale,w,8*scale,4*scale);ctx.fill();ctx.restore()}if(b.value==='tape'){ctx.fillStyle='rgba(198,163,78,.42)';ctx.fillRect(0,h*.08,w,h*.84)}}";
    const replacement="else if(b.kind==='shape'){window.__audreyShareDrawShapeV2(ctx,b,w,h,scale)}";
    if(!source.includes(old))return false;
    try{
      const patched=source.replace(old,replacement);
      makeOutfitShareBlob=eval('('+patched+')');
      return true;
    }catch(err){console.error('Share shape renderer patch failed',err);return false;}
  }

  function install(){
    if(installed||typeof makeOutfitShareBlob!=='function')return false;
    window.__audreyShareDrawShapeV2=drawShareShape;
    if(!patchShareShapeRenderer())return false;
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
    window.AUDREY_SHARE_EXPORT_COMPAT_V2={exportPieces,drawShareShape};
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
