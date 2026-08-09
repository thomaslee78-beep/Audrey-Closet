const CATEGORIES=['Tops','Bottoms','Outerwear','Shoes','Accessories','Misc'];
const ACQUIRED=['Bought new','Gifted','Hand-me-down','Secondhand','DIY','Other'];
const COLORS=['Black','White','Cream','Gray','Brown','Coffee','Tan','Beige','Burgundy','Red','Orange','Yellow','Mustard','Olive','Green','Mint','Turquoise','Blue','Navy','Purple','Pink','Multicolor'];
const TYPES={
  Tops:['T-shirt','Long-sleeve T-shirt','Tank top','Blouse','Button-down shirt','Polo','Sweater','Sweatshirt','Hoodie','Cardigan','Crop top','Camisole','Other'],
  Bottoms:['Jeans','Pants / Trousers','Leggings','Shorts','Skirt','Joggers / Sweatpants','Other'],
  Outerwear:['Jacket','Coat','Blazer','Vest','Rain jacket','Puffer','Fleece','Other'],
  Shoes:['Sneakers','Athletic shoes','Boots','Sandals','Flats','Heels','Loafers','Slippers','Other'],
  Accessories:['Hat','Belt','Bag / Purse','Backpack','Scarf','Jewelry','Sunglasses','Hair accessory','Gloves','Other'],
  Misc:['Dress','Jumpsuit / Romper','Swimsuit','Socks','Tights','Underwear','Pajamas / Sleepwear','Costume','Uniform','Other']
};
const CLOTHING_SIZES=['Not set','XXS','XS','S','M','L','XL','XXL','Girls 8','Girls 10','Girls 12','Girls 14','Girls 16','00','0','2','4','6','8','10','12','14','16','18','Men XS','Men S','Men M','Men L','Men XL','Men XXL','One Size','Other'];
const BOTTOM_SIZES=['Not set','XXS','XS','S','M','L','XL','XXL','Girls 8','Girls 10','Girls 12','Girls 14','Girls 16','00','0','2','4','6','8','10','12','14','16','18',...Array.from({length:17},(_,i)=>`Men W${28+i}`),'Men W46','Men W48','Other'];
const SHOE_SIZES=['Not set',...Array.from({length:25},(_,i)=>String(1+i*.5)),'Other'];
const ACCESSORY_SIZES=['Not set','One Size','XS','S','M','L','XL','Other'];
const STORE_KEY='audreyClosetV1';
const DB_NAME='AudreyClosetDB';
const DB_VERSION=1;
const DB_STORE='app';
const DEFAULT_APP_NAME="Audrey's Clothing App";
const DEFAULT_PORTFOLIO_FOLDERS=['Everyday','School','Weekend','Dressy','Sport','Seasonal','Ideas'];
let state=emptyState();
let selectedCategory='';
let catalogReviewIds=[];
let itemReviewIds=[];
let itemSwipeStart=null;
let itemPhotoPickerActive=false;
let itemDialogScrollY=0;
let itemWorkingPhoto='';
let itemOriginalPhoto='';
let studioSourcePhoto='';
let studioCutoutPhoto='';
let studioMode='original';
let studioBg='transparent';
let studioScale=88;
let studioRotation=0;
let studioEdge=45;
let studioBrushMode='';
let studioDrawing=false;
let studioRestoreCanvas=null;
let wishWorkingPhoto='';
let boardItems=[];
let boardUndoStack=[];
const BOARD_MOVE_SENSITIVITY=.72;
const BOARD_PINCH_SCALE_SENSITIVITY=.58;
const BOARD_PINCH_ROTATION_SENSITIVITY=.58;
const BOARD_PINCH_MOVE_SENSITIVITY=.58;
let traySource='closet';
let trayCategory='Recent';
let portfolioFilter='All';
let viewingOutfitId=null;
let editingOutfitId=null;
let selectedBoardUid=null;
let doodleMode=false;
let activeDoodle=null;
let pendingShareBlob=null;
let pendingShareUrl='';
let pendingShareFileName='outfit.jpg';
let closetDrag={timer:null,pointerId:null,touchId:null,startX:0,startY:0,x:0,y:0,card:null,category:'',active:false,moved:false,ghost:null,dropOutline:null,placeholder:null,lastPlacement:'',raf:null,longPressed:false};
let suppressCatalogClickUntil=0;

function emptyState(){return {items:[],outfits:[],journal:[],wishlist:[],settings:{appName:DEFAULT_APP_NAME,portfolioFolders:[...DEFAULT_PORTFOLIO_FOLDERS],boardRecent:{closet:[],wishlist:[]}}}}
function ensureSettings(){
  state.settings=state.settings||{};
  if(!state.settings.appName)state.settings.appName=DEFAULT_APP_NAME;
  if(!Array.isArray(state.settings.portfolioFolders)||!state.settings.portfolioFolders.length)state.settings.portfolioFolders=[...DEFAULT_PORTFOLIO_FOLDERS];
  state.settings.portfolioFolders=[...new Set(state.settings.portfolioFolders.map(x=>String(x||'').trim()).filter(Boolean))].slice(0,12);
  if(!state.settings.portfolioFolders.length)state.settings.portfolioFolders=['Everyday'];
  state.settings.boardRecent=state.settings.boardRecent||{closet:[],wishlist:[]};
  state.settings.boardRecent.closet=Array.isArray(state.settings.boardRecent.closet)?state.settings.boardRecent.closet:[];
  state.settings.boardRecent.wishlist=Array.isArray(state.settings.boardRecent.wishlist)?state.settings.boardRecent.wishlist:[];
  state.settings.closetOrder=state.settings.closetOrder&&typeof state.settings.closetOrder==='object'?state.settings.closetOrder:{};
  CATEGORIES.forEach(cat=>{
    const ids=state.items.filter(i=>i.category===cat).map(i=>i.id);
    const saved=Array.isArray(state.settings.closetOrder[cat])?state.settings.closetOrder[cat]:[];
    state.settings.closetOrder[cat]=[...saved.filter(x=>ids.includes(x)),...ids.filter(x=>!saved.includes(x))];
  });
}
function openDB(){return new Promise((resolve,reject)=>{const req=indexedDB.open(DB_NAME,DB_VERSION);req.onupgradeneeded=()=>{const db=req.result;if(!db.objectStoreNames.contains(DB_STORE))db.createObjectStore(DB_STORE)};req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error)})}
async function loadState(){
  try{
    const db=await openDB();
    const saved=await new Promise((resolve,reject)=>{const tx=db.transaction(DB_STORE,'readonly'),req=tx.objectStore(DB_STORE).get('state');req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error)});
    if(saved)return {...emptyState(),...saved};
    const legacy=localStorage.getItem(STORE_KEY);
    if(legacy){const migrated={...emptyState(),...JSON.parse(legacy)};await persistState(migrated);localStorage.removeItem(STORE_KEY);return migrated}
  }catch(e){console.warn('IndexedDB load failed',e);try{return {...emptyState(),...JSON.parse(localStorage.getItem(STORE_KEY)||'{}')}}catch{}}
  return emptyState();
}
async function persistState(value=state){const db=await openDB();return new Promise((resolve,reject)=>{const tx=db.transaction(DB_STORE,'readwrite');tx.objectStore(DB_STORE).put(value,'state');tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error)})}
async function saveState(){
  try{await persistState(state);renderAll();return true}
  catch(e){console.error('Save failed',e);toast('Could not save. Try closing other tabs or export a backup.');return false}
}
function id(){return crypto.randomUUID?crypto.randomUUID():Date.now().toString(36)+Math.random().toString(36).slice(2)}
function esc(s=''){return String(s).replace(/[&<>'"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[m]))}
function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),1800)}
function $(q){return document.querySelector(q)}
function $$(q){return [...document.querySelectorAll(q)]}
function seasonForDate(d=new Date()){const m=d.getMonth()+1;if([12,1,2].includes(m))return'Winter';if([3,4,5].includes(m))return'Spring';if([6,7,8].includes(m))return'Summer';return'Fall'}
function colorHex(name){const map={Black:'#262626',White:'#faf9f4',Cream:'#f1e7c9',Gray:'#8a8984',Brown:'#7a5744',Coffee:'#6c5142',Tan:'#b79876',Beige:'#d9c7a6',Burgundy:'#7d3547',Red:'#b84b46',Orange:'#d37c3f',Yellow:'#d7bb4e',Mustard:'#c3a04b',Olive:'#66715a',Green:'#4d7851',Mint:'#9cc5ab',Turquoise:'#4d8e8a',Blue:'#527aa7',Navy:'#34455f',Purple:'#79618c',Pink:'#c7788b',Multicolor:'#ad7b6a'};return map[name]||'#a39a89'}

async function init(){
  state=await loadState();
  ensureSettings();
  fillSelects(); bindNav(); bindDialogs(); bindBoard(); bindPhotoStudio();
  $('#catalogSearch').addEventListener('input',renderCatalog);
  $('#filterBtn').onclick=()=>$('#filterPanel').classList.toggle('hidden');
  $('#clearFilters').onclick=()=>{selectedCategory='';$('#filterCategory').value='';$('#filterSeason').value='';$('#filterColor').value='';renderCatalog();renderCategories()};
  ['filterCategory','filterSeason','filterColor'].forEach(x=>$('#'+x).addEventListener('change',renderCatalog));
  $('#exportBtn').onclick=exportData;$('#importFile').onchange=importData;$('#resetBtn').onclick=resetData;
  $('#saveAppNameBtn').onclick=saveAppName;$('#resetAppNameBtn').onclick=resetAppName;
  $('#settingsBtn').onclick=()=>{renderPortfolioFolderEditor();showScreen('more')};
  $('#addPortfolioFolderBtn').onclick=addPortfolioFolder;
  $('#managePortfolioBtn').onclick=()=>{renderPortfolioFolderEditor();showScreen('more')};
  $('#portfolioNewBtn').onclick=()=>{startNewOutfit();showScreen('outfits')};
  if('serviceWorker'in navigator)navigator.serviceWorker.register('./sw.js').catch(()=>{});
  renderAll();
}
function fillSelects(){
  const catOpts=CATEGORIES.map(c=>`<option>${c}</option>`).join('');
  $('#itemCategory').innerHTML=catOpts;$('#wishCategory').innerHTML=catOpts;
  $('#filterCategory').innerHTML='<option value="">All categories</option>'+catOpts;
  $('#itemAcquired').innerHTML=ACQUIRED.map(a=>`<option>${a}</option>`).join('');
  const colorOpts='<option value="">Not set</option>'+COLORS.map(c=>`<option>${c}</option>`).join('');
  $('#itemColor').innerHTML=colorOpts;$('#wishColor').innerHTML=colorOpts;
  $('#filterColor').innerHTML='<option value="">All colors</option>'+COLORS.map(c=>`<option>${c}</option>`).join('');
  populateTypeOptions('Tops');populateSizeOptions('Tops');
  $('#itemCategory').addEventListener('change',()=>{populateTypeOptions($('#itemCategory').value);populateSizeOptions($('#itemCategory').value);updateItemReviewSummary()});
}
function populateTypeOptions(category,selected=''){const opts=[...(TYPES[category]||['Other'])];if(selected&&!opts.includes(selected))opts.unshift(selected);$('#itemType').innerHTML=opts.map(v=>`<option${v===selected?' selected':''}>${esc(v)}</option>`).join('')}
function sizesForCategory(category){if(category==='Shoes')return [...SHOE_SIZES];if(category==='Accessories')return [...ACCESSORY_SIZES];if(category==='Bottoms')return [...BOTTOM_SIZES];return [...CLOTHING_SIZES]}
function populateSizeOptions(category,selected=''){const opts=sizesForCategory(category);if(selected&&!opts.includes(selected))opts.unshift(selected);$('#itemSize').innerHTML=opts.map(v=>`<option value="${v==='Not set'?'':esc(v)}"${v===selected||(!selected&&v==='Not set')?' selected':''}>${esc(v)}</option>`).join('')}
function bindNav(){
  $$('.bottom-nav button').forEach(b=>b.onclick=()=>showScreen(b.dataset.nav));
  ['addItemBtn','emptyAddBtn','quickAddBtn'].forEach(x=>$('#'+x).onclick=()=>openItem(null, selectedCategory||$('#filterCategory').value||''));
  $('#addWishBtn').onclick=()=>openWish();
  $('#logWearBtn').onclick=openWear;
}
function showScreen(name){$$('.screen').forEach(s=>s.classList.toggle('active',s.dataset.screen===name));$$('.bottom-nav button').forEach(b=>b.classList.toggle('active',b.dataset.nav===name));scrollTo({top:0,behavior:'smooth'});if(name==='journal')renderJournal();if(name==='outfits')renderOutfits();if(name==='portfolio')renderSavedOutfits();if(name==='more')renderPortfolioFolderEditor()}

