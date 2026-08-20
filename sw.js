const CACHE='audrey-closet-v13.16-dev5';
const ASSETS=['./','./index.html','./styles.css','./app.js','./manifest.webmanifest','./icon-192.png','./icon-512.png'];

/*
 * v13.16-dev5 Tier interaction refinement.
 *
 * The current app is a single large classic app.js file. For this dev branch we
 * append the isolated tier feature when app.js is served so the stable v13.15
 * source remains untouched while the interaction is tested. If the feature is
 * promoted, it can be folded into app.js/styles.css in the next stable release.
 */
const TIER_PATCH=String.raw`
;/* v13.16-dev5 — multi-tier filter + tier reactions */
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

  const originalItemCard=itemCard;
  itemCard=function(i){
    const html=originalItemCard(i);
    const tier=normalizeClosetTier(i&&i.tier);
    if(!tier)return html;
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
