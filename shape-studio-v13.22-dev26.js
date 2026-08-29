/* Audrey Closet v13.22 Color Expansion 2.0 dev1
 * Loads the preserved v13.22-dev26 Shape/Text patch, then layers color UX on top.
 * Data compatibility: garments continue to store one canonical `color` string.
 */
(function(){
  'use strict';

  const preserved=document.createElement('script');
  preserved.src='shape-studio-v13.22-dev26-original.js?v=13.22-color-expansion-dev1';
  preserved.async=false;
  document.head.appendChild(preserved);

  const COLOR_GROUPS=[
    {id:'neutrals',label:'Neutrals',colors:[
      ['Black','#262626'],['Charcoal','#4b4b49'],['Gray','#8a8984'],['Silver','#bbbcb9'],['White','#faf9f4'],['Ivory','#f6f0df'],['Cream','#f1e7c9']
    ]},
    {id:'browns',label:'Browns & Earth',colors:[
      ['Brown','#7a5744'],['Coffee','#6c5142'],['Chocolate','#5c3b31'],['Camel','#b1855e'],['Tan','#b79876'],['Beige','#d9c7a6']
    ]},
    {id:'reds',label:'Reds & Pinks',colors:[
      ['Burgundy','#7d3547'],['Red','#b84b46'],['Coral','#d97868'],['Pink','#c7788b'],['Blush','#dda9af']
    ]},
    {id:'warm',label:'Orange & Yellow',colors:[
      ['Orange','#d37c3f'],['Rust','#a95f3e'],['Yellow','#d7bb4e'],['Mustard','#c3a04b'],['Gold','#b99a47']
    ]},
    {id:'greens',label:'Greens',colors:[
      ['Olive','#66715a'],['Green','#4d7851'],['Sage','#8fa18a'],['Mint','#9cc5ab']
    ]},
    {id:'blues',label:'Blues & Teals',colors:[
      ['Turquoise','#4d8e8a'],['Teal','#367b79'],['Light Blue','#9dbbd0'],['Blue','#527aa7'],['Navy','#34455f']
    ]},
    {id:'purples',label:'Purples',colors:[
      ['Purple','#79618c'],['Lavender','#afa0c4']
    ]},
    {id:'special',label:'Special',colors:[
      ['Multicolor','linear-gradient(135deg,#c7788b 0 25%,#d7bb4e 25% 50%,#4d7851 50% 75%,#527aa7 75%)'],['Metallic','linear-gradient(135deg,#8f918e,#eeeeeb,#a5a6a3)']
    ]}
  ];
  const COLOR_NAMES=COLOR_GROUPS.flatMap(g=>g.colors.map(c=>c[0]));
  const COLOR_HEX=Object.fromEntries(COLOR_GROUPS.flatMap(g=>g.colors));
  const COLOR_ALIASES={
    grey:'Gray',lightgrey:'Gray',lightgray:'Gray',darkgrey:'Charcoal',darkgray:'Charcoal',
    offwhite:'Ivory',off-white:'Ivory',ivory:'Ivory',cream:'Cream',
    khaki:'Tan',taupe:'Beige',espresso:'Coffee',chocolatebrown:'Chocolate',
    maroon:'Burgundy',wine:'Burgundy',berry:'Burgundy',rose:'Pink',salmon:'Coral',
    burntorange:'Rust',ochre:'Mustard',golden:'Gold',
    sagegreen:'Sage',mintgreen:'Mint',aqua:'Turquoise',cyan:'Turquoise',
    tealblue:'Teal',skyblue:'Light Blue',lightblue:'Light Blue',royalblue:'Blue',
    violet:'Purple',lilac:'Lavender',multi:'Multicolor',multi-color:'Multicolor',multicolour:'Multicolor'
  };
  const selectedColorFilters=new Set();

  function key(value){return String(value||'').trim().toLowerCase().replace(/[^a-z0-9]+/g,'')}
  function canonicalColor(value){
    const raw=String(value||'').trim();
    if(!raw)return'';
    const exact=COLOR_NAMES.find(x=>x.toLowerCase()===raw.toLowerCase());
    if(exact)return exact;
    return COLOR_ALIASES[key(raw)]||raw;
  }
  function swatchPaint(name){return COLOR_HEX[canonicalColor(name)]||'#a39a89'}
  function isGradientPaint(paint){return String(paint).includes('gradient(')}
  function swatchStyle(name){const p=swatchPaint(name);return isGradientPaint(p)?`background:${p}`:`background-color:${p}`}

  function installStyles(){
    if(document.getElementById('colorExpansionV2Styles'))return;
    const style=document.createElement('style');
    style.id='colorExpansionV2Styles';
    style.textContent=`
      .color-expansion-native{position:absolute!important;width:1px!important;height:1px!important;opacity:0!important;pointer-events:none!important;overflow:hidden!important}
      .color-expansion-field{display:grid;gap:7px;grid-column:1/-1}
      .color-expansion-summary{display:flex;align-items:center;justify-content:space-between;gap:10px;min-height:38px;padding:7px 9px;border:1px solid var(--line);border-radius:10px;background:#fffaf0}
      .color-expansion-current{display:flex;align-items:center;gap:8px;min-width:0;font-size:12px;font-weight:750;color:var(--ink)}
      .color-expansion-current .color-dot{width:20px;height:20px;border-radius:50%;border:1px solid rgba(70,60,50,.18);box-shadow:inset 0 0 0 1px rgba(255,255,255,.28);flex:0 0 auto}
      .color-expansion-current small{font-size:10px;color:#887b6c;font-weight:600}
      .color-expansion-groups{display:grid;gap:7px;padding:8px;border:1px solid rgba(108,81,66,.12);border-radius:12px;background:rgba(247,243,234,.62)}
      .color-expansion-group{display:grid;gap:4px}
      .color-expansion-group-label{font-size:9px;line-height:1;text-transform:uppercase;letter-spacing:.09em;color:#84786b;font-weight:800}
      .color-expansion-swatches{display:flex;gap:6px;overflow-x:auto;padding:1px 1px 4px;scrollbar-width:none;-webkit-overflow-scrolling:touch}
      .color-expansion-swatches::-webkit-scrollbar{display:none}
      .color-expansion-swatch{appearance:none;-webkit-appearance:none;display:grid;grid-template-rows:28px auto;gap:3px;justify-items:center;flex:0 0 46px;width:46px;padding:3px 1px 2px;border:1px solid transparent;border-radius:9px;background:transparent;color:#6f655a;font:650 8px/1.05 var(--sans);cursor:pointer;-webkit-tap-highlight-color:transparent}
      .color-expansion-swatch .color-chip{width:28px;height:28px;border-radius:50%;border:1px solid rgba(70,60,50,.18);box-shadow:inset 0 0 0 1px rgba(255,255,255,.28),0 1px 2px rgba(60,50,40,.06)}
      .color-expansion-swatch.active{border-color:rgba(102,113,90,.56);background:rgba(225,229,218,.82);color:#4f5d49;font-weight:800}
      .color-expansion-swatch:focus-visible{outline:3px solid rgba(77,142,138,.25);outline-offset:1px}
      .color-expansion-clear{appearance:none;border:0;background:transparent;color:#897b6e;font:750 10px/1 var(--sans);padding:5px 2px;cursor:pointer}
      .color-filter-v2{display:grid;gap:7px;grid-column:1/-1;padding:4px 0 2px}
      .color-filter-v2-head{display:flex;align-items:center;justify-content:space-between;gap:8px}
      .color-filter-v2-head strong{font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:#817568}
      .color-filter-v2-head small{font-size:10px;color:#8b7e70}
      .color-filter-v2-groups{display:grid;gap:6px}
      .color-filter-v2-group{display:grid;grid-template-columns:66px minmax(0,1fr);gap:5px;align-items:start}
      .color-filter-v2-label{padding-top:7px;font-size:9px;line-height:1.15;color:#8a7d70;font-weight:750}
      .color-filter-v2-options{display:flex;flex-wrap:wrap;gap:5px}
      .color-filter-chip{appearance:none;-webkit-appearance:none;display:flex;align-items:center;gap:5px;min-height:28px;padding:4px 7px 4px 5px;border:1px solid rgba(108,81,66,.17);border-radius:9px;background:#fffaf0;color:#74695d;font:700 9px/1 var(--sans);cursor:pointer}
      .color-filter-chip .color-dot{width:16px;height:16px;border-radius:50%;border:1px solid rgba(70,60,50,.16);flex:0 0 auto}
      .color-filter-chip.active{background:var(--olive);border-color:var(--olive-dark);color:#fff;box-shadow:0 2px 5px rgba(63,73,55,.11)}
      .color-filter-chip.active .color-dot{border-color:rgba(255,255,255,.52)}
      #filterColor{display:none!important}
      @media(max-width:620px){
        .color-expansion-field{grid-column:1/-1}
        .color-filter-v2-group{grid-template-columns:1fr}
        .color-filter-v2-label{padding-top:1px}
      }
    `;
    document.head.appendChild(style);
  }

  function populateSelect(select,value){
    if(!select)return;
    const wanted=canonicalColor(value||select.value);
    select.innerHTML='<option value="">Not set</option>'+COLOR_GROUPS.map(group=>`<optgroup label="${group.label}">${group.colors.map(([name])=>`<option value="${name}">${name}</option>`).join('')}</optgroup>`).join('');
    if(wanted&&!COLOR_NAMES.includes(wanted)){
      const legacy=document.createElement('option');legacy.value=wanted;legacy.textContent=wanted+' (legacy)';select.appendChild(legacy);
    }
    select.value=wanted;
  }

  function chooserMarkup(id){
    return `<div class="color-expansion-field" data-color-for="${id}">
      <div class="color-expansion-summary"><div class="color-expansion-current"><span class="color-dot"></span><span class="color-name">Not set</span></div><button type="button" class="color-expansion-clear">Clear</button></div>
      <div class="color-expansion-groups">${COLOR_GROUPS.map(group=>`<div class="color-expansion-group"><span class="color-expansion-group-label">${group.label}</span><div class="color-expansion-swatches">${group.colors.map(([name])=>`<button type="button" class="color-expansion-swatch" data-color="${name}" title="${name}" aria-label="${name}"><span class="color-chip" style="${swatchStyle(name)}"></span><span>${name}</span></button>`).join('')}</div></div>`).join('')}</div>
    </div>`;
  }

  function syncChooser(select){
    if(!select)return;
    const host=document.querySelector(`[data-color-for="${select.id}"]`);if(!host)return;
    const value=canonicalColor(select.value);
    host.querySelectorAll('.color-expansion-swatch').forEach(btn=>btn.classList.toggle('active',btn.dataset.color===value));
    const dot=host.querySelector('.color-expansion-current .color-dot');if(dot)dot.style.cssText=swatchStyle(value);
    const label=host.querySelector('.color-name');if(label)label.textContent=value||'Not set';
  }

  function installChooser(select){
    if(!select||document.querySelector(`[data-color-for="${select.id}"]`))return;
    const value=select.value;
    populateSelect(select,value);
    select.classList.add('color-expansion-native');
    select.insertAdjacentHTML('afterend',chooserMarkup(select.id));
    const host=document.querySelector(`[data-color-for="${select.id}"]`);
    host.querySelectorAll('.color-expansion-swatch').forEach(btn=>btn.addEventListener('click',()=>{
      select.value=btn.dataset.color||'';
      syncChooser(select);
      select.dispatchEvent(new Event('input',{bubbles:true}));
      select.dispatchEvent(new Event('change',{bubbles:true}));
      if(select.id==='wishColor'&&typeof renderWishReviewDetails==='function'&&typeof wishDialogMode!=='undefined'&&wishDialogMode==='review')renderWishReviewDetails();
    }));
    host.querySelector('.color-expansion-clear').addEventListener('click',()=>{
      select.value='';syncChooser(select);select.dispatchEvent(new Event('input',{bubbles:true}));select.dispatchEvent(new Event('change',{bubbles:true}));
    });
    syncChooser(select);
  }

  function syncAllChoosers(){['itemColor','wishColor'].forEach(id=>syncChooser(document.getElementById(id)))}

  function filterMarkup(){
    return `<div class="color-filter-v2" id="colorFilterV2"><div class="color-filter-v2-head"><strong>Colors</strong><small id="colorFilterV2Count">Any color</small></div><div class="color-filter-v2-groups">${COLOR_GROUPS.map(group=>`<div class="color-filter-v2-group"><span class="color-filter-v2-label">${group.label}</span><div class="color-filter-v2-options">${group.colors.map(([name])=>`<button type="button" class="color-filter-chip" data-filter-color="${name}" aria-pressed="false"><span class="color-dot" style="${swatchStyle(name)}"></span><span>${name}</span></button>`).join('')}</div></div>`).join('')}</div></div>`;
  }

  function updateFilterUI(){
    document.querySelectorAll('.color-filter-chip').forEach(btn=>{
      const active=selectedColorFilters.has(btn.dataset.filterColor);btn.classList.toggle('active',active);btn.setAttribute('aria-pressed',active?'true':'false');
    });
    const count=document.getElementById('colorFilterV2Count');
    if(count)count.textContent=selectedColorFilters.size?`${selectedColorFilters.size} selected`:'Any color';
  }

  function applyColorPostFilter(){
    if(!selectedColorFilters.size)return;
    const grid=document.getElementById('catalogGrid');if(!grid)return;
    const visible=[];
    grid.querySelectorAll('.item-card[data-id]').forEach(card=>{
      const item=state.items.find(x=>String(x.id)===String(card.dataset.id));
      if(!item||!selectedColorFilters.has(canonicalColor(item.color)))card.remove();else visible.push(item.id);
    });
    if(typeof catalogReviewIds!=='undefined')catalogReviewIds=visible;
    const count=document.getElementById('catalogCount');if(count)count.textContent=`${visible.length} ${visible.length===1?'piece':'pieces'}`;
    const empty=document.getElementById('catalogEmpty');if(empty)empty.classList.toggle('hidden',visible.length>0);
    if(typeof applyFreeFlowScatter==='function')applyFreeFlowScatter();
  }

  function installFilter(){
    const legacy=document.getElementById('filterColor');if(!legacy)return;
    populateSelect(legacy,'');legacy.value='';
    if(!document.getElementById('colorFilterV2'))legacy.insertAdjacentHTML('afterend',filterMarkup());
    document.querySelectorAll('.color-filter-chip').forEach(btn=>btn.addEventListener('click',()=>{
      const color=btn.dataset.filterColor;if(selectedColorFilters.has(color))selectedColorFilters.delete(color);else selectedColorFilters.add(color);
      updateFilterUI();renderCatalog();
    }));
    updateFilterUI();
  }

  function wrapRuntime(){
    if(typeof colorHex==='function'&&!colorHex.__colorExpansionV2){
      const replacement=function(name){const paint=swatchPaint(name);return isGradientPaint(paint)?'#9b8477':paint};replacement.__colorExpansionV2=true;colorHex=replacement;
    }
    if(typeof nearestColor==='function'&&!nearestColor.__colorExpansionV2){
      const rgb={Black:[35,35,35],Charcoal:[74,74,72],Gray:[135,135,130],Silver:[188,189,186],White:[242,240,234],Ivory:[239,232,213],Cream:[235,222,190],Brown:[117,82,60],Coffee:[108,81,66],Chocolate:[84,57,48],Camel:[174,132,91],Tan:[177,145,105],Beige:[211,192,157],Burgundy:[125,53,71],Red:[178,63,61],Coral:[205,103,91],Pink:[196,107,132],Blush:[215,160,169],Orange:[209,120,53],Rust:[163,88,56],Yellow:[220,190,65],Mustard:[195,160,75],Gold:[183,151,63],Olive:[102,113,90],Green:[67,117,70],Sage:[139,158,133],Mint:[151,196,166],Turquoise:[77,142,138],Teal:[52,121,119],LightBlue:[157,187,208],Blue:[78,117,164],Navy:[50,65,92],Purple:[116,88,139],Lavender:[174,158,196]};
      const labels={LightBlue:'Light Blue'};
      const replacement=function(r,g,b){let best='Multicolor',dist=1e9;for(const [k,v] of Object.entries(rgb)){const d=(r-v[0])**2+(g-v[1])**2+(b-v[2])**2;if(d<dist){dist=d;best=labels[k]||k}}return best};replacement.__colorExpansionV2=true;nearestColor=replacement;
    }
    if(typeof renderCatalog==='function'&&!renderCatalog.__colorExpansionV2){
      const base=renderCatalog;
      const replacement=function(){const legacy=document.getElementById('filterColor');if(legacy)legacy.value='';const result=base.apply(this,arguments);applyColorPostFilter();return result};replacement.__colorExpansionV2=true;renderCatalog=replacement;
    }
    if(typeof openItem==='function'&&!openItem.__colorExpansionV2){
      const base=openItem;const replacement=function(){const r=base.apply(this,arguments);setTimeout(syncAllChoosers,0);return r};replacement.__colorExpansionV2=true;openItem=replacement;
    }
    if(typeof openWish==='function'&&!openWish.__colorExpansionV2){
      const base=openWish;const replacement=function(){const r=base.apply(this,arguments);setTimeout(syncAllChoosers,0);return r};replacement.__colorExpansionV2=true;openWish=replacement;
    }
    if(typeof applyPendingSmartScan==='function'&&!applyPendingSmartScan.__colorExpansionV2){
      const base=applyPendingSmartScan;const replacement=function(){const r=base.apply(this,arguments);setTimeout(syncAllChoosers,0);return r};replacement.__colorExpansionV2=true;applyPendingSmartScan=replacement;
    }
    if(typeof setWishSelectValue==='function'&&!setWishSelectValue.__colorExpansionV2){
      const base=setWishSelectValue;const replacement=function(selector,value){if(selector==='#wishColor'){const sel=document.querySelector(selector);if(sel){const c=canonicalColor(value);if(c&&!Array.from(sel.options).some(o=>o.value===c)){const o=document.createElement('option');o.value=c;o.textContent=c;sel.appendChild(o)}value=c}}const r=base.call(this,selector,value);if(selector==='#wishColor')setTimeout(syncAllChoosers,0);return r};replacement.__colorExpansionV2=true;setWishSelectValue=replacement;
    }
    if(typeof quickCaptureReviewField==='function'&&!quickCaptureReviewField.__colorExpansionV2){
      const base=quickCaptureReviewField;
      const replacement=function(field,label,type,options){
        if(type!=='select-color')return base.apply(this,arguments);
        const sug=quickCaptureDraft.suggestions[field],value=canonicalColor(sug?.value||''),checked=(value||options?.defaultChecked)?'checked':'';
        const input=`<select data-qc-value="${field}">${COLOR_GROUPS.map(group=>`<optgroup label="${group.label}">${group.colors.map(([v])=>`<option value="${v}"${v===value?' selected':''}>${v}</option>`).join('')}</optgroup>`).join('')}</select>`;
        return `<div class="quick-capture-review-row" data-qc-row="${field}"><label class="quick-capture-apply"><input type="checkbox" data-qc-apply="${field}" ${checked}><span></span></label><div class="quick-capture-review-copy"><strong>${label}</strong>${sug?.source?`<small>${sug.source}</small>`:''}${input}</div></div>`;
      };replacement.__colorExpansionV2=true;quickCaptureReviewField=replacement;
    }
  }

  function normalizeLoadedColors(){
    let changed=false;
    ['items','wishlist'].forEach(bucket=>(state?.[bucket]||[]).forEach(item=>{
      const before=String(item.color||'').trim(),after=canonicalColor(before);
      if(before&&after!==before&&COLOR_NAMES.includes(after)){item.color=after;changed=true}
    }));
    if(changed&&typeof saveState==='function')saveState();
  }

  function installClearHook(){
    const clear=document.getElementById('clearFilters');if(!clear||clear.dataset.colorExpansionV2)return;
    clear.dataset.colorExpansionV2='1';
    clear.addEventListener('click',()=>{selectedColorFilters.clear();updateFilterUI();setTimeout(()=>renderCatalog(),0)});
  }

  function install(){
    if(document.documentElement.dataset.colorExpansionV2)return;
    document.documentElement.dataset.colorExpansionV2='dev1';
    installStyles();
    wrapRuntime();
    installChooser(document.getElementById('itemColor'));
    installChooser(document.getElementById('wishColor'));
    installFilter();
    installClearHook();
    normalizeLoadedColors();
    syncAllChoosers();
    renderCatalog();

    const observer=new MutationObserver(()=>{
      if(document.getElementById('itemDialog')?.open||document.getElementById('wishDialog')?.open)syncAllChoosers();
    });
    ['itemDialog','wishDialog'].forEach(id=>{const el=document.getElementById(id);if(el)observer.observe(el,{attributes:true,attributeFilter:['open','class']})});
  }

  if(document.readyState==='complete')setTimeout(install,0);else window.addEventListener('load',()=>setTimeout(install,0),{once:true});
})();
