const CACHE='audrey-closet-v13.16-dev11';
const ASSETS=['./','./index.html','./styles.css','./app.js','./manifest.webmanifest','./icon-192.png','./icon-512.png'];

/*
 * v13.16-dev11 Journal panel consistency.
 *
 * The current app is a single large classic app.js file. For this dev branch we
 * append the isolated tier feature when app.js is served so the stable v13.15
 * source remains untouched while the interaction is tested. If the feature is
 * promoted, it can be folded into app.js/styles.css in the next stable release.
 */
const TIER_PATCH=String.raw`
;/* v13.16-dev11 — Today’s Look panel alignment */
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
      '.today-section-toggle{border:1px solid var(--line)!important;background:#efe6d5!important;border-radius:16px!important;padding:10px 12px!important}',
      '.today-section-toggle strong{font-family:var(--serif)!important;font-size:19px!important;font-weight:600!important;color:var(--ink)!important}',
      '.today-section-toggle small{font-size:10px!important;color:#7b7065!important}',
      '.today-toggle-icon{color:var(--burgundy)!important}',
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
    about.innerHTML='<div class="settings-card settings-about-card"><h3>About Audrey’s Closet</h3><p class="settings-about-version">Version v13.16-dev11</p><p>A personal closet journal built around cataloging, outfits, memories and everyday wardrobe decisions.</p><p>Credits and a few hidden extras can grow here in future releases.</p></div>';

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
  };

  installClosetTierFilter();
  installTierRibbonSetting();
  installSettingsGroups();

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
