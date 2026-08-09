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
const CLOTHING_SIZES=['Not set','XXS','XS','S','M','L','XL','XXL','Girls 8','Girls 10','Girls 12','Girls 14','Girls 16','00','0','2','4','6','8','10','12','14','16','18','One Size','Other'];
const SHOE_SIZES=['Not set',...Array.from({length:25},(_,i)=>String(1+i*.5)),'Other'];
const ACCESSORY_SIZES=['Not set','One Size','XS','S','M','L','XL','Other'];
const STORE_KEY='audreyClosetV1';
const DB_NAME='AudreyClosetDB';
const DB_VERSION=1;
const DB_STORE='app';
const DEFAULT_APP_NAME="Audrey's Clothing App";
let state=emptyState();
let selectedCategory='';
let itemWorkingPhoto='';
let wishWorkingPhoto='';
let boardItems=[];
let traySource='closet';
let viewingOutfitId=null;
let editingOutfitId=null;
let selectedBoardUid=null;
let doodleMode=false;
let activeDoodle=null;

function emptyState(){return {items:[],outfits:[],journal:[],wishlist:[],settings:{appName:DEFAULT_APP_NAME}}}
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
  fillSelects(); bindNav(); bindDialogs(); bindBoard();
  $('#catalogSearch').addEventListener('input',renderCatalog);
  $('#filterBtn').onclick=()=>$('#filterPanel').classList.toggle('hidden');
  $('#clearFilters').onclick=()=>{selectedCategory='';$('#filterCategory').value='';$('#filterSeason').value='';$('#filterColor').value='';renderCatalog();renderCategories()};
  ['filterCategory','filterSeason','filterColor'].forEach(x=>$('#'+x).addEventListener('change',renderCatalog));
  $('#exportBtn').onclick=exportData;$('#importFile').onchange=importData;$('#resetBtn').onclick=resetData;
  $('#saveAppNameBtn').onclick=saveAppName;$('#resetAppNameBtn').onclick=resetAppName;
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
  $('#itemCategory').addEventListener('change',()=>{populateTypeOptions($('#itemCategory').value);populateSizeOptions($('#itemCategory').value)});
}
function populateTypeOptions(category,selected=''){const opts=[...(TYPES[category]||['Other'])];if(selected&&!opts.includes(selected))opts.unshift(selected);$('#itemType').innerHTML=opts.map(v=>`<option${v===selected?' selected':''}>${esc(v)}</option>`).join('')}
function sizesForCategory(category){if(category==='Shoes')return [...SHOE_SIZES];if(category==='Accessories')return [...ACCESSORY_SIZES];return [...CLOTHING_SIZES]}
function populateSizeOptions(category,selected=''){const opts=sizesForCategory(category);if(selected&&!opts.includes(selected))opts.unshift(selected);$('#itemSize').innerHTML=opts.map(v=>`<option value="${v==='Not set'?'':esc(v)}"${v===selected||(!selected&&v==='Not set')?' selected':''}>${esc(v)}</option>`).join('')}
function bindNav(){
  $$('.bottom-nav button').forEach(b=>b.onclick=()=>showScreen(b.dataset.nav));
  ['addItemBtn','emptyAddBtn','quickAddBtn'].forEach(x=>$('#'+x).onclick=()=>openItem());
  $('#addWishBtn').onclick=()=>openWish();
  $('#logWearBtn').onclick=openWear;
}
function showScreen(name){$$('.screen').forEach(s=>s.classList.toggle('active',s.dataset.screen===name));$$('.bottom-nav button').forEach(b=>b.classList.toggle('active',b.dataset.nav===name));scrollTo({top:0,behavior:'smooth'});if(name==='journal')renderJournal();if(name==='outfits')renderOutfits()}