function bindDialogs(){
  $('#itemPhoto').onchange=e=>handleItemPhotoSelection(e,'camera');
  $('#itemPhotoLibrary').onchange=e=>handleItemPhotoSelection(e,'library');
  ['itemPhoto','itemPhotoLibrary'].forEach(inputId=>{const input=$('#'+inputId);input.addEventListener('click',()=>{itemPhotoPickerActive=true;ensureItemDialogVisible()})});
  window.addEventListener('focus',()=>{if(itemPhotoPickerActive)setTimeout(restoreItemDialogAfterPicker,180)});
  window.addEventListener('pageshow',()=>{if(itemPhotoPickerActive)setTimeout(restoreItemDialogAfterPicker,180)});
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&itemPhotoPickerActive)setTimeout(restoreItemDialogAfterPicker,180)});
  $('#removeBgBtn').onclick=()=>openPhotoStudio();
  $('#photoStudioBtn').onclick=()=>openPhotoStudio();
  $('#restoreOriginalPhotoBtn').onclick=()=>restoreCapturedOriginal(false);
  $('#smartScanBtn').onclick=smartScan;
  $('#itemForm').onsubmit=e=>{e.preventDefault();saveItem()};
  $('#cancelItemBtn').onclick=closeItemWithoutSaving;
  $('#closeItemDialogBtn').onclick=closeItemWithoutSaving;
  $('#itemDialog').addEventListener('cancel',e=>{e.preventDefault();closeItemWithoutSaving()});
  ['itemCategory','itemType','itemBrand','itemColor'].forEach(id=>$('#'+id).addEventListener('input',updateItemReviewSummary));
  $('#deleteItemBtn').onclick=deleteItem;
  bindItemSwipe();
  $('#wishPhoto').onchange=async e=>{const f=e.target.files[0];if(!f)return;wishWorkingPhoto=await fileToDataURL(f,900,.74);showPhoto('#wishPhotoPreview','#wishPhotoPlaceholder',wishWorkingPhoto)};
  $('#wishForm').onsubmit=e=>{e.preventDefault();saveWish()};
  $('#deleteWishBtn').onclick=deleteWish;
  $('#wearForm').onsubmit=e=>{e.preventDefault();saveWear()};
  $('#deleteOutfitBtn').onclick=deleteOutfit;$('#favoriteViewedOutfitBtn').onclick=favoriteViewedOutfit;$('#editViewedOutfitBtn').onclick=editViewedOutfit;$('#shareViewedOutfitBtn').onclick=shareViewedOutfit;
}
function openItem(item=null,preferredCategory=''){
  itemReviewIds=item ? (catalogReviewIds.includes(item.id)?[...catalogReviewIds]:state.items.map(i=>i.id)) : [];
  loadItemIntoEditor(item,preferredCategory);
  if(!$('#itemDialog').open){lockPageForItemDialog();$('#itemDialog').showModal()}
}
function loadItemIntoEditor(item=null,preferredCategory=''){
  const isEdit=!!item;
  $('#itemDialog').classList.toggle('editing-existing',isEdit);
  $('#itemDialogTitle').textContent=isEdit?'Review piece':'Add a piece';$('#itemId').value=item?.id||'';itemWorkingPhoto=item?.photo||'';itemOriginalPhoto=item?.originalPhoto||item?.photo||'';
  showPhoto('#itemPhotoPreview','#photoPlaceholder',itemWorkingPhoto);updateOriginalPhotoButton();const category=item?.category||preferredCategory||selectedCategory||$('#filterCategory').value||'Tops';$('#itemCategory').value=category;populateTypeOptions(category,item?.type||'');populateSizeOptions(category,item?.size||'');$('#itemBrand').value=item?.brand||'';$('#itemColor').value=item?.color||'';$('#itemPattern').value=item?.pattern||'Solid';$('#itemAcquired').value=item?.acquired||'Bought new';$('#itemSeason').value=item?.season||'All-season';$('#itemNotes').value=item?.notes||'';$('#scanStatus').textContent='';$('#deleteItemBtn').classList.toggle('hidden',!item);$('#itemPhoto').value='';$('#itemPhotoLibrary').value='';
  const tools=$('.photo-tools-disclosure');if(tools)tools.open=!isEdit;
  $('#itemReviewSummary').classList.toggle('hidden',!isEdit);$('#itemSwipeHint').classList.toggle('hidden',!isEdit||itemReviewIds.length<2);updateItemReviewSummary();
  if($('#itemDialog').open)$('#itemDialog').scrollTop=0;
}
function bindItemSwipe(){
  const zone=$('#itemSwipeZone');if(!zone)return;
  zone.addEventListener('touchstart',e=>{if(!$('#itemId').value||e.touches.length!==1)return;const t=e.touches[0];itemSwipeStart={x:t.clientX,y:t.clientY,time:Date.now()}},{passive:true});
  zone.addEventListener('touchend',e=>{if(!itemSwipeStart||!$('#itemId').value)return;const t=e.changedTouches[0],dx=t.clientX-itemSwipeStart.x,dy=t.clientY-itemSwipeStart.y,elapsed=Date.now()-itemSwipeStart.time;itemSwipeStart=null;if(elapsed>700||Math.abs(dx)<55||Math.abs(dx)<Math.abs(dy)*1.25)return;navigateReviewItem(dx<0?1:-1)});
}
function navigateReviewItem(delta){
  const current=$('#itemId').value;if(!current||itemReviewIds.length<2)return;const idx=itemReviewIds.indexOf(current);if(idx<0)return;const nextIndex=idx+delta;if(nextIndex<0||nextIndex>=itemReviewIds.length){toast(delta<0?'First piece in this view':'Last piece in this view');return}const next=state.items.find(i=>i.id===itemReviewIds[nextIndex]);if(!next)return;loadItemIntoEditor(next);const zone=$('#itemSwipeZone');zone.classList.remove('swipe-next','swipe-prev');void zone.offsetWidth;zone.classList.add(delta>0?'swipe-next':'swipe-prev');setTimeout(()=>zone.classList.remove('swipe-next','swipe-prev'),220);
}
function closeItemWithoutSaving(){
  // Form fields and photo edits are working copies only. Closing never mutates state.
  itemWorkingPhoto='';itemOriginalPhoto='';itemPhotoPickerActive=false;$('#itemPhoto').value='';$('#itemPhotoLibrary').value='';$('#scanStatus').textContent='';
  if($('#itemDialog').open)$('#itemDialog').close('cancel');
  unlockPageForItemDialog();
}
async function handleItemPhotoSelection(e,source='camera'){
  const f=e.target.files&&e.target.files[0];
  itemPhotoPickerActive=false;
  ensureItemDialogVisible();
  if(!f){$('#scanStatus').textContent=source==='library'?'No photo selected.':'Camera canceled — your piece is still open.';return}
  setPhotoBusy(true,source==='library'?'Importing photo…':'Optimizing photo…');
  try{
    itemOriginalPhoto=await fileToDataURL(f,1100,.78);
    itemWorkingPhoto=itemOriginalPhoto;
    showPhoto('#itemPhotoPreview','#photoPlaceholder',itemWorkingPhoto);updateOriginalPhotoButton();
    const scan=await analyzeImage(itemWorkingPhoto);applyVisualScan(scan);
    $('#scanStatus').textContent=`${source==='library'?'Imported':'Photo ready'} · ${scan.color} · ${scan.pattern}. Photo Studio can crop, cut out and normalize it.`;
  }catch(err){console.error(err);$('#scanStatus').textContent='Photo could not be processed. Try another photo.';toast('Could not process that photo')}
  finally{setPhotoBusy(false);e.target.value=''}
}
function ensureItemDialogVisible(){
  const d=$('#itemDialog');
  if(!d.open){try{lockPageForItemDialog();d.showModal()}catch(err){console.warn('Could not restore item review dialog',err)}}
}
function restoreItemDialogAfterPicker(){
  if(!itemPhotoPickerActive)return;
  ensureItemDialogVisible();
  setTimeout(()=>{itemPhotoPickerActive=false},700);
}
function lockPageForItemDialog(){
  if(document.body.classList.contains('item-dialog-open'))return;
  itemDialogScrollY=window.scrollY||0;
  document.body.style.top=`-${itemDialogScrollY}px`;
  document.body.classList.add('item-dialog-open');
}
function unlockPageForItemDialog(){
  if(!document.body.classList.contains('item-dialog-open'))return;
  document.body.classList.remove('item-dialog-open');document.body.style.top='';
  window.scrollTo(0,itemDialogScrollY||0);
}

function updateItemReviewSummary(){
  const isEdit=!!$('#itemId').value;$('#itemReviewSummary').classList.toggle('hidden',!isEdit);if(!isEdit)return;
  const type=$('#itemType').value||$('#itemCategory').value||'Clothing item',color=$('#itemColor').value||'Color not set',brand=$('#itemBrand').value.trim()||'No brand';
  $('#itemReviewTitle').textContent=type;$('#itemReviewMeta').innerHTML=`<span class="swatch" style="background:${colorHex(color)}"></span>${esc(color)} · ${esc(brand)}`;
}
async function saveItem(){
  const iid=$('#itemId').value;const old=state.items.find(x=>x.id===iid);const obj={id:iid||id(),photo:itemWorkingPhoto,originalPhoto:itemOriginalPhoto||itemWorkingPhoto,category:$('#itemCategory').value,type:$('#itemType').value,brand:$('#itemBrand').value.trim(),size:$('#itemSize').value,color:$('#itemColor').value,pattern:$('#itemPattern').value,acquired:$('#itemAcquired').value,season:$('#itemSeason').value,notes:$('#itemNotes').value.trim(),created:old?.created||Date.now(),wears:old?.wears||0};
  const previous=state.items;if(iid)state.items=state.items.map(x=>x.id===iid?obj:x);else{state.items=[obj,...state.items];ensureSettings();const order=state.settings.closetOrder[obj.category]||[];state.settings.closetOrder[obj.category]=[obj.id,...order.filter(x=>x!==obj.id)];}
  const btn=$('#saveItemBtn');btn.disabled=true;btn.textContent='Saving…';$('#scanStatus').textContent='Saving securely on this device…';
  const ok=await saveState();btn.disabled=false;btn.textContent='Save piece';
  if(ok){$('#itemDialog').close();unlockPageForItemDialog();toast(iid?'Piece updated':'Added to closet')}else{state.items=previous;$('#scanStatus').textContent='Save failed. Your entry is still open so you can try again.'}
}
function setPhotoBusy(busy,message=''){['#removeBgBtn','#smartScanBtn','#saveItemBtn'].forEach(sel=>{const el=$(sel);if(el)el.disabled=busy});if(message)$('#scanStatus').textContent=message}
function deleteItem(){const iid=$('#itemId').value;if(!iid||!confirm('Delete this closet piece?'))return;state.items=state.items.filter(x=>x.id!==iid);state.journal=state.journal.map(j=>({...j,itemIds:j.itemIds.filter(x=>x!==iid)}));saveState();$('#itemDialog').close();unlockPageForItemDialog();toast('Piece deleted')}

function renderAll(){ensureSettings();applyAppName();renderCategories();renderCatalog();renderOutfits();renderSavedOutfits();renderWishlist();renderJournal();renderPortfolioFolderEditor()}
function renderCategories(){const host=$('#categoryStrip');host.innerHTML=CATEGORIES.map(c=>{const n=state.items.filter(i=>i.category===c).length;return`<button class="category-chip ${selectedCategory===c?'active':''}" data-cat="${c}"><strong>${c}</strong><span>${n} ${n===1?'piece':'pieces'}</span></button>`}).join('');$$('.category-chip').forEach(b=>b.onclick=()=>{selectedCategory=selectedCategory===b.dataset.cat?'':b.dataset.cat;renderCategories();renderCatalog()})}
function renderCatalog(){
  ensureSettings();
  const q=$('#catalogSearch').value.toLowerCase().trim(),fc=$('#filterCategory').value,fs=$('#filterSeason').value,fcol=$('#filterColor').value;
  const activeCategory=selectedCategory||fc||'';
  let items=state.items.filter(i=>(!selectedCategory||i.category===selectedCategory)&&(!fc||i.category===fc)&&(!fs||i.season===fs)&&(!fcol||i.color===fcol)&&(!q||[i.type,i.brand,i.color,i.pattern,i.notes,i.category].join(' ').toLowerCase().includes(q)));
  if(activeCategory){const order=state.settings.closetOrder[activeCategory]||[];items=[...items].sort((a,b)=>{const ai=order.indexOf(a.id),bi=order.indexOf(b.id);return (ai<0?999999:ai)-(bi<0?999999:bi)})}
  catalogReviewIds=items.map(i=>i.id);
  $('#catalogCount').textContent=`${items.length} ${items.length===1?'piece':'pieces'}`;$('#catalogGrid').innerHTML=items.map(i=>itemCard(i)).join('');$('#catalogEmpty').classList.toggle('hidden',state.items.length>0||q||selectedCategory||fc||fs||fcol);
  $$('.item-card').forEach(c=>c.onclick=()=>{if(Date.now()<suppressCatalogClickUntil)return;openItem(state.items.find(i=>i.id===c.dataset.id))});
  bindCatalogReorder(activeCategory);
}

