const CACHE='audrey-closet-v13.18-dev12';
const ASSETS=['./','./index.html','./styles.css','./app.js','./manifest.webmanifest','./icon-192.png','./icon-512.png'];

/*
 * v13.18-dev12 Board rectangular tabs.
 *
 * The current app is a single large classic app.js file. For this dev branch we
 * append the isolated tier feature when app.js is served so the stable v13.15
 * source remains untouched while the interaction is tested. If the feature is
 * promoted, it can be folded into app.js/styles.css in the next stable release.
 */
const TIER_PATCH=String.raw`
;/* v13.18-dev12 — Board rectangular tabs */
(function(){
  const CLOSET_TIERS=['S','A','B','C','D'];
  function normalizeClosetTier(value){
    const tier=String(value||'').trim().toUpperCase();
    return CLOSET_TIERS.includes(tier)?tier:'';
  }
  const TIER_REACTIONS={
    S:['Amazing find!','Can’t live without it','Closet MVP','Instant favorite','This one stays','Worth the hype','Main character piece','Always a yes','Perfect find','Top shelf','Never letting go','The one','Closet legend','No notes','Absolute keeper'],
    A:['Really good one','Easy favorite','Strong pick','Glad we found this','Almost perfect','Gets a lot right','Reliable win','Definitely keeping','Great choice','A regular in rotation','So close to S','Worth reaching for','Easy yes','Solid favorite','Good closet energy'],
    B:['Solid choice','Gets the job done','Good in rotation','Nice to have','Dependable','Works well','Still earning its spot','Pretty good','Useful piece','A steady pick','Nothing wrong here','Good supporting cast','Makes sense','Worth keeping around','Comfortable middle'],
    C:['It has its moments','Maybe with the right outfit','Still figuring this one out','Could grow on you','Needs a little help','Occasional pick','Not bad','Depends on the day','There’s potential','Maybe later','Keep experimenting','Needs the right mood','On the fence','Could work','Give it another shot'],
    D:['Meh','Try again','Not feeling it','Probably not the one','Closet benchwarmer','Maybe it’s time','Hard pass today','Not earning its space','Needs a comeback','Could be better','One more chance?','Not quite working','Low rotation','Maybe let this one go','Thanks for playing']
  };
  const tierReactionByItem=new Map();
  const lastTierReaction={S:'',A:'',B:'',C:'',D:''};
  function pickTierReaction(tier){
    const pool=TIER_REACTIONS[tier]||[];
    if(!pool.length)return'';
    const candidates=pool.length>1?pool.filter(x=>x!==lastTierReaction[tier]):pool;
    const message=candidates[Math.floor(Math.random()*candidates.length)]||pool[0]||'';
    lastTierReaction[tier]=message;
    return message;
  }
  function tierReactionFor(item,tier,{force=false}={}){
    const itemId=item&&item.id?item.id:$('#itemId')?.value||'';
    if(!itemId||!tier)return'';
    const key=itemId+'|'+tier;
    if(force||!tierReactionByItem.has(key))tierReactionByItem.set(key,pickTierReaction(tier));
    return tierReactionByItem.get(key)||'';
  }
  function tierRibbonsEnabled(){
    ensureSettings();
    return state.settings.showTierRibbons!==false;
  }
  async function setTierRibbonsEnabled(enabled){
    ensureSettings();
    const previous=state.settings.showTierRibbons!==false;
    state.settings.showTierRibbons=!!enabled;
    renderCatalog();
    const ok=await saveState();
    if(!ok){
      state.settings.showTierRibbons=previous;
      const input=$('#showTierRibbonsSetting');
      if(input)input.checked=previous;
      renderCatalog();
    }
  }
  const CLOSET_VIEWS=['classic','modern','free-flow'];
  function normalizeClosetView(value){
    const view=String(value||'classic').trim().toLowerCase();
    return CLOSET_VIEWS.includes(view)?view:'classic';
  }
  function currentClosetView(){
    ensureSettings();
    return normalizeClosetView(state.settings.closetView);
  }
  let freeFlowScatterNonce=0;
  function freeFlowHash(text){
    let h=2166136261;
    const s=String(text||'');
    for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}
    return h>>>0;
  }
  function freeFlowRand(id,salt){
    const h=freeFlowHash(String(id)+'|'+String(freeFlowScatterNonce)+'|'+String(salt));
    return (h%10000)/9999;
  }
  function applyFreeFlowScatter(){
    if(currentClosetView()!=='free-flow')return;
    $$('#catalogGrid .item-card[data-id]').forEach(function(card,index){
      const id=card.dataset.id||String(index);
      const xBase=-8+freeFlowRand(id,'x')*16;
      const yBase=-9+freeFlowRand(id,'y')*18;
      const edgeBias=(index%4===0?-3:(index%4===1?2.5:(index%4===2?-1.5:3)));
      const rowBreath=(Math.floor(index/2)%3===0?-2:(Math.floor(index/2)%3===1?1.5:3));
      const x=Math.round(xBase+edgeBias);
      const y=Math.round(yBase+rowBreath);
      const scale=(1.02+freeFlowRand(id,'s')*.08).toFixed(3);
      const rotate=(-.55+freeFlowRand(id,'r')*1.10).toFixed(2);
      const thumb=card.querySelector('.thumb');
      if(!thumb)return;
      thumb.style.setProperty('--ff-x',x+'px');
      thumb.style.setProperty('--ff-y',y+'px');
      thumb.style.setProperty('--ff-scale',scale);
      thumb.style.setProperty('--ff-r',rotate+'deg');
    });
  }
  function reshuffleFreeFlowScatter(){
    freeFlowScatterNonce++;
    applyFreeFlowScatter();
  }
  function applyClosetView(){
    const screen=document.querySelector('.screen[data-screen="catalog"]');
    if(!screen)return;
    const view=currentClosetView();
    screen.dataset.closetView=view;
    document.body.classList.toggle('closet-view-modern',view==='modern');
    document.body.classList.toggle('closet-view-free-flow',view==='free-flow');
    document.body.classList.toggle('closet-view-classic',view==='classic');
    $$('.closet-view-option').forEach(function(btn){
      const active=btn.dataset.closetView===view;
      btn.classList.toggle('active',active);
      btn.setAttribute('aria-pressed',active?'true':'false');
    });
  }
  async function setClosetView(view){
    view=normalizeClosetView(view);
    ensureSettings();
    const previous=currentClosetView();
    state.settings.closetView=view;
    applyClosetView();
    renderCatalog();
    const ok=await saveState();
    if(!ok){
      state.settings.closetView=previous;
      applyClosetView();
      renderCatalog();
    }
  }
  function installClosetTierStyles(){
    if(document.getElementById('closetTierStyles'))return;
    const style=document.createElement('style');
    style.id='closetTierStyles';
    style.textContent=[
      '#itemDialog .closet-tier-section{display:grid;gap:8px;padding:10px 11px;border:1px solid rgba(108,81,66,.14);border-radius:15px;background:rgba(243,238,225,.56)}',
      '#itemDialog .closet-tier-heading{display:flex;align-items:flex-end;justify-content:space-between;gap:10px}',
      '#itemDialog .closet-tier-heading>div{display:grid;gap:1px}',
      '#itemDialog .closet-tier-kicker{font-size:9px;line-height:1;letter-spacing:.11em;text-transform:uppercase;color:#8a7c6e;font-weight:800}',
      '#itemDialog .closet-tier-heading strong{font-family:var(--serif);font-size:17px;line-height:1.15;font-weight:600;color:var(--ink)}',
      '#itemDialog .closet-tier-heading small{max-width:145px;text-align:right;font-size:9px;line-height:1.2;color:#897d6e}',
      '#itemDialog .closet-tier-options{display:grid;grid-template-columns:repeat(5,1fr);gap:6px}',
      '#itemDialog .closet-tier-btn{min-width:0;height:36px;padding:0;border:1px solid rgba(108,81,66,.24);border-radius:10px;background:#fffaf0;color:#74695d;font:800 14px/1 var(--sans);cursor:pointer;-webkit-tap-highlight-color:transparent;transition:transform .12s ease,background .12s ease,border-color .12s ease,color .12s ease,box-shadow .12s ease}',
      '#itemDialog .closet-tier-btn:active{transform:scale(.96)}',
      '#itemDialog .closet-tier-btn.active{background:var(--olive);border-color:var(--olive-dark);color:#fff;box-shadow:inset 0 0 0 1px rgba(255,255,255,.13),0 2px 5px rgba(63,73,55,.14)}',
      '#itemDialog .closet-tier-btn:focus-visible{outline:3px solid rgba(77,142,138,.3);outline-offset:2px}',
      '#itemDialog .closet-tier-btn:disabled{opacity:.58}',
      '#catalogGrid .thumb{position:relative;overflow:hidden}',
      '#catalogGrid .tier-ribbon{--tier-a:#65745d;--tier-b:#53624c;--tier-tail:#465440;--tier-text:#fff;position:absolute;left:0;top:10px;z-index:3;display:inline-flex;align-items:center;height:22px;padding:0 12px;background:linear-gradient(135deg,var(--tier-a),var(--tier-b) 60%,var(--tier-tail));color:var(--tier-text);font:800 10px/1 var(--sans);letter-spacing:.08em;text-transform:uppercase;border-radius:0 10px 10px 0;box-shadow:0 2px 8px rgba(52,63,48,.18)}',
      '#catalogGrid .tier-ribbon::after{content:"";position:absolute;right:-7px;top:0;border-top:11px solid transparent;border-bottom:11px solid transparent;border-left:7px solid var(--tier-tail)}',
      '#catalogGrid .tier-ribbon.tier-s{--tier-a:#b8944e;--tier-b:#b38a3d;--tier-tail:#8b6a2b;--tier-text:#fff8ea;box-shadow:0 2px 8px rgba(88,65,22,.22)}',
      '#catalogGrid .tier-ribbon.tier-a{--tier-a:#66785f;--tier-b:#596b53;--tier-tail:#465840;--tier-text:#fff}',
      '#catalogGrid .tier-ribbon.tier-b{--tier-a:#7d8d76;--tier-b:#718269;--tier-tail:#5f7058;--tier-text:#fff}',
      '#catalogGrid .tier-ribbon.tier-c{--tier-a:#99a591;--tier-b:#8e9b87;--tier-tail:#7c8975;--tier-text:#253026}',
      '#catalogGrid .tier-ribbon.tier-d{--tier-a:#b9c2b4;--tier-b:#adb8a8;--tier-tail:#98a493;--tier-text:#253026}',
      '#tierFilterWrap{display:grid;gap:6px;grid-column:1/-1;padding:2px 0}',
      '#tierFilterWrap .tier-filter-label{font-size:10px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#817568}',
      '#tierFilterOptions{display:flex;flex-wrap:wrap;gap:6px}',
      '#tierFilterOptions .tier-filter-chip{min-width:38px;height:32px;padding:0 10px;border:1px solid rgba(108,81,66,.2);border-radius:10px;background:#fffaf0;color:#74695d;font:800 11px/1 var(--sans);cursor:pointer;-webkit-tap-highlight-color:transparent}',
      '#tierFilterOptions .tier-filter-chip.active{background:var(--olive);border-color:var(--olive-dark);color:#fff;box-shadow:0 2px 5px rgba(63,73,55,.12)}',
      '#tierFilterOptions .tier-filter-chip[data-tier-filter="unrated"]{min-width:72px}',
      '#tierRibbonSettingsCard{margin-top:12px}',
      '#tierRibbonSettingsCard .tier-setting-row{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:10px 0}',
      '#tierRibbonSettingsCard .tier-setting-copy{display:grid;gap:3px;min-width:0}',
      '#tierRibbonSettingsCard .tier-setting-copy strong{font-size:14px;color:var(--ink)}',
      '#tierRibbonSettingsCard .tier-setting-copy small{font-size:11px;line-height:1.35;color:#817568}',
      '#tierRibbonSettingsCard .tier-setting-toggle{display:inline-flex;align-items:center;gap:8px;flex:0 0 auto;font-size:12px;font-weight:700;color:#74695d}',
      '#tierRibbonSettingsCard .tier-setting-toggle input{width:20px;height:20px;accent-color:var(--olive)}',
      '.settings-groups{display:grid;gap:10px}',
      '.settings-group{border:1px solid rgba(108,81,66,.16);border-radius:16px;background:#e1e5da;overflow:hidden;box-shadow:0 1px 0 rgba(255,255,255,.45) inset}',
      '.settings-group>summary{list-style:none;display:flex;align-items:center;justify-content:space-between;gap:12px;min-height:56px;padding:0 15px;cursor:pointer;font-weight:800;color:var(--ink);background:#e1e5da;-webkit-tap-highlight-color:transparent;transition:background .14s ease}',
      '.settings-group>summary::-webkit-details-marker{display:none}',
      '.settings-group>summary:active{background:#d4dacd}',
      '.settings-group>summary::after{content:"＋";font-size:18px;line-height:1;color:#6f7868;font-weight:600}',
      '.settings-group[open]>summary{background:#e1e5da;border-bottom:1px solid rgba(108,81,66,.10)}',
      '.settings-group[open]>summary::after{content:"−"}',
      '.settings-group>summary small{display:block;font-size:10px;line-height:1.25;font-weight:600;color:#716b61;margin-top:3px}',
      '.settings-group-body{display:grid;gap:10px;padding:10px;background:rgba(255,250,240,.76)}',
      '.settings-group-body>.settings-card{margin:0}',
      '.settings-group-empty{padding:14px;border:1px dashed rgba(108,81,66,.16);border-radius:12px;background:rgba(255,255,255,.48);font-size:12px;line-height:1.45;color:#817568}',
      '.settings-about-card{display:grid;gap:6px}',
      '.settings-about-version{font-weight:800;color:var(--ink)}',
      '.planned-section-toggle{border-color:var(--line)!important;background:#efe6d5!important}',
      '.planned-section-toggle small{color:#7b7065!important}',
      '.planned-toggle-icon{color:var(--burgundy)!important}',
      '.today-journal-section{background:#f2eadb!important;border-radius:16px!important;padding:0 10px 10px!important;overflow:hidden}',
      '.today-section-toggle{border:0!important;background:#f2eadb!important;border-radius:0!important;padding:11px 2px 9px!important}',
      '.today-section-toggle strong{font-family:var(--serif)!important;font-size:19px!important;font-weight:600!important;color:var(--ink)!important}',
      '.today-section-toggle small{font-size:10px!important;color:#7b7065!important}',
      '.today-toggle-icon{color:var(--burgundy)!important}',
      '.today-journal-content{margin-top:0!important}',
      '#closetViewSettingsCard{display:grid;gap:10px}',
      '.closet-view-options{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px}',
      '.closet-view-option{min-width:0;min-height:76px;display:flex;flex-direction:column;align-items:flex-start;justify-content:center;gap:4px;padding:10px;border:1px solid var(--line);border-radius:13px;background:#fffdf7;color:var(--ink);font:inherit;text-align:left;cursor:pointer;-webkit-tap-highlight-color:transparent}',
      '.closet-view-option strong{font-family:var(--serif);font-size:15px;font-weight:600}',
      '.closet-view-option small{font-size:9px;line-height:1.3;color:#817568}',
      '.closet-view-option.active{background:#e1e5da;border-color:var(--olive);box-shadow:inset 0 0 0 1px rgba(102,113,90,.18)}',
      '.closet-view-option:disabled{opacity:.48;cursor:default}',
      '.closet-view-note{margin:0!important;font-size:10px!important;color:#817568!important}',
      '.screen[data-screen="catalog"][data-closet-view="modern"] .hero-card{width:calc(100% + 28px);margin-left:-14px;margin-right:-14px;border-radius:0;box-shadow:none;padding-left:20px;padding-right:20px}',
      '.screen[data-screen="catalog"][data-closet-view="modern"] .closet-grid{width:calc(100% + 28px);margin-left:-14px;margin-right:-14px;grid-template-columns:repeat(2,minmax(0,1fr));gap:0;background:#fff}',
      '.screen[data-screen="catalog"][data-closet-view="modern"] .item-card{border-radius:0;border:1px solid rgba(255,255,255,.96);box-shadow:none;background:#fffaf0}',
      '.screen[data-screen="catalog"][data-closet-view="modern"] .item-card .thumb{aspect-ratio:1/1.08;border-radius:0}',
      '.screen[data-screen="catalog"][data-closet-view="modern"] .item-card .card-body{padding:8px 9px 9px}',
      '.screen[data-screen="catalog"][data-closet-view="modern"] .item-card .card-body{display:none!important}',
      '.screen[data-screen="catalog"][data-closet-view="modern"] .item-card h4{font-size:15px;margin-bottom:2px}',
      '.screen[data-screen="catalog"][data-closet-view="modern"] .item-card p{font-size:10px}',
      '.screen[data-screen="catalog"][data-closet-view="modern"] .closet-section-title{margin-top:16px}',
      '.screen[data-screen="catalog"][data-closet-view="modern"] .category-strip{width:calc(100% + 28px);margin-left:-14px;margin-right:-14px;padding-left:0;padding-right:0;gap:0}',
      '.screen[data-screen="catalog"][data-closet-view="modern"] .category-chip{min-width:110px;border-radius:0;border-left:0;border-top:1px solid var(--line);border-bottom:1px solid var(--line);border-right:1px solid var(--line);background:var(--paper)}',
      '.screen[data-screen="catalog"][data-closet-view="modern"] .category-chip:first-child{border-left:1px solid var(--line)}',
      '.screen[data-screen="catalog"][data-closet-view="modern"] .category-chip.active{border-color:var(--turq);background:var(--turq);color:#fff}',
      '.screen[data-screen="catalog"][data-closet-view="modern"] .toolbar .searchbox{border-radius:0}',
      '.screen[data-screen="catalog"][data-closet-view="modern"] #filterBtn{border-radius:0}',
      '.screen[data-screen="catalog"][data-closet-view="modern"] .item-card .count-badge{display:none!important}',
      '.screen[data-screen="catalog"][data-closet-view="modern"] .hero-card .primary{border-radius:0!important}',
      '.screen[data-screen="catalog"][data-closet-view="modern"] .closet-grid{background:transparent!important}',
      '.screen[data-screen="catalog"][data-closet-view="modern"] .closet-grid:has(.item-card:last-child:nth-child(odd))::after{content:"";display:block;aspect-ratio:1/1.08;background:linear-gradient(140deg,#e7dfcd,#f8f3e8);border:1px solid rgba(255,255,255,.96);box-sizing:border-box}',
      'body.closet-view-modern .closet-drop-outline{border-radius:0!important}',
      'body.closet-view-modern .closet-drag-ghost{border-radius:0!important}',
      '.screen[data-screen="catalog"][data-closet-view="free-flow"] .closet-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:0 1px;background:transparent!important}',
      '.screen[data-screen="catalog"][data-closet-view="free-flow"] .item-card{position:relative;overflow:visible;border:0!important;border-radius:0!important;background:transparent!important;box-shadow:none!important;min-height:186px;display:flex;align-items:center;justify-content:center}',
      '.screen[data-screen="catalog"][data-closet-view="free-flow"] .item-card .card-body{display:none!important}',
      '.screen[data-screen="catalog"][data-closet-view="free-flow"] .item-card .count-badge{display:none!important}',
      '.screen[data-screen="catalog"][data-closet-view="free-flow"] .item-card .thumb{width:107%;aspect-ratio:1/1.08;background:transparent!important;border:0!important;overflow:visible!important;display:flex;align-items:center;justify-content:center;transform-origin:center center;transform:translate(var(--ff-x,0px),var(--ff-y,0px)) rotate(var(--ff-r,0deg)) scale(var(--ff-scale,1.04))}',
      '.screen[data-screen="catalog"][data-closet-view="free-flow"] .item-card img{width:100%;height:100%;object-fit:contain;filter:drop-shadow(0 7px 8px rgba(68,55,37,.10));transition:transform .14s ease}',
      '.screen[data-screen="catalog"][data-closet-view="free-flow"] .tier-ribbon{top:12px;left:5px;transform:scale(.86);transform-origin:left top}',
      '.screen[data-screen="catalog"][data-closet-view="free-flow"] .archived-badge{transform:scale(.88);transform-origin:right top}',
      '.screen[data-screen="catalog"][data-closet-view="free-flow"] .closet-section-title{margin-bottom:3px}',
      'body.closet-view-free-flow .closet-drag-ghost{border:0!important;border-radius:0!important;background:transparent!important;box-shadow:none!important;overflow:visible!important}',
      'body.closet-view-free-flow .closet-drag-ghost .card-body,body.closet-view-free-flow .closet-drag-ghost .count-badge{display:none!important}',
      'body.closet-view-free-flow .closet-drop-outline{border-radius:0!important;background:rgba(125,53,71,.035)!important}',
      '.screen[data-screen="outfits"] .board-picker-card{background:transparent!important;border:0!important;border-radius:0!important;box-shadow:none!important;padding-left:0!important;padding-right:0!important}',
      '.screen[data-screen="outfits"] .piece-grid{grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:0 2px!important;padding:2px 0 8px!important;overflow:visible!important;max-height:none!important}',
      '.screen[data-screen="outfits"] .piece-grid .tray-piece{position:relative;width:auto!important;min-width:0!important;border:0!important;background:transparent!important;padding:0!important;overflow:visible!important;min-height:118px;display:flex;align-items:center;justify-content:center}',
      '.screen[data-screen="outfits"] .piece-grid .tray-piece .mini-photo{width:108%!important;height:auto!important;aspect-ratio:1/1.04!important;border:0!important;border-radius:0!important;background:transparent!important;padding:0!important;box-shadow:none!important;overflow:visible!important;display:flex;align-items:center;justify-content:center;transform-origin:center center}',
      '.screen[data-screen="outfits"] .piece-grid .tray-piece .mini-photo img{width:100%!important;height:100%!important;max-width:none!important;max-height:none!important;object-fit:contain!important;filter:drop-shadow(0 6px 7px rgba(68,55,37,.10))}',
      '.screen[data-screen="outfits"] .piece-grid .tray-piece small,.screen[data-screen="outfits"] .piece-grid .tray-piece em{display:none!important}',
      '.screen[data-screen="outfits"] .piece-grid .tray-piece:nth-child(10n+1) .mini-photo{transform:translate(-5px,5px) rotate(-.35deg) scale(1.03)}',
      '.screen[data-screen="outfits"] .piece-grid .tray-piece:nth-child(10n+2) .mini-photo{transform:translate(4px,-3px) rotate(.25deg) scale(1.07)}',
      '.screen[data-screen="outfits"] .piece-grid .tray-piece:nth-child(10n+3) .mini-photo{transform:translate(1px,3px) rotate(.15deg) scale(1.04)}',
      '.screen[data-screen="outfits"] .piece-grid .tray-piece:nth-child(10n+4) .mini-photo{transform:translate(-3px,-4px) rotate(-.30deg) scale(1.08)}',
      '.screen[data-screen="outfits"] .piece-grid .tray-piece:nth-child(10n+5) .mini-photo{transform:translate(5px,2px) rotate(.20deg) scale(1.02)}',
      '.screen[data-screen="outfits"] .piece-grid .tray-piece:nth-child(10n+6) .mini-photo{transform:translate(-2px,6px) rotate(-.20deg) scale(1.06)}',
      '.screen[data-screen="outfits"] .piece-grid .tray-piece:nth-child(10n+7) .mini-photo{transform:translate(3px,-5px) rotate(.32deg) scale(1.05)}',
      '.screen[data-screen="outfits"] .piece-grid .tray-piece:nth-child(10n+8) .mini-photo{transform:translate(-4px,1px) rotate(-.18deg) scale(1.03)}',
      '.screen[data-screen="outfits"] .piece-grid .tray-piece:nth-child(10n+9) .mini-photo{transform:translate(2px,5px) rotate(.28deg) scale(1.07)}',
      '.screen[data-screen="outfits"] .piece-grid .tray-piece:nth-child(10n) .mini-photo{transform:translate(-1px,-2px) rotate(-.22deg) scale(1.04)}',
      '.screen[data-screen="outfits"] .picker-head{margin-left:2px;margin-right:2px}',
      '.screen[data-screen="outfits"] .picker-head span{display:none!important}',
      '@media(max-width:410px){.screen[data-screen="outfits"] .piece-grid{grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:0!important}.screen[data-screen="outfits"] .piece-grid .tray-piece{min-height:108px}}',
      '.screen[data-screen="outfits"]{--board-format-ratio:4/5}',
      '.screen[data-screen="outfits"] .board-page-head{margin-bottom:8px}',
      '.screen[data-screen="outfits"] .board-compose-bar{display:grid;grid-template-columns:minmax(0,1fr) auto auto;gap:7px;align-items:center;margin:0 0 10px}',
      '.screen[data-screen="outfits"] .board-compose-name{min-width:0;font:inherit;color:var(--ink);border:1px solid var(--line);background:#fffdf7;border-radius:13px;padding:11px 12px;width:100%;outline:none}',
      '.screen[data-screen="outfits"] .board-compose-name:focus{border-color:var(--turq);box-shadow:0 0 0 3px rgba(77,142,138,.12)}',
      '.screen[data-screen="outfits"] .board-notes-btn{width:42px;height:42px;padding:0;border:1px solid rgba(108,81,66,.16);border-radius:13px;background:#eee4d0;color:var(--coffee);font-size:19px;font-weight:800}',
      '.screen[data-screen="outfits"] .board-compose-save{min-height:42px;padding:10px 13px;white-space:nowrap}',
      '.screen[data-screen="outfits"] .board-notes-drawer{display:none;margin:-3px 0 10px;padding:9px;border:1px solid var(--line);border-radius:13px;background:#f3ead8}',
      '.screen[data-screen="outfits"] .board-notes-drawer.open{display:block}',
      '.screen[data-screen="outfits"] .board-notes-drawer textarea{min-height:78px;margin:0!important}',
      '.screen[data-screen="outfits"] .board-shell.board-first{display:block!important;margin:0}',
      '.screen[data-screen="outfits"] .board-first>div:first-child{width:100%}',
      '.screen[data-screen="outfits"] #outfitBoard{width:min(100%,620px);height:auto!important;aspect-ratio:var(--board-format-ratio);margin:0 auto;border-radius:18px}',
      '.screen[data-screen="outfits"] .board-save-panel{display:none!important}',
      '.screen[data-screen="outfits"] #boardEditbar{margin:0;padding:0;overflow-x:auto}',
      '.screen[data-screen="outfits"] .board-workspace{margin-top:10px}',
      '.screen[data-screen="outfits"] .board-workspace-tabs{position:sticky;top:66px;z-index:16;display:grid;grid-template-columns:1fr 1fr 1fr;gap:0;border:1px solid var(--line);border-radius:14px;overflow:hidden;background:#f8f2e4;box-shadow:0 4px 12px rgba(65,52,37,.08)}',
      '.screen[data-screen="outfits"] .board-workspace-tab{min-width:0;border:0;border-right:1px solid var(--line);background:#f8f2e4;color:#786c5e;padding:11px 6px;font:750 11px/1.1 var(--sans)}',
      '.screen[data-screen="outfits"] .board-workspace-tab:last-child{border-right:0}',
      '.screen[data-screen="outfits"] .board-workspace-tab.active{background:var(--olive);color:#fff}',
      '.screen[data-screen="outfits"] .board-workspace-panel{display:none;padding-top:9px}',
      '.screen[data-screen="outfits"] .board-workspace-panel.active{display:block}',
      '.screen[data-screen="outfits"] .board-workspace-panel .board-picker-card{margin:0!important}',
      '.screen[data-screen="outfits"] .board-tools-shell{display:grid;gap:9px;padding:10px;border:1px solid var(--line);border-radius:14px;background:rgba(255,250,240,.78)}',
      '.screen[data-screen="outfits"] .board-tools-actions{display:flex;gap:7px;flex-wrap:wrap}',
      '.screen[data-screen="outfits"] .board-tools-actions .soft-btn{flex:1 1 120px}',
      '.screen[data-screen="outfits"] .board-decorate-shell{padding:10px;border:1px solid var(--line);border-radius:14px;background:rgba(255,250,240,.78)}',
      '.screen[data-screen="outfits"] .board-decorate-shell #decorateToggle{display:none!important}',
      '.screen[data-screen="outfits"] .board-decorate-shell #creativeTools{display:grid!important}',
      '.screen[data-screen="outfits"] .board-decorate-shell #creativeTools.hidden{display:grid!important}',
      '.screen[data-screen="outfits"] .board-controls-top{display:none!important}',
      '@media(max-width:410px){.screen[data-screen="outfits"] .board-compose-bar{grid-template-columns:minmax(0,1fr) 40px auto;gap:6px}.screen[data-screen="outfits"] .board-compose-save{padding-left:10px;padding-right:10px;font-size:12px}.screen[data-screen="outfits"] #outfitBoard{border-radius:15px}.screen[data-screen="outfits"] .board-workspace-tabs{top:62px}.screen[data-screen="outfits"] .board-workspace-tab{font-size:10px;padding:10px 4px}}',
      '.screen[data-screen="outfits"] .board-notes-drawer{width:100%}',
      '.screen[data-screen="outfits"] .board-notes-drawer textarea{width:100%!important;display:block;box-sizing:border-box;font-size:16px!important;line-height:1.35}',
      '.screen[data-screen="outfits"] #boardTextInput{font-size:16px!important}',
      '.screen[data-screen="outfits"] .board-picker-bottom .picker-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:5px}',
      '.screen[data-screen="outfits"] .board-picker-bottom .picker-head .tabs-small{margin:0!important;flex:0 0 auto;display:flex;gap:5px}',
      '.screen[data-screen="outfits"] .board-picker-bottom .picker-head .tabs-small button{padding:6px 9px;font-size:10px;border-radius:12px}',
      '.screen[data-screen="outfits"] .board-tools-main .board-editbar{display:flex;gap:5px;flex-wrap:wrap;overflow:visible}',
      '.screen[data-screen="outfits"] .board-tools-main .board-editbar button{flex:1 1 92px}',
      '.screen[data-screen="outfits"] .board-tools-main #clearBoardBtn{display:inline-flex;align-items:center;justify-content:center}',
      '.screen[data-screen="outfits"] .board-page-head .board-head-actions{display:flex;gap:7px;align-items:center}',
      '.screen[data-screen="outfits"] .board-page-head .board-head-actions #shareOutfitBtn{white-space:nowrap}',
      '@media(max-width:410px){.screen[data-screen="outfits"] .board-notes-drawer textarea,.screen[data-screen="outfits"] #boardTextInput,.screen[data-screen="outfits"] .board-compose-name{font-size:16px!important}.screen[data-screen="outfits"] .board-picker-bottom .picker-head{gap:6px}.screen[data-screen="outfits"] .board-picker-bottom .picker-head strong{font-size:17px}.screen[data-screen="outfits"] .board-picker-bottom .picker-head .tabs-small button{padding:6px 7px;font-size:9px}.screen[data-screen="outfits"] .board-page-head .board-head-actions{gap:5px}}',
      '.screen[data-screen="outfits"] .board-picker-filters{display:grid;grid-template-columns:minmax(0,1fr) auto auto;gap:6px;align-items:center;margin:5px 0 6px}',
      '.screen[data-screen="outfits"] .board-picker-search{min-width:0;height:38px;border:1px solid var(--line);border-radius:12px;background:#fffdf7;padding:0 10px;font:16px/1 var(--sans);color:var(--ink);outline:none}',
      '.screen[data-screen="outfits"] .board-picker-search:focus{border-color:var(--turq);box-shadow:0 0 0 3px rgba(77,142,138,.12)}',
      '.screen[data-screen="outfits"] .board-picker-filter-btn{height:38px;padding:0 10px;border:1px solid var(--line);border-radius:12px;background:#fffaf0;color:#74695d;font:750 10px/1 var(--sans);white-space:nowrap}',
      '.screen[data-screen="outfits"] .board-picker-filter-btn.active{background:var(--olive);border-color:var(--olive);color:#fff}',
      '.screen[data-screen="outfits"] .board-picker-filter-panel{display:none;grid-column:1/-1;padding:8px;border:1px solid var(--line);border-radius:12px;background:#f5eedf}',
      '.screen[data-screen="outfits"] .board-picker-filter-panel.open{display:grid;gap:7px}',
      '.screen[data-screen="outfits"] .board-picker-filter-row{display:flex;align-items:center;gap:6px;flex-wrap:wrap}',
      '.screen[data-screen="outfits"] .board-picker-filter-row>span{min-width:42px;font-size:9px;font-weight:800;letter-spacing:.07em;text-transform:uppercase;color:#817568}',
      '.screen[data-screen="outfits"] .board-picker-chip{min-height:30px;padding:0 9px;border:1px solid rgba(108,81,66,.18);border-radius:10px;background:#fffaf0;color:#74695d;font:750 10px/1 var(--sans)}',
      '.screen[data-screen="outfits"] .board-picker-chip.active{background:var(--olive);border-color:var(--olive);color:#fff}',
      '.screen[data-screen="outfits"] .piece-grid .tray-piece.board-picker-added .mini-photo{animation:boardPickerAdded .52s ease-out}',
      '.screen[data-screen="outfits"] #outfitBoard .board-piece.board-piece-added{animation:boardPieceArrive .42s ease-out}',
      '@keyframes boardPickerAdded{0%{filter:none}35%{filter:drop-shadow(0 0 8px rgba(77,142,138,.55));transform:scale(1.07)}100%{filter:none}}',
      '@keyframes boardPieceArrive{0%{opacity:.35}45%{opacity:1;filter:drop-shadow(0 0 10px rgba(77,142,138,.42))}100%{filter:none}}',
      '.screen[data-screen="outfits"] #clearBoardBtn{border-color:rgba(125,53,71,.22)!important;color:var(--burgundy)!important}',
      '@media(max-width:410px){.screen[data-screen="outfits"] .board-picker-filters{grid-template-columns:minmax(0,1fr) auto auto;gap:5px}.screen[data-screen="outfits"] .board-picker-filter-btn{padding:0 8px;font-size:9px}}',
      '.screen[data-screen="outfits"] .board-picker-bottom .picker-head>strong{display:none!important}',
      '.screen[data-screen="outfits"] .board-picker-bottom .picker-head{justify-content:flex-end;margin-bottom:2px}',
      '.screen[data-screen="outfits"] .board-picker-bottom .picker-head .tabs-small{margin-left:auto!important}',
      '.screen[data-screen="outfits"] .outfit-category-filter{margin-top:2px!important;margin-bottom:4px!important}',
      '.screen[data-screen="outfits"] .board-picker-filters{margin-top:2px!important;margin-bottom:4px!important}',
      '.screen[data-screen="outfits"] .piece-grid{padding-top:0!important}',
      '.screen[data-screen="outfits"] .board-picker-reset-btn{height:38px;padding:0 10px;border:1px solid rgba(108,81,66,.16);border-radius:12px;background:#eee5d3;color:#74695d;font:750 10px/1 var(--sans);white-space:nowrap}',
      '.screen[data-screen="outfits"] .board-picker-reset-btn:active{transform:scale(.97)}',
      '@media(max-width:410px){.screen[data-screen="outfits"] .board-picker-filters{grid-template-columns:minmax(0,1fr) auto auto auto!important}.screen[data-screen="outfits"] .board-picker-reset-btn{padding:0 7px;font-size:9px}}',
      '.screen[data-screen="outfits"] .board-workspace{margin-top:4px}',
      '.screen[data-screen="outfits"] .board-workspace-tabs{position:sticky;top:66px;z-index:16;display:flex;align-items:flex-end;gap:3px;border:0!important;border-radius:0!important;overflow:visible;background:transparent!important;box-shadow:none!important;padding:0 2px}',
      '.screen[data-screen="outfits"] .board-workspace-tab{position:relative;min-width:0;flex:1 1 0;border:0!important;border-radius:13px 13px 0 0!important;background:#e9e0cf;color:#75695c;padding:10px 7px 9px;font:750 11px/1.1 var(--sans);box-shadow:none!important;margin:0}',
      '.screen[data-screen="outfits"] .board-workspace-tab.active{background:#f5eedf!important;color:var(--ink)!important;z-index:2;padding-bottom:11px}',
      '.screen[data-screen="outfits"] .board-workspace-panel{display:none;padding:0 0 4px;margin-top:0;border:0!important;border-radius:0 0 14px 14px;background:#f5eedf}',
      '.screen[data-screen="outfits"] .board-workspace-panel.active{display:block;padding-top:7px}',
      '.screen[data-screen="outfits"] .board-workspace-panel .board-picker-card{background:transparent!important;border:0!important;box-shadow:none!important;padding-top:0!important}',
      '.screen[data-screen="outfits"] .board-tools-shell,.screen[data-screen="outfits"] .board-decorate-shell{border:0!important;border-radius:0 0 14px 14px!important;background:#f5eedf!important;box-shadow:none!important;padding-top:8px}',
      '.screen[data-screen="outfits"] .board-picker-bottom{background:#f5eedf!important}',
      '.screen[data-screen="outfits"] .board-workspace-panel[data-board-panel="pick"]{padding-left:2px;padding-right:2px}',
      '.screen[data-screen="outfits"] .board-workspace-tab:not(.active):active{background:#dfd4c1}',
      '@media(max-width:410px){.screen[data-screen="outfits"] .board-workspace-tabs{top:62px;gap:2px}.screen[data-screen="outfits"] .board-workspace-tab{font-size:10px;padding:9px 5px 8px;border-radius:11px 11px 0 0!important}.screen[data-screen="outfits"] .board-workspace-tab.active{padding-bottom:10px}}',
      '.screen[data-screen="outfits"] .board-workspace-tabs{background:#d8cdb9!important;padding:5px 5px 0;border-radius:14px 14px 0 0!important}',
      '.screen[data-screen="outfits"] .board-workspace-tab{display:flex;align-items:center;justify-content:flex-start;text-align:left;font-family:var(--serif)!important;font-size:15px!important;font-weight:600!important;letter-spacing:0!important;color:#51483f!important;background:#cbbda6!important;padding:11px 10px 10px!important}',
      '.screen[data-screen="outfits"] .board-workspace-tab.active{background:#eee4d2!important;color:#302a25!important}',
      '.screen[data-screen="outfits"] .board-workspace-panel{background:#eee4d2!important}',
      '.screen[data-screen="outfits"] .board-tools-shell,.screen[data-screen="outfits"] .board-decorate-shell,.screen[data-screen="outfits"] .board-picker-bottom{background:#eee4d2!important}',
      '.screen[data-screen="outfits"] .board-workspace-tab:not(.active):active{background:#c2b298!important}',
      '@media(max-width:410px){.screen[data-screen="outfits"] .board-workspace-tab{font-size:14px!important;padding:10px 8px 9px!important}}',
      '.screen[data-screen="outfits"] .board-workspace-tabs{background:#e6dcc9!important}',
      '.screen[data-screen="outfits"] .board-workspace-tab{justify-content:center!important;text-align:center!important}',
      '.screen[data-screen="outfits"] .board-workspace-tab.active{background:#f1e7d5!important}',
      '.screen[data-screen="outfits"] .board-workspace-panel{background:#f1e7d5!important}',
      '.screen[data-screen="outfits"] .board-tools-shell,.screen[data-screen="outfits"] .board-decorate-shell,.screen[data-screen="outfits"] .board-picker-bottom{background:#f1e7d5!important}',
      '.screen[data-screen="outfits"] .outfit-category-filter{background:#f1e7d5!important;border:0!important;box-shadow:none!important;padding-top:2px!important;padding-bottom:3px!important}',
      '.screen[data-screen="outfits"] .board-picker-filters{background:#f1e7d5!important}',
      '.screen[data-screen="outfits"] .board-workspace-panel[data-board-panel="pick"]{background:#f1e7d5!important}',
      '.screen[data-screen="outfits"] .piece-grid{padding-top:12px!important;overflow:visible!important}',
      '.screen[data-screen="outfits"] .piece-grid .tray-piece{transform:translateY(2px)}',
      '.screen[data-screen="outfits"] .piece-grid .tray-piece:nth-child(10n+2) .mini-photo,.screen[data-screen="outfits"] .piece-grid .tray-piece:nth-child(10n+4) .mini-photo,.screen[data-screen="outfits"] .piece-grid .tray-piece:nth-child(10n+7) .mini-photo{margin-top:4px}',
      '@media(max-width:410px){.screen[data-screen="outfits"] .piece-grid{padding-top:10px!important}}',
      '.screen[data-screen="outfits"] .board-workspace-tabs{background:transparent!important;padding:5px 0 0!important;gap:8px!important;border-radius:0!important}',
      '.screen[data-screen="outfits"] .board-workspace-tab{margin:0!important}',
      '.screen[data-screen="outfits"] .board-workspace-tab:first-child{margin-left:0!important}',
      '.screen[data-screen="outfits"] .board-workspace-tab:last-child{margin-right:0!important}',
      '.screen[data-screen="outfits"] .board-workspace-panel{margin-left:0!important;margin-right:0!important}',
      '@media(max-width:410px){.screen[data-screen="outfits"] .board-workspace-tabs{gap:6px!important}}',
      '.screen[data-screen="outfits"] .board-workspace-tabs{gap:5px!important}',
      '.screen[data-screen="outfits"] .board-workspace-tab{border-radius:0!important}',
      '@media(max-width:410px){.screen[data-screen="outfits"] .board-workspace-tabs{gap:4px!important}.screen[data-screen="outfits"] .board-workspace-tab{border-radius:0!important}}',
      '@media(max-width:380px){.closet-view-options{grid-template-columns:1fr}.closet-view-option{min-height:60px}}',
      '@media(max-width:410px){#itemDialog .closet-tier-section{padding:8px 9px;gap:7px}#itemDialog .closet-tier-btn{height:34px}#itemDialog .closet-tier-heading small{max-width:125px}}'
    ].join('');
    document.head.appendChild(style);
  }
  function closetTierSection(item){
    const selected=normalizeClosetTier(item&&item.tier);
    const section=document.createElement('section');
    section.className='closet-tier-section';
    section.setAttribute('aria-label','Piece tier');
    const heading=document.createElement('div');
    heading.className='closet-tier-heading';
    const titleWrap=document.createElement('div');
    const kicker=document.createElement('span');
    kicker.className='closet-tier-kicker';
    kicker.textContent='Your tier';
    const title=document.createElement('strong');
    title.textContent=selected?selected+'-Tier':'Not rated';
    titleWrap.append(kicker,title);
    const hint=document.createElement('small');
    hint.textContent=selected?tierReactionFor(item,selected):'How essential is this piece?';
    heading.append(titleWrap,hint);
    const options=document.createElement('div');
    options.className='closet-tier-options';
    options.setAttribute('role','group');
    options.setAttribute('aria-label','Rate this piece from S to D');
    CLOSET_TIERS.forEach(function(tier){
      const btn=document.createElement('button');
      btn.type='button';
      btn.className='closet-tier-btn'+(tier===selected?' active':'');
      btn.dataset.closetTier=tier;
      btn.setAttribute('aria-pressed',tier===selected?'true':'false');
      btn.setAttribute('aria-label',tier+'-Tier');
      btn.textContent=tier;
      btn.addEventListener('click',function(){setClosetTier($('#itemId').value,tier)});
      options.appendChild(btn);
    });
    section.append(heading,options);
    return section;
  }
  async function setClosetTier(itemId,tier){
    const item=state.items.find(function(x){return x.id===itemId});
    if(!item)return;
    const previous=normalizeClosetTier(item.tier);
    const requested=normalizeClosetTier(tier);
    const next=previous===requested?'':requested;
    item.tier=next;
    if(next)tierReactionFor(item,next,{force:true});
    renderItemReviewDetails(item);
    $$('.closet-tier-btn','#itemReviewDetails').forEach(function(btn){btn.disabled=true});
    const ok=await saveState();
    if(!ok){
      item.tier=previous;
      renderItemReviewDetails(item);
      return;
    }
    const live=state.items.find(function(x){return x.id===itemId});
    if(live&&itemDialogMode==='review'&&$('#itemId').value===itemId)renderItemReviewDetails(live);
    renderCatalog();
  }

  const originalFinishCatalogDrag=finishCatalogDrag;
  finishCatalogDrag=async function(){
    const freeFlowBefore=currentClosetView()==='free-flow';
    const beforeOrder=freeFlowBefore?state.items.map(function(i){return i.id}).join('|'):'';
    const result=await originalFinishCatalogDrag.apply(this,arguments);
    if(freeFlowBefore){
      const afterOrder=state.items.map(function(i){return i.id}).join('|');
      if(beforeOrder!==afterOrder){
        reshuffleFreeFlowScatter();
      }
    }
    return result;
  };

  installClosetTierStyles();

  const selectedTierFilters=new Set();
  function syncTierFilterChips(){
    $$('#tierFilterOptions .tier-filter-chip').forEach(function(btn){
      const active=selectedTierFilters.has(btn.dataset.tierFilter||'');
      btn.classList.toggle('active',active);
      btn.setAttribute('aria-pressed',active?'true':'false');
    });
  }
  function installClosetTierFilter(){
    const panel=$('#filterPanel');
    if(!panel||$('#tierFilterWrap'))return;
    const wrap=document.createElement('div');
    wrap.id='tierFilterWrap';
    wrap.innerHTML='<span class="tier-filter-label">Tier</span><div id="tierFilterOptions" role="group" aria-label="Filter closet by tier"></div>';
    const options=wrap.querySelector('#tierFilterOptions');
    CLOSET_TIERS.forEach(function(tier){
      const btn=document.createElement('button');
      btn.type='button';
      btn.className='tier-filter-chip';
      btn.dataset.tierFilter=tier;
      btn.setAttribute('aria-pressed','false');
      btn.textContent=tier;
      options.appendChild(btn);
    });
    const unrated=document.createElement('button');
    unrated.type='button';
    unrated.className='tier-filter-chip';
    unrated.dataset.tierFilter='unrated';
    unrated.setAttribute('aria-pressed','false');
    unrated.textContent='Not rated';
    options.appendChild(unrated);
    const archivedToggle=$('#includeArchivedCloset')?.closest('label');
    const clear=$('#clearFilters');
    if(archivedToggle)panel.insertBefore(wrap,archivedToggle);
    else if(clear)panel.insertBefore(wrap,clear);
    else panel.appendChild(wrap);
    options.querySelectorAll('.tier-filter-chip').forEach(function(btn){
      btn.addEventListener('click',function(){
        const value=btn.dataset.tierFilter||'';
        if(selectedTierFilters.has(value))selectedTierFilters.delete(value);
        else selectedTierFilters.add(value);
        syncTierFilterChips();
        renderCatalog();
      });
    });
    clear?.addEventListener('click',function(){
      selectedTierFilters.clear();
      syncTierFilterChips();
      requestAnimationFrame(renderCatalog);
    });
  }

  function installTierRibbonSetting(){
    const screen=document.querySelector('.screen[data-screen="more"]');
    if(!screen||$('#tierRibbonSettingsCard'))return;
    const card=document.createElement('div');
    card.id='tierRibbonSettingsCard';
    card.className='settings-card';
    card.innerHTML='<h3>Catalog / Closet</h3>'+ '<p>Choose how tier ratings appear in your Closet. Ratings and Tier filters stay available even when ribbons are hidden.</p>'+ '<div class="tier-setting-row"><div class="tier-setting-copy"><strong>Show Tier ribbons</strong><small>Display S / A / B / C / D ribbons on rated Closet cards.</small></div><label class="tier-setting-toggle"><input type="checkbox" id="showTierRibbonsSetting"> <span>On</span></label></div>';
    const firstCard=screen.querySelector('.settings-card');
    if(firstCard)screen.insertBefore(card,firstCard);else screen.appendChild(card);
    const input=card.querySelector('#showTierRibbonsSetting');
    input.checked=tierRibbonsEnabled();
    input.addEventListener('change',function(){setTierRibbonsEnabled(input.checked)});
  }

  function installClosetViewSetting(){
    const catalogBody=document.querySelector('.settings-group[data-settings-group="catalog"] .settings-group-body');
    if(!catalogBody||$('#closetViewSettingsCard'))return;
    const card=document.createElement('div');
    card.id='closetViewSettingsCard';
    card.className='settings-card';
    card.innerHTML='<h3>Closet view</h3>'+
      '<p>Choose how the Closet catalog is presented. This changes layout only; your items, filters, tiers and manual order stay the same.</p>'+
      '<div class="closet-view-options" role="group" aria-label="Closet view mode">'+
        '<button type="button" class="closet-view-option" data-closet-view="classic" aria-pressed="false"><strong>Classic</strong><small>Current card-based catalog</small></button>'+
        '<button type="button" class="closet-view-option" data-closet-view="modern" aria-pressed="false"><strong>Modern</strong><small>Full-bleed grid with touching cards</small></button>'+
        '<button type="button" class="closet-view-option" data-closet-view="free-flow" aria-pressed="false"><strong>Free-Flow</strong><small>Photo-only experimental closet</small></button>'+
      '</div>'+
      '<p class="closet-view-note">Free-Flow is experimental. App Style / themes remain a separate future setting from Closet View.</p>';
    catalogBody.prepend(card);
    card.querySelectorAll('.closet-view-option:not(:disabled)').forEach(function(btn){
      btn.addEventListener('click',function(){setClosetView(btn.dataset.closetView)});
    });
    applyClosetView();
  }

  function installSettingsGroups(){
    const screen=document.querySelector('.screen[data-screen="more"]');
    if(!screen||screen.querySelector('.settings-groups'))return;

    const pageHead=screen.querySelector('.page-head');
    const allCards=[...screen.querySelectorAll(':scope > .settings-card')];

    const appIdentity=screen.querySelector('.app-identity-card');
    const portfolio=screen.querySelector('.portfolio-settings-card');
    const journal=screen.querySelector('.journal-order-settings-card');
    const tier=screen.querySelector('#tierRibbonSettingsCard');

    const dataCard=allCards.find(card=>card.querySelector('h3')?.textContent.trim()==='Data');
    const smartScan=allCards.find(card=>card.querySelector('h3')?.textContent.trim()==='Smart photo scan');
    const resetCard=allCards.find(card=>card.classList.contains('danger-zone')||card.querySelector('h3')?.textContent.trim()==='Reset');

    const groups=document.createElement('div');
    groups.className='settings-groups';

    function makeGroup(id,label,subtitle,{open=false}={}){
      const details=document.createElement('details');
      details.className='settings-group';
      details.dataset.settingsGroup=id;
      if(open)details.open=true;
      const summary=document.createElement('summary');
      const copy=document.createElement('span');
      copy.innerHTML='<span>'+label+'</span>'+(subtitle?'<small>'+subtitle+'</small>':'');
      summary.appendChild(copy);
      const body=document.createElement('div');
      body.className='settings-group-body';
      details.append(summary,body);
      groups.appendChild(details);
      return body;
    }

    const general=makeGroup('general','General','App identity, data and reset',{open:true});
    const catalog=makeGroup('catalog','Catalog / Closet','Closet display and photo preferences');
    const board=makeGroup('board','Board','Outfit Board preferences');
    const portfolioGroup=makeGroup('portfolio','Portfolio','Saved-look organization');
    const journalGroup=makeGroup('journal','Journal','Wear-log layout and preferences');
    const wishlist=makeGroup('wishlist','Wishlist','Shopping and wishlist preferences');
    const about=makeGroup('about','About','Version, credits and future extras');

    [appIdentity,dataCard,resetCard].filter(Boolean).forEach(card=>general.appendChild(card));
    [tier,smartScan].filter(Boolean).forEach(card=>catalog.appendChild(card));
    if(portfolio)portfolioGroup.appendChild(portfolio);
    if(journal)journalGroup.appendChild(journal);

    board.innerHTML='<div class="settings-group-empty">Board preferences will live here as customization options are added.</div>';
    wishlist.innerHTML='<div class="settings-group-empty">Wishlist preferences will live here as shopping and capture options expand.</div>';
    about.innerHTML='<div class="settings-card settings-about-card"><h3>About Audrey’s Closet</h3><p class="settings-about-version">Version v13.18-dev12</p><p>A personal closet journal built around cataloging, outfits, memories and everyday wardrobe decisions.</p><p>Credits and a few hidden extras can grow here in future releases.</p></div>';

    if(pageHead?.nextSibling)screen.insertBefore(groups,pageHead.nextSibling);
    else screen.appendChild(groups);
  }

  const originalItemCard=itemCard;
  itemCard=function(i){
    const html=originalItemCard(i);
    const tier=normalizeClosetTier(i&&i.tier);
    if(!tier||!tierRibbonsEnabled())return html;
    const tierClass='tier-'+tier.toLowerCase();
    return html.replace('<div class="thumb">','<div class="thumb"><span class="tier-ribbon '+tierClass+'" aria-label="'+tier+'-Tier">'+tier+'-Tier</span>');
  };

  renderCatalog=function(){
    ensureSettings();
    applyClosetView();
    const q=$('#catalogSearch').value.toLowerCase().trim(),
      fc=$('#filterCategory').value,
      fs=$('#filterSeason').value,
      fcol=$('#filterColor').value,
      tierFilters=selectedTierFilters;
    const activeCategory=selectedCategory||fc||'';
    let items=state.items.filter(function(i){
      const tier=normalizeClosetTier(i.tier);
      const tierMatch=!tierFilters.size||tierFilters.has(tier)||(tierFilters.has('unrated')&&!tier);
      return (includeArchivedCloset||!isArchived(i))&&
        (!selectedCategory||i.category===selectedCategory)&&
        (!fc||i.category===fc)&&
        (!fs||i.season===fs)&&
        (!fcol||i.color===fcol)&&
        tierMatch&&
        (!q||[i.type,i.brand,i.color,i.pattern,i.notes,i.category].join(' ').toLowerCase().includes(q));
    });
    if(activeCategory){
      const order=state.settings.closetOrder[activeCategory]||[];
      items=[...items].sort(function(a,b){
        const ai=order.indexOf(a.id),bi=order.indexOf(b.id);
        return (ai<0?999999:ai)-(bi<0?999999:bi);
      });
    }
    catalogReviewIds=items.map(function(i){return i.id});
    const eligibleCount=state.items.filter(function(i){return includeArchivedCloset||!isArchived(i)}).length;
    $('#catalogCount').textContent=items.length+' '+(items.length===1?'piece':'pieces');
    $('#catalogGrid').innerHTML=items.map(function(i){return itemCard(i)}).join('');
    $('#catalogEmpty').classList.toggle('hidden',eligibleCount>0||q||selectedCategory||fc||fs||fcol||tierFilters.size);
    $$('.item-card').forEach(function(c){
      c.onclick=function(){
        if(Date.now()<suppressCatalogClickUntil)return;
        openItem(state.items.find(function(i){return i.id===c.dataset.id}));
      };
    });
    bindCatalogReorder(activeCategory);
    applyFreeFlowScatter();
  };


  const BOARD_FORMATS={
    'portrait-4x5':{label:'Portrait 4:5',ratio:'4 / 5'},
    'portrait-3x4':{label:'Portrait 3:4',ratio:'3 / 4'},
    'square':{label:'Square',ratio:'1 / 1'},
    'landscape-4x3':{label:'Landscape 4:3',ratio:'4 / 3'}
  };
  function currentBoardFormat(){
    ensureSettings();
    const value=state.settings.boardFormat||'portrait-4x5';
    return BOARD_FORMATS[value]?value:'portrait-4x5';
  }
  function applyBoardFormat(){
    const screen=document.querySelector('.screen[data-screen="outfits"]');
    if(!screen)return;
    const format=currentBoardFormat(),def=BOARD_FORMATS[format];
    screen.dataset.boardFormat=format;
    screen.style.setProperty('--board-format-ratio',def.ratio);
  }
  function setBoardWorkspacePanel(name){
    const root=$('#boardWorkspace');
    if(!root)return;
    const beforeY=window.scrollY||0;
    const rootTopBefore=root.getBoundingClientRect().top;
    root.querySelectorAll('.board-workspace-tab').forEach(function(btn){
      const active=btn.dataset.boardPanel===name;
      btn.classList.toggle('active',active);
      btn.setAttribute('aria-selected',active?'true':'false');
    });
    root.querySelectorAll('.board-workspace-panel').forEach(function(panel){
      panel.classList.toggle('active',panel.dataset.boardPanel===name);
    });
    requestAnimationFrame(function(){
      const rootTopAfter=root.getBoundingClientRect().top;
      const delta=rootTopAfter-rootTopBefore;
      if(Math.abs(delta)>.5)window.scrollTo(0,beforeY+delta);
    });
  }
  function installBoardWorkspaceV3(){
    const screen=document.querySelector('.screen[data-screen="outfits"]');
    const shell=screen?.querySelector('.board-shell.board-first');
    const picker=screen?.querySelector('.board-picker-card.board-picker-bottom');
    const board=$('#outfitBoard'),name=$('#outfitName'),notes=$('#outfitNotes'),save=$('#saveOutfitBtn');
    const editbar=$('#boardEditbar'),decorateToggle=$('#decorateToggle'),creative=$('#creativeTools');
    if(!screen||!shell||!picker||!board||!name||!notes||!save||$('#boardWorkspace'))return;

    applyBoardFormat();

    const compose=document.createElement('div');
    compose.className='board-compose-bar';
    shell.parentNode.insertBefore(compose,shell);
    name.classList.add('board-compose-name');
    name.placeholder='Name this board';
    compose.appendChild(name);

    const notesBtn=document.createElement('button');
    notesBtn.type='button';
    notesBtn.id='boardNotesBtn';
    notesBtn.className='board-notes-btn';
    notesBtn.setAttribute('aria-label','Board notes');
    notesBtn.setAttribute('aria-expanded','false');
    notesBtn.textContent='▤';
    compose.appendChild(notesBtn);

    save.classList.add('board-compose-save');
    save.textContent=editingOutfitId?'Update':'Save';
    compose.appendChild(save);

    const notesDrawer=document.createElement('div');
    notesDrawer.id='boardNotesDrawer';
    notesDrawer.className='board-notes-drawer';
    notesDrawer.appendChild(notes);
    compose.insertAdjacentElement('afterend',notesDrawer);
    notesBtn.onclick=function(){
      const open=!notesDrawer.classList.contains('open');
      notesDrawer.classList.toggle('open',open);
      notesBtn.setAttribute('aria-expanded',open?'true':'false');
      if(open)notes.focus();
    };

    const workspace=document.createElement('section');
    workspace.id='boardWorkspace';
    workspace.className='board-workspace';
    workspace.innerHTML=
      '<div class="board-workspace-tabs" role="tablist" aria-label="Board workspace">'+
        '<button type="button" class="board-workspace-tab active" data-board-panel="pick" role="tab" aria-selected="true">Add Items</button>'+
        '<button type="button" class="board-workspace-tab" data-board-panel="tools" role="tab" aria-selected="false">Tools</button>'+
        '<button type="button" class="board-workspace-tab" data-board-panel="decorate" role="tab" aria-selected="false">Decorate</button>'+
      '</div>'+
      '<div class="board-workspace-panel active" data-board-panel="pick"></div>'+
      '<div class="board-workspace-panel" data-board-panel="tools"><div class="board-tools-shell"><div class="board-tools-main"></div></div></div>'+
      '<div class="board-workspace-panel" data-board-panel="decorate"><div class="board-decorate-shell"></div></div>';
    shell.insertAdjacentElement('afterend',workspace);

    const pickPanel=workspace.querySelector('[data-board-panel="pick"].board-workspace-panel');
    pickPanel.appendChild(picker);

    const pickerHead=picker.querySelector('.picker-head');
    const sourceTabs=picker.querySelector('.tabs-small');
    if(pickerHead&&sourceTabs)pickerHead.appendChild(sourceTabs);

    const toolsMain=workspace.querySelector('.board-tools-main');
    if(editbar)toolsMain.appendChild(editbar);
    const clear=$('#clearBoardBtn');
    if(clear&&editbar){
      clear.className='soft-btn';
      clear.textContent='Clear';
      editbar.appendChild(clear);
    }

    const head=screen.querySelector('.board-page-head');
    const newBtn=$('#newBoardBtn');
    const share=$('#shareOutfitBtn');
    if(head&&newBtn){
      let headActions=head.querySelector('.board-head-actions');
      if(!headActions){
        headActions=document.createElement('div');
        headActions.className='board-head-actions';
        head.appendChild(headActions);
      }
      headActions.appendChild(newBtn);
      if(share)headActions.insertBefore(share,newBtn);
    }

    const decorateShell=workspace.querySelector('.board-decorate-shell');
    if(decorateToggle)decorateShell.appendChild(decorateToggle);
    if(creative){
      creative.classList.remove('hidden');
      decorateShell.appendChild(creative);
    }

    workspace.querySelectorAll('.board-workspace-tab').forEach(function(btn){
      btn.onclick=function(){setBoardWorkspacePanel(btn.dataset.boardPanel)};
    });
    setBoardWorkspacePanel('pick');
  }

  function refitSavedBoardToCurrent(outfit){
    if(!outfit)return;
    setTimeout(function(){
      const board=$('#outfitBoard');
      if(!board||!boardItems.length)return;
      const oldW=Number(outfit.boardWidth)||board.clientWidth;
      const oldH=Number(outfit.boardHeight)||board.clientHeight;
      const newW=board.clientWidth,newH=board.clientHeight;
      if(!oldW||!oldH||!newW||!newH)return;
      const sx=newW/oldW,sy=newH/oldH;
      if(Math.abs(sx-1)<.01&&Math.abs(sy-1)<.01)return;
      boardItems=boardItems.map(function(piece){
        const p=normalizeBoardItem({...piece});
        return {...p,x:p.x*sx,y:p.y*sy,w:p.w*sx,h:p.h*sy};
      });
      drawBoard();
    },120);
  }

  const originalLoadOutfitForEditingV318=loadOutfitForEditing;
  loadOutfitForEditing=function(oid){
    const outfit=state.outfits.find(function(x){return x.id===oid});
    const result=originalLoadOutfitForEditingV318.apply(this,arguments);
    refitSavedBoardToCurrent(outfit);
    return result;
  };
  const originalLoadOutfitAsDuplicateV318=loadOutfitAsDuplicate;
  loadOutfitAsDuplicate=function(oid){
    const outfit=state.outfits.find(function(x){return x.id===oid});
    const result=originalLoadOutfitAsDuplicateV318.apply(this,arguments);
    refitSavedBoardToCurrent(outfit);
    return result;
  };

  installBoardWorkspaceV3();
  setTimeout(installBoardConfirmationsV6,0);

  let boardPickerSearch='';
  let boardPickerColor='';
  let boardPickerTier='';

  function boardPickerObjectForButton(btn){
    const source=btn?.dataset?.source||traySource;
    const arr=source==='closet'?state.items:state.wishlist;
    return arr.find(function(x){return x.id===btn.dataset.id})||null;
  }

  function boardPickerMatches(obj){
    if(!obj)return false;
    const q=String(boardPickerSearch||'').trim().toLowerCase();
    if(q){
      const hay=[
        obj.type,obj.name,obj.category,obj.brand,obj.color,obj.pattern,obj.notes
      ].filter(Boolean).join(' ').toLowerCase();
      if(!hay.includes(q))return false;
    }
    if(boardPickerColor&&String(obj.color||'').toLowerCase()!==boardPickerColor.toLowerCase())return false;
    if(boardPickerTier){
      const tier=normalizeClosetTier(obj.tier);
      if(boardPickerTier==='unrated'){
        if(tier)return false;
      }else if(tier!==boardPickerTier)return false;
    }
    return true;
  }

  function applyBoardPickerFilters(){
    const tray=$('#pieceTray');
    if(!tray)return;
    let visible=0;
    tray.querySelectorAll('.tray-piece').forEach(function(btn){
      const show=boardPickerMatches(boardPickerObjectForButton(btn));
      btn.style.display=show?'':'none';
      if(show)visible++;
    });
    let empty=tray.querySelector('.board-picker-filter-empty');
    if(!visible&&tray.querySelector('.tray-piece')){
      if(!empty){
        empty=document.createElement('p');
        empty.className='tray-empty board-picker-filter-empty';
        empty.textContent='No pieces match these filters.';
        tray.appendChild(empty);
      }
    }else if(empty)empty.remove();
  }

  function refreshBoardPickerFilterUi(){
    const colorBtn=$('#boardPickerColorBtn');
    const tierBtn=$('#boardPickerTierBtn');
    if(colorBtn){
      colorBtn.textContent=boardPickerColor||'Color';
      colorBtn.classList.toggle('active',!!boardPickerColor);
    }
    if(tierBtn){
      tierBtn.textContent=boardPickerTier?(boardPickerTier==='unrated'?'Unrated':boardPickerTier+'-Tier'):'Tier';
      tierBtn.classList.toggle('active',!!boardPickerTier);
    }
    $$('#boardPickerColorPanel .board-picker-chip').forEach(function(btn){
      btn.classList.toggle('active',(btn.dataset.color||'')===boardPickerColor);
    });
    $$('#boardPickerTierPanel .board-picker-chip').forEach(function(btn){
      btn.classList.toggle('active',(btn.dataset.tier||'')===boardPickerTier);
    });
  }

  function installBoardPickerFiltersV5(){
    const picker=document.querySelector('.screen[data-screen="outfits"] .board-picker-bottom');
    const category=$('#outfitCategoryFilter');
    if(!picker||!category||$('#boardPickerFilters'))return;

    const filters=document.createElement('div');
    filters.id='boardPickerFilters';
    filters.className='board-picker-filters';
    filters.innerHTML=
      '<input id="boardPickerSearch" class="board-picker-search" type="search" inputmode="search" autocomplete="off" placeholder="Search pieces…">'+
      '<button type="button" id="boardPickerColorBtn" class="board-picker-filter-btn">Color</button>'+
      '<button type="button" id="boardPickerTierBtn" class="board-picker-filter-btn">Tier</button>'+
      '<button type="button" id="boardPickerResetBtn" class="board-picker-reset-btn">Reset</button>'+
      '<div id="boardPickerColorPanel" class="board-picker-filter-panel">'+
        '<div class="board-picker-filter-row"><span>Color</span>'+
          '<button type="button" class="board-picker-chip" data-color="">All</button>'+
          COLORS.map(function(c){return '<button type="button" class="board-picker-chip" data-color="'+esc(c)+'">'+esc(c)+'</button>'}).join('')+
        '</div>'+
      '</div>'+
      '<div id="boardPickerTierPanel" class="board-picker-filter-panel">'+
        '<div class="board-picker-filter-row"><span>Tier</span>'+
          '<button type="button" class="board-picker-chip" data-tier="">All</button>'+
          CLOSET_TIERS.map(function(t){return '<button type="button" class="board-picker-chip" data-tier="'+t+'">'+t+'</button>'}).join('')+
          '<button type="button" class="board-picker-chip" data-tier="unrated">Unrated</button>'+
        '</div>'+
      '</div>';
    category.insertAdjacentElement('afterend',filters);

    const search=$('#boardPickerSearch');
    search.value=boardPickerSearch;
    search.oninput=function(){
      boardPickerSearch=search.value||'';
      applyBoardPickerFilters();
    };

    $('#boardPickerColorBtn').onclick=function(){
      $('#boardPickerColorPanel').classList.toggle('open');
      $('#boardPickerTierPanel').classList.remove('open');
    };
    $('#boardPickerTierBtn').onclick=function(){
      $('#boardPickerTierPanel').classList.toggle('open');
      $('#boardPickerColorPanel').classList.remove('open');
    };
    $('#boardPickerResetBtn').onclick=function(){
      boardPickerSearch='';
      boardPickerColor='';
      boardPickerTier='';
      traySource='closet';
      trayCategory='Recent';
      const search=$('#boardPickerSearch');
      if(search)search.value='';
      $$('.screen[data-screen="outfits"] .tabs-small button').forEach(function(btn){
        btn.classList.toggle('active',btn.dataset.source==='closet');
      });
      $('#boardPickerColorPanel')?.classList.remove('open');
      $('#boardPickerTierPanel')?.classList.remove('open');
      refreshBoardPickerFilterUi();
      renderPieceTray();
      toast('Picker filters reset');
    };
    $$('#boardPickerColorPanel .board-picker-chip').forEach(function(btn){
      btn.onclick=function(){
        boardPickerColor=btn.dataset.color||'';
        $('#boardPickerColorPanel').classList.remove('open');
        refreshBoardPickerFilterUi();
        applyBoardPickerFilters();
      };
    });
    $$('#boardPickerTierPanel .board-picker-chip').forEach(function(btn){
      btn.onclick=function(){
        boardPickerTier=btn.dataset.tier||'';
        $('#boardPickerTierPanel').classList.remove('open');
        refreshBoardPickerFilterUi();
        applyBoardPickerFilters();
      };
    });
    refreshBoardPickerFilterUi();
    applyBoardPickerFilters();
  }

  const originalRenderPieceTrayV5=renderPieceTray;
  renderPieceTray=function(){
    const result=originalRenderPieceTrayV5.apply(this,arguments);
    installBoardPickerFiltersV5();
    applyBoardPickerFilters();
    return result;
  };

  const originalAddBoardPieceV5=addBoardPiece;
  addBoardPiece=function(pid,source){
    const beforeUid=selectedBoardUid;
    const result=originalAddBoardPieceV5.apply(this,arguments);
    applyBoardPickerFilters();
    const trayBtn=document.querySelector('#pieceTray .tray-piece[data-id="'+CSS.escape(String(pid))+'"][data-source="'+CSS.escape(String(source))+'"]');
    if(trayBtn){
      trayBtn.classList.add('board-picker-added');
      setTimeout(function(){trayBtn.classList.remove('board-picker-added')},560);
    }
    if(selectedBoardUid&&selectedBoardUid!==beforeUid){
      const piece=document.querySelector('#outfitBoard .board-piece[data-uid="'+CSS.escape(String(selectedBoardUid))+'"]');
      if(piece){
        piece.classList.add('board-piece-added');
        setTimeout(function(){piece.classList.remove('board-piece-added')},480);
      }
      toast('Added to board');
    }
    return result;
  };

  function confirmClearBoardV6(){
    if(!boardItems.length){
      toast('Board is already clear');
      return false;
    }
    return window.confirm('Clear this board?\n\nThis will remove all items and decorations from the current board. This action cannot be undone.');
  }

  function installBoardConfirmationsV6(){
    const clear=$('#clearBoardBtn');
    if(clear){
      clear.onclick=function(e){
        e.preventDefault();
        e.stopImmediatePropagation();
        if(!confirmClearBoardV6())return;
        clearBoard();
        toast('Board cleared');
      };
    }

    const newBtn=$('#newBoardBtn');
    if(newBtn){
      newBtn.onclick=function(e){
        e.preventDefault();
        e.stopImmediatePropagation();
        if(boardHasDraft()){
          const ok=window.confirm('Start a new board?\n\nYour current unsaved board will be cleared. Save it first if you want to keep this look.');
          if(!ok){
            toast('Kept current board');
            return;
          }
        }
        startNewOutfit();
      };
    }
  }

  installBoardPickerFiltersV5();
  installBoardConfirmationsV6();

  function installBoardCaptureGuardV7(){
    if(document.documentElement.dataset.boardGuardV7==='true')return;
    document.documentElement.dataset.boardGuardV7='true';
    document.addEventListener('click',function(e){
      const clear=e.target.closest&&e.target.closest('#clearBoardBtn');
      if(clear){
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        if(!boardItems.length){
          toast('Board is already clear');
          return;
        }
        const ok=window.confirm('Clear this board?\n\nThis will remove all items and decorations from the current board. This action cannot be undone.');
        if(!ok){
          toast('Clear canceled');
          return;
        }
        clearBoard();
        toast('Board cleared');
        return;
      }

      const newBtn=e.target.closest&&e.target.closest('#newBoardBtn');
      if(newBtn){
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        if(boardHasDraft()){
          const ok=window.confirm('Start a new board?\n\nYour current unsaved board will be cleared. Save it first if you want to keep this look.');
          if(!ok){
            toast('Kept current board');
            return;
          }
        }
        startNewOutfit();
      }
    },true);
  }

  installBoardCaptureGuardV7();

  installClosetTierFilter();
  installTierRibbonSetting();
  installSettingsGroups();
  installClosetViewSetting();
  applyClosetView();
  applyBoardFormat();

  const originalRenderItemReviewDetails=renderItemReviewDetails;
  renderItemReviewDetails=function(item){
    originalRenderItemReviewDetails(item);
    const box=$('#itemReviewDetails');
    if(!box)return;
    const live=item||state.items.find(function(x){return x.id===$('#itemId').value})||null;
    box.prepend(closetTierSection(live));
  };

  const originalSaveItem=saveItem;
  saveItem=async function(){
    const itemId=$('#itemId').value;
    const existing=itemId?state.items.find(function(x){return x.id===itemId}):null;
    const preservedTier=normalizeClosetTier(existing&&existing.tier);
    await originalSaveItem();
    if(!itemId||!preservedTier)return;
    const live=state.items.find(function(x){return x.id===itemId});
    if(live&&normalizeClosetTier(live.tier)!==preservedTier){
      live.tier=preservedTier;
      await saveState();
    }
  };
})();
`;

