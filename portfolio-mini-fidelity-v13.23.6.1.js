/* Audrey Closet v13.23.6.1 — Deterministic Portfolio Mini Text Scale
 * Keeps the accepted letterboxed mini Board plane from v13.23.6, but removes
 * container-query font sizing. Every mini text object now uses:
 * saved text preset px × exact uniform Board→thumbnail scale.
 * iOS/Safari text autosizing is explicitly disabled for Portfolio mini text.
 */
(function(){
  'use strict';

  const VERSION='13.23.6.1';
  let installed=false;
  let miniObserver=null;

  function esc(v){return String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#39;'}[ch]));}
  function num(v,fallback=0){const n=Number(v);return Number.isFinite(n)?n:fallback;}
  function pct(v,total){return total>0?(num(v)/total*100):0;}
  function textEngine(){return window.AUDREY_BOARD_TEXT_LAYOUT_V13235||null;}
  function geometry(piece,outfit){
    const p=normalizeBoardItem({...piece}),sw=Math.max(1,num(outfit?.boardWidth,390)),sh=Math.max(1,num(outfit?.boardHeight,420));
    return{p,sw,sh,left:pct(p.x,sw),top:pct(p.y,sh),width:pct(p.w,sw),height:pct(p.h,sh),z:num(p.z,1),rotation:num(p.rotation,0)};
  }
  function geometryStyle(g){return `left:${g.left}%;top:${g.top}%;width:${g.width}%;height:${g.height}%;z-index:${g.z};transform:rotate(${g.rotation}deg)`;}
  function normalizedText(piece){
    const engine=textEngine(),style=engine?.normalizeStyle?engine.normalizeStyle(piece?.textStyle):(piece?.textStyle||{});
    const sizes=engine?.sizes||{small:{label:'S',px:20,lineHeight:1.12},medium:{label:'M',px:28,lineHeight:1.12},large:{label:'L',px:38,lineHeight:1.12},xlarge:{label:'XL',px:50,lineHeight:1.12}};
    const fonts=engine?.fonts||{};
    const size=sizes[style.size]||sizes.medium,font=fonts[style.font]||{css:'Georgia,serif'};
    return{style,size,font,basePx:num(size.px,28),lineHeight:num(size.lineHeight,1.12)};
  }
  function sharedTextStyle(piece){
    const t=normalizedText(piece),s=t.style;
    return `font-family:${t.font.css};font-weight:${s.bold?700:(t.font.weight||400)};font-style:${s.italic?'italic':'normal'};text-decoration:${s.underline?'underline':'none'};color:${s.color||'#7d3547'};text-align:${s.align||'center'};line-height:${t.lineHeight};white-space:pre-wrap;overflow-wrap:break-word;word-break:normal;-webkit-text-size-adjust:none;text-size-adjust:none`;
  }
  function renderText(piece,outfit){
    const g=geometry(piece,outfit),t=normalizedText(g.p),align=t.style.align||'center',justify=align==='left'?'flex-start':align==='right'?'flex-end':'center';
    return `<span class="portfolio-deco portfolio-text-fidelity-v132361" style="${geometryStyle(g)}"><span class="portfolio-text-fidelity-content-v132361" data-mini-font-base="${t.basePx}" data-mini-text-size="${esc(t.style.size||'medium')}" style="${sharedTextStyle(g.p)};justify-content:${justify}">${esc(g.p.value||'')}</span></span>`;
  }
  function renderPiece(piece,outfit){
    const g=geometry(piece,outfit),obj=(g.p.source==='wishlist'?state.wishlist:state.items).find(x=>x.id===g.p.id);
    if(!obj?.photo)return'';
    return `<img class="portfolio-piece portfolio-piece-fidelity-v132361" src="${esc(obj.photo)}" style="${geometryStyle(g)}" draggable="false">`;
  }
  function renderShape(piece,outfit,legacy){const g=geometry(piece,outfit),html=legacy(piece,outfit);return html?html.replace(/style="[^"]*"/,`style="${geometryStyle(g)}"`):'';}
  function renderSticker(piece,outfit,legacy){
    const g=geometry(piece,outfit),compat=window.AUDREY_STICKER_RENDER_COMPAT_V13231;
    if(compat?.stickerMarkup)return `<span class="portfolio-deco portfolio-sticker-v13231 portfolio-sticker-fidelity-v132361" style="${geometryStyle(g)}">${compat.stickerMarkup(g.p,'portfolio-sticker-content-v13231')}</span>`;
    const html=legacy(piece,outfit);return html?html.replace(/style="[^"]*"/,`style="${geometryStyle(g)}"`):'';
  }
  function applyDeterministicTextScale(plane,scale){
    plane.querySelectorAll('.portfolio-text-fidelity-content-v132361[data-mini-font-base]').forEach(el=>{
      const base=Math.max(1,num(el.dataset.miniFontBase,28)),fontPx=Math.max(.1,base*scale);
      el.style.setProperty('font-size',fontPx+'px','important');
      el.style.setProperty('-webkit-text-size-adjust','none','important');
      el.style.setProperty('text-size-adjust','none','important');
    });
  }
  function sizeMiniPlane(mini,outfit){
    if(!mini||!outfit)return;
    const plane=mini.querySelector(':scope > .portfolio-mini-plane-v132361');if(!plane)return;
    const sw=Math.max(1,num(outfit.boardWidth,390)),sh=Math.max(1,num(outfit.boardHeight,420)),cw=mini.clientWidth,ch=mini.clientHeight;
    if(!cw||!ch)return;
    const scale=Math.min(cw/sw,ch/sh),pw=sw*scale,ph=sh*scale;
    plane.dataset.miniScale=String(scale);
    Object.assign(plane.style,{width:pw+'px',height:ph+'px',left:((cw-pw)/2)+'px',top:((ch-ph)/2)+'px'});
    applyDeterministicTextScale(plane,scale);
  }
  function installMiniPlanes(){
    const root=document.getElementById('savedOutfits');if(!root)return;
    root.querySelectorAll('.portfolio-card[data-id]').forEach(card=>{
      const outfit=state.outfits.find(o=>String(o.id)===String(card.dataset.id)),mini=card.querySelector('.outfit-mini');if(!outfit||!mini)return;
      let plane=mini.querySelector(':scope > .portfolio-mini-plane-v132361');
      if(!plane){
        const old=mini.querySelector(':scope > .portfolio-mini-plane-v13236');
        if(old){plane=old;plane.classList.remove('portfolio-mini-plane-v13236');plane.classList.add('portfolio-mini-plane-v132361');}
        else{plane=document.createElement('div');plane.className='portfolio-mini-plane-v132361';while(mini.firstChild)plane.appendChild(mini.firstChild);mini.appendChild(plane);}
      }
      plane.dataset.outfitId=outfit.id;
      sizeMiniPlane(mini,outfit);miniObserver?.observe(mini);
    });
  }
  function wrapPortfolioRefresh(){
    if(window.__audreyPortfolioMiniRefreshWrappedV132361||typeof renderSavedOutfits!=='function')return;
    const previous=renderSavedOutfits;
    renderSavedOutfits=function(){const result=previous.apply(this,arguments);requestAnimationFrame(installMiniPlanes);return result;};
    window.__audreyPortfolioMiniRefreshWrappedV132361=true;
  }
  function installStyles(){
    if(document.getElementById('portfolioMiniFidelityV132361Styles'))return;
    const style=document.createElement('style');style.id='portfolioMiniFidelityV132361Styles';style.textContent=`
      .outfit-mini{position:relative!important;overflow:hidden!important}
      .portfolio-mini-plane-v132361{position:absolute!important;overflow:visible!important;transform:none!important;-webkit-text-size-adjust:none!important;text-size-adjust:none!important}
      .portfolio-text-fidelity-v132361{position:absolute!important;display:block!important;overflow:visible!important;box-sizing:border-box!important;-webkit-text-size-adjust:none!important;text-size-adjust:none!important}
      .portfolio-text-fidelity-content-v132361{position:absolute;inset:0;display:flex;align-items:center;width:100%;height:100%;box-sizing:border-box;padding:3%;overflow:visible;-webkit-text-size-adjust:none!important;text-size-adjust:none!important}
      .portfolio-piece-fidelity-v132361{position:absolute!important;object-fit:contain!important}
      .portfolio-sticker-fidelity-v132361{position:absolute!important;overflow:visible!important}
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
    window.AUDREY_PORTFOLIO_MINI_FIDELITY_V132361={version:VERSION,geometry,geometryStyle,normalizedText,sharedTextStyle,applyDeterministicTextScale,sizeMiniPlane,installMiniPlanes};
    try{if(typeof renderSavedOutfits==='function')renderSavedOutfits();requestAnimationFrame(installMiniPlanes);}catch(e){console.warn('Portfolio Mini Fidelity v13.23.6.1 refresh skipped',e)}
    return true;
  }
  function start(){let tries=0;const timer=setInterval(()=>{tries++;if((window.AUDREY_BOARD_TEXT_LAYOUT_V13235&&window.AUDREY_STICKER_RENDER_COMPAT_V13231&&install())||tries>80)clearInterval(timer)},50);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