function bindCatalogReorder(activeCategory){
  const grid=$('#catalogGrid');if(!grid)return;
  grid.querySelectorAll('.item-card').forEach(card=>{
    // Never let iOS/Safari treat the garment image itself as a draggable/copyable image.
    card.draggable=false;
    card.querySelectorAll('img').forEach(img=>{img.draggable=false;img.ondragstart=e=>e.preventDefault()});
    // Mouse / trackpad path. Touch gets its own non-passive handlers below so iOS
    // can hand control to us after a deliberate long press.
    card.onpointerdown=e=>{
      if(e.pointerType==='touch')return;
      if(e.pointerType==='mouse'&&e.button!==0)return;
      beginCatalogPress(card,activeCategory,e.pointerId,e.clientX,e.clientY,null);
    };
    card.onpointermove=e=>{if(e.pointerType!=='touch')moveCatalogDrag(e.clientX,e.clientY,e.pointerId,null,e)};
    card.onpointerup=e=>{if(e.pointerType!=='touch')finishCatalogDrag(e.pointerId,null,false,e)};
    card.onpointercancel=e=>{if(e.pointerType!=='touch')finishCatalogDrag(e.pointerId,null,true,e)};
    card.ontouchstart=e=>{
      if(e.touches.length!==1)return;
      const t=e.changedTouches[0];
      beginCatalogPress(card,activeCategory,null,t.clientX,t.clientY,t.identifier);
    };
    card.ontouchmove=e=>{
      const d=closetDrag;if(d.touchId==null)return;
      const t=[...e.changedTouches].find(x=>x.identifier===d.touchId)||[...e.touches].find(x=>x.identifier===d.touchId);
      if(!t)return;
      moveCatalogDrag(t.clientX,t.clientY,null,d.touchId,e);
    };
    card.ontouchend=e=>{
      const d=closetDrag;if(d.touchId==null)return;
      const t=[...e.changedTouches].find(x=>x.identifier===d.touchId);
      if(t)finishCatalogDrag(null,d.touchId,false,e);
    };
    card.ontouchcancel=e=>{
      const d=closetDrag;if(d.touchId==null)return;
      finishCatalogDrag(null,d.touchId,true,e);
    };
    card.oncontextmenu=e=>{if(closetDrag.active||closetDrag.timer)e.preventDefault()};
  });
}
function beginCatalogPress(card,activeCategory,pointerId,x,y,touchId){
  clearTimeout(closetDrag.timer);cleanupCatalogGhost();
  closetDrag={timer:null,pointerId,touchId,startX:x,startY:y,x,y,card,category:activeCategory||'',active:false,moved:false,ghost:null,dropOutline:null,placeholder:null,lastPlacement:'',raf:null,longPressed:false};
  closetDrag.timer=setTimeout(()=>startCatalogDrag(),430);
}
function startCatalogDrag(){
  const d=closetDrag;if(!d.card)return;
  if(!d.category){d.timer=null;d.longPressed=true;suppressCatalogClickUntil=Date.now()+1100;navigator.vibrate?.(12);toast('Choose a clothing category first, then press & hold to reorder.');return}
  d.active=true;d.longPressed=true;d.timer=null;suppressCatalogClickUntil=Date.now()+900;
  const rect=d.card.getBoundingClientRect();

  // Keep the grid completely stable while dragging. The original card remains in its slot
  // (dimmed) and we only highlight the intended destination. No neighboring cards move
  // until the user actually drops the item, which prevents the flashing seen on iPhone.
  d.card.classList.add('closet-drag-source');
  d.originalId=d.card.dataset.id;
  d.targetId=d.originalId;
  d.targetAfter=false;

  const ghost=d.card.cloneNode(true);ghost.classList.add('closet-drag-ghost');ghost.removeAttribute('data-id');ghost.removeAttribute('style');
  ghost.querySelectorAll('img').forEach(img=>{img.draggable=false});
  Object.assign(ghost.style,{position:'fixed',left:'0',top:'0',width:rect.width+'px',height:rect.height+'px',margin:'0',pointerEvents:'none',zIndex:'5000',willChange:'transform'});
  document.body.appendChild(ghost);d.ghost=ghost;d.ghostOffsetX=d.x-rect.left;d.ghostOffsetY=d.y-rect.top;
  const dropOutline=document.createElement('div');dropOutline.className='closet-drop-outline';dropOutline.setAttribute('aria-hidden','true');document.body.appendChild(dropOutline);d.dropOutline=dropOutline;
  document.body.classList.add('closet-reordering');$('#catalogGrid')?.classList.add('closet-grid-reordering');
  navigator.vibrate?.(18);positionCatalogGhost(d.x,d.y);updateCatalogDropTarget(d.x,d.y);
  toast('Reorder mode — choose a new slot, then release');
}
function positionCatalogGhost(x,y){
  const d=closetDrag;if(!d.ghost)return;
  const left=x-(d.ghostOffsetX||0),top=y-(d.ghostOffsetY||0);
  d.ghost.style.transform=`translate3d(${left}px,${top}px,0) scale(1.018)`;
}
function moveCatalogDrag(x,y,pointerId,touchId,e){
  const d=closetDrag;if(!d.card)return;
  if(pointerId!=null&&d.pointerId!==pointerId)return;
  if(touchId!=null&&d.touchId!==touchId)return;
  d.x=x;d.y=y;
  const dx=x-d.startX,dy=y-d.startY;
  if(!d.active){
    if(Math.hypot(dx,dy)>14){clearTimeout(d.timer);d.timer=null}
    return;
  }
  if(e?.cancelable)e.preventDefault();
  d.moved=true;positionCatalogGhost(x,y);
  d.pendingX=x;d.pendingY=y;
  if(!d.raf)d.raf=requestAnimationFrame(()=>{d.raf=null;autoScrollCatalogDrag(d.pendingY);updateCatalogDropTarget(d.pendingX,d.pendingY)});
}
function autoScrollCatalogDrag(y){
  const edge=105,speed=10;
  if(y<edge)window.scrollBy(0,-speed);
  else if(y>window.innerHeight-edge)window.scrollBy(0,speed);
}
function clearCatalogDropTarget(){
  $$('#catalogGrid .closet-drop-target').forEach(el=>el.classList.remove('closet-drop-target','drop-before','drop-after'));
  const o=closetDrag?.dropOutline;if(o)o.classList.remove('visible');
}
function updateCatalogDropTarget(x,y){
  const d=closetDrag,grid=$('#catalogGrid');if(!grid||!d.card)return;
  const cards=[...grid.querySelectorAll('.item-card[data-id]')].filter(c=>c!==d.card);
  clearCatalogDropTarget();
  if(!cards.length){d.targetId=d.originalId;d.targetAfter=false;return}

  // Pick the closest card center. This works consistently across rows/columns without
  // reflowing the grid during the gesture.
  let target=null,best=Infinity;
  for(const c of cards){
    const r=c.getBoundingClientRect();
    const cx=r.left+r.width/2,cy=r.top+r.height/2;
    const dist=Math.hypot(x-cx,y-cy);
    if(dist<best){best=dist;target=c}
  }
  if(!target)return;
  const r=target.getBoundingClientRect();
  const sameRow=y>=r.top-r.height*.22&&y<=r.bottom+r.height*.22;
  const after=sameRow ? x>r.left+r.width/2 : y>r.top+r.height/2;
  d.targetId=target.dataset.id;d.targetAfter=after;
  target.classList.add('closet-drop-target',after?'drop-after':'drop-before');
  if(d.dropOutline){const tr=target.getBoundingClientRect();Object.assign(d.dropOutline.style,{left:tr.left+'px',top:tr.top+'px',width:tr.width+'px',height:tr.height+'px'});d.dropOutline.classList.add('visible')}
}

function cleanupCatalogGhost(){
  const d=closetDrag;
  if(d?.raf){cancelAnimationFrame(d.raf);d.raf=null}
  if(d?.ghost){try{d.ghost.remove()}catch{}}
  if(d?.dropOutline){try{d.dropOutline.remove()}catch{}}
  clearCatalogDropTarget();
  $('#catalogGrid')?.classList.remove('closet-grid-reordering');
  document.body.classList.remove('closet-reordering');
  d?.card?.classList.remove('closet-drag-source');
}
async function finishCatalogDrag(pointerId,touchId,canceled=false,e){
  const d=closetDrag;if(!d.card)return;
  if(pointerId!=null&&d.pointerId!==pointerId)return;
  if(touchId!=null&&d.touchId!==touchId)return;
  clearTimeout(d.timer);
  if(d.active){
    if(e?.cancelable)e.preventDefault();
    suppressCatalogClickUntil=Date.now()+650;
    if(!canceled&&d.targetId&&d.originalId){
      ensureSettings();
      const categoryIds=state.items.filter(x=>x.category===d.category).map(x=>x.id);
      let order=(state.settings.closetOrder[d.category]||[]).filter(id=>categoryIds.includes(id));
      order=[...order,...categoryIds.filter(id=>!order.includes(id))];
      order=order.filter(id=>id!==d.originalId);
      let idx=order.indexOf(d.targetId);
      if(idx<0)idx=0;
      if(d.targetAfter)idx+=1;
      order.splice(Math.max(0,Math.min(order.length,idx)),0,d.originalId);
      state.settings.closetOrder[d.category]=[...new Set(order)];
      await saveState();
      renderCatalog();
      toast('Closet order saved');
    }
  }
  cleanupCatalogGhost();
  closetDrag={timer:null,pointerId:null,touchId:null,startX:0,startY:0,x:0,y:0,card:null,category:'',active:false,moved:false,ghost:null,dropOutline:null,placeholder:null,lastPlacement:'',raf:null,targetId:null,targetAfter:false,originalId:null,longPressed:false};
}

function itemCard(i){return`<article class="item-card" data-id="${i.id}"><div class="thumb">${i.photo?`<img src="${i.photo}" alt="${esc(i.type||i.category)}" draggable="false">`:`<div class="hanger">⌇</div>`}<span class="count-badge">${i.wears||0} wears</span></div><div class="card-body"><h4>${esc(i.type||i.category)}</h4><p>${i.color?`<span class="swatch" style="background:${colorHex(i.color)}"></span>${esc(i.color)} · `:''}${esc(i.brand||'No brand')}</p><p>${esc(i.size||'Size —')} · ${esc(i.pattern||'Solid')}</p></div></article>`}

function openWish(w=null){$('#wishId').value=w?.id||'';wishWorkingPhoto=w?.photo||'';showPhoto('#wishPhotoPreview','#wishPhotoPlaceholder',wishWorkingPhoto);$('#wishName').value=w?.name||'';$('#wishBrand').value=w?.brand||'';$('#wishPrice').value=w?.price||'';$('#wishLink').value=w?.link||'';$('#wishCategory').value=w?.category||'Tops';$('#wishColor').value=w?.color||'';$('#wishNotes').value=w?.notes||'';$('#deleteWishBtn').classList.toggle('hidden',!w);$('#wishDialog').showModal()}
function saveWish(){const wid=$('#wishId').value,old=state.wishlist.find(x=>x.id===wid),obj={id:wid||id(),photo:wishWorkingPhoto,name:$('#wishName').value.trim(),brand:$('#wishBrand').value.trim(),price:$('#wishPrice').value.trim(),link:$('#wishLink').value.trim(),category:$('#wishCategory').value,color:$('#wishColor').value,notes:$('#wishNotes').value.trim(),created:old?.created||Date.now()};if(wid)state.wishlist=state.wishlist.map(x=>x.id===wid?obj:x);else state.wishlist.unshift(obj);saveState();$('#wishDialog').close();toast('Wishlist saved')}
function deleteWish(){const wid=$('#wishId').value;if(!confirm('Remove this wishlist item?'))return;state.wishlist=state.wishlist.filter(x=>x.id!==wid);saveState();$('#wishDialog').close()}
function renderWishlist(){$('#wishlistGrid').innerHTML=state.wishlist.map(w=>`<article class="wish-card" data-id="${w.id}"><div class="wish-photo">${w.photo?`<img src="${w.photo}">`:'♡'}</div><div class="wish-body"><h4>${esc(w.name)}</h4><p>${esc(w.brand||'')} ${w.color?'· '+esc(w.color):''}</p><div class="price">${esc(w.price||'')}</div>${w.link?`<p>link saved ↗</p>`:''}</div></article>`).join('');$('#wishlistEmpty').classList.toggle('hidden',state.wishlist.length>0);$$('.wish-card').forEach(c=>c.onclick=()=>openWish(state.wishlist.find(w=>w.id===c.dataset.id)))}

