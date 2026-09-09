/* Audrey Closet v13.24 — Smart Scan Phase 7A4 Service-First Runtime Bridge
 * Uses Audrey Smart Scan service when enabled for a deployment.
 * If service mode is not configured, preserves Phase 7A2 developer behavior.
 * Public service failures/offline conditions fall back to frozen Local Smart Scan v1.1.
 */
(function(){
  'use strict';
  const VERSION='13.24-phase7a4-service-runtime1';
  const CORE=window.AUDREY_SMART_SCAN;
  const LOCAL=window.smartScanLocal;
  const SERVICE=window.AUDREY_SMART_SCAN_SERVICE;
  const DEV=window.AUDREY_SMART_SCAN_AI_TRANSPORT;
  if(!CORE?.toPendingFlat||!LOCAL?.analyze||!SERVICE){console.warn('Smart Scan Phase 7A4 runtime skipped: dependencies unavailable.');return}

  function progress(stage,detail={}){window.dispatchEvent(new CustomEvent('audrey:smartscan-progress',{detail:{stage,...detail}}))}
  function serviceConfigured(){const c=SERVICE.getConfig();return Boolean(c.enabled&&c.endpoint)}
  function markServiceFallback(localResult,error){
    const c=SERVICE.getConfig();
    const result=CORE.normalizeResult({...localResult,engine:'local',fallbackUsed:true,provider:'openai',model:c.defaultModel||'',diagnostics:{...(localResult?.diagnostics||{}),fallback:{from:'audrey-smartscan-service',reason:error?.code||error?.message||'service failure'},transportVersion:VERSION}});
    CORE.lastResult=result;CORE.lastDiagnostics=result.diagnostics;API.lastResult=result;API.lastError=error||null;return result;
  }
  async function analyzeProduction(photo,{includeOCR=true,target='item'}={}){
    const cfg=SERVICE.getConfig();
    if(navigator.onLine===false){const err=Object.assign(new Error('Device is offline.'),{code:'SERVICE_OFFLINE'});progress('fallback-start',{engine:'local',fallback:true,message:'No internet connection. Using Local Smart Scan…'});return markServiceFallback(await LOCAL.analyze(photo,{includeOCR}),err)}
    try{
      progress('ai-request',{engine:'ai',message:'Sending this item to Smart Scan…'});
      const result=await SERVICE.analyze(photo,{target,model:cfg.defaultModel,detail:cfg.detail});
      CORE.lastResult=result;CORE.lastDiagnostics=result.diagnostics;API.lastResult=result;API.lastError=null;
      progress('ai-validating',{engine:'ai',message:'Validating detected clothing details…'});
      return result;
    }catch(err){
      console.warn('Audrey Smart Scan service failed; using Local Smart Scan v1.1 fallback.',err);
      progress('fallback-start',{engine:'local',fallback:true,message:err?.code==='RATE_LIMITED'?'Smart Scan limit reached. Using Local Smart Scan…':'AI was unavailable. Continuing with Local Smart Scan…'});
      return markServiceFallback(await LOCAL.analyze(photo,{includeOCR}),err);
    }
  }

  const previousSmartScan=window.smartScan;
  window.smartScan=async function(target='item'){
    if(!serviceConfigured())return typeof previousSmartScan==='function'?previousSmartScan(target):undefined;
    smartScanTarget=target==='wish'?'wish':'item';
    const photo=smartScanTarget==='wish'?wishWorkingPhoto:itemWorkingPhoto;
    if(!photo)return toast('Take or choose a photo first');
    progress('scan-start',{engine:navigator.onLine===false?'local':'ai',target:smartScanTarget,photo,message:navigator.onLine===false?'No internet connection. Preparing Local Smart Scan…':'Preparing this item for AI Smart Scan…'});
    const busyText=navigator.onLine===false?'Scanning locally…':'AI is analyzing category, type, color and pattern…';
    if(smartScanTarget==='wish'){['#wishSmartScanBtn','#wishPhotoMenuBtn','#saveWishBtn'].forEach(sel=>{const el=$(sel);if(el)el.disabled=true});$('#wishScanStatus').textContent=busyText}else setPhotoBusy(true,busyText);
    try{
      const result=await analyzeProduction(photo,{includeOCR:true,target:smartScanTarget});
      pendingSmartScanResult=CORE.toPendingFlat(result);if(!pendingSmartScanResult.type)delete pendingSmartScanResult.type;
      progress('scan-complete',{engine:result.engine,fallbackUsed:result.fallbackUsed,message:result.engine==='ai'?'AI Smart Scan complete.':'Smart Scan complete.'});
      openSmartScanReview(pendingSmartScanResult);
      const status=result.engine==='ai'?'AI Smart Scan complete. Review detected details before applying.':(result.fallbackUsed?'AI was unavailable or limited, so Local Smart Scan was used. Review detected details before applying.':'Smart Scan complete. Review detected details before applying.');
      $(smartScanTarget==='wish'?'#wishScanStatus':'#scanStatus').textContent=status;
    }catch(err){
      progress('scan-error',{engine:'ai',message:'Smart Scan could not analyze this photo.'});console.error(err);toast('Smart Scan could not analyze this photo');$(smartScanTarget==='wish'?'#wishScanStatus':'#scanStatus').textContent='Smart Scan could not analyze this photo.';
    }finally{
      if(smartScanTarget==='wish')['#wishSmartScanBtn','#wishPhotoMenuBtn','#saveWishBtn'].forEach(sel=>{const el=$(sel);if(el)el.disabled=false});else setPhotoBusy(false);
    }
  };

  function applyServiceUI(){
    if(!serviceConfigured())return;
    const keyRow=document.getElementById('smartScanAIApiKey')?.closest('label');if(keyRow)keyRow.hidden=true;
    const test=document.getElementById('smartScanAITestBtn');if(test)test.hidden=true;
    const result=document.getElementById('smartScanAITestResult');if(result)result.hidden=true;
    const enabled=document.getElementById('smartScanAIEnabled');if(enabled){enabled.checked=true;enabled.disabled=true}
    const provider=document.getElementById('smartScanAIProvider');if(provider)provider.disabled=true;
    const status=document.getElementById('smartScanAIStatus');if(status)status.textContent='AI Smart Scan is provided securely by Audrey Closet. No personal API key is required.';
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(applyServiceUI,0),{once:true});else setTimeout(applyServiceUI,0);

  const API={version:VERSION,isServiceMode:serviceConfigured,analyzeProduction,devTransport:DEV||null,lastResult:null,lastError:null};
  window.AUDREY_SMART_SCAN_PRODUCTION_RUNTIME=API;
  console.info(`Audrey Smart Scan ${VERSION} loaded: service-first production bridge ready.`);
})();