function bindDialogs(){
  $('#itemPhoto').onchange=async e=>{const f=e.target.files[0];if(!f)return;setPhotoBusy(true,'Optimizing photo…');try{itemWorkingPhoto=await fileToDataURL(f,900,.74);showPhoto('#itemPhotoPreview','#photoPlaceholder',itemWorkingPhoto);$('#scanStatus').textContent='Photo optimized. Detecting color…';const scan=await analyzeImage(itemWorkingPhoto);applyVisualScan(scan);$('#scanStatus').textContent=`Photo ready · ${scan.color} · ${scan.pattern}. You can save now or run Smart scan.`}catch(err){console.error(err);$('#scanStatus').textContent='Photo could not be processed. Try another photo.';toast('Could not process that photo')}finally{setPhotoBusy(false)}};
  $('#removeBgBtn').onclick=async()=>{if(!itemWorkingPhoto)return toast('Take or choose a photo first');setPhotoBusy(true,'Removing simple background…');try{itemWorkingPhoto=await removeSimpleBackground(itemWorkingPhoto);showPhoto('#itemPhotoPreview','#photoPlaceholder',itemWorkingPhoto);$('#scanStatus').textContent='Background removed and optimized. Best with a plain wall or floor.'}catch(err){console.error(err);toast('Background removal failed')}finally{setPhotoBusy(false)}};
  $('#smartScanBtn').onclick=smartScan;
  $('#itemForm').onsubmit=e=>{e.preventDefault();saveItem()};
  $('#deleteItemBtn').onclick=deleteItem;
  $('#wishPhoto').onchange=async e=>{const f=e.target.files[0];if(!f)return;wishWorkingPhoto=await fileToDataURL(f,900,.74);showPhoto('#wishPhotoPreview','#wishPhotoPlaceholder',wishWorkingPhoto)};
  $('#wishForm').onsubmit=e=>{e.preventDefault();saveWish()};
  $('#deleteWishBtn').onclick=deleteWish;
  $('#wearForm').onsubmit=e=>{e.preventDefault();saveWear()};
  $('#deleteOutfitBtn').onclick=deleteOutfit;
}
function openItem(item=null){
  $('#itemDialogTitle').textContent=item?'Edit piece':'Add a piece';$('#itemId').value=item?.id||'';itemWorkingPhoto=item?.photo||'';
  showPhoto('#itemPhotoPreview','#photoPlaceholder',itemWorkingPhoto);const category=item?.category||'Tops';$('#itemCategory').value=category;populateTypeOptions(category,item?.type||'');populateSizeOptions(category,item?.size||'');$('#itemBrand').value=item?.brand||'';$('#itemColor').value=item?.color||'';$('#itemPattern').value=item?.pattern||'Solid';$('#itemAcquired').value=item?.acquired||'Bought new';$('#itemSeason').value=item?.season||'All-season';$('#itemNotes').value=item?.notes||'';$('#scanStatus').textContent='';$('#deleteItemBtn').classList.toggle('hidden',!item);$('#itemPhoto').value='';$('#itemDialog').showModal();
}
async function saveItem(){
  const iid=$('#itemId').value;const old=state.items.find(x=>x.id===iid);const obj={id:iid||id(),photo:itemWorkingPhoto,category:$('#itemCategory').value,type:$('#itemType').value,brand:$('#itemBrand').value.trim(),size:$('#itemSize').value,color:$('#itemColor').value,pattern:$('#itemPattern').value,acquired:$('#itemAcquired').value,season:$('#itemSeason').value,notes:$('#itemNotes').value.trim(),created:old?.created||Date.now(),wears:old?.wears||0};
  const previous=state.items;if(iid)state.items=state.items.map(x=>x.id===iid?obj:x);else state.items=[obj,...state.items];
  const btn=$('#saveItemBtn');btn.disabled=true;btn.textContent='Saving…';$('#scanStatus').textContent='Saving securely on this device…';
  const ok=await saveState();btn.disabled=false;btn.textContent='Save piece';
  if(ok){$('#itemDialog').close();toast(iid?'Piece updated':'Added to closet')}else{state.items=previous;$('#scanStatus').textContent='Save failed. Your entry is still open so you can try again.'}
}
function setPhotoBusy(busy,message=''){['#removeBgBtn','#smartScanBtn','#saveItemBtn'].forEach(sel=>{const el=$(sel);if(el)el.disabled=busy});if(message)$('#scanStatus').textContent=message}
function deleteItem(){const iid=$('#itemId').value;if(!iid||!confirm('Delete this closet piece?'))return;state.items=state.items.filter(x=>x.id!==iid);state.journal=state.journal.map(j=>({...j,itemIds:j.itemIds.filter(x=>x!==iid)}));saveState();$('#itemDialog').close();toast('Piece deleted')}

function renderAll(){applyAppName();renderCategories();renderCatalog();renderOutfits();renderWishlist();renderJournal()}
function renderCategories(){const host=$('#categoryStrip');host.innerHTML=CATEGORIES.map(c=>{const n=state.items.filter(i=>i.category===c).length;return`<button class="category-chip ${selectedCategory===c?'active':''}" data-cat="${c}"><strong>${c}</strong><span>${n} ${n===1?'piece':'pieces'}</span></button>`}).join('');$$('.category-chip').forEach(b=>b.onclick=()=>{selectedCategory=selectedCategory===b.dataset.cat?'':b.dataset.cat;renderCategories();renderCatalog()})}
function renderCatalog(){
  const q=$('#catalogSearch').value.toLowerCase().trim(),fc=$('#filterCategory').value,fs=$('#filterSeason').value,fcol=$('#filterColor').value;
  const items=state.items.filter(i=>(!selectedCategory||i.category===selectedCategory)&&(!fc||i.category===fc)&&(!fs||i.season===fs)&&(!fcol||i.color===fcol)&&(!q||[i.type,i.brand,i.color,i.pattern,i.notes,i.category].join(' ').toLowerCase().includes(q)));
  $('#catalogCount').textContent=`${items.length} ${items.length===1?'piece':'pieces'}`;$('#catalogGrid').innerHTML=items.map(i=>itemCard(i)).join('');$('#catalogEmpty').classList.toggle('hidden',state.items.length>0||q||selectedCategory||fc||fs||fcol);$$('.item-card').forEach(c=>c.onclick=()=>openItem(state.items.find(i=>i.id===c.dataset.id)));
}
function itemCard(i){return`<article class="item-card" data-id="${i.id}"><div class="thumb">${i.photo?`<img src="${i.photo}" alt="${esc(i.type||i.category)}">`:`<div class="hanger">⌇</div>`}<span class="count-badge">${i.wears||0} wears</span></div><div class="card-body"><h4>${esc(i.type||i.category)}</h4><p>${i.color?`<span class="swatch" style="background:${colorHex(i.color)}"></span>${esc(i.color)} · `:''}${esc(i.brand||'No brand')}</p><p>${esc(i.size||'Size —')} · ${esc(i.pattern||'Solid')}</p></div></article>`}