function bindBoard(){
  $('#newBoardBtn').onclick=startNewOutfit;
  $('#clearBoardBtn').onclick=clearBoard;$('#saveOutfitBtn').onclick=requestSaveOutfit;$('#shareOutfitBtn').onclick=prepareOutfitShare;
  $('#confirmSaveOutfitBtn').onclick=saveOutfit;$('#cancelOutfitSaveBtn').onclick=()=>$('#outfitSaveDialog').close();$('#closeOutfitSaveBtn').onclick=()=>$('#outfitSaveDialog').close();
  $('#shareNowBtn').onclick=sharePreparedOutfit;
  $('#openShareImageBtn').onclick=openPreparedShareImage;
  $('#closeSharePreviewBtn').onclick=closeSharePreview;
  $$('.tabs-small button').forEach(b=>b.onclick=()=>{traySource=b.dataset.source;trayCategory='Recent';$$('.tabs-small button').forEach(x=>x.classList.toggle('active',x===b));renderPieceTray()});
  $('#decorateToggle').onclick=()=>{const panel=$('#creativeTools');const opening=panel.classList.contains('hidden');panel.classList.toggle('hidden');$('#decorateToggle').classList.toggle('active',opening);$('#decorateToggle').firstChild.textContent=opening?'− Decorate ':'＋ Decorate '};
  $('#addBoardTextBtn').onclick=()=>{const text=$('#boardTextInput').value.trim();if(!text)return toast('Type something first');addCreativeItem('text',text);$('#boardTextInput').value=''};
  $$('.sticker-row [data-sticker]').forEach(b=>b.onclick=()=>addCreativeItem('sticker',b.dataset.sticker));
  $$('.shape-row [data-shape]').forEach(b=>b.onclick=()=>addCreativeItem('shape',b.dataset.shape));
  $('#bringFrontBtn').onclick=()=>layerSelected('front');$('#sendBackBtn').onclick=()=>layerSelected('back');
  $('#rotateLeftBtn').onclick=()=>rotateSelected(-10);$('#rotateRightBtn').onclick=()=>rotateSelected(10);
  $('#duplicateBoardBtn').onclick=duplicateSelected;$('#deleteBoardBtn').onclick=deleteSelected;$('#undoBoardBtn').onclick=undoBoardDelete;
  $('#drawModeBtn').onclick=()=>{doodleMode=!doodleMode;$('#drawModeBtn').classList.toggle('active',doodleMode);$('#outfitBoard').classList.toggle('drawing',doodleMode);$('#boardHelp').textContent=doodleMode?'Doodle mode: draw directly on the board. Tap doodle again when finished.':'Select an object to move, resize, rotate, layer or delete it.'};
  const board=$('#outfitBoard');
  board.addEventListener('pointerdown',startDoodle);
  board.addEventListener('pointermove',moveDoodle);
  board.addEventListener('pointerup',endDoodle);
  board.addEventListener('pointercancel',endDoodle);
  board.addEventListener('pointerdown',e=>{if(!doodleMode&&e.target===board){selectedBoardUid=null;drawBoard()}});
}
function renderOutfits(){populatePortfolioFolderSelect($('#outfitFolder').value);renderPieceTray()}
function startNewOutfit(){editingOutfitId=null;boardUndoStack=[];clearBoard();$('#outfitName').value='';$('#outfitNotes').value='';populatePortfolioFolderSelect(state.settings.portfolioFolders[0]||'Everyday');$('#saveOutfitBtn').textContent='Save outfit';toast('New outfit board')}
function populatePortfolioFolderSelect(selected=''){
  ensureSettings();
  const folders=state.settings.portfolioFolders;
  const value=folders.includes(selected)?selected:(folders[0]||'Everyday');
  $('#outfitFolder').innerHTML=folders.map(f=>`<option${f===value?' selected':''}>${esc(f)}</option>`).join('');
}
function renderPieceTray(){
  ensureSettings();
  const all=traySource==='closet'?state.items:state.wishlist;
  const validRecent=(state.settings.boardRecent[traySource]||[]).filter(pid=>all.some(x=>x.id===pid));
  const cats=['Recent','All',...CATEGORIES.filter(c=>all.some(x=>x.category===c))];
  if(!cats.includes(trayCategory)||(trayCategory==='Recent'&&!validRecent.length))trayCategory=validRecent.length?'Recent':'All';
  $('#outfitCategoryFilter').innerHTML=cats.map(c=>`<button class="${trayCategory===c?'active':''}" data-traycat="${c}">${c}<span>${c==='Recent'?validRecent.length:c==='All'?all.length:all.filter(x=>x.category===c).length}</span></button>`).join('');
  $$('#outfitCategoryFilter [data-traycat]').forEach(b=>b.onclick=()=>{trayCategory=b.dataset.traycat;renderPieceTray()});
  let arr;
  if(trayCategory==='Recent')arr=validRecent.map(pid=>all.find(x=>x.id===pid)).filter(Boolean);
  else arr=all.filter(x=>trayCategory==='All'||x.category===trayCategory);
  $('#pieceTray').innerHTML=arr.map(x=>`<button class="tray-piece" data-id="${x.id}" data-source="${traySource}"><div class="mini-photo">${x.photo?`<img src="${x.photo}">`:'✣'}</div><small>${esc(x.type||x.name||x.category)}</small><em>${esc(x.category||'')}</em></button>`).join('')||`<p class="tray-empty">${trayCategory==='Recent'?'Recently used pieces will appear here.':'No pieces in this category yet.'}</p>`;
  $$('.tray-piece').forEach(b=>b.onclick=()=>addBoardPiece(b.dataset.id,b.dataset.source));
}
function nextZ(){return Math.max(0,...boardItems.map(x=>Number(x.z)||0))+1}
function addBoardPiece(pid,source){const src=source==='closet'?state.items:state.wishlist,obj=src.find(x=>x.id===pid);if(!obj)return;const bi={uid:id(),kind:'piece',source,id:pid,x:28+Math.random()*120,y:42+Math.random()*100,w:146,h:172,rotation:0,z:nextZ()};boardItems.push(bi);selectedBoardUid=bi.uid;ensureSettings();state.settings.boardRecent[source]=[pid,...state.settings.boardRecent[source].filter(x=>x!==pid)].slice(0,18);persistState(state).catch(()=>{});drawBoard();renderPieceTray()}
function addCreativeItem(kind,value){const defaults=kind==='text'?{w:180,h:70}:{w:90,h:90};const bi={uid:id(),kind,value,x:60+Math.random()*90,y:70+Math.random()*80,...defaults,rotation:kind==='shape'&&value==='tape'?-8:0,z:nextZ()};if(kind==='shape'&&value==='line'){bi.w=170;bi.h=35}boardItems.push(bi);selectedBoardUid=bi.uid;drawBoard()}
function normalizeBoardItem(b){b.kind=b.kind||'piece';b.w=Number(b.w)||132;b.h=Number(b.h)||156;b.rotation=Number(b.rotation)||0;b.z=Number(b.z)||1;return b}
function boardItemContent(b){
  if(b.kind==='piece'){const obj=(b.source==='closet'?state.items:state.wishlist).find(x=>x.id===b.id);if(!obj)return '';return obj.photo?`<img src="${obj.photo}" alt="">`:`<div class="piece-fallback">${esc(obj.type||obj.name||'piece')}</div>`}
  if(b.kind==='text')return `<div class="board-text">${esc(b.value)}</div>`;
  if(b.kind==='sticker')return `<div class="board-sticker">${esc(b.value)}</div>`;
  if(b.kind==='shape')return `<div class="board-shape shape-${esc(b.value)}"></div>`;
  if(b.kind==='doodle')return `<svg class="doodle-svg" viewBox="0 0 ${Math.max(1,b.w)} ${Math.max(1,b.h)}" preserveAspectRatio="none"><polyline points="${esc(b.points||'')}" fill="none" vector-effect="non-scaling-stroke"/></svg>`;
  return '';
}
function drawBoard(){
  const board=$('#outfitBoard');board.querySelectorAll('.board-piece').forEach(x=>x.remove());const tip=board.querySelector('.board-tip');tip.style.display=boardItems.length?'none':'flex';
  boardItems.map(normalizeBoardItem).sort((a,b)=>a.z-b.z).forEach(b=>{const content=boardItemContent(b);if(!content)return;const el=document.createElement('div');el.className='board-piece kind-'+b.kind+(selectedBoardUid===b.uid?' selected':'');el.dataset.uid=b.uid;el.style.left=b.x+'px';el.style.top=b.y+'px';el.style.width=b.w+'px';el.style.height=b.h+'px';el.style.zIndex=b.z;el.style.transform=`rotate(${b.rotation}deg)`;el.innerHTML=`<div class="board-object">${content}</div><button type="button" class="board-remove-handle" aria-label="Remove from board">×</button><button type="button" class="resize-handle" aria-label="Resize">↘</button>`;makeBoardInteractive(el,b);board.appendChild(el)});
  const selected=boardItems.find(x=>x.uid===selectedBoardUid);updateBoardEditControls(!!selected);if(selected&&!doodleMode)$('#boardHelp').textContent='Drag gently to move. Pinch to resize + rotate. Use Front / Back for layering.';updateUndoButton();
}
function makeBoardInteractive(el,model){
  const pointers=new Map();let gesture=null;
  const board=$('#outfitBoard');
  function clampPosition(){model.x=Math.max(-model.w*.55,Math.min(board.clientWidth-model.w*.45,model.x));model.y=Math.max(-model.h*.55,Math.min(board.clientHeight-model.h*.45,model.y))}
  function twoPointStats(){const pts=[...pointers.values()];if(pts.length<2)return null;const a=pts[0],b=pts[1],dx=b.x-a.x,dy=b.y-a.y;return{dist:Math.hypot(dx,dy),angle:Math.atan2(dy,dx)*180/Math.PI,cx:(a.x+b.x)/2,cy:(a.y+b.y)/2}}
  el.addEventListener('pointerdown',e=>{if(doodleMode)return;e.stopPropagation();if(e.target.classList.contains('board-remove-handle')){e.preventDefault();removeBoardItem(model.uid);return}selectedBoardUid=model.uid;model.z=model.z||nextZ();drawSelectionOnly(model.uid);el.setPointerCapture(e.pointerId);pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(e.target.classList.contains('resize-handle')){gesture={mode:'resize',sx:e.clientX,sy:e.clientY,w:model.w,h:model.h};return}if(pointers.size===1){gesture={mode:'drag',sx:e.clientX,sy:e.clientY,x:model.x,y:model.y}}else if(pointers.size===2){const st=twoPointStats();gesture={mode:'pinch',start:st,w:model.w,h:model.h,rotation:model.rotation,x:model.x,y:model.y}}});
  el.addEventListener('pointermove',e=>{if(!pointers.has(e.pointerId)||!gesture)return;e.preventDefault();pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(gesture.mode==='resize'){const dx=e.clientX-gesture.sx,dy=e.clientY-gesture.sy,delta=((dx+dy)/2)*.78,ratio=model.h/model.w;model.w=Math.max(45,Math.min(300,gesture.w+delta));model.h=Math.max(40,Math.min(340,model.w*ratio));}else if(gesture.mode==='drag'&&pointers.size===1){model.x=gesture.x+(e.clientX-gesture.sx)*BOARD_MOVE_SENSITIVITY;model.y=gesture.y+(e.clientY-gesture.sy)*BOARD_MOVE_SENSITIVITY;clampPosition()}else if(pointers.size>=2){if(gesture.mode!=='pinch'){const st=twoPointStats();gesture={mode:'pinch',start:st,w:model.w,h:model.h,rotation:model.rotation,x:model.x,y:model.y}}const st=twoPointStats(),rawScale=st.dist/Math.max(1,gesture.start.dist),scale=Math.max(.52,Math.min(2.15,1+(rawScale-1)*BOARD_PINCH_SCALE_SENSITIVITY));model.w=Math.max(45,Math.min(320,gesture.w*scale));model.h=Math.max(40,Math.min(360,gesture.h*scale));model.rotation=gesture.rotation+(st.angle-gesture.start.angle)*BOARD_PINCH_ROTATION_SENSITIVITY;model.x=gesture.x+(st.cx-gesture.start.cx)*BOARD_PINCH_MOVE_SENSITIVITY;model.y=gesture.y+(st.cy-gesture.start.cy)*BOARD_PINCH_MOVE_SENSITIVITY;clampPosition()}el.style.left=model.x+'px';el.style.top=model.y+'px';el.style.width=model.w+'px';el.style.height=model.h+'px';el.style.transform=`rotate(${model.rotation}deg)`});
  function release(e){pointers.delete(e.pointerId);if(pointers.size===1){const p=[...pointers.values()][0];gesture={mode:'drag',sx:p.x,sy:p.y,x:model.x,y:model.y}}else if(!pointers.size)gesture=null}
  el.addEventListener('pointerup',release);el.addEventListener('pointercancel',release);
}
function updateBoardEditControls(hasSelection){const bar=$('#boardEditbar');if(!bar)return;bar.classList.toggle('has-selection',hasSelection);['sendBackBtn','bringFrontBtn','rotateLeftBtn','rotateRightBtn','duplicateBoardBtn','deleteBoardBtn'].forEach(id=>{const btn=$('#'+id);if(btn)btn.disabled=!hasSelection})}
function drawSelectionOnly(uid){$$('#outfitBoard .board-piece').forEach(el=>el.classList.toggle('selected',el.dataset.uid===uid));updateBoardEditControls(!!uid);updateUndoButton()}
function selectedBoardItem(){return boardItems.find(x=>x.uid===selectedBoardUid)}
function layerSelected(where){const b=selectedBoardItem();if(!b)return toast('Select something on the board');if(where==='front')b.z=nextZ();else b.z=Math.min(0,...boardItems.filter(x=>x!==b).map(x=>Number(x.z)||0))-1;drawBoard()}
function rotateSelected(delta){const b=selectedBoardItem();if(!b)return toast('Select something on the board');b.rotation=(Number(b.rotation)||0)+delta;drawBoard()}
function duplicateSelected(){const b=selectedBoardItem();if(!b)return toast('Select something on the board');const copy={...b,uid:id(),x:b.x+18,y:b.y+18,z:nextZ()};boardItems.push(copy);selectedBoardUid=copy.uid;drawBoard()}
function updateUndoButton(){const b=$('#undoBoardBtn');if(!b)return;b.disabled=!boardUndoStack.length;b.classList.toggle('undo-ready',!!boardUndoStack.length)}
function removeBoardItem(uid){const idx=boardItems.findIndex(x=>x.uid===uid);if(idx<0)return;const removed={item:{...boardItems[idx]},index:idx};boardItems.splice(idx,1);boardUndoStack.push(removed);if(boardUndoStack.length>12)boardUndoStack.shift();if(selectedBoardUid===uid)selectedBoardUid=null;drawBoard();updateUndoButton();toast('Item removed — Undo is available')}
function deleteSelected(){if(!selectedBoardUid)return toast('Select something on the board');removeBoardItem(selectedBoardUid)}
function undoBoardDelete(){const last=boardUndoStack.pop();if(!last)return toast('Nothing to undo');const idx=Math.max(0,Math.min(boardItems.length,last.index));boardItems.splice(idx,0,last.item);selectedBoardUid=last.item.uid;drawBoard();updateUndoButton();toast('Item restored')}
function clearBoard(){boardItems=[];boardUndoStack=[];selectedBoardUid=null;doodleMode=false;$('#drawModeBtn')?.classList.remove('active');$('#outfitBoard')?.classList.remove('drawing');drawBoard();updateUndoButton()}
function localBoardPoint(e,board){const r=board.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top}}
function startDoodle(e){if(!doodleMode||e.target.closest('.board-piece'))return;e.preventDefault();const board=$('#outfitBoard'),p=localBoardPoint(e,board);activeDoodle={pointerId:e.pointerId,points:[p]};board.setPointerCapture(e.pointerId)}
function moveDoodle(e){if(!doodleMode||!activeDoodle||activeDoodle.pointerId!==e.pointerId)return;e.preventDefault();activeDoodle.points.push(localBoardPoint(e,$('#outfitBoard')))}
function endDoodle(e){if(!activeDoodle||activeDoodle.pointerId!==e.pointerId)return;const pts=activeDoodle.points;activeDoodle=null;if(pts.length<2)return;const minx=Math.min(...pts.map(p=>p.x)),maxx=Math.max(...pts.map(p=>p.x)),miny=Math.min(...pts.map(p=>p.y)),maxy=Math.max(...pts.map(p=>p.y));const pad=8,w=Math.max(24,maxx-minx+pad*2),h=Math.max(24,maxy-miny+pad*2);const points=pts.map(p=>`${(p.x-minx+pad).toFixed(1)},${(p.y-miny+pad).toFixed(1)}`).join(' ');const b={uid:id(),kind:'doodle',points,x:minx-pad,y:miny-pad,w,h,rotation:0,z:nextZ()};boardItems.push(b);selectedBoardUid=b.uid;drawBoard()}

