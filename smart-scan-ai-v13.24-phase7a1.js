/* Audrey Closet v13.24 — Smart Scan Phase 7A1 AI Configuration & Adapter
 * Adds developer-only AI Smart Scan configuration and a provider-neutral adapter seam.
 * No AI network request is made in this phase. Local Smart Scan v1.1 remains the active engine.
 */
(function(){
  'use strict';
  const VERSION='13.24-phase7a1-config-adapter1';
  const CORE=window.AUDREY_SMART_SCAN;
  if(!CORE?.taxonomy||!CORE?.normalizeResult){
    console.warn('Smart Scan Phase 7A1 skipped: Phase 6.3 contract unavailable.');
    return;
  }

  const STORAGE_KEY='audreySmartScanAIConfigV1';
  const DEFAULTS={
    enabled:false,
    provider:'openai',
    model:'gpt-5.6-luna',
    apiKey:'',
    detail:'auto'
  };
  const PROVIDERS=[{id:'openai',label:'OpenAI'}];
  const MODELS=[
    {id:'gpt-5.6-luna',label:'GPT-5.6 Luna'},
    {id:'gpt-5.6-terra',label:'GPT-5.6 Terra'},
    {id:'gpt-5.6-sol',label:'GPT-5.6 Sol'}
  ];

  function clone(x){return x==null?x:JSON.parse(JSON.stringify(x))}
  function loadConfig(){
    let saved={};
    try{saved=JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}')||{}}catch{}
    const cfg={...DEFAULTS,...saved};
    if(!PROVIDERS.some(x=>x.id===cfg.provider))cfg.provider=DEFAULTS.provider;
    if(!MODELS.some(x=>x.id===cfg.model))cfg.model=DEFAULTS.model;
    if(!['low','high','auto'].includes(cfg.detail))cfg.detail='auto';
    cfg.enabled=Boolean(cfg.enabled);
    cfg.apiKey=String(cfg.apiKey||'');
    return cfg;
  }
  function saveConfig(next){
    const cfg={...loadConfig(),...next};
    localStorage.setItem(STORAGE_KEY,JSON.stringify(cfg));
    API.config=cfg;
    syncUI();
    return clone(cfg);
  }
  function publicConfig(){const c=loadConfig();return{...c,apiKey:c.apiKey?'••••••••':''}}
  function isConfigured(){const c=loadConfig();return c.enabled&&c.provider==='openai'&&Boolean(c.model)&&Boolean(c.apiKey)}

  function taxonomyPayload(){return clone(CORE.taxonomy)}
  function resultSchema(){
    const t=CORE.taxonomy;
    const allTypes=[...new Set(Object.values(t.types||{}).flat())];
    return{
      name:'audrey_smart_scan_result',strict:true,
      schema:{
        type:'object',additionalProperties:false,
        properties:{
          category:{type:'string',enum:['',...t.categories]},
          type:{type:'string',enum:['',...allTypes]},
          color:{type:'string',enum:['',...t.colors]},
          pattern:{type:'string',enum:['',...t.patterns]},
          brand:{type:'string'},
          size:{type:'string'},
          confidence:{
            type:'object',additionalProperties:false,
            properties:{category:{type:'number',minimum:0,maximum:1},type:{type:'number',minimum:0,maximum:1},color:{type:'number',minimum:0,maximum:1},pattern:{type:'number',minimum:0,maximum:1}},
            required:['category','type','color','pattern']
          }
        },
        required:['category','type','color','pattern','brand','size','confidence']
      }
    };
  }

  function buildOpenAIRequest(photo){
    const cfg=loadConfig(),taxonomy=taxonomyPayload(),schema=resultSchema();
    return{
      model:cfg.model,
      input:[{
        role:'user',
        content:[
          {type:'input_text',text:'Analyze this clothing item for Audrey Closet. Choose only values from the supplied taxonomy. Return the most likely category, exact type within that category, primary color, pattern, visible brand if any, visible size if any, and confidence for category/type/color/pattern. Taxonomy: '+JSON.stringify(taxonomy)},
          {type:'input_image',image_url:photo,detail:cfg.detail}
        ]
      }],
      text:{format:{type:'json_schema',...schema}}
    };
  }

  function normalizeAIOutput(raw,{provider='openai',model=''}={}){
    const confidence=raw?.confidence||{};
    return CORE.normalizeResult({
      engine:'ai',fallbackUsed:false,provider,model,
      category:{value:raw?.category||'',confidence:confidence.category},
      type:{value:raw?.type||'',confidence:confidence.type},
      color:{value:raw?.color||'',confidence:confidence.color},
      pattern:{value:raw?.pattern||'',confidence:confidence.pattern},
      brand:{value:raw?.brand||'',confidence:null},
      size:{value:raw?.size||'',confidence:null},
      diagnostics:{contractVersion:CORE.version,aiVersion:VERSION,engine:'ai',provider,model}
    });
  }

  async function analyze(photo,taxonomy=CORE.taxonomy){
    void taxonomy;
    const cfg=loadConfig();
    if(!cfg.enabled)throw new Error('AI Smart Scan is disabled.');
    if(!cfg.apiKey)throw new Error('AI Smart Scan API key is not configured.');
    // Phase 7A1 intentionally stops before transport. Phase 7A2 will call the provider and validate its response.
    const err=new Error('AI transport is not enabled yet in Phase 7A1.');
    err.code='AI_TRANSPORT_NOT_IMPLEMENTED';
    throw err;
  }

  function settingsHost(){
    return document.querySelector('.screen[data-screen="more"] .settings-group-body')||document.querySelector('.screen[data-screen="more"]');
  }
  function installUI(){
    const host=settingsHost();
    if(!host||document.getElementById('smartScanAISettingsCard'))return false;
    const card=document.createElement('div');
    card.id='smartScanAISettingsCard';
    card.className='settings-card';
    card.innerHTML=`
      <h3>Smart Scan AI</h3>
      <p>Optional AI-assisted clothing analysis. Local Smart Scan remains the active engine in this phase.</p>
      <label class="field"><span>Enable AI Smart Scan</span><input type="checkbox" id="smartScanAIEnabled"></label>
      <label class="field"><span>Provider</span><select id="smartScanAIProvider">${PROVIDERS.map(x=>`<option value="${x.id}">${x.label}</option>`).join('')}</select></label>
      <label class="field"><span>Model</span><select id="smartScanAIModel">${MODELS.map(x=>`<option value="${x.id}">${x.label}</option>`).join('')}</select></label>
      <label class="field"><span>Image detail</span><select id="smartScanAIDetail"><option value="auto">Auto</option><option value="low">Low</option><option value="high">High</option></select></label>
      <label class="field"><span>API key <small>(local development only)</small></span><input type="password" id="smartScanAIApiKey" autocomplete="off" placeholder="sk-…"></label>
      <p class="empty-note" id="smartScanAIStatus">Phase 7A1: configuration only. No photo is sent to AI yet.</p>`;
    host.appendChild(card);
    const enabled=card.querySelector('#smartScanAIEnabled'),provider=card.querySelector('#smartScanAIProvider'),model=card.querySelector('#smartScanAIModel'),detail=card.querySelector('#smartScanAIDetail'),key=card.querySelector('#smartScanAIApiKey');
    enabled.addEventListener('change',()=>saveConfig({enabled:enabled.checked}));
    provider.addEventListener('change',()=>saveConfig({provider:provider.value}));
    model.addEventListener('change',()=>saveConfig({model:model.value}));
    detail.addEventListener('change',()=>saveConfig({detail:detail.value}));
    key.addEventListener('change',()=>saveConfig({apiKey:key.value.trim()}));
    syncUI();
    return true;
  }
  function syncUI(){
    const c=loadConfig();
    const enabled=document.getElementById('smartScanAIEnabled'),provider=document.getElementById('smartScanAIProvider'),model=document.getElementById('smartScanAIModel'),detail=document.getElementById('smartScanAIDetail'),key=document.getElementById('smartScanAIApiKey'),status=document.getElementById('smartScanAIStatus');
    if(enabled)enabled.checked=c.enabled;if(provider)provider.value=c.provider;if(model)model.value=c.model;if(detail)detail.value=c.detail;if(key&&document.activeElement!==key)key.value=c.apiKey;
    if(status)status.textContent=c.enabled?(c.apiKey?'Configured for development. Phase 7A1 still uses Local Smart Scan only.':'AI enabled, but an API key is still needed for development testing.'):'AI Smart Scan is off. Local Smart Scan v1.1 is active.';
  }
  function ensureUI(){if(!installUI())setTimeout(installUI,250)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ensureUI,{once:true});else ensureUI();

  const API={version:VERSION,config:loadConfig(),providers:PROVIDERS,models:MODELS,getConfig:loadConfig,saveConfig,publicConfig,isConfigured,taxonomy:taxonomyPayload(),resultSchema:resultSchema(),buildOpenAIRequest,normalizeAIOutput,analyze};
  window.smartScanAI=API;
  window.AUDREY_SMART_SCAN_AI=API;
  console.info(`Audrey Smart Scan ${VERSION} loaded: AI configuration and adapter ready; Local remains active.`);
})();