function openWish(w=null){$('#wishId').value=w?.id||'';wishWorkingPhoto=w?.photo||'';showPhoto('#wishPhotoPreview','#wishPhotoPlaceholder',wishWorkingPhoto);$('#wishName').value=w?.name||'';$('#wishBrand').value=w?.brand||'';$('#wishPrice').value=w?.price||'';$('#wishLink').value=w?.link||'';$('#wishCategory').value=w?.category||'Tops';$('#wishColor').value=w?.color||'';$('#wishNotes').value=w?.notes||'';$('#deleteWishBtn').classList.toggle('hidden',!w);$('#wishDialog').showModal()}
function saveWish(){const wid=$('#wishId').value,old=state.wishlist.find(x=>x.id===wid),obj={id:wid||id(),photo:wishWorkingPhoto,name:$('#wishName').value.trim(),brand:$('#wishBrand').value.trim(),price:$('#wishPrice').value.trim(),link:$('#wishLink').value.trim(),category:$('#wishCategory').value,color:$('#wishColor').value,notes:$('#wishNotes').value.trim(),created:old?.created||Date.now()};if(wid)state.wishlist=state.wishlist.map(x=>x.id===wid?obj:x);else state.wishlist.unshift(obj);saveState();$('#wishDialog').close();toast('Wishlist saved')}
function deleteWish(){const wid=$('#wishId').value;if(!confirm('Remove this wishlist item?'))return;state.wishlist=state.wishlist.filter(x=>x.id!==wid);saveState();$('#wishDialog').close()}
function renderWishlist(){$('#wishlistGrid').innerHTML=state.wishlist.map(w=>`<article class="wish-card" data-id="${w.id}"><div class="wish-photo">${w.photo?`<img src="${w.photo}">`:'♡'}</div><div class="wish-body"><h4>${esc(w.name)}</h4><p>${esc(w.brand||'')} ${w.color?'· '+esc(w.color):''}</p><div class="price">${esc(w.price||'')}</div>${w.link?`<p>link saved ↗</p>`:''}</div></article>`).join('');$('#wishlistEmpty').classList.toggle('hidden',state.wishlist.length>0);$$('.wish-card').forEach(c=>c.onclick=()=>openWish(state.wishlist.find(w=>w.id===c.dataset.id)))}

