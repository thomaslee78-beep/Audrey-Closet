/* Audrey Closet v13.23.6 — Portfolio Mini Fidelity
 * Faithful miniatures of the saved Design Board using one uniform board scale.
 * The mini card now contains a letterboxed Board plane with the same saved
 * aspect ratio, so text box width and font size shrink by the same factor.
 */
(function(){
  'use strict';

  const VERSION='13.23.6';
  let installed=false;
  let miniObserver=null;

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
    const size=sizes[style.size]||sizes.medium,font=fonts[style.font]||{css:'Georgia,serif'},lh=Number(size.lineHeight)||1.12;
    // The plane has the same aspect ratio as the saved Board. 1cqw therefore
    // equals exactly 1% of saved-board width at the mini scale.
    const fontCqw=(size.px/g.sw)*100;
    return `font-family:${font.css};font-size:${fontCqw}cqw;font-weight:${style.bold?700:(font.weight||400)};font-style:${style.italic?'italic':'normal'};text-decoration:${style.underline?'underline':'none'};color:${style.color||'#7d3547'};text-align:${style.align||'center'};line-height:${lh};white-space:pre-wrap;overflow-wrap:break-word;word-break:normal`;
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
  function renderShape(piece,outfit,legacy){const g=geometry(piece,outfit),html=legacy(piece,outfit);return html?html.replace(/style="[^"]*"/,`style="${geometryStyle(g)}"`):'';}
  function renderSticker(piece,outfit,legacy){
    const g=geometry(piece,outfit),compat=window.AUDREY_STICKER_RENDER_COMPAT_V13231;
    if(compat?.stickerMarkup)return `<span class="portfolio-deco portfolio-sticker-v13231 portfolio-sticker-fidelity-v13236" style="${geometryStyle(g)}">${compat.stickerMarkup(g.p,'portfolio-sticker-content-v13231')}</span>`;
    const html=legacy(piece,outfit);return html?html.replace(/style="[^"]*"/,`style="${geometryStyle(g)}"`):'';
  }

  function sizeMiniPlane(mini,outfit){
    if(!mini||!outfit)return;
    let plane=mini.querySelector(':scope > .portfolio-mini-plane-v13236');
    if(!plane)return;
    const sw=Math.max(1,num(outfit.boardWidth,390)),sh=Math.max(1,num(outfit.boardHeight,420)),cw=mini.clientWidth,ch=mini.clientHeight;
    if(!cw||!ch)return;
    const scale=Math.min(cw/sw,ch/sh),pw=sw*scale,ph=sh*scale;
    Object.assign(plane.style,{width:pw+'px',height:ph+'px',left:((cw-pw)/2)+'px',top:((ch-ph)/2)+'px'});
  }
  function installMiniPlanes(){
    const root=document.getElementById('savedOutfits');if(!root)return;
    root.querySelectorAll('.portfolio-card[data-id]').forEach(card=>{
      const outfit=state.outfits.find(o=>String(o.id)===String(card.dataset.id)),mini=card.querySelector('.outfit-mini');if(!outfit||!mini)return;
      let plane=mini.querySelector(':scope > .portfolio-mini-plane-v13236');
      if(!plane){plane=document.createElement('div');plane.className='portfolio-mini-plane-v13236';while(mini.firstChild)plane.appendChild(mini.firstChild);mini.appendChild(plane);}
      plane.dataset.outfitId=outfit.id;plane.style.setProperty('--mini-board-w',String(num(outfit.boardWidth,390)));plane.style.setProperty('--mini-board-h',String(num(outfit.boardHeight,420));sizeMiniPlane(mini,outfit);miniObserver?.observe(mini);
    });
  }
  function wrapPortfolioRefresh(){
    if(window.__audreyPortfolioMiniRefreshWrappedV13236||typeof renderSavedOutfits!=='function')return;
    const previous=renderSavedOutfits;
    renderSavedOutfits=function(){const result=previous.apply(this,arguments);requestAnimationFrame(installMiniPlanes);return result;};
    window.__audreyPortfolioMiniRefreshWrappedV13236=true;
  }

  function installStyles(){
    if(document.getElementById('portfolioMiniFidelityV13236Styles'))return;
    const style=document.createElement('style');style.id='portfolioMiniFidelityV13236Styles';style.textContent=`
      .outfit-mini{position:relative!important;overflow:hidden!important}
      .portfolio-mini-plane-v13236{position:absolute!important;container-type:size!important;overflow:visible!important;transform:none!important}
      .portfolio-text-fidelity-v13236{position:absolute!important;display:block!important;overflow:visible!important;box-sizing:border-box!important}
      .portfolio-text-fidelity-content-v13236{position:absolute;inset:0;display:flex;align-items:center;width:100%;height:100%;box-sizing:border-box;padding:3%;overflow:visible}
      .portfolio-piece-fidelity-v13236{position:absolute!important;object-fit:contain!important}
      .portfolio-sticker-fidelity-v13236{position:absolute!important;overflow:visible!important}
      @supports not (font-size:1cqw){.portfolio-text-fidelity-content-v13236{font-size:10px!important}}
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
    installStyles();wrapPortfolioRefresh();
    if('ResizeObserver' in window)miniObserver=new ResizeObserver(entries=>entries.forEach(entry=>{const mini=entry.target,card=mini.closest('.portfolio-card[data-id]'),outfit=card&&state.outfits.find(o=>String(o.id)===String(card.dataset.id));if(outfit)sizeMiniPlane(mini,outfit)}));
    installed=true;
    window.AUDREY_PORTFOLIO_MINI_FIDELITY_V13236={version:VERSION,geometry,geometryStyle,sharedTextStyle,sizeMiniPlane,installMiniPlanes};
    try{if(typeof renderSavedOutfits==='function')renderSavedOutfits();requestAnimationFrame(installMiniPlanes);}catch(e){console.warn('Portfolio Mini Fidelity refresh skipped',e)}
    return true;
  }
  function start(){let tries=0;const timer=setInterval(()=>{tries++;if((window.AUDREY_BOARD_TEXT_LAYOUT_V13235&&window.AUDREY_STICKER_RENDER_COMPAT_V13231&&install())||tries>80)clearInterval(timer)},50);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
