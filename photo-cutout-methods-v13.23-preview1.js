/* Audrey Closet v13.23 background-removal preview — Phase 1 Cutout Method framework.
 * Standard preserves the current production cutout path exactly.
 * Experimental methods are visible for evaluation planning but disabled until
 * their individual algorithm phases are implemented.
 */
(function(){
  'use strict';

  const METHODS=[
    {id:'standard',label:'Standard',help:'Uses the current background removal method.',enabled:true},
    {id:'center',label:'Center Focus',help:'Protects the main object near the center.',enabled:false},
    {id:'edge',label:'Edge Guide',help:'Looks for subtle outlines and shadows.',enabled:false},
    {id:'grow',label:'Subject Grow',help:'Builds outward from the main object.',enabled:false},
    {id:'blend',label:'Smart Blend',help:'Combines several subject clues.',enabled:false}
  ];

  let studioCutoutMethod='standard';

  function normalizeMethod(value){
    return METHODS.some(x=>x.id===value)?value:'standard';
  }

  function methodDef(value=studioCutoutMethod){
    return METHODS.find(x=>x.id===normalizeMethod(value))||METHODS[0];
  }

  function ensureMethodStyles(){
    if(document.getElementById('studioCutoutMethodStyles'))return;
    const style=document.createElement('style');
    style.id='studioCutoutMethodStyles';
    style.textContent=`
      .studio-cutout-methods{display:grid;gap:7px;margin-top:9px;padding-top:9px;border-top:1px solid rgba(108,81,66,.12)}
      .studio-cutout-method-heading{display:flex;align-items:center;justify-content:space-between;gap:10px}
      .studio-cutout-method-heading strong{font-size:11px;letter-spacing:.02em;color:#665c50}
      .studio-cutout-method-heading small{font-size:9px;color:#8a7d70}
      .studio-cutout-method-row{display:flex;gap:6px;overflow-x:auto;padding-bottom:2px;-webkit-overflow-scrolling:touch;scrollbar-width:none}
      .studio-cutout-method-row::-webkit-scrollbar{display:none}
      .studio-cutout-method-btn{flex:0 0 auto;min-height:34px;padding:7px 10px;border:1px solid rgba(108,81,66,.18);border-radius:10px;background:#f8f1e3;color:#675d51;font:800 10px/1.05 system-ui,-apple-system,sans-serif}
      .studio-cutout-method-btn.active{background:#6d7863;border-color:#6d7863;color:#fff}
      .studio-cutout-method-btn:disabled{opacity:.42;filter:saturate(.55)}
      .studio-cutout-methods.is-original .studio-cutout-method-row{opacity:.5;pointer-events:none}
      .studio-cutout-method-help{margin:0;font-size:9.5px;line-height:1.3;color:#817568}
    `;
    document.head.appendChild(style);
  }

  function methodHost(){
    const modes=[...document.querySelectorAll('.studio-mode')];
    if(!modes.length)return null;
    return modes[0].parentElement;
  }

  function syncMethodUI(){
    const root=document.getElementById('studioCutoutMethods');
    if(!root)return;
    root.classList.toggle('is-original',typeof studioMode!=='undefined'&&studioMode==='original');
    root.querySelectorAll('[data-cutout-method]').forEach(btn=>{
      const active=btn.dataset.cutoutMethod===studioCutoutMethod;
      btn.classList.toggle('active',active);
      btn.setAttribute('aria-pressed',active?'true':'false');
    });
    const help=root.querySelector('.studio-cutout-method-help');
    if(help)help.textContent=methodDef().help+(methodDef().enabled?'':' Coming in the next preview phase.');
  }

  function installMethodUI(){
    if(document.getElementById('studioCutoutMethods')){syncMethodUI();return;}
    const host=methodHost();
    if(!host)return;
    ensureMethodStyles();
    const root=document.createElement('section');
    root.id='studioCutoutMethods';
    root.className='studio-cutout-methods';
    root.setAttribute('aria-label','Cutout method');
    root.innerHTML=`
      <div class="studio-cutout-method-heading"><strong>Cutout method</strong><small>Preview lab</small></div>
      <div class="studio-cutout-method-row" role="group" aria-label="Choose cutout method"></div>
      <p class="studio-cutout-method-help"></p>`;
    const row=root.querySelector('.studio-cutout-method-row');
    METHODS.forEach(def=>{
      const btn=document.createElement('button');
      btn.type='button';
      btn.className='studio-cutout-method-btn';
      btn.dataset.cutoutMethod=def.id;
      btn.textContent=def.label;
      btn.disabled=!def.enabled;
      btn.setAttribute('aria-pressed','false');
      btn.addEventListener('click',async()=>{
        if(!def.enabled)return;
        studioCutoutMethod=def.id;
        syncMethodUI();
        if(typeof studioMode!=='undefined'&&studioMode!=='original'&&typeof applyStudioMode==='function'){
          await applyStudioMode(studioMode);
        }
      });
      row.appendChild(btn);
    });
    host.insertAdjacentElement('afterend',root);
    syncMethodUI();
  }

  const originalOpenPhotoStudioV1323Methods=openPhotoStudio;
  openPhotoStudio=async function(target='item'){
    const nextTarget=target==='wish'?'wish':'item';
    const saved=nextTarget==='wish'?wishStudioState:itemStudioState;
    studioCutoutMethod=normalizeMethod(saved&&saved.cutoutMethod);
    const result=await originalOpenPhotoStudioV1323Methods.apply(this,arguments);
    installMethodUI();
    syncMethodUI();
    return result;
  };

  const originalApplyStudioModeV1323Methods=applyStudioMode;
  applyStudioMode=async function(mode,options){
    // Phase 1 deliberately leaves Standard on the exact existing production path.
    // Experimental method algorithms will be introduced one at a time later.
    const result=await originalApplyStudioModeV1323Methods.apply(this,arguments);
    syncMethodUI();
    return result;
  };

  const originalApplyPhotoStudioV1323Methods=applyPhotoStudio;
  applyPhotoStudio=async function(){
    const target=typeof studioTarget!=='undefined'&&studioTarget==='wish'?'wish':'item';
    const result=await originalApplyPhotoStudioV1323Methods.apply(this,arguments);
    const stateRef=target==='wish'?wishStudioState:itemStudioState;
    if(stateRef&&typeof stateRef==='object')stateRef.cutoutMethod=normalizeMethod(studioCutoutMethod);
    return result;
  };

  window.__audreyCutoutMethodPreview={
    phase:1,
    getMethod:()=>studioCutoutMethod,
    methods:METHODS.map(x=>({...x}))
  };
})();