function withTierPatch(resp){
  return resp.text().then(text=>{
    const headers=new Headers(resp.headers);
    headers.delete('content-length');
    return new Response(text+'\n'+TIER_PATCH,{status:resp.status,statusText:resp.statusText,headers});
  });
}

self.addEventListener('install',e=>{
  self.skipWaiting();
  e.waitUntil((async()=>{
    const cache=await caches.open(CACHE);
    await cache.addAll(ASSETS.filter(asset=>asset!=='./app.js'));
    const appResp=await fetch('./app.js',{cache:'no-store'});
    await cache.put('./app.js',await withTierPatch(appResp));
  })());
});

self.addEventListener('activate',e=>e.waitUntil(Promise.all([
  caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))),
  self.clients.claim()
])));

self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const url=new URL(e.request.url);
  if(url.origin===location.origin&&url.pathname.endsWith('/app.js')){
    e.respondWith(fetch(e.request).then(async resp=>{
      const patched=await withTierPatch(resp);
      const copy=patched.clone();
      caches.open(CACHE).then(c=>c.put(e.request,copy));
      return patched;
    }).catch(()=>caches.match(e.request).then(r=>r||caches.match('./app.js'))));
    return;
  }
  if(url.origin===location.origin&&(url.pathname.endsWith('/')||url.pathname.endsWith('.html')||url.pathname.endsWith('.js')||url.pathname.endsWith('.css'))){
    e.respondWith(fetch(e.request).then(resp=>{
      const copy=resp.clone();
      caches.open(CACHE).then(c=>c.put(e.request,copy));
      return resp;
    }).catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html'))));
    return;
  }
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)));
});