function bindBoard(){
  $('#newBoardBtn').onclick=()=>{editingOutfitId=null;clearBoard();$('#outfitName').value='';$('#outfitNotes').value='';$('#saveOutfitBtn').textContent='Save outfit';toast('New outfit board')};
  $('#clearBoardBtn').onclick=clearBoard;$('#saveOutfitBtn').onclick=saveOutfit;
  $$('.tabs-small button').forEach(b=>b.onclick=()=>{traySource=b.dataset.source;$$('.tabs-small button').forEach(x=>x.classList.toggle('active',x===b));renderPieceTray()});
  $('#addBoardTextBtn').onclick=()=>{const text=$('#boardTextInput').value.trim();if(!text)return toast('Type something first');addCreativeItem('text',text);$('#boardTextInput').value=''};
  $$('.sticker-row [data-sticker]').forEach(b=>b.onclick=()=>addCreativeItem('sticker',b.dataset.sticker));
  $$('.shape-row [data-shape]').forEach(b=>b.onclick=()=>addCreativeItem('shape',b.dataset.shape));
  $('#bringFrontBtn').onclick=()=>layerSelected('front');$('#sendBackBtn').onclick=()=>layerSelected('back');
  $('#rotateLeftBtn').onclick=()=>rotateSelected(-10);$('#rotateRightBtn').onclick=()=>rotateSelected(10);
  $('#duplicateBoardBtn').onclick=duplicateSelected;$('#deleteBoardBtn').onclick=deleteSelected;
  $('#drawModeBtn').onclick=()=>{doodleMode=!doodleMode;$('#drawModeBtn').classList.toggle('active',doodleMode);$('#outfitBoard').classList.toggle('drawing',doodleMode);$('#boardHelp').textContent=doodleMode?'Doodle mode: draw directly on the board. Tap doodle again when finished.':'Select an object to move, resize, rotate, layer or delete it.'};
  const board=$('#outfitBoard');
  board.addEventListener('pointerdown',startDoodle);
  board.addEventListener('pointermove',moveDoodle);
  board.addEventListener('pointerup',endDoodle);
  board.addEventListener('pointercancel',endDoodle);
  board.addEventListener('pointerdown',e=>{if(!doodleMode&&e.target===board){selectedBoardUid=null;drawBoard()}});
}
function renderOutfits(){renderPieceTray();renderSavedOutfits()}
function renderPieceTray(){const arr=traySource==='closet'?state.items:state.wishlist;$('#pieceTray').innerHTML=arr.map(x=>`<button class="tray-piece" data-id="${x.id}" data-source="${traySource}"><div class="mini-photo">${x.photo?`<img src="${x.photo}">`:'✣'}</div><small>${esc(x.type||x.name||x.category)}</small></button>`).join('')||'<p class="muted" style="color:#786f61">Nothing here yet.</p>';$$('.tray-piece').forEach(b=>b.onclick=()=>addBoardPiece(b.dataset.id,b.dataset.source))}
function nextZ(){return Math.max(0,...boardItems.map(x=>Number(x.z)||0))+1}
function addBoardPiece(pid,source){const src=source==='closet'?state.items:state.wishlist,obj=src.find(x=>x.id===pid);if(!obj)return;const bi={uid:id(),kind:'piece',source,id:pid,x:28+Math.random()*120,y:42+Math.random()*100,w:132,h:156,rotation:0,z:nextZ()};boardItems.push(bi);selectedBoardUid=bi.uid;drawBoard()}
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
  boardItems.map(normalizeBoardItem).sort((a,b)=>a.z-b.z).forEach(b=>{const content=boardItemContent(b);if(!content)return;const el=document.createElement('div');el.className='board-piece kind-'+b.kind+(selectedBoardUid===b.uid?' selected':'');el.dataset.uid=b.uid;el.style.left=b.x+'px';el.style.top=b.y+'px';el.style.width=b.w+'px';el.style.height=b.h+'px';el.style.zIndex=b.z;el.style.transform=`rotate(${b.rotation}deg)`;el.innerHTML=`<div class="board-object">${content}</div><button type="button" class="resize-handle" aria-label="Resize">↘</button>`;makeBoardInteractive(el,b);board.appendChild(el)});
  const selected=boardItems.find(x=>x.uid===selectedBoardUid);$('#boardEditbar').classList.toggle('has-selection',!!selected);if(selected&&!doodleMode)$('#boardHelp').textContent='Drag to move. Pinch with two fingers to resize + rotate. Use ↘ for one-finger resize.';
}
function makeBoardInteractive(el,model){
  const pointers=new Map();let gesture=null;
  const board=$('#outfitBoard');
  function clampPosition(){model.x=Math.max(-model.w*.55,Math.min(board.clientWidth-model.w*.45,model.x));model.y=Math.max(-model.h*.55,Math.min(board.clientHeight-model.h*.45,model.y))}
  function twoPointStats(){const pts=[...pointers.values()];if(pts.length<2)return null;const a=pts[0],b=pts[1],dx=b.x-a.x,dy=b.y-a.y;return{dist:Math.hypot(dx,dy),angle:Math.atan2(dy,dx)*180/Math.PI,cx:(a.x+b.x)/2,cy:(a.y+b.y)/2}}
  el.addEventListener('pointerdown',e=>{if(doodleMode)return;e.stopPropagation();selectedBoardUid=model.uid;model.z=model.z||nextZ();drawSelectionOnly(model.uid);el.setPointerCapture(e.pointerId);pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(e.target.classList.contains('resize-handle')){gesture={mode:'resize',sx:e.clientX,sy:e.clientY,w:model.w,h:model.h};return}if(pointers.size===1){gesture={mode:'drag',sx:e.clientX,sy:e.clientY,x:model.x,y:model.y}}else if(pointers.size===2){const st=twoPointStats();gesture={mode:'pinch',start:st,w:model.w,h:model.h,rotation:model.rotation,x:model.x,y:model.y}}});
  el.addEventListener('pointermove',e=>{if(!pointers.has(e.pointerId)||!gesture)return;e.preventDefault();pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(gesture.mode==='resize'){const dx=e.clientX-gesture.sx,dy=e.clientY-gesture.sy,delta=(dx+dy)/2,ratio=model.h/model.w;model.w=Math.max(45,Math.min(300,gesture.w+delta));model.h=Math.max(40,Math.min(340,model.w*ratio));}else if(gesture.mode==='drag'&&pointers.size===1){model.x=gesture.x+e.clientX-gesture.sx;model.y=gesture.y+e.clientY-gesture.sy;clampPosition()}else if(pointers.size>=2){if(gesture.mode!=='pinch'){const st=twoPointStats();gesture={mode:'pinch',start:st,w:model.w,h:model.h,rotation:model.rotation,x:model.x,y:model.y}}const st=twoPointStats(),scale=Math.max(.35,Math.min(2.8,st.dist/Math.max(1,gesture.start.dist)));model.w=Math.max(45,Math.min(320,gesture.w*scale));model.h=Math.max(40,Math.min(360,gesture.h*scale));model.rotation=gesture.rotation+(st.angle-gesture.start.angle);model.x=gesture.x+(st.cx-gesture.start.cx);model.y=gesture.y+(st.cy-gesture.start.cy);clampPosition()}el.style.left=model.x+'px';el.style.top=model.y+'px';el.style.width=model.w+'px';el.style.height=model.h+'px';el.style.transform=`rotate(${model.rotation}deg)`});
  function release(e){pointers.delete(e.pointerId);if(pointers.size===1){const p=[...pointers.values()][0];gesture={mode:'drag',sx:p.x,sy:p.y,x:model.x,y:model.y}}else if(!pointers.size)gesture=null}
  el.addEventListener('pointerup',release);el.addEventListener('pointercancel',release);
}
function drawSelectionOnly(uid){$$('#outfitBoard .board-piece').forEach(el=>el.classList.toggle('selected',el.dataset.uid===uid));$('#boardEditbar').classList.toggle('has-selection',!!uid)}
function selectedBoardItem(){return boardItems.find(x=>x.uid===selectedBoardUid)}
function layerSelected(where){const b=selectedBoardItem();if(!b)return toast('Select something on the board');if(where==='front')b.z=nextZ();else b.z=Math.min(0,...boardItems.filter(x=>x!==b).map(x=>Number(x.z)||0))-1;drawBoard()}
function rotateSelected(delta){const b=selectedBoardItem();if(!b)return toast('Select something on the board');b.rotation=(Number(b.rotation)||0)+delta;drawBoard()}
function duplicateSelected(){const b=selectedBoardItem();if(!b)return toast('Select something on the board');const copy={...b,uid:id(),x:b.x+18,y:b.y+18,z:nextZ()};boardItems.push(copy);selectedBoardUid=copy.uid;drawBoard()}
function deleteSelected(){if(!selectedBoardUid)return toast('Select something on the board');boardItems=boardItems.filter(x=>x.uid!==selectedBoardUid);selectedBoardUid=null;drawBoard()}
function clearBoard(){boardItems=[];selectedBoardUid=null;doodleMode=false;$('#drawModeBtn')?.classList.remove('active');$('#outfitBoard')?.classList.remove('drawing');drawBoard()}
function localBoardPoint(e,board){const r=board.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top}}
function startDoodle(e){if(!doodleMode||e.target.closest('.board-piece'))return;e.preventDefault();const board=$('#outfitBoard'),p=localBoardPoint(e,board);activeDoodle={pointerId:e.pointerId,points:[p]};board.setPointerCapture(e.pointerId)}
function moveDoodle(e){if(!doodleMode||!activeDoodle||activeDoodle.pointerId!==e.pointerId)return;e.preventDefault();activeDoodle.points.push(localBoardPoint(e,$('#outfitBoard')))}
function endDoodle(e){if(!activeDoodle||activeDoodle.pointerId!==e.pointerId)return;const pts=activeDoodle.points;activeDoodle=null;if(pts.length<2)return;const minx=Math.min(...pts.map(p=>p.x)),maxx=Math.max(...pts.map(p=>p.x)),miny=Math.min(...pts.map(p=>p.y)),maxy=Math.max(...pts.map(p=>p.y));const pad=8,w=Math.max(24,maxx-minx+pad*2),h=Math.max(24,maxy-miny+pad*2);const points=pts.map(p=>`${(p.x-minx+pad).toFixed(1)},${(p.y-miny+pad).toFixed(1)}`).join(' ');const b={uid:id(),kind:'doodle',points,x:minx-pad,y:miny-pad,w,h,rotation:0,z:nextZ()};boardItems.push(b);selectedBoardUid=b.uid;drawBoard()}
async function saveOutfit(){if(!boardItems.length)return toast('Add at least one piece');const name=$('#outfitName').value.trim()||'Untitled look';const board=$('#outfitBoard');const snapshot={name,notes:$('#outfitNotes').value.trim(),pieces:boardItems.map(x=>({...x})),boardWidth:board.clientWidth,boardHeight:board.clientHeight};if(editingOutfitId){const existing=state.outfits.find(x=>x.id===editingOutfitId);if(existing){Object.assign(existing,snapshot,{updated:Date.now()})}else editingOutfitId=null}if(!editingOutfitId){const created={id:id(),...snapshot,created:Date.now()};state.outfits.unshift(created);editingOutfitId=created.id}await saveState();renderSavedOutfits();$('#saveOutfitBtn').textContent='Update outfit';toast('Outfit saved')}
function renderMiniPiece(p,n){p=normalizeBoardItem({...p});if(p.kind==='piece'){const obj=(p.source==='closet'?state.items:state.wishlist).find(x=>x.id===p.id);return obj?.photo?`<img src="${obj.photo}" style="left:${8+n*19}px;top:${8+(n%2)*24}px;transform:rotate(${p.rotation||0}deg)">`:''}if(p.kind==='text')return `<span class="mini-deco" style="left:${8+n*9}px;top:${10+n*13}px">${esc(p.value)}</span>`;if(p.kind==='sticker')return `<span class="mini-sticker" style="left:${8+n*14}px;top:${12+n*12}px">${esc(p.value)}</span>`;return ''}
function renderSavedOutfits(){$('#outfitCount').textContent=state.outfits.length;$('#savedOutfits').innerHTML=state.outfits.map(o=>`<article class="outfit-card" data-id="${o.id}"><div class="outfit-mini">${o.pieces.slice(0,7).map(renderMiniPiece).join('')}</div><h4>${esc(o.name)}</h4><p>${o.pieces.length} elements · ${new Date(o.created).toLocaleDateString()} · tap to edit</p></article>`).join('');$$('.outfit-card').forEach(c=>c.onclick=()=>loadOutfitForEditing(c.dataset.id))}
function loadOutfitForEditing(oid){const o=state.outfits.find(x=>x.id===oid);if(!o)return;editingOutfitId=oid;boardItems=(o.pieces||[]).map(p=>normalizeBoardItem({...p,uid:p.uid||id()}));selectedBoardUid=null;doodleMode=false;$('#drawModeBtn')?.classList.remove('active');$('#outfitBoard')?.classList.remove('drawing');$('#outfitName').value=o.name||'';$('#outfitNotes').value=o.notes||'';$('#saveOutfitBtn').textContent='Update outfit';drawBoard();$('#outfitBoard').scrollIntoView({behavior:'smooth',block:'center'});toast('Outfit loaded — edit and save again')}
function renderSnapshotPiece(board,p,scaleX,scaleY){p=normalizeBoardItem({...p});const el=document.createElement('div');el.className='snapshot-piece kind-'+p.kind;el.style.left=(p.x*scaleX)+'px';el.style.top=(p.y*scaleY)+'px';el.style.width=(p.w*scaleX)+'px';el.style.height=(p.h*scaleY)+'px';el.style.zIndex=p.z;el.style.transform=`rotate(${p.rotation}deg)`;el.innerHTML=boardItemContent(p);board.appendChild(el)}
function viewOutfit(oid){const o=state.outfits.find(x=>x.id===oid);if(!o)return;viewingOutfitId=oid;$('#viewOutfitName').textContent=o.name;$('#viewOutfitNotes').textContent=o.notes||'No notes yet.';const board=$('#viewOutfitBoard');board.innerHTML='';$('#outfitViewDialog').showModal();requestAnimationFrame(()=>{const sourceW=o.boardWidth||390,sourceH=o.boardHeight||420,scaleX=(board.clientWidth||390)/sourceW,scaleY=(board.clientHeight||350)/sourceH;o.pieces.slice().sort((a,b)=>(a.z||0)-(b.z||0)).forEach(p=>renderSnapshotPiece(board,p,scaleX,scaleY))})}
function deleteOutfit(){if(!viewingOutfitId||!confirm('Delete this saved outfit?'))return;state.outfits=state.outfits.filter(x=>x.id!==viewingOutfitId);saveState();$('#outfitViewDialog').close()}

