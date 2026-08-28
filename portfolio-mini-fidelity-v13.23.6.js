/* Audrey Closet v13.23.6 — Portfolio Mini Fidelity
 * Makes Portfolio cards faithful miniatures of the saved Design Board.
 * Uses exact saved geometry, shared Text Layout styling, and accepted Sticker
 * compatibility instead of the legacy thumbnail-friendly size clamps.
 */
(function(){
  'use strict';

  const VERSION='13.23.6';
  let installed=false;

  function esc(v){return String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));}
  function num(v,fallback=0){const n=Number(v);return Number.isFinite(n)?n:fallback;}
  function pct(v,total){return total>0?(num(v)/total*100):0;}
  function geometry(piece,outfit){
    const p=normalizeBoardItem({...piece}),sw=Math.max(1,num(outfit?.boardWidth,390)),sh=Math.max(1,num(outfit?.boardHeight,420));
    return{p,sw,sh,left:pct(p.x,sw),top:pct(p.y,sh),width:pct(p.w,sw),height:pct(p.h,sh),z:num(p.z,1),rotation:num(p.rotation,0)};
  }
  function geometryStyle(g){return `left:${g.left}%;top:${g.top}%;width:${g.width}%;height:${g.height}%;z-index:${g.z};transform:rotate(${g.rotation}deg)`;}

  function sharedTextStyle(piece,g){
    const engine=window.AUDREY_BOARD_TEXT_LAYOUT_V13235,style=engine?.normalizeStyle?engine.normalizeStyle(piece.textStyle):(piece.textStyle||{});
    const sizes=engine?.sizes||{small:{px:20,lineHeight:1.12},medium:{px:28,lineHeight:1.12},large:{px:38,lineHeight:1.12},xlarge:{px:50,lineHeight:1.12}};
    const fonts=engine?.fonts||{};
    const size=sizes[style.size]||sizes.medium,font=fonts[style.font]||{css:'Georgia,serif'};
    // Scale from the original saved Board into the mini viewport. min(cqw,cqh)
    // preserves a uniform type scale even if the card is a slightly different ratio.
    const fw=(size.px/g.sw)*100,fh=(size.px/g.sh)*100;
    const lh=Number(size.lineHeight)||1.12;
    return `font-family:${font.css};font-size:min(${fw}cqw,${fh}cqh);font-weight:${style.bold?700:(font.weight||400)};font-style:${style.italic?'italic':'normal'};text-decoration:${style.underline?'underline':'none'};color:${style.color||'#7d3547'};text-align:${style.align||'center'};line-height:${lh};white-space:pre-wrap;overflow-wrap:break-word;word-break:normal`;
  }
  function renderText(piece,outfit){
    const g=geometry(piece,outfit),align=(window.AUDREY_BOARD_TEXT_LAYOUT_V13235?.normalizeStyle?.(g.p.textStyle)?.align)||g.p.textStyle?.align||'center';
    const justify=align==='left'?'flex-start':align==='right'?'flex-end':'center';
    return `<span class="portfolio-deco portfolio-text-fidelity-v13236" style="${geometryStyle(g)}"><span class="portfolio-text-fidelity-content-v13236" style="${sharedTextStyle(g.p,g)};justify-content:${justify}">${esc(g.p.value||'')}</span></span>`;
  }
  function renderPiece(piece,outfit){
    const g=geometry(piece,outfit),obj=(g.p.source==='wishlist'?state.wishlist:state.items).find(x=>x.id===g.p.id);
    if(!obj?.photo)return'';
    return `<img class="portfolio-piece portfolio-piece-fidelity-v13236" src="${esc(obj.photo)}" style="${geometryStyle(g)}" draggable="false">`;
  }
  function renderShape(piece,outfit,legacy){
    const g=geometry(piece,outfit),html=legacy(piece,outfit);
    // Keep the accepted Shape visual markup but replace only the old clamped geometry.
    if(!html)return'';
    return html.replace(/style="[^"]*"/,`style="${geometryStyle(g)}"`);
  }
  function renderSticker(piece,outfit,legacy){
    const g=geometry(piece,outfit),compat=window.AUDREY_STICKER_RENDER_COMPAT_V13231;
    if(compat?.stickerMarkup)return `<span class="portfolio-deco portfolio-sticker-v13231 portfolio-sticker-fidelity-v13236" style="${geometryStyle(g)}">${compat.stickerMarkup(g.p,'portfolio-sticker-content-v13231')}</span>`;
    const html=legacy(piece,outfit);return html?html.replace(/style="[^"]*"/,`style="${geometryStyle(g)}"`):'';
  }

  function installStyles(){
    if(document.getElementById('portfolioMiniFidelityV13236Styles'))return;
    const style=document.createElement('style');style.id='portfolioMiniFidelityV13236Styles';style.textContent=`
      .outfit-mini{container-type:size;position:relative;overflow:hidden}
      .portfolio-text-fidelity-v13236{position:absolute!important;display:block!important;overflow:visible!important;box-sizing:border-box!important}
      .portfolio-text-fidelity-content-v13236{position:absolute;inset:0;display:flex;align-items:center;width:100%;height:100%;box-sizing:border-box;padding:3%;overflow:visible}
      .portfolio-piece-fidelity-v13236{position:absolute!important;object-fit:contain!important}
      .portfolio-sticker-fidelity-v13236{position:absolute!important;overflow:visible!important}
      @supports not (font-size:1cqw){
        .portfolio-text-fidelity-content-v13236{font-size:10px!important}
      }
    `;document.head.appendChild(style);
  }
  function install(){
    if(installed||typeof renderMiniPiece!=='function')return false;
    const legacy=renderMiniPiece;
    renderMiniPiece=function(piece,outfit){
      const p=normalizeBoardItem({...piece});
      if(p?.kind==='text')return renderText(p,outfit);
      if(p?.kind==='piece')return renderPiece(p,outfit);
      if(p?.kind==='sticker')return renderSticker(p,outfit,legacy);
      if(p?.kind==='shape')return renderShape(p,outfit,legacy);
      return legacy.apply(this,arguments);
    };
    installStyles();installed=true;
    window.AUDREY_PORTFOLIO_MINI_FIDELITY_V13236={version:VERSION,geometry,geometryStyle,sharedTextStyle};
    try{if(typeof renderSavedOutfits==='function')renderSavedOutfits();}catch(e){console.warn('Portfolio Mini Fidelity refresh skipped',e)}
    return true;
  }
  function start(){let tries=0;const timer=setInterval(()=>{tries++;if((window.AUDREY_BOARD_TEXT_LAYOUT_V13235&&window.AUDREY_STICKER_RENDER_COMPAT_V13231&&install())||tries>80)clearInterval(timer)},50);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
