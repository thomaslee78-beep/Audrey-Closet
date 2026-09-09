/* Audrey Closet v13.24 — Smart Scan Phase 7A4A Production Service Adapter
 * Browser-side client for an Audrey-controlled Smart Scan service.
 * No provider API key is stored or sent by the browser in service mode.
 * This module is dormant until a deployment injects window.AUDREY_SMART_SCAN_SERVICE_CONFIG.endpoint.
 */
(function(){
  'use strict';
  const VERSION='13.24-phase7a4a-service-adapter1';
  const APP_ID='audrey-closet';
  const FEATURE='smartscan';
  const CORE=window.AUDREY_SMART_SCAN;
  const AI=window.smartScanAI;
  const TELEMETRY=window.AUDREY_SMART_SCAN_TELEMETRY;
  if(!CORE?.normalizeResult||!CORE?.taxonomy){console.warn('Smart Scan Phase 7A4A skipped: Phase 6.3 contract unavailable.');return}

  const clone=x=>x==null?x:JSON.parse(JSON.stringify(x));
  function id(prefix='req'){try{if(crypto?.randomUUID)return `${prefix}_${crypto.randomUUID()}`}catch{}return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,10)}`}
  function deploymentConfig(){const c=window.AUDREY_SMART_SCAN_SERVICE_CONFIG||{};return{endpoint:String(c.endpoint||'').replace(/\/$/,''),enabled:Boolean(c.enabled),defaultModel:String(c.defaultModel||'gpt-5.6-luna'),detail:String(c.detail||'auto')}}
  function identity(){const t=TELEMETRY?.identity?.()||{};return{appId:t.appId||APP_ID,feature:t.feature||FEATURE,installId:t.installId||'',sessionId:t.sessionId||'',userId:t.userId||null}}
  function isAvailable(){const c=deploymentConfig();return Boolean(c.enabled&&c.endpoint&&navigator.onLine!==false)}
  function buildEnvelope(photo,{model,detail,target='item'}={}){
    if(!photo)throw Object.assign(new Error('No photo supplied to Smart Scan service.'),{code:'SERVICE_NO_PHOTO'});
    const c=deploymentConfig(),cfg=AI?.getConfig?.()||{};
    return{schemaVersion:1,requestId:id('smartscan'),...identity(),target,model:String(model||cfg.model||c.defaultModel||'gpt-5.6-luna'),detail:String(detail||cfg.detail||c.detail||'auto'),image:photo,taxonomyVersion:1,client:{smartScanContract:CORE.version||'',serviceAdapter:VERSION}};
  }
  function normalizeServiceResult(body){
    const raw=body?.result||{};
    const result=CORE.normalizeResult({engine:'ai',fallbackUsed:false,provider:String(body?.provider||'openai'),model:String(body?.model||raw?.model||''),category:raw.category,type:raw.type,color:raw.color,pattern:raw.pattern,brand:raw.brand,size:raw.size,diagnostics:{contractVersion:CORE.version,serviceVersion:String(body?.serviceVersion||''),serviceRequestId:String(body?.requestId||''),providerRequestId:String(body?.providerRequestId||''),requestMs:Number(body?.requestMs||0)||0,usage:clone(body?.usage||{}),transport:'audrey-smartscan-service'}});
    if(!result.category.value||!result.color.value||!result.pattern.value){const err=new Error('Smart Scan service returned an incomplete result.');err.code='SERVICE_INVALID_RESULT';throw err}
    return result;
  }
  async function analyze(photo,opts={}){
    const c=deploymentConfig();
    if(!c.enabled||!c.endpoint){const err=new Error('Smart Scan service is not configured for this deployment.');err.code='SERVICE_NOT_CONFIGURED';throw err}
    if(navigator.onLine===false){const err=new Error('Device is offline.');err.code='SERVICE_OFFLINE';throw err}
    const envelope=buildEnvelope(photo,opts),started=performance.now();
    const response=await fetch(c.endpoint+'/v1/smartscan/analyze',{method:'POST',headers:{'Content-Type':'application/json','X-Audrey-App':APP_ID,'X-Audrey-Feature':FEATURE,'X-Audrey-Request':envelope.requestId},body:JSON.stringify(envelope)});
    let body={};try{body=await response.json()}catch{}
    if(!response.ok){const err=new Error(body?.error?.message||body?.message||('Smart Scan service returned HTTP '+response.status));err.status=response.status;err.code=body?.error?.code||'SERVICE_HTTP_ERROR';err.retryAfter=body?.retryAfter||null;throw err}
    const result=normalizeServiceResult(body);
    result.diagnostics={...(result.diagnostics||{}),clientRequestMs:Math.round(performance.now()-started)};
    API.lastResult=result;API.lastResponse=clone(body);API.lastError=null;return result;
  }
  async function health(){const c=deploymentConfig();if(!c.endpoint)throw new Error('Smart Scan service endpoint is not configured.');const r=await fetch(c.endpoint+'/health',{headers:{'X-Audrey-App':APP_ID}});let b={};try{b=await r.json()}catch{}if(!r.ok)throw new Error(b?.message||('Service health check returned HTTP '+r.status));return b}

  const API={version:VERSION,appId:APP_ID,feature:FEATURE,getConfig:deploymentConfig,identity,isAvailable,buildEnvelope,normalizeServiceResult,analyze,health,lastResult:null,lastResponse:null,lastError:null};
  window.AUDREY_SMART_SCAN_SERVICE=API;
  console.info(`Audrey Smart Scan ${VERSION} loaded: production service adapter ready; current scan path unchanged until endpoint is enabled.`);
})();