async function imageFromSrc(src){
  return new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=reject;img.src=src});
}
function roundRectPath(ctx,x,y,w,h,r){r=Math.min(r,w/2,h/2);ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath()}
function parseDoodlePoints(points=''){return points.trim().split(/\s+/).map(pair=>pair.split(',').map(Number)).filter(p=>p.length===2&&p.every(Number.isFinite))}
async function makeOutfitShareBlob(){
  if(!boardItems.length)throw new Error('empty');
  const board=$('#outfitBoard'),sourceW=board.clientWidth||390,sourceH=board.clientHeight||420;
  const W=1080,H=1200,pad=66,header=130,footer=82,drawW=W-pad*2,drawH=H-header-footer;
  const sx=drawW/sourceW,sy=drawH/sourceH;
  const c=document.createElement('canvas');c.width=W;c.height=H;const ctx=c.getContext('2d');
  ctx.fillStyle='#f7f0df';ctx.fillRect(0,0,W,H);
  ctx.fillStyle='#efe9d9';roundRectPath(ctx,pad,header,drawW,drawH,42);ctx.fill();
  ctx.save();roundRectPath(ctx,pad,header,drawW,drawH,42);ctx.clip();
  ctx.strokeStyle='rgba(108,81,66,.10)';ctx.lineWidth=2;const grid=24*((sx+sy)/2);
  for(let x=pad;x<=pad+drawW;x+=grid){ctx.beginPath();ctx.moveTo(x,header);ctx.lineTo(x,header+drawH);ctx.stroke()}
  for(let y=header;y<=header+drawH;y+=grid){ctx.beginPath();ctx.moveTo(pad,y);ctx.lineTo(pad+drawW,y);ctx.stroke()}
  const pieces=boardItems.map(x=>normalizeBoardItem({...x})).sort((a,b)=>a.z-b.z);
  for(const b of pieces){
    const x=pad+b.x*sx,y=header+b.y*sy,w=b.w*sx,h=b.h*sy,cx=x+w/2,cy=y+h/2;
    ctx.save();ctx.translate(cx,cy);ctx.rotate((b.rotation||0)*Math.PI/180);ctx.translate(-w/2,-h/2);
    if(b.kind==='piece'){
      const obj=(b.source==='closet'?state.items:state.wishlist).find(o=>o.id===b.id);
      if(obj?.photo){try{const img=await imageFromSrc(obj.photo);const ar=img.naturalWidth/img.naturalHeight,box=w/h;let dw=w,dh=h,dx=0,dy=0;if(ar>box){dh=w/ar;dy=(h-dh)/2}else{dw=h*ar;dx=(w-dw)/2}ctx.drawImage(img,dx,dy,dw,dh)}catch{}}
      else if(obj){ctx.fillStyle='#6c5142';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`${Math.max(18,24*sx)}px Georgia`;ctx.fillText(obj.type||obj.name||'piece',w/2,h/2,w*.9)}
    } else if(b.kind==='text'){
      ctx.fillStyle='#7d3547';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`italic ${Math.max(24,38*sx)}px Georgia`;wrapCanvasText(ctx,b.value||'',w/2,h/2,w*.95,Math.max(30,43*sx));
    } else if(b.kind==='sticker'){
      ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`${Math.max(38,72*sx)}px system-ui, Apple Color Emoji`;ctx.fillText(b.value||'✨',w/2,h/2,w);
    } else if(b.kind==='shape'){
      if(b.value==='circle'){ctx.strokeStyle='#4d8e8a';ctx.lineWidth=Math.max(5,8*sx);ctx.beginPath();ctx.ellipse(w/2,h/2,Math.max(2,w/2-7),Math.max(2,h/2-7),0,0,Math.PI*2);ctx.stroke()}
      if(b.value==='line'){ctx.strokeStyle='#7d3547';ctx.lineWidth=Math.max(6,10*sx);ctx.lineCap='round';ctx.beginPath();ctx.moveTo(5,h/2);ctx.lineTo(w-5,h/2);ctx.stroke()}
      if(b.value==='tape'){ctx.fillStyle='rgba(198,163,78,.48)';ctx.fillRect(0,h*.08,w,h*.84)}
    } else if(b.kind==='doodle'){
      const pts=parseDoodlePoints(b.points||'');if(pts.length){ctx.strokeStyle='#6c5142';ctx.lineWidth=Math.max(4,6*sx);ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();pts.forEach((p,i)=>{const px=p[0]*w/b.w,py=p[1]*h/b.h;i?ctx.lineTo(px,py):ctx.moveTo(px,py)});ctx.stroke()}
    }
    ctx.restore();
  }
  ctx.restore();
  ctx.fillStyle='#2e2a24';ctx.textAlign='left';ctx.textBaseline='alphabetic';ctx.font='600 48px Georgia';const title=($('#outfitName').value.trim()||'My outfit');ctx.fillText(title,pad,74,W-pad*2);
  ctx.fillStyle='#7d3547';ctx.font='italic 27px Georgia';ctx.fillText((state.settings?.appName||DEFAULT_APP_NAME),pad,108,W-pad*2);
  const notes=$('#outfitNotes').value.trim();if(notes){ctx.fillStyle='#6c5142';ctx.font='24px system-ui';ctx.textAlign='center';ctx.fillText(notes,W/2,H-31,W-pad*2)}
  return new Promise((resolve,reject)=>c.toBlob(b=>b?resolve(b):reject(new Error('image export failed')),'image/jpeg',.92));
}
function wrapCanvasText(ctx,text,x,y,maxWidth,lineHeight){const words=String(text).split(/\s+/),lines=[];let line='';for(const word of words){const test=line?line+' '+word:word;if(ctx.measureText(test).width>maxWidth&&line){lines.push(line);line=word}else line=test}if(line)lines.push(line);const start=y-(lines.length-1)*lineHeight/2;lines.slice(0,4).forEach((l,i)=>ctx.fillText(l,x,start+i*lineHeight,maxWidth))}
async function prepareOutfitShare(){
  if(!boardItems.length)return toast('Add something to the board first');
  const btn=$('#shareOutfitBtn');btn.disabled=true;const old=btn.textContent;btn.textContent='Creating preview…';
  try{
    if(pendingShareUrl){URL.revokeObjectURL(pendingShareUrl);pendingShareUrl=''}
    pendingShareBlob=await makeOutfitShareBlob();
    const safe=(($('#outfitName').value.trim()||'outfit').replace(/[^a-z0-9]+/gi,'-').replace(/^-|-$/g,'').toLowerCase()||'outfit');
    pendingShareFileName=`${safe}.jpg`;
    pendingShareUrl=URL.createObjectURL(pendingShareBlob);
    $('#sharePreviewImage').src=pendingShareUrl;
    $('#sharePreviewTitle').textContent=$('#outfitName').value.trim()||'My outfit';
    $('#sharePreviewStatus').textContent=navigator.share?'Image ready. Tap “Share now” to open the iPhone share sheet.':'Image ready. Tap “Open image” and use the browser share button.';
    $('#shareNowBtn').classList.toggle('hidden',!navigator.share);
    $('#sharePreviewDialog').showModal();
  }catch(err){console.error(err);toast('Could not create the outfit image')}
  finally{btn.disabled=false;btn.textContent=old}
}
async function sharePreparedOutfit(){
  if(!pendingShareBlob)return toast('Create the preview again');
  const btn=$('#shareNowBtn');btn.disabled=true;const old=btn.textContent;btn.textContent='Opening share…';
  try{
    const file=new File([pendingShareBlob],pendingShareFileName,{type:'image/jpeg'});
    if(navigator.canShare&&!navigator.canShare({files:[file]}))throw new Error('file sharing unsupported');
    await navigator.share({title:$('#outfitName').value.trim()||'Outfit',text:'Check out this outfit board!',files:[file]});
  }catch(err){
    if(err?.name!=='AbortError'){
      console.warn('Native file share failed',err);
      $('#sharePreviewStatus').textContent='The iPhone share sheet could not accept the file here. Tap “Open image” below, then use Share from Safari.';
      toast('Try Open image instead');
    }
  }finally{btn.disabled=false;btn.textContent=old}
}
function openPreparedShareImage(){
  if(!pendingShareUrl)return toast('Create the preview again');
  // This runs directly from the user tap, so iOS is much less likely to block it.
  const w=window.open(pendingShareUrl,'_blank');
  if(!w){
    const a=document.createElement('a');a.href=pendingShareUrl;a.target='_blank';a.rel='noopener';document.body.appendChild(a);a.click();a.remove();
  }
  $('#sharePreviewStatus').textContent='The image should open by itself. Use the iPhone Share button there, or touch and hold the image to save/copy it.';
}
function closeSharePreview(){
  $('#sharePreviewDialog').close();
  // Keep the object URL alive while the dialog is open only; the blob itself remains cached for another share attempt.
  if(pendingShareUrl){URL.revokeObjectURL(pendingShareUrl);pendingShareUrl='';}
  $('#sharePreviewImage').removeAttribute('src');
}