function openWear(){if(!state.items.length)return toast('Add closet pieces first');$('#wearDate').value=new Date().toISOString().slice(0,10);$('#wearNotes').value='';$('#wearPicker').innerHTML=state.items.map(i=>`<button type="button" class="wear-option" data-id="${i.id}">${i.photo?`<img src="${i.photo}">`:'✣'}<small>${esc(i.type||i.category)}</small></button>`).join('');$$('.wear-option').forEach(b=>b.onclick=()=>b.classList.toggle('selected'));$('#wearDialog').showModal()}
function saveWear(){const ids=$$('.wear-option.selected').map(b=>b.dataset.id);if(!ids.length)return toast('Select at least one item');const date=$('#wearDate').value;const existing=state.journal.find(j=>j.date===date);if(existing){existing.itemIds=ids;existing.notes=$('#wearNotes').value.trim()}else state.journal.unshift({id:id(),date,itemIds:ids,notes:$('#wearNotes').value.trim()});state.items.forEach(i=>i.wears=state.journal.reduce((n,j)=>n+j.itemIds.filter(x=>x===i.id).length,0));saveState();$('#wearDialog').close();toast('Journal updated')}
function renderJournal(){
  const wears=state.items.map(i=>({...i,w:state.journal.reduce((n,j)=>n+j.itemIds.filter(x=>x===i.id).length,0)})).sort((a,b)=>b.w-a.w);const total=wears.reduce((n,i)=>n+i.w,0);$('#totalWears').textContent=total;const mw=wears[0]?.w?wears[0]:null;$('#mostWorn').textContent=mw?(mw.type||mw.category):'—';$('#mostWornMeta').textContent=mw?`${mw.w} wears · ${mw.color||'color not set'}`:'No wear data yet';
  const colorCounts={};state.journal.forEach(j=>j.itemIds.forEach(x=>{const i=state.items.find(z=>z.id===x);if(i?.color)colorCounts[i.color]=(colorCounts[i.color]||0)+1}));const fav=Object.entries(colorCounts).sort((a,b)=>b[1]-a[1])[0];$('#favColor').textContent=fav?.[0]||'—';$('#favColorMeta').textContent=fav?`${fav[1]} item-wears`:'No wear data yet';const sn=seasonForDate();$('#seasonName').textContent=sn;$('#seasonWears').textContent=state.journal.filter(j=>seasonForDate(new Date(j.date+'T12:00:00'))===sn).reduce((n,j)=>n+j.itemIds.length,0);
  $('#journalCount').textContent=`${state.journal.length} ${state.journal.length===1?'day':'days'}`;$('#journalList').innerHTML=state.journal.slice().sort((a,b)=>b.date.localeCompare(a.date)).map(j=>{const d=new Date(j.date+'T12:00:00');return`<article class="journal-row"><div class="journal-date"><small>${d.toLocaleString('en',{month:'short'}).toUpperCase()}</small><strong>${d.getDate()}</strong></div><div class="journal-thumbs">${j.itemIds.slice(0,6).map(x=>{const i=state.items.find(z=>z.id===x);return i?.photo?`<img src="${i.photo}">`:''}).join('')}</div><p>${esc(j.notes||`${j.itemIds.length} items`)}</p></article>`}).join('')||'<div class="empty-state compact"><p>No journal entries yet.</p></div>';drawDonut($('#colorChart'),colorCounts);const seasonCounts={Winter:0,Spring:0,Summer:0,Fall:0};state.journal.forEach(j=>seasonCounts[seasonForDate(new Date(j.date+'T12:00:00'))]++);drawBars($('#seasonChart'),seasonCounts)
}
function drawDonut(canvas,data){const ctx=canvas.getContext('2d'),w=canvas.width,h=canvas.height;ctx.clearRect(0,0,w,h);const entries=Object.entries(data).sort((a,b)=>b[1]-a[1]).slice(0,7),total=entries.reduce((n,x)=>n+x[1],0);if(!total){ctx.fillStyle='#8d8273';ctx.font='18px Avenir';ctx.textAlign='center';ctx.fillText('Log outfits to reveal your color story',w/2,h/2);return}let a=-Math.PI/2;entries.forEach(([c,v])=>{const next=a+(v/total)*Math.PI*2;ctx.beginPath();ctx.strokeStyle=colorHex(c);ctx.lineWidth=44;ctx.arc(150,h/2,75,a,next);ctx.stroke();a=next});ctx.fillStyle='#2e2a24';ctx.textAlign='center';ctx.font='32px Georgia';ctx.fillText(total,150,h/2+7);ctx.font='12px Avenir';ctx.fillText('item-wears',150,h/2+27);ctx.textAlign='left';entries.forEach(([c,v],n)=>{const y=42+n*27;ctx.fillStyle=colorHex(c);ctx.fillRect(285,y-11,16,16);ctx.fillStyle='#3c372f';ctx.font='14px Avenir';ctx.fillText(`${c}  ${v}`,312,y+2)})}
function drawBars(canvas,data){const ctx=canvas.getContext('2d'),w=canvas.width,h=canvas.height;ctx.clearRect(0,0,w,h);const vals=Object.values(data),max=Math.max(1,...vals),names=Object.keys(data),gap=32,bw=(w-gap*5)/4;names.forEach((n,i)=>{const x=gap+i*(bw+gap),bh=(data[n]/max)*(h-70);ctx.fillStyle=['#6d7a5d','#8ca78d','#c6a34e','#8a4b58'][i];ctx.fillRect(x,h-40-bh,bw,bh);ctx.fillStyle='#4b443a';ctx.textAlign='center';ctx.font='13px Avenir';ctx.fillText(n,x+bw/2,h-16);ctx.font='18px Georgia';ctx.fillText(data[n],x+bw/2,h-48-bh)})}

