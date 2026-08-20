const CACHE='audrey-closet-v13.16-dev2';
const ASSETS=['./','./index.html','./styles.css','./app.js','./manifest.webmanifest','./icon-192.png','./icon-512.png'];

/*
 * v13.16-dev2 S-Tier extension.
 *
 * The current app is a single large classic app.js file. For this dev branch we
 * append the isolated tier feature when app.js is served so the stable v13.15
 * source remains untouched while the interaction is tested. If the feature is
 * promoted, it can be folded into app.js/styles.css in the next stable release.
 */
const TIER_PATCH=String.raw`
;/* v13.16-dev2 — S/A/B/C/D Closet tier + catalog integration */
(function(){
  const CLOSET_TIERS=['S','A','B','C','D'];
  function normalizeClosetTier(value){
    const tier=String(value||'').trim().toUpperCase();
    return CLOSET_TIERS.includes(tier)?tier:'';
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
      '#catalogGrid .thumb{position:relative}',
      '#catalogGrid .closet-tier-card-badge{position:absolute;left:8px;top:8px;z-index:3;display:grid;place-items:center;min-width:27px;height:27px;padding:0 7px;border:1px solid rgba(255,255,255,.62);border-radius:9px;background:rgba(84,94,73,.92);color:#fff;font:800 12px/1 var(--sans);box-shadow:0 2px 7px rgba(43,48,38,.18);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px)}',
      '#filterTier{min-width:0}',
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
    hint.textContent=selected?'Tap again to clear':'How essential is this piece?';
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

  function installClosetTierFilter(){
    const panel=$('#filterPanel');
    if(!panel||$('#filterTier'))return;
    const select=document.createElement('select');
    select.id='filterTier';
    select.setAttribute('aria-label','Filter closet by tier');
    select.innerHTML='<option value="">All tiers</option>'+
      CLOSET_TIERS.map(function(t){return '<option value="'+t+'">'+t+'-Tier</option>'}).join('')+
      '<option value="unrated">Not rated</option>';
    const clear=$('#clearFilters');
    if(clear)panel.insertBefore(select,clear);else panel.appendChild(select);
    select.addEventListener('change',renderCatalog);
    clear?.addEventListener('click',function(){
      select.value='';
      requestAnimationFrame(renderCatalog);
    });
  }

  const originalItemCard=itemCard;
  itemCard=function(i){
    const html=originalItemCard(i);
    const tier=normalizeClosetTier(i&&i.tier);
    if(!tier)return html;
    return html.replace('<div class="thumb">','<div class="thumb"><span class="closet-tier-card-badge" aria-label="'+tier+'-Tier">'+tier+'</span>');
  };

  renderCatalog=function(){
    ensureSettings();
    const q=$('#catalogSearch').value.toLowerCase().trim(),
      fc=$('#filterCategory').value,
      fs=$('#filterSeason').value,
      fcol=$('#filterColor').value,
      ft=$('#filterTier')?.value||'';
    const activeCategory=selectedCategory||fc||'';
    let items=state.items.filter(function(i){
      const tier=normalizeClosetTier(i.tier);
      const tierMatch=!ft||(ft==='unrated'?!tier:tier===ft);
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
    $('#catalogEmpty').classList.toggle('hidden',eligibleCount>0||q||selectedCategory||fc||fs||fcol||ft);
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