function requestSaveOutfit(){if(!boardItems.length)return toast('Add at least one piece');ensureSettings();const existing=editingOutfitId?state.outfits.find(x=>x.id===editingOutfitId):null;populatePortfolioFolderSelect(existing?.folder||state.settings.portfolioFolders[0]||'Everyday');$('#confirmSaveOutfitBtn').textContent=editingOutfitId?'Update here':'Save here';$('#outfitSaveDialog').showModal()}
async function saveOutfit(){if(!boardItems.length){$('#outfitSaveDialog').close();return toast('Add at least one piece')}const name=$('#outfitName').value.trim()||'Untitled look';const board=$('#outfitBoard');ensureSettings();const snapshot={name,notes:$('#outfitNotes').value.trim(),folder:$('#outfitFolder').value||state.settings.portfolioFolders[0]||'Everyday',favorite:editingOutfitId?(state.outfits.find(x=>x.id===editingOutfitId)?.favorite||false):false,pieces:boardItems.map(x=>({...x})),boardWidth:board.clientWidth,boardHeight:board.clientHeight};if(editingOutfitId){const existing=state.outfits.find(x=>x.id===editingOutfitId);if(existing){Object.assign(existing,snapshot,{updated:Date.now()})}else editingOutfitId=null}if(!editingOutfitId){const created={id:id(),...snapshot,created:Date.now()};state.outfits.unshift(created);editingOutfitId=created.id}const ok=await saveState();if(ok===false)return toast('Could not save — please try again');$('#outfitSaveDialog').close();renderSavedOutfits();$('#saveOutfitBtn').textContent='Update outfit';toast('Outfit saved to '+snapshot.folder)}
function renderMiniPiece(p,o){
  p=normalizeBoardItem({...p});const sw=o.boardWidth||390,sh=o.boardHeight||420;
  const left=Math.max(-10,Math.min(100,(p.x/sw)*100)),top=Math.max(-10,Math.min(100,(p.y/sh)*100));
  const width=Math.max(8,Math.min(70,(p.w/sw)*100)),height=Math.max(8,Math.min(70,(p.h/sh)*100));
  const style=`left:${left}%;top:${top}%;width:${width}%;height:${height}%;z-index:${p.z||1};transform:rotate(${p.rotation||0}deg)`;
  if(p.kind==='piece'){const obj=(p.source==='closet'?state.items:state.wishlist).find(x=>x.id===p.id);return obj?.photo?`<img class="portfolio-piece" src="${obj.photo}" style="${style}">`:''}
  if(p.kind==='text')return `<span class="portfolio-deco mini-deco" style="${style}">${esc(p.value)}</span>`;
  if(p.kind==='sticker')return `<span class="portfolio-deco mini-sticker" style="${style}">${esc(p.value)}</span>`;
  if(p.kind==='shape')return `<span class="portfolio-shape shape-${esc(p.value)}" style="${style}"></span>`;
  return '';
}
function renderSavedOutfits(){
  ensureSettings();
  const known=new Set(state.settings.portfolioFolders);
  const legacy=state.outfits.map(o=>o.folder||'Everyday').filter(f=>!known.has(f));
  if(legacy.length){state.settings.portfolioFolders.push(...new Set(legacy));state.settings.portfolioFolders=state.settings.portfolioFolders.slice(0,12)}
  const folders=['All','Favorites',...state.settings.portfolioFolders];
  if(!folders.includes(portfolioFilter))portfolioFilter='All';
  $('#portfolioTabs').innerHTML=folders.map(f=>`<button class="portfolio-tab ${portfolioFilter===f?'active':''}" data-portfolio="${esc(f)}">${f==='Favorites'?'★ ':''}${esc(f)}<span>${f==='All'?state.outfits.length:f==='Favorites'?state.outfits.filter(o=>o.favorite).length:state.outfits.filter(o=>(o.folder||'Everyday')===f).length}</span></button>`).join('');
  $$('#portfolioTabs [data-portfolio]').forEach(b=>b.onclick=()=>{portfolioFilter=b.dataset.portfolio;renderSavedOutfits()});
  const shown=state.outfits.filter(o=>portfolioFilter==='All'||(portfolioFilter==='Favorites'?o.favorite:(o.folder||'Everyday')===portfolioFilter));
  $('#outfitCount').textContent=`${shown.length} ${shown.length===1?'look':'looks'}`;
  $('#savedOutfits').innerHTML=shown.map(o=>`<article class="outfit-card portfolio-card" data-id="${o.id}"><button class="favorite-outfit ${o.favorite?'active':''}" data-fav="${o.id}" aria-label="Favorite">${o.favorite?'★':'☆'}</button><div class="folder-label">${esc(o.folder||'Everyday')}</div><div class="outfit-mini">${o.pieces.slice().sort((a,b)=>(a.z||0)-(b.z||0)).map(p=>renderMiniPiece(p,o)).join('')}</div><h4>${esc(o.name)}</h4><p>${o.pieces.filter(p=>(p.kind||'piece')==='piece').length} pieces · ${new Date(o.updated||o.created).toLocaleDateString()}</p></article>`).join('')||'<div class="portfolio-empty">No looks in this folder yet. Create one on the Board.</div>';
  $$('.outfit-card').forEach(c=>c.onclick=e=>{if(e.target.closest('.favorite-outfit'))return;viewOutfit(c.dataset.id)});
  $$('.favorite-outfit').forEach(b=>b.onclick=async e=>{e.stopPropagation();const o=state.outfits.find(x=>x.id===b.dataset.fav);if(!o)return;o.favorite=!o.favorite;await saveState();renderSavedOutfits();toast(o.favorite?'Added to favorites':'Removed from favorites')});
}
function loadOutfitForEditing(oid){const o=state.outfits.find(x=>x.id===oid);if(!o)return;editingOutfitId=oid;boardUndoStack=[];boardItems=(o.pieces||[]).map(p=>normalizeBoardItem({...p,uid:p.uid||id()}));selectedBoardUid=null;doodleMode=false;$('#drawModeBtn')?.classList.remove('active');$('#outfitBoard')?.classList.remove('drawing');$('#outfitName').value=o.name||'';$('#outfitNotes').value=o.notes||'';populatePortfolioFolderSelect(o.folder||state.settings.portfolioFolders[0]);$('#saveOutfitBtn').textContent='Update outfit';drawBoard();showScreen('outfits');setTimeout(()=>$('#outfitBoard').scrollIntoView({behavior:'smooth',block:'center'}),80);toast('Outfit loaded — keep editing')}
function renderSnapshotPiece(board,p,scaleX,scaleY){p=normalizeBoardItem({...p});const el=document.createElement('div');el.className='snapshot-piece kind-'+p.kind;el.style.left=(p.x*scaleX)+'px';el.style.top=(p.y*scaleY)+'px';el.style.width=(p.w*scaleX)+'px';el.style.height=(p.h*scaleY)+'px';el.style.zIndex=p.z;el.style.transform=`rotate(${p.rotation}deg)`;el.innerHTML=boardItemContent(p);board.appendChild(el)}
function viewOutfit(oid){const o=state.outfits.find(x=>x.id===oid);if(!o)return;viewingOutfitId=oid;$('#viewOutfitName').textContent=o.name;$('#favoriteViewedOutfitBtn').textContent=(o.favorite?'★':'☆')+' Favorite';$('#viewOutfitNotes').textContent=o.notes||'No notes yet.';const board=$('#viewOutfitBoard');board.innerHTML='';$('#outfitViewDialog').showModal();requestAnimationFrame(()=>{const sourceW=o.boardWidth||390,sourceH=o.boardHeight||420,scaleX=(board.clientWidth||390)/sourceW,scaleY=(board.clientHeight||350)/sourceH;o.pieces.slice().sort((a,b)=>(a.z||0)-(b.z||0)).forEach(p=>renderSnapshotPiece(board,p,scaleX,scaleY))})}
function deleteOutfit(){if(!viewingOutfitId||!confirm('Delete this saved outfit?'))return;state.outfits=state.outfits.filter(x=>x.id!==viewingOutfitId);saveState();$('#outfitViewDialog').close();renderSavedOutfits()}
function favoriteViewedOutfit(){const o=state.outfits.find(x=>x.id===viewingOutfitId);if(!o)return;o.favorite=!o.favorite;saveState();$('#favoriteViewedOutfitBtn').textContent=(o.favorite?'★':'☆')+' Favorite';renderSavedOutfits()}
function editViewedOutfit(){const oid=viewingOutfitId;$('#outfitViewDialog').close();loadOutfitForEditing(oid)}
async function shareViewedOutfit(){const o=state.outfits.find(x=>x.id===viewingOutfitId);if(!o)return;$('#outfitViewDialog').close();const saved={items:boardItems,edit:editingOutfitId,name:$('#outfitName').value,notes:$('#outfitNotes').value,folder:$('#outfitFolder').value};boardItems=(o.pieces||[]).map(p=>normalizeBoardItem({...p}));editingOutfitId=o.id;$('#outfitName').value=o.name||'';$('#outfitNotes').value=o.notes||'';try{await prepareOutfitShare()}finally{boardItems=saved.items;editingOutfitId=saved.edit;$('#outfitName').value=saved.name;$('#outfitNotes').value=saved.notes;populatePortfolioFolderSelect(saved.folder)}}

function renderPortfolioFolderEditor(){
  ensureSettings();
  const box=$('#portfolioFolderEditor');if(!box)return;
  box.innerHTML=state.settings.portfolioFolders.map((f,i)=>`<div class="folder-edit-row" data-index="${i}"><input value="${esc(f)}" maxlength="24" aria-label="Folder name"><div class="folder-row-actions"><button type="button" class="folder-up" ${i===0?'disabled':''}>↑</button><button type="button" class="folder-down" ${i===state.settings.portfolioFolders.length-1?'disabled':''}>↓</button><button type="button" class="folder-delete" ${state.settings.portfolioFolders.length===1?'disabled':''}>×</button></div></div>`).join('');
  $$('.folder-edit-row input').forEach(inp=>inp.onchange=()=>renamePortfolioFolder(Number(inp.closest('.folder-edit-row').dataset.index),inp.value));
  $$('.folder-up').forEach(b=>b.onclick=()=>movePortfolioFolder(Number(b.closest('.folder-edit-row').dataset.index),-1));
  $$('.folder-down').forEach(b=>b.onclick=()=>movePortfolioFolder(Number(b.closest('.folder-edit-row').dataset.index),1));
  $$('.folder-delete').forEach(b=>b.onclick=()=>deletePortfolioFolder(Number(b.closest('.folder-edit-row').dataset.index)));
}
async function renamePortfolioFolder(index,value){ensureSettings();const old=state.settings.portfolioFolders[index],name=String(value||'').trim();if(!name){renderPortfolioFolderEditor();return toast('Folder name cannot be empty')}if(state.settings.portfolioFolders.some((x,i)=>i!==index&&x.toLowerCase()===name.toLowerCase())){renderPortfolioFolderEditor();return toast('That folder already exists')}state.settings.portfolioFolders[index]=name;state.outfits.forEach(o=>{if((o.folder||'Everyday')===old)o.folder=name});await saveState();populatePortfolioFolderSelect(name);renderPortfolioFolderEditor();toast('Folder renamed')}
async function movePortfolioFolder(index,dir){const j=index+dir;if(j<0||j>=state.settings.portfolioFolders.length)return;[state.settings.portfolioFolders[index],state.settings.portfolioFolders[j]]=[state.settings.portfolioFolders[j],state.settings.portfolioFolders[index]];await saveState();renderPortfolioFolderEditor()}
async function deletePortfolioFolder(index){if(state.settings.portfolioFolders.length<=1)return;const old=state.settings.portfolioFolders[index],replacement=state.settings.portfolioFolders.find((_,i)=>i!==index)||'Everyday';if(!confirm(`Remove “${old}”? Saved looks in it will move to “${replacement}”.`))return;state.settings.portfolioFolders.splice(index,1);state.outfits.forEach(o=>{if((o.folder||'Everyday')===old)o.folder=replacement});if(portfolioFilter===old)portfolioFilter='All';await saveState();populatePortfolioFolderSelect(replacement);renderPortfolioFolderEditor();toast('Folder removed')}
async function addPortfolioFolder(){ensureSettings();const input=$('#newPortfolioFolder'),name=input.value.trim();if(!name)return toast('Enter a folder name');if(state.settings.portfolioFolders.length>=12)return toast('Up to 12 folders');if(state.settings.portfolioFolders.some(x=>x.toLowerCase()===name.toLowerCase()))return toast('That folder already exists');state.settings.portfolioFolders.push(name);input.value='';await saveState();populatePortfolioFolderSelect(name);renderPortfolioFolderEditor();toast('Folder added')}

