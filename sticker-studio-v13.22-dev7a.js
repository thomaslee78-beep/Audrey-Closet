/* Audrey Closet v13.22 Sticker Studio dev7a
 * Adds an intentional Emoji pack containing all original glyph stickers from
 * Standard, Music, Cute Animals and Fashion. Existing themed packs remain
 * unchanged while they transition to illustrated assets.
 */
(function(){
  'use strict';

  const STYLE_ID='stickerStudioV1322Dev7aStyles';
  const PACK_ID='emoji';

  const EMOJI_STICKERS=[
    // Standard originals
    {id:'emoji-heart',label:'Heart',glyph:'♥',sizeClass:'small',sourcePack:'standard'},
    {id:'emoji-diamond',label:'Diamond',glyph:'◆',sizeClass:'small',sourcePack:'standard'},
    {id:'emoji-star',label:'Star',glyph:'★',sizeClass:'small',sourcePack:'standard'},
    {id:'emoji-happy',label:'Happy face',glyph:'☺',sizeClass:'small',sourcePack:'standard'},
    {id:'emoji-sparkle',label:'Sparkle',glyph:'✨',sizeClass:'small',sourcePack:'standard'},
    {id:'emoji-lightning',label:'Lightning',glyph:'⚡',sizeClass:'small',sourcePack:'standard'},
    {id:'emoji-flower',label:'Flower',glyph:'🌼',sizeClass:'small',sourcePack:'standard'},
    {id:'emoji-rainbow',label:'Rainbow',glyph:'🌈',sizeClass:'small',sourcePack:'standard'},
    {id:'emoji-cloud',label:'Cloud',glyph:'☁️',sizeClass:'small',sourcePack:'standard'},
    {id:'emoji-sun',label:'Sun',glyph:'☀️',sizeClass:'small',sourcePack:'standard'},
    {id:'emoji-moon',label:'Moon',glyph:'🌙',sizeClass:'small',sourcePack:'standard'},
    {id:'emoji-butterfly',label:'Butterfly',glyph:'🦋',sizeClass:'small',sourcePack:'standard'},

    // Music originals
    {id:'emoji-treble-clef',label:'Treble clef',glyph:'𝄞',sizeClass:'small',sourcePack:'music'},
    {id:'emoji-bass-clef',label:'Bass clef',glyph:'𝄢',sizeClass:'small',sourcePack:'music'},
    {id:'emoji-guitar',label:'Guitar',glyph:'🎸',sizeClass:'small',sourcePack:'music'},
    {id:'emoji-piano',label:'Piano',glyph:'🎹',sizeClass:'small',sourcePack:'music'},
    {id:'emoji-drums',label:'Drums',glyph:'🥁',sizeClass:'small',sourcePack:'music'},
    {id:'emoji-microphone',label:'Microphone',glyph:'🎤',sizeClass:'small',sourcePack:'music'},
    {id:'emoji-notes',label:'Music notes',glyph:'🎵',sizeClass:'small',sourcePack:'music'},
    {id:'emoji-double-notes',label:'Double notes',glyph:'🎶',sizeClass:'small',sourcePack:'music'},
    {id:'emoji-headphones',label:'Headphones',glyph:'🎧',sizeClass:'small',sourcePack:'music'},
    {id:'emoji-record',label:'Record',glyph:'💿',sizeClass:'small',sourcePack:'music'},
    {id:'emoji-amp',label:'Guitar amp',glyph:'▣',sizeClass:'small',sourcePack:'music'},
    {id:'emoji-sheet',label:'Sheet music',glyph:'▤',sizeClass:'small',sourcePack:'music'},

    // Cute Animal originals
    {id:'emoji-dog',label:'Dog',glyph:'🐶',sizeClass:'small',sourcePack:'cute-animals'},
    {id:'emoji-cat',label:'Cat',glyph:'🐱',sizeClass:'small',sourcePack:'cute-animals'},
    {id:'emoji-lion',label:'Lion',glyph:'🦁',sizeClass:'small',sourcePack:'cute-animals'},
    {id:'emoji-tiger',label:'Tiger',glyph:'🐯',sizeClass:'small',sourcePack:'cute-animals'},
    {id:'emoji-fish',label:'Fish',glyph:'🐠',sizeClass:'small',sourcePack:'cute-animals'},
    {id:'emoji-frog',label:'Frog',glyph:'🐸',sizeClass:'small',sourcePack:'cute-animals'},
    {id:'emoji-mouse',label:'Mouse',glyph:'🐭',sizeClass:'small',sourcePack:'cute-animals'},
    {id:'emoji-bunny',label:'Bunny',glyph:'🐰',sizeClass:'small',sourcePack:'cute-animals'},
    {id:'emoji-bear',label:'Bear',glyph:'🐻',sizeClass:'small',sourcePack:'cute-animals'},
    {id:'emoji-panda',label:'Panda',glyph:'🐼',sizeClass:'small',sourcePack:'cute-animals'},
    {id:'emoji-fox',label:'Fox',glyph:'🦊',sizeClass:'small',sourcePack:'cute-animals'},
    {id:'emoji-penguin',label:'Penguin',glyph:'🐧',sizeClass:'small',sourcePack:'cute-animals'},

    // Fashion originals
    {id:'emoji-button',label:'Button',glyph:'◉',sizeClass:'small',sourcePack:'fashion'},
    {id:'emoji-pin',label:'Pin',glyph:'📌',sizeClass:'small',sourcePack:'fashion'},
    {id:'emoji-swatch',label:'Fabric swatch',glyph:'▧',sizeClass:'small',sourcePack:'fashion'},
    {id:'emoji-watch',label:'Watch',glyph:'⌚',sizeClass:'small',sourcePack:'fashion'},
    {id:'emoji-necklace',label:'Necklace',glyph:'💎',sizeClass:'small',sourcePack:'fashion'},
    {id:'emoji-sunglasses',label:'Sunglasses',glyph:'🕶️',sizeClass:'small',sourcePack:'fashion'},
    {id:'emoji-bag',label:'Handbag',glyph:'👜',sizeClass:'small',sourcePack:'fashion'},
    {id:'emoji-thread',label:'Thread',glyph:'🧵',sizeClass:'small',sourcePack:'fashion'},
    {id:'emoji-needle',label:'Needle',glyph:'🪡',sizeClass:'small',sourcePack:'fashion'},
    {id:'emoji-bow',label:'Bow',glyph:'🎀',sizeClass:'small',sourcePack:'fashion'},
    {id:'emoji-shoe',label:'Shoe',glyph:'👠',sizeClass:'small',sourcePack:'fashion'},
    {id:'emoji-hanger',label:'Hanger',glyph:'♧',sizeClass:'small',sourcePack:'fashion'}
  ];

  const EMOJI_PACK={
    id:PACK_ID,
    label:'Emoji',
    icon:'☺',
    description:'Quick glyph stickers from every original pack.',
    stickers:EMOJI_STICKERS
  };

  function registry(){return window.AUDREY_STICKER_PACKS_V1}
  function root(){return document.getElementById('stickerStudioV1322Dev1')}

  function installStyles(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      .screen[data-screen="outfits"] #stickerStudioV1322Dev1 .sticker-pack-btn[data-pack="emoji"] .pack-icon{
        font-size:16px;line-height:1;
      }
      .screen[data-screen="outfits"] #stickerStudioV1322Dev1[data-active-pack-dev7a="emoji"] .sticker-browser{
        grid-auto-flow:dense!important;
      }
      .screen[data-screen="outfits"] #stickerStudioV1322Dev1[data-active-pack-dev7a="emoji"] .sticker-tile{
        grid-column:span 1!important;
        grid-row:span 1!important;
        min-height:0!important;
        padding:5px 3px 4px!important;
      }
      .screen[data-screen="outfits"] #stickerStudioV1322Dev1[data-active-pack-dev7a="emoji"] .sticker-preview{
        width:42px!important;height:38px!important;font-size:26px!important;
      }
    `;
    document.head.appendChild(style);
  }

  function registerPack(){
    const reg=registry();
    if(!reg||!Array.isArray(reg.packs))return false;
    if(!reg.packs.some(pack=>pack.id===PACK_ID))reg.packs.push(EMOJI_PACK);
    return true;
  }

  function addEmojiSticker(sticker,button){
    if(typeof addCreativeItem!=='function')return;
    addCreativeItem('sticker',sticker.glyph);
    try{
      const item=Array.isArray(boardItems)?boardItems.find(entry=>entry.uid===selectedBoardUid):null;
      if(item){
        item.stickerVersion=registry()?.version||1;
        item.stickerPack=PACK_ID;
        item.stickerId=sticker.id;
        item.stickerSizeClass='small';
        if(typeof item.stickerOutline==='undefined')item.stickerOutline=false;
        item.w=84;
        item.h=84;
        if(typeof drawBoard==='function')drawBoard();
      }
    }catch(_){ }
    button?.classList.add('added');
    setTimeout(()=>button?.classList.remove('added'),550);
    if(typeof toast==='function')toast(`${sticker.label} added`);
  }

  function renderEmoji(){
    const studio=root();
    if(!studio)return;
    studio.dataset.activePackDev7a=PACK_ID;
    studio.querySelectorAll('.sticker-pack-btn').forEach(btn=>{
      const active=btn.dataset.pack===PACK_ID;
      btn.classList.toggle('active',active);
      btn.setAttribute('aria-pressed',active?'true':'false');
    });
    const head=studio.querySelector('.sticker-pack-head');
    const browser=studio.querySelector('.sticker-browser');
    if(head)head.innerHTML=`<div class="sticker-pack-copy"><strong>Emoji Pack</strong><small>${EMOJI_PACK.description}</small></div><span class="sticker-pack-count">${EMOJI_STICKERS.length} stickers</span>`;
    if(!browser)return;
    browser.innerHTML=EMOJI_STICKERS.map(sticker=>`<button type="button" class="sticker-tile" data-sticker-id="${sticker.id}" data-size-class="small" aria-label="Add ${sticker.label}"><span class="sticker-preview" aria-hidden="true">${sticker.glyph}</span><small>${sticker.label}</small></button>`).join('');
    browser.querySelectorAll('.sticker-tile').forEach(btn=>btn.addEventListener('click',()=>{
      const sticker=EMOJI_STICKERS.find(entry=>entry.id===btn.dataset.stickerId);
      if(sticker)addEmojiSticker(sticker,btn);
    }));
  }

  function ensurePackButton(){
    const studio=root();
    const strip=studio?.querySelector('.sticker-pack-strip');
    if(!strip)return;
    if(strip.querySelector('.sticker-pack-btn[data-pack="emoji"]'))return;
    const btn=document.createElement('button');
    btn.type='button';
    btn.className='sticker-pack-btn';
    btn.dataset.pack=PACK_ID;
    btn.setAttribute('aria-pressed','false');
    btn.innerHTML='<span class="pack-icon" aria-hidden="true">☺</span><span>Emoji</span>';
    btn.addEventListener('click',renderEmoji);
    strip.appendChild(btn);
  }

  function clearEmojiModeWhenOtherPackSelected(e){
    const target=e.target;
    if(!(target instanceof Element))return;
    const btn=target.closest('#stickerStudioV1322Dev1 .sticker-pack-btn');
    if(btn&&btn.dataset.pack!==PACK_ID)root()?.removeAttribute('data-active-pack-dev7a');
  }

  function reconcile(){
    installStyles();
    if(!registerPack())return;
    ensurePackButton();
  }

  function schedule(){requestAnimationFrame(()=>requestAnimationFrame(reconcile))}

  function start(){
    reconcile();
    document.addEventListener('click',clearEmojiModeWhenOtherPackSelected,true);
    document.addEventListener('click',e=>{
      const target=e.target;
      if(!(target instanceof Element))return;
      if(target.closest('.decorate-studio-tab[data-decorate-group="stickers"],.board-workspace-tab[data-board-panel="decorate"],#decorateToggle'))schedule();
    },false);
    window.addEventListener('pageshow',schedule);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