async function smartScan(){if(!itemWorkingPhoto)return toast('Take or choose a photo first');$('#scanStatus').textContent='Scanning color, pattern and visible text…';const visual=await analyzeImage(itemWorkingPhoto);applyVisualScan(visual);let text='';try{text=await tryOCR(itemWorkingPhoto)}catch{}if(text){const t=text.replace(/\n/g,' ');const brands=['Nike','Adidas','Lacoste','Gap','Old Navy','Zara','H&M','Uniqlo','Levi','Levi\'s','Converse','Vans','Champion','Aritzia','Brandy Melville','Hollister','Abercrombie','American Eagle','Puma','New Balance','Patagonia','North Face'];const brand=brands.find(b=>new RegExp(`\\b${b.replace("'","\\'")}\\b`,'i').test(t));if(brand&&!$('#itemBrand').value)$('#itemBrand').value=brand;const sm=t.match(/\b(XXS|XS|S|M|L|XL|XXL|[0-9]{1,2}(?:\.[05])?)\b/i);if(sm&&!$('#itemSize').value)$('#itemSize').value=sm[1].toUpperCase();$('#scanStatus').textContent=`Detected ${visual.color}${brand?' · '+brand:''}${sm?' · size '+sm[1]:''}. Please verify.`}else $('#scanStatus').textContent=`Detected ${visual.color} · ${visual.pattern}. Brand/size text wasn't readable; please verify fields.`}
function applyVisualScan(scan){if(!$('#itemColor').value)$('#itemColor').value=scan.color;if($('#itemPattern').value==='Solid')$('#itemPattern').value=scan.pattern;$('#scanStatus').textContent=`Photo scan: ${scan.color} · ${scan.pattern}. Please verify.`}
async function tryOCR(dataURL){if(!navigator.onLine)return'';if(!window.Tesseract){await new Promise((res,rej)=>{const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';s.onload=res;s.onerror=rej;document.head.appendChild(s)})}const r=await Tesseract.recognize(dataURL,'eng',{logger:()=>{}});return r?.data?.text||''}
async function analyzeImage(dataURL){const img=await imageFrom(dataURL);const c=document.createElement('canvas'),size=96;c.width=c.height=size;const ctx=c.getContext('2d');ctx.drawImage(img,0,0,size,size);const d=ctx.getImageData(0,0,size,size).data;let rs=0,gs=0,bs=0,n=0,lum=[],sat=[];for(let i=0;i<d.length;i+=4){if(d[i+3]<80)continue;const r=d[i],g=d[i+1],b=d[i+2];if(r>245&&g>245&&b>245)continue;rs+=r;gs+=g;bs+=b;n++;const mx=Math.max(r,g,b),mn=Math.min(r,g,b);lum.push((r+g+b)/3);sat.push(mx-mn)}if(!n)return{color:'Multicolor',pattern:'Solid'};const r=rs/n,g=gs/n,b=bs/n;color=nearestColor(r,g,b);const mean=lum.reduce((a,x)=>a+x,0)/lum.length,variance=lum.reduce((a,x)=>a+(x-mean)**2,0)/lum.length,avgSat=sat.reduce((a,x)=>a+x,0)/sat.length;let pattern='Solid';if(variance>2200&&avgSat>45)pattern='Floral/Print';else if(variance>1500)pattern='Graphic';return{color,pattern}}
function nearestColor(r,g,b){const palette={Black:[35,35,35],White:[242,240,234],Cream:[235,222,190],Gray:[135,135,130],Brown:[117,82,60],Coffee:[108,81,66],Tan:[177,145,105],Beige:[211,192,157],Burgundy:[125,53,71],Red:[178,63,61],Orange:[209,120,53],Yellow:[220,190,65],Mustard:[195,160,75],Olive:[102,113,90],Green:[67,117,70],Mint:[151,196,166],Turquoise:[77,142,138],Blue:[78,117,164],Navy:[50,65,92],Purple:[116,88,139],Pink:[196,107,132]};let best='Multicolor',dist=1e9;for(const[k,v]of Object.entries(palette)){const d=(r-v[0])**2+(g-v[1])**2+(b-v[2])**2;if(d<dist){dist=d;best=k}}return best}
async function removeSimpleBackground(dataURL){const img=await imageFrom(dataURL),max=900,scale=Math.min(1,max/Math.max(img.width,img.height)),c=document.createElement('canvas');c.width=Math.round(img.width*scale);c.height=Math.round(img.height*scale);const ctx=c.getContext('2d');ctx.drawImage(img,0,0,c.width,c.height);const im=ctx.getImageData(0,0,c.width,c.height),d=im.data,w=c.width,h=c.height;const samples=[];const take=(x,y)=>{const i=(y*w+x)*4;samples.push([d[i],d[i+1],d[i+2]])};for(let x=0;x<w;x+=Math.max(1,Math.floor(w/30))){take(x,0);take(x,h-1)}for(let y=0;y<h;y+=Math.max(1,Math.floor(h/30))){take(0,y);take(w-1,y)}const bg=samples.reduce((a,p)=>[a[0]+p[0],a[1]+p[1],a[2]+p[2]],[0,0,0]).map(x=>x/samples.length);for(let i=0;i<d.length;i+=4){const dist=Math.sqrt((d[i]-bg[0])**2+(d[i+1]-bg[1])**2+(d[i+2]-bg[2])**2);if(dist<34)d[i+3]=0;else if(dist<72)d[i+3]=Math.round(255*(dist-34)/(72-34))}ctx.putImageData(im,0,0);const webp=c.toDataURL('image/webp',.78);return webp.startsWith('data:image/webp')?webp:c.toDataURL('image/png')}
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