function openWear(){if(!state.items.length)return toast('Add closet pieces first');$('#wearDate').value=new Date().toISOString().slice(0,10);$('#wearNotes').value='';$('#wearPicker').innerHTML=state.items.map(i=>`<button type="button" class="wear-option" data-id="${i.id}">${i.photo?`<img src="${i.photo}">`:'✣'}<small>${esc(i.type||i.category)}</small></button>`).join('');$$('.wear-option').forEach(b=>b.onclick=()=>b.classList.toggle('selected'));$('#wearDialog').showModal()}
function saveWear(){const ids=$$('.wear-option.selected').map(b=>b.dataset.id);if(!ids.length)return toast('Select at least one item');const date=$('#wearDate').value;const existing=state.journal.find(j=>j.date===date);if(existing){existing.itemIds=ids;existing.notes=$('#wearNotes').value.trim()}else state.journal.unshift({id:id(),date,itemIds:ids,notes:$('#wearNotes').value.trim()});state.items.forEach(i=>i.wears=state.journal.reduce((n,j)=>n+j.itemIds.filter(x=>x===i.id).length,0));saveState();$('#wearDialog').close();toast('Journal updated')}
function renderJournal(){
  const wears=state.items.map(i=>({...i,w:state.journal.reduce((n,j)=>n+j.itemIds.filter(x=>x===i.id).length,0)})).sort((a,b)=>b.w-a.w);const total=wears.reduce((n,i)=>n+i.w,0);$('#totalWears').textContent=total;const mw=wears[0]?.w?wears[0]:null;$('#mostWorn').textContent=mw?(mw.type||mw.category):'—';$('#mostWornMeta').textContent=mw?`${mw.w} wears · ${mw.color||'color not set'}`:'No wear data yet';
  const colorCounts={};state.journal.forEach(j=>j.itemIds.forEach(x=>{const i=state.items.find(z=>z.id===x);if(i?.color)colorCounts[i.color]=(colorCounts[i.color]||0)+1}));const fav=Object.entries(colorCounts).sort((a,b)=>b[1]-a[1])[0];$('#favColor').textContent=fav?.[0]||'—';$('#favColorMeta').textContent=fav?`${fav[1]} item-wears`:'No wear data yet';const sn=seasonForDate();$('#seasonName').textContent=sn;$('#seasonWears').textContent=state.journal.filter(j=>seasonForDate(new Date(j.date+'T12:00:00'))===sn).reduce((n,j)=>n+j.itemIds.length,0);
  $('#journalCount').textContent=`${state.journal.length} ${state.journal.length===1?'day':'days'}`;$('#journalList').innerHTML=state.journal.slice().sort((a,b)=>b.date.localeCompare(a.date)).map(j=>{const d=new Date(j.date+'T12:00:00');return`<article class="journal-row"><div class="journal-date"><small>${d.toLocaleString('en',{month:'short'}).toUpperCase()}</small><strong>${d.getDate()}</strong></div><div class="journal-thumbs">${j.itemIds.slice(0,6).map(x=>{const i=state.items.find(z=>z.id===x);return i?.photo?`<img src="${i.photo}">`:''}).join('')}</div><p>${esc(j.notes||`${j.itemIds.length} items`)}</p></article>`}).join('')||'<div class="empty-state compact"><p>No journal entries yet.</p></div>';drawDonut($('#colorChart'),colorCounts);const seasonCounts={Winter:0,Spring:0,Summer:0,Fall:0};state.journal.forEach(j=>seasonCounts[seasonForDate(new Date(j.date+'T12:00:00'))]++);drawBars($('#seasonChart'),seasonCounts)
}
function drawDonut(canvas,data){const ctx=canvas.getContext('2d'),w=canvas.width,h=canvas.height;ctx.clearRect(0,0,w,h);const entries=Object.entries(data).sort((a,b)=>b[1]-a[1]).slice(0,7),total=entries.reduce((n,x)=>n+x[1],0);if(!total){ctx.fillStyle='#8d8273';ctx.font='18px Avenir';ctx.textAlign='center';ctx.fillText('Log outfits to reveal your color story',w/2,h/2);return}let a=-Math.PI/2;entries.forEach(([c,v])=>{const next=a+(v/total)*Math.PI*2;ctx.beginPath();ctx.strokeStyle=colorHex(c);ctx.lineWidth=44;ctx.arc(150,h/2,75,a,next);ctx.stroke();a=next});ctx.fillStyle='#2e2a24';ctx.textAlign='center';ctx.font='32px Georgia';ctx.fillText(total,150,h/2+7);ctx.font='12px Avenir';ctx.fillText('item-wears',150,h/2+27);ctx.textAlign='left';entries.forEach(([c,v],n)=>{const y=42+n*27;ctx.fillStyle=colorHex(c);ctx.fillRect(285,y-11,16,16);ctx.fillStyle='#3c372f';ctx.font='14px Avenir';ctx.fillText(`${c}  ${v}`,312,y+2)})}
function drawBars(canvas,data){const ctx=canvas.getContext('2d'),w=canvas.width,h=canvas.height;ctx.clearRect(0,0,w,h);const vals=Object.values(data),max=Math.max(1,...vals),names=Object.keys(data),gap=32,bw=(w-gap*5)/4;names.forEach((n,i)=>{const x=gap+i*(bw+gap),bh=(data[n]/max)*(h-70);ctx.fillStyle=['#6d7a5d','#8ca78d','#c6a34e','#8a4b58'][i];ctx.fillRect(x,h-40-bh,bw,bh);ctx.fillStyle='#4b443a';ctx.textAlign='center';ctx.font='13px Avenir';ctx.fillText(n,x+bw/2,h-16);ctx.font='18px Georgia';ctx.fillText(data[n],x+bw/2,h-48-bh)})}


function templateHint(category){return {Tops:'TOP • center shoulders and sleeves',Bottoms:'BOTTOM • center waistband and hems',Outerwear:'OUTERWEAR • leave room around sleeves',Shoes:'SHOES • place pair side-by-side',Accessories:'ACCESSORY • center the full shape',Misc:'GARMENT • keep the whole item inside the guide'}[category]||'CENTER ITEM'}
async function openPhotoStudio(){
  if(!itemWorkingPhoto)return toast('Take or choose a photo first');
  studioSourcePhoto=itemOriginalPhoto||itemWorkingPhoto;studioCutoutPhoto='';studioMode='original';studioBg='transparent';studioScale=88;studioRotation=0;studioEdge=45;studioBrushMode='';
  $('#studioScale').value=studioScale;$('#studioRotate').value=studioRotation;$('#studioEdge').value=studioEdge;$('#studioTemplateHint').textContent=templateHint($('#itemCategory').value);
  $$('.studio-mode').forEach(b=>b.classList.toggle('active',b.dataset.mode==='original'));$$('.studio-bg').forEach(b=>b.classList.toggle('active',b.dataset.bg==='transparent'));$$('.brush-btn').forEach(b=>b.classList.remove('active'));
  $('#photoStudioDialog').showModal();await renderStudio();
}
async function buildCutout(clean=false){
  const src=studioSourcePhoto||itemWorkingPhoto;if(!src)return src;
  $('#studioStatus').textContent=clean?'Making a cleaner edge…':'Removing background…';
  try{studioCutoutPhoto=clean?await removeAdvancedBackground(src,Number($('#studioEdge').value)||45):await removeSimpleBackground(src);studioMode=clean?'clean':'quick';$$('.studio-mode').forEach(b=>b.classList.toggle('active',b.dataset.mode===studioMode));await renderStudio();$('#studioStatus').textContent=clean?'Clean cutout ready. Adjust edge if needed.':'Quick cutout ready.';return studioCutoutPhoto}catch(e){console.error(e);$('#studioStatus').textContent='Cutout failed — original is still safe.';toast('Could not remove background')}
}
async function renderStudio(){
  const canvas=$('#studioCanvas'),ctx=canvas.getContext('2d');canvas.width=720;canvas.height=720;ctx.clearRect(0,0,720,720);
  if(studioBg==='cream'){ctx.fillStyle='#f4ecd9';ctx.fillRect(0,0,720,720)}else if(studioBg==='paper'){ctx.fillStyle='#e9dfc9';ctx.fillRect(0,0,720,720);ctx.globalAlpha=.15;for(let y=0;y<720;y+=24){ctx.fillStyle=y%48===0?'#8b765e':'#fff';ctx.fillRect(0,y,720,1)}ctx.globalAlpha=1}
  const src=studioMode==='original'?studioSourcePhoto:(studioCutoutPhoto||studioSourcePhoto);if(!src)return;
  const img=await imageFrom(src);let sx=0,sy=0,sw=img.width,sh=img.height;
  if(studioMode!=='original'&&studioCutoutPhoto){const b=await transparentBounds(img);sx=b.x;sy=b.y;sw=b.w;sh=b.h}
  const base=Math.min(650/sw,650/sh),scale=base*(studioScale/88),dw=sw*scale,dh=sh*scale;
  ctx.save();ctx.translate(360,360);ctx.rotate(studioRotation*Math.PI/180);ctx.drawImage(img,sx,sy,sw,sh,-dw/2,-dh/2,dw,dh);ctx.restore();
  studioRestoreCanvas=document.createElement('canvas');studioRestoreCanvas.width=720;studioRestoreCanvas.height=720;const rctx=studioRestoreCanvas.getContext('2d');const oimg=await imageFrom(studioSourcePhoto);const obase=Math.min(650/oimg.width,650/oimg.height),oscale=obase*(studioScale/88),odw=oimg.width*oscale,odh=oimg.height*oscale;rctx.translate(360,360);rctx.rotate(studioRotation*Math.PI/180);rctx.drawImage(oimg,-odw/2,-odh/2,odw,odh);
  $('#studioScaleValue').textContent=studioScale+'%';$('#studioRotateValue').textContent=studioRotation+'°';
}
async function autoFitStudio(){studioScale=88;studioRotation=0;$('#studioScale').value=studioScale;$('#studioRotate').value=0;await renderStudio();toast('Centered and fitted')}
async function transparentBounds(img){const c=document.createElement('canvas'),max=360,sc=Math.min(1,max/Math.max(img.width,img.height));c.width=Math.max(1,Math.round(img.width*sc));c.height=Math.max(1,Math.round(img.height*sc));const x=c.getContext('2d');x.drawImage(img,0,0,c.width,c.height);const d=x.getImageData(0,0,c.width,c.height).data;let minX=c.width,minY=c.height,maxX=-1,maxY=-1;for(let y=0;y<c.height;y++)for(let xx=0;xx<c.width;xx++){if(d[(y*c.width+xx)*4+3]>30){if(xx<minX)minX=xx;if(xx>maxX)maxX=xx;if(y<minY)minY=y;if(y>maxY)maxY=y}}if(maxX<0)return{x:0,y:0,w:img.width,h:img.height};const pad=8;minX=Math.max(0,minX-pad);minY=Math.max(0,minY-pad);maxX=Math.min(c.width-1,maxX+pad);maxY=Math.min(c.height-1,maxY+pad);return{x:minX/sc,y:minY/sc,w:(maxX-minX+1)/sc,h:(maxY-minY+1)/sc}}
function studioPointerPos(e){const c=$('#studioCanvas'),r=c.getBoundingClientRect();return{x:(e.clientX-r.left)*c.width/r.width,y:(e.clientY-r.top)*c.height/r.height}}
function paintStudio(e){if(!studioBrushMode)return;const c=$('#studioCanvas'),ctx=c.getContext('2d'),p=studioPointerPos(e),rad=Number($('#studioBrush').value)||26;ctx.save();ctx.beginPath();ctx.arc(p.x,p.y,rad,0,Math.PI*2);ctx.clip();if(studioBrushMode==='erase'){ctx.globalCompositeOperation='destination-out';ctx.fillStyle='#000';ctx.fillRect(p.x-rad,p.y-rad,rad*2,rad*2)}else if(studioRestoreCanvas){ctx.globalCompositeOperation='source-over';ctx.drawImage(studioRestoreCanvas,0,0)}ctx.restore()}
async function applyPhotoStudio(){const c=$('#studioCanvas');if(studioBg==='transparent'){itemWorkingPhoto=c.toDataURL('image/png')}else{itemWorkingPhoto=c.toDataURL('image/webp',.82);if(!itemWorkingPhoto.startsWith('data:image/webp'))itemWorkingPhoto=c.toDataURL('image/jpeg',.84)}showPhoto('#itemPhotoPreview','#photoPlaceholder',itemWorkingPhoto);updateOriginalPhotoButton();$('#photoStudioDialog').close();$('#scanStatus').textContent=studioBg==='transparent'?'Photo Studio image applied · transparency preserved.':'Photo Studio image applied · standardized square crop.';toast('Photo applied')}
function updateOriginalPhotoButton(){const b=$('#restoreOriginalPhotoBtn');if(!b)return;b.classList.toggle('hidden',!itemOriginalPhoto||itemWorkingPhoto===itemOriginalPhoto)}
function restoreCapturedOriginal(closeStudio=false){if(!itemOriginalPhoto)return toast('No captured original is available');itemWorkingPhoto=itemOriginalPhoto;showPhoto('#itemPhotoPreview','#photoPlaceholder',itemWorkingPhoto);updateOriginalPhotoButton();$('#scanStatus').textContent='Restored the original captured photo.';if(closeStudio&&$('#photoStudioDialog').open)$('#photoStudioDialog').close();toast('Original photo restored')}
function bindPhotoStudio(){
  $$('.studio-mode').forEach(b=>b.onclick=async()=>{studioMode=b.dataset.mode;if(studioMode==='original'){$$('.studio-mode').forEach(x=>x.classList.toggle('active',x===b));await renderStudio()}else await buildCutout(studioMode==='clean')});
  $$('.studio-bg').forEach(b=>b.onclick=async()=>{studioBg=b.dataset.bg;$$('.studio-bg').forEach(x=>x.classList.toggle('active',x===b));await renderStudio()});
  $('#studioScale').oninput=async e=>{studioScale=Number(e.target.value);await renderStudio()};$('#studioRotate').oninput=async e=>{studioRotation=Number(e.target.value);await renderStudio()};
  $('#studioEdge').onchange=async()=>{if(studioMode==='clean')await buildCutout(true)};$('#studioAutoFit').onclick=autoFitStudio;$('#studioApply').onclick=applyPhotoStudio;$('#studioUseOriginal').onclick=()=>restoreCapturedOriginal(true);
  $$('.brush-btn').forEach(b=>b.onclick=()=>{studioBrushMode=studioBrushMode===b.dataset.brush?'':b.dataset.brush;$$('.brush-btn').forEach(x=>x.classList.toggle('active',x.dataset.brush===studioBrushMode))});
  const c=$('#studioCanvas');c.addEventListener('pointerdown',e=>{if(!studioBrushMode)return;studioDrawing=true;c.setPointerCapture(e.pointerId);paintStudio(e)});c.addEventListener('pointermove',e=>{if(studioDrawing)paintStudio(e)});c.addEventListener('pointerup',()=>studioDrawing=false);c.addEventListener('pointercancel',()=>studioDrawing=false);
}
async function removeAdvancedBackground(dataURL,edge=45){
  const img=await imageFrom(dataURL),max=900,scale=Math.min(1,max/Math.max(img.width,img.height)),c=document.createElement('canvas');c.width=Math.round(img.width*scale);c.height=Math.round(img.height*scale);const ctx=c.getContext('2d');ctx.drawImage(img,0,0,c.width,c.height);const im=ctx.getImageData(0,0,c.width,c.height),d=im.data,w=c.width,h=c.height;
  const samples=[];const sample=(x,y)=>{const i=(y*w+x)*4;samples.push([d[i],d[i+1],d[i+2]])};const step=Math.max(2,Math.floor(Math.min(w,h)/28));for(let x=0;x<w;x+=step){for(let k=0;k<Math.min(14,h);k+=4){sample(x,k);sample(x,h-1-k)}}for(let y=0;y<h;y+=step){for(let k=0;k<Math.min(14,w);k+=4){sample(k,y);sample(w-1-k,y)}};
  samples.sort((a,b)=>(a[0]+a[1]+a[2])-(b[0]+b[1]+b[2]));const mid=samples[Math.floor(samples.length/2)]||[240,240,240];const low=Math.max(20,edge*.72),high=Math.max(low+22,edge*1.75);
  const alpha=new Uint8ClampedArray(w*h);for(let p=0;p<w*h;p++){const i=p*4,dr=d[i]-mid[0],dg=d[i+1]-mid[1],db=d[i+2]-mid[2],dist=Math.sqrt(dr*dr+dg*dg+db*db);alpha[p]=dist<=low?0:dist>=high?255:Math.round(255*(dist-low)/(high-low))}
  /* Flood clear only background-connected weak pixels, which protects similarly colored areas inside the garment. */
  const q=new Int32Array(w*h),seen=new Uint8Array(w*h);let head=0,tail=0;const push=p=>{if(p<0||p>=w*h||seen[p]||alpha[p]>210)return;seen[p]=1;q[tail++]=p};for(let x=0;x<w;x++){push(x);push((h-1)*w+x)}for(let y=0;y<h;y++){push(y*w);push(y*w+w-1)}while(head<tail){const p=q[head++],x=p%w,y=(p/w)|0;alpha[p]=0;if(x>0)push(p-1);if(x<w-1)push(p+1);if(y>0)push(p-w);if(y<h-1)push(p+w)}
  for(let p=0;p<w*h;p++)d[p*4+3]=alpha[p];ctx.putImageData(im,0,0);return c.toDataURL('image/png')
}

