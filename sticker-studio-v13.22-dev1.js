/* Audrey Closet v13.22 Sticker Studio dev1
 * Architecture + placeholder browser for Board > Decorate > Stickers.
 * Keeps the existing Board sticker object/render path compatible while adding
 * pack/id/size metadata for future image assets and optional sticker outlines.
 */
(function(){
  'use strict';

  const ROOT_ID='stickerStudioV1322Dev1';
  const STYLE_ID='stickerStudioV1322Dev1Styles';
  const REGISTRY_VERSION=1;

  const STICKER_PACKS=[
    {
      id:'standard',
      label:'Standard',
      icon:'✦',
      description:'Everyday symbols and little accents.',
      stickers:[
        {id:'heart',label:'Heart',glyph:'♥',sizeClass:'small'},
        {id:'diamond',label:'Diamond',glyph:'◆',sizeClass:'small'},
        {id:'star',label:'Star',glyph:'★',sizeClass:'small'},
        {id:'happy',label:'Happy face',glyph:'☺',sizeClass:'small'},
        {id:'sparkle',label:'Sparkle',glyph:'✨',sizeClass:'small'},
        {id:'lightning',label:'Lightning',glyph:'⚡',sizeClass:'small'},
        {id:'flower',label:'Flower',glyph:'🌼',sizeClass:'small'},
        {id:'rainbow',label:'Rainbow',glyph:'🌈',sizeClass:'medium'},
        {id:'cloud',label:'Cloud',glyph:'☁️',sizeClass:'medium'},
        {id:'sun',label:'Sun',glyph:'☀️',sizeClass:'small'},
        {id:'moon',label:'Moon',glyph:'🌙',sizeClass:'small'},
        {id:'butterfly',label:'Butterfly',glyph:'🦋',sizeClass:'medium'}
      ]
    },
    {
      id:'music',
      label:'Music',
      icon:'♫',
      description:'Notes, instruments and studio energy.',
      stickers:[
        {id:'treble-clef',label:'Treble clef',glyph:'𝄞',sizeClass:'medium'},
        {id:'bass-clef',label:'Bass clef',glyph:'𝄢',sizeClass:'medium'},
        {id:'guitar',label:'Guitar',glyph:'🎸',sizeClass:'medium'},
        {id:'piano',label:'Piano',glyph:'🎹',sizeClass:'medium'},
        {id:'drums',label:'Drums',glyph:'🥁',sizeClass:'medium'},
        {id:'microphone',label:'Microphone',glyph:'🎤',sizeClass:'medium'},
        {id:'notes',label:'Music notes',glyph:'🎵',sizeClass:'small'},
        {id:'double-notes',label:'Double notes',glyph:'🎶',sizeClass:'small'},
        {id:'headphones',label:'Headphones',glyph:'🎧',sizeClass:'medium'},
        {id:'record',label:'Record',glyph:'💿',sizeClass:'medium'},
        {id:'amp',label:'Guitar amp',glyph:'▣',sizeClass:'medium'},
        {id:'sheet',label:'Sheet music',glyph:'▤',sizeClass:'medium'}
      ]
    },
    {
      id:'cute-animals',
      label:'Cute Animals',
      icon:'🐾',
      description:'Friendly little creatures for playful looks.',
      stickers:[
        {id:'dog',label:'Dog',glyph:'🐶',sizeClass:'medium'},
        {id:'cat',label:'Cat',glyph:'🐱',sizeClass:'medium'},
        {id:'lion',label:'Lion',glyph:'🦁',sizeClass:'medium'},
        {id:'tiger',label:'Tiger',glyph:'🐯',sizeClass:'medium'},
        {id:'fish',label:'Fish',glyph:'🐠',sizeClass:'medium'},
        {id:'frog',label:'Frog',glyph:'🐸',sizeClass:'medium'},
        {id:'mouse',label:'Mouse',glyph:'🐭',sizeClass:'medium'},
        {id:'bunny',label:'Bunny',glyph:'🐰',sizeClass:'medium'},
        {id:'bear',label:'Bear',glyph:'🐻',sizeClass:'medium'},
        {id:'panda',label:'Panda',glyph:'🐼',sizeClass:'medium'},
        {id:'fox',label:'Fox',glyph:'🦊',sizeClass:'medium'},
        {id:'penguin',label:'Penguin',glyph:'🐧',sizeClass:'medium'}
      ]
    },
    {
      id:'fashion',
      label:'Fashion',
      icon:'✂',
      description:'Closet, sewing and accessory details.',
      stickers:[
        {id:'button',label:'Button',glyph:'◉',sizeClass:'small'},
        {id:'pin',label:'Pin',glyph:'📌',sizeClass:'small'},
        {id:'swatch',label:'Fabric swatch',glyph:'▧',sizeClass:'medium'},
        {id:'watch',label:'Watch',glyph:'⌚',sizeClass:'medium'},
        {id:'necklace',label:'Necklace',glyph:'💎',sizeClass:'medium'},
        {id:'sunglasses',label:'Sunglasses',glyph:'🕶️',sizeClass:'medium'},
        {id:'bag',label:'Handbag',glyph:'👜',sizeClass:'medium'},
        {id:'thread',label:'Thread',glyph:'🧵',sizeClass:'medium'},
        {id:'needle',label:'Needle',glyph:'🪡',sizeClass:'medium'},
        {id:'bow',label:'Bow',glyph:'🎀',sizeClass:'medium'},
        {id:'shoe',label:'Shoe',glyph:'👠',sizeClass:'medium'},
        {id:'hanger',label:'Hanger',glyph:'♧',sizeClass:'medium'}
      ]
    }
  ];

  // Deliberately public registry: future pack loaders can append/replace packs
  // without coupling the Sticker Studio UI to hard-coded buttons.
  window.AUDREY_STICKER_PACKS_V1={version:REGISTRY_VERSION,packs:STICKER_PACKS};

  let activePackId='standard';

  function installStyles(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      .screen[data-screen="outfits"] .decorate-studio-panel[data-decorate-group="stickers"]{gap:0!important}
      .screen[data-screen="outfits"] .decorate-studio-panel[data-decorate-group="stickers"] .decorate-studio-content{gap:0!important}
      .screen[data-screen="outfits"] .decorate-studio-panel[data-decorate-group="stickers"] .decorate-tool-card:not(.sticker-studio-dev1-card){display:none!important}
      .screen[data-screen="outfits"] #${ROOT_ID}{display:grid;gap:8px;padding:6px 7px 10px;border:1px solid rgba(102,113,90,.18);border-radius:10px;background:rgba(238,240,232,.68);box-shadow:none}
      .screen[data-screen="outfits"] #${ROOT_ID} .sticker-pack-strip{display:flex;gap:6px;overflow-x:auto;overscroll-behavior-inline:contain;-webkit-overflow-scrolling:touch;padding:1px 1px 3px;scrollbar-width:none}
      .screen[data-screen="outfits"] #${ROOT_ID} .sticker-pack-strip::-webkit-scrollbar{display:none}
      .screen[data-screen="outfits"] #${ROOT_ID} .sticker-pack-btn{flex:0 0 auto;min-height:36px;padding:5px 9px;border:1px solid rgba(108,81,66,.16);border-radius:10px;background:rgba(255,250,240,.84);color:var(--ink);display:flex;align-items:center;gap:6px;font:700 10px/1.1 var(--sans);-webkit-tap-highlight-color:transparent}
      .screen[data-screen="outfits"] #${ROOT_ID} .sticker-pack-btn .pack-icon{font-size:15px;line-height:1}
      .screen[data-screen="outfits"] #${ROOT_ID} .sticker-pack-btn.active{background:var(--olive);border-color:var(--olive-dark);color:#fff;box-shadow:0 2px 5px rgba(63,73,55,.12)}
      .screen[data-screen="outfits"] #${ROOT_ID} .sticker-pack-head{display:flex;align-items:flex-end;justify-content:space-between;gap:10px;padding:0 2px}
      .screen[data-screen="outfits"] #${ROOT_ID} .sticker-pack-copy{display:grid;gap:1px;min-width:0}
      .screen[data-screen="outfits"] #${ROOT_ID} .sticker-pack-copy strong{font-family:var(--serif);font-size:15px;line-height:1.1;color:var(--ink)}
      .screen[data-screen="outfits"] #${ROOT_ID} .sticker-pack-copy small{font-size:9px;line-height:1.25;color:#817568}
      .screen[data-screen="outfits"] #${ROOT_ID} .sticker-pack-count{font-size:9px;font-weight:800;color:#7c746b;white-space:nowrap}
      .screen[data-screen="outfits"] #${ROOT_ID} .sticker-browser{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:7px;align-items:start;padding:1px 1px 6px}
      .screen[data-screen="outfits"] #${ROOT_ID} .sticker-tile{position:relative;min-width:0;min-height:70px;padding:6px 4px 5px;border:1px solid rgba(108,81,66,.13);border-radius:13px;background:rgba(255,252,246,.82);display:grid;place-items:center;grid-template-rows:1fr auto;gap:3px;color:var(--ink);box-shadow:0 1px 0 rgba(255,255,255,.7) inset;-webkit-tap-highlight-color:transparent;transition:transform .12s ease,background .12s ease,border-color .12s ease}
      .screen[data-screen="outfits"] #${ROOT_ID} .sticker-tile:nth-child(4n+2){transform:translateY(3px)}
      .screen[data-screen="outfits"] #${ROOT_ID} .sticker-tile:nth-child(4n+4){transform:translateY(5px)}
      .screen[data-screen="outfits"] #${ROOT_ID} .sticker-tile:active{transform:scale(.95)!important;background:#fffaf0;border-color:rgba(102,113,90,.32)}
      .screen[data-screen="outfits"] #${ROOT_ID} .sticker-preview{display:grid;place-items:center;width:48px;height:44px;font-size:30px;line-height:1;filter:saturate(1.08)}
      .screen[data-screen="outfits"] #${ROOT_ID} .sticker-tile[data-size-class="small"] .sticker-preview{font-size:27px}
      .screen[data-screen="outfits"] #${ROOT_ID} .sticker-tile[data-size-class="medium"] .sticker-preview{font-size:33px}
      .screen[data-screen="outfits"] #${ROOT_ID} .sticker-tile small{max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:8px;line-height:1.15;color:#756c62;font-weight:700}
      .screen[data-screen="outfits"] #${ROOT_ID} .sticker-tile.added::after{content:'✓';position:absolute;right:5px;top:5px;width:17px;height:17px;border-radius:999px;background:var(--olive);color:white;display:grid;place-items:center;font-size:10px;font-weight:900;box-shadow:0 1px 4px rgba(63,73,55,.18)}
      .screen[data-screen="outfits"] #${ROOT_ID} .sticker-footnote{padding:0 2px;font-size:8px;line-height:1.3;color:#91877a}
      @media(max-width:370px){.screen[data-screen="outfits"] #${ROOT_ID} .sticker-browser{grid-template-columns:repeat(3,minmax(0,1fr))}}
    `;
    document.head.appendChild(style);
  }

  function stickerPanel(){return document.querySelector('.decorate-studio-panel[data-decorate-group="stickers"]')}
  function stickerContent(){return stickerPanel()?.querySelector('.decorate-studio-content')||stickerPanel()}
  function packById(id){return STICKER_PACKS.find(pack=>pack.id===id)||STICKER_PACKS[0]}

  function addPlaceholderSticker(pack,sticker,button){
    if(typeof addCreativeItem!=='function')return;
    addCreativeItem('sticker',sticker.glyph);
    // Enrich the existing compatible object for the future Sticker Studio model.
    try{
      const item=boardItems.find(entry=>entry.uid===selectedBoardUid);
      if(item){
        item.stickerVersion=REGISTRY_VERSION;
        item.stickerPack=pack.id;
        item.stickerId=sticker.id;
        item.stickerSizeClass=sticker.sizeClass||'small';
        if(typeof item.stickerOutline==='undefined')item.stickerOutline=false;
        if(sticker.sizeClass==='medium'&&Number(item.w)===90&&Number(item.h)===90){item.w=108;item.h=108;drawBoard()}
      }
    }catch(_){/* compatibility metadata is optional in dev1 */}
    button?.classList.add('added');
    setTimeout(()=>button?.classList.remove('added'),550);
    if(typeof toast==='function')toast(`${sticker.label} added`);
  }

  function renderBrowser(){
    const root=document.getElementById(ROOT_ID);
    if(!root)return;
    const pack=packById(activePackId);
    root.querySelectorAll('.sticker-pack-btn').forEach(btn=>{
      const active=btn.dataset.pack===pack.id;
      btn.classList.toggle('active',active);
      btn.setAttribute('aria-pressed',active?'true':'false');
    });
    const head=root.querySelector('.sticker-pack-head');
    const browser=root.querySelector('.sticker-browser');
    if(head)head.innerHTML=`<div class="sticker-pack-copy"><strong>${pack.label} Pack</strong><small>${pack.description}</small></div><span class="sticker-pack-count">${pack.stickers.length} stickers</span>`;
    if(browser){
      browser.innerHTML=pack.stickers.map(sticker=>`<button type="button" class="sticker-tile" data-sticker-id="${sticker.id}" data-size-class="${sticker.sizeClass||'small'}" aria-label="Add ${sticker.label}"><span class="sticker-preview" aria-hidden="true">${sticker.glyph}</span><small>${sticker.label}</small></button>`).join('');
      browser.querySelectorAll('.sticker-tile').forEach(btn=>{
        btn.addEventListener('click',()=>{
          const sticker=pack.stickers.find(entry=>entry.id===btn.dataset.stickerId);
          if(sticker)addPlaceholderSticker(pack,sticker,btn);
        });
      });
    }
  }

  function mount(){
    installStyles();
    const content=stickerContent();
    if(!content||document.getElementById(ROOT_ID))return;
    const card=document.createElement('section');
    card.id=ROOT_ID;
    card.className='decorate-tool-card sticker-studio-dev1-card';
    card.setAttribute('aria-label','Sticker Studio');
    card.innerHTML=`
      <div class="sticker-pack-strip" role="group" aria-label="Sticker packs">
        ${STICKER_PACKS.map(pack=>`<button type="button" class="sticker-pack-btn${pack.id===activePackId?' active':''}" data-pack="${pack.id}" aria-pressed="${pack.id===activePackId?'true':'false'}"><span class="pack-icon" aria-hidden="true">${pack.icon}</span><span>${pack.label}</span></button>`).join('')}
      </div>
      <div class="sticker-pack-head"></div>
      <div class="sticker-browser" aria-live="polite"></div>
      <div class="sticker-footnote">Sticker pack browser preview • image assets and optional white outline come in the next Sticker Studio increments.</div>`;
    content.appendChild(card);
    card.querySelectorAll('.sticker-pack-btn').forEach(btn=>btn.addEventListener('click',()=>{
      activePackId=btn.dataset.pack||'standard';
      renderBrowser();
    }));
    renderBrowser();
  }

  function schedule(){requestAnimationFrame(()=>requestAnimationFrame(mount))}
  function start(){
    mount();
    document.addEventListener('click',e=>{
      const t=e.target;
      if(!(t instanceof Element))return;
      if(t.closest('.board-workspace-tab[data-board-panel="decorate"],.decorate-studio-tab[data-decorate-group="stickers"],#decorateToggle'))schedule();
    },false);
    window.addEventListener('pageshow',schedule);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