async function smartScan(){if(!itemWorkingPhoto)return toast('Take or choose a photo first');$('#scanStatus').textContent='Scanning color, pattern and visible text…';const visual=await analyzeImage(itemWorkingPhoto);applyVisualScan(visual);let text='';try{text=await tryOCR(itemWorkingPhoto)}catch{}if(text){const t=text.replace(/\n/g,' ');const brands=['Nike','Adidas','Lacoste','Gap','Old Navy','Zara','H&M','Uniqlo','Levi','Levi\'s','Converse','Vans','Champion','Aritzia','Brandy Melville','Hollister','Abercrombie','American Eagle','Puma','New Balance','Patagonia','North Face'];const brand=brands.find(b=>new RegExp(`\\b${b.replace("'","\\'")}\\b`,'i').test(t));if(brand&&!$('#itemBrand').value)$('#itemBrand').value=brand;const sm=t.match(/\b(XXS|XS|S|M|L|XL|XXL|[0-9]{1,2}(?:\.[05])?)\b/i);if(sm&&!$('#itemSize').value)$('#itemSize').value=sm[1].toUpperCase();$('#scanStatus').textContent=`Detected ${visual.color}${brand?' · '+brand:''}${sm?' · size '+sm[1]:''}. Please verify.`}else $('#scanStatus').textContent=`Detected ${visual.color} · ${visual.pattern}. Brand/size text wasn't readable; please verify fields.`;updateItemReviewSummary()}
function applyVisualScan(scan){if(!$('#itemColor').value)$('#itemColor').value=scan.color;if($('#itemPattern').value==='Solid')$('#itemPattern').value=scan.pattern;$('#scanStatus').textContent=`Photo scan: ${scan.color} · ${scan.pattern}. Please verify.`;updateItemReviewSummary()}
async function tryOCR(dataURL){if(!navigator.onLine)return'';if(!window.Tesseract){await new Promise((res,rej)=>{const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';s.onload=res;s.onerror=rej;document.head.appendChild(s)})}const r=await Tesseract.recognize(dataURL,'eng',{logger:()=>{}});return r?.data?.text||''}
async function analyzeImage(dataURL){const img=await imageFrom(dataURL);const c=document.createElement('canvas'),size=96;c.width=c.height=size;const ctx=c.getContext('2d');ctx.drawImage(img,0,0,size,size);const d=ctx.getImageData(0,0,size,size).data;let rs=0,gs=0,bs=0,n=0,lum=[],sat=[];for(let i=0;i<d.length;i+=4){if(d[i+3]<80)continue;const r=d[i],g=d[i+1],b=d[i+2];if(r>245&&g>245&&b>245)continue;rs+=r;gs+=g;bs+=b;n++;const mx=Math.max(r,g,b),mn=Math.min(r,g,b);lum.push((r+g+b)/3);sat.push(mx-mn)}if(!n)return{color:'Multicolor',pattern:'Solid'};const r=rs/n,g=gs/n,b=bs/n;color=nearestColor(r,g,b);const mean=lum.reduce((a,x)=>a+x,0)/lum.length,variance=lum.reduce((a,x)=>a+(x-mean)**2,0)/lum.length,avgSat=sat.reduce((a,x)=>a+x,0)/sat.length;let pattern='Solid';if(variance>2200&&avgSat>45)pattern='Floral/Print';else if(variance>1500)pattern='Graphic';return{color,pattern}}
function nearestColor(r,g,b){const palette={Black:[35,35,35],White:[242,240,234],Cream:[235,222,190],Gray:[135,135,130],Brown:[117,82,60],Coffee:[108,81,66],Tan:[177,145,105],Beige:[211,192,157],Burgundy:[125,53,71],Red:[178,63,61],Orange:[209,120,53],Yellow:[220,190,65],Mustard:[195,160,75],Olive:[102,113,90],Green:[67,117,70],Mint:[151,196,166],Turquoise:[77,142,138],Blue:[78,117,164],Navy:[50,65,92],Purple:[116,88,139],Pink:[196,107,132]};let best='Multicolor',dist=1e9;for(const[k,v]of Object.entries(palette)){const d=(r-v[0])**2+(g-v[1])**2+(b-v[2])**2;if(d<dist){dist=d;best=k}}return best}
async function removeSimpleBackground(dataURL){const img=await imageFrom(dataURL),max=900,scale=Math.min(1,max/Math.max(img.width,img.height)),c=document.createElement('canvas');c.width=Math.round(img.width*scale);c.height=Math.round(img.height*scale);const ctx=c.getContext('2d');ctx.drawImage(img,0,0,c.width,c.height);const im=ctx.getImageData(0,0,c.width,c.height),d=im.data,w=c.width,h=c.height;const samples=[];const take=(x,y)=>{const i=(y*w+x)*4;samples.push([d[i],d[i+1],d[i+2]])};for(let x=0;x<w;x+=Math.max(1,Math.floor(w/30))){take(x,0);take(x,h-1)}for(let y=0;y<h;y+=Math.max(1,Math.floor(h/30))){take(0,y);take(w-1,y)}const bg=samples.reduce((a,p)=>[a[0]+p[0],a[1]+p[1],a[2]+p[2]],[0,0,0]).map(x=>x/samples.length);for(let i=0;i<d.length;i+=4){const dist=Math.sqrt((d[i]-bg[0])**2+(d[i+1]-bg[1])**2+(d[i+2]-bg[2])**2);if(dist<34)d[i+3]=0;else if(dist<72)d[i+3]=Math.round(255*(dist-34)/(72-34))}ctx.putImageData(im,0,0);return c.toDataURL('image/png')}
function imageFrom(src){return new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=rej;i.src=src})}
function fileToDataURL(file,max=1200,quality=.85){return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=async()=>{try{const img=await imageFrom(r.result),scale=Math.min(1,max/Math.max(img.width,img.height)),c=document.createElement('canvas');c.width=Math.round(img.width*scale);c.height=Math.round(img.height*scale);c.getContext('2d').drawImage(img,0,0,c.width,c.height);resolve(c.toDataURL('image/jpeg',quality))}catch(e){reject(e)}};r.onerror=reject;r.readAsDataURL(file)})}
function showPhoto(imgSel,phSel,src){const img=$(imgSel),ph=$(phSel);if(src){img.src=src;img.style.display='block';ph.style.display='none'}else{img.removeAttribute('src');img.style.display='none';ph.style.display='block'}}
function getAppName(){return (state.settings?.appName||DEFAULT_APP_NAME).trim()||DEFAULT_APP_NAME}
function applyAppName(){
  if(!state.settings)state.settings={appName:DEFAULT_APP_NAME};
  const name=getAppName();
  const eyebrow=$('#appNameEyebrow'),input=$('#appNameInput'),current=$('#currentAppName');
  if(eyebrow)eyebrow.textContent=name.toUpperCase();
  if(input&&document.activeElement!==input)input.value=name;
  if(current)current.textContent=name;
  document.title=`${name} · Closet Journal`;
  const appleTitle=document.querySelector('meta[name="apple-mobile-web-app-title"]');if(appleTitle)appleTitle.setAttribute('content',name);
}
async function saveAppName(){
  const value=$('#appNameInput').value.trim().replace(/\s+/g,' ');
  if(!value)return toast('Enter an app name');
  if(!state.settings)state.settings={};state.settings.appName=value.slice(0,60);
  const ok=await saveState();if(ok)toast('App name updated');
}
async function resetAppName(){
  if(!state.settings)state.settings={};state.settings.appName=DEFAULT_APP_NAME;$('#appNameInput').value=DEFAULT_APP_NAME;
  const ok=await saveState();if(ok)toast("Restored Audrey's default");
}
function exportData(){const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);const safe=getAppName().toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'clothing-app';a.download=`${safe}-backup-${new Date().toISOString().slice(0,10)}.json`;a.click();URL.revokeObjectURL(a.href)}
async function importData(e){const f=e.target.files[0];if(!f)return;try{const obj=JSON.parse(await f.text());state={...emptyState(),...obj,settings:{...emptyState().settings,...(obj.settings||{})}};saveState();toast('Backup imported')}catch{alert('That file does not look like a valid clothing-app backup.')}e.target.value=''}
function resetData(){if(confirm('Erase all closet, outfit, journal and wishlist data from this device?')){state=emptyState();saveState();toast('App data erased')}}

init();
