/* Audrey Closet v13.24 — Smart Scan Phase 7A5A Progress Overlay
 * Preview UX layer for clear in-progress feedback during AI or Local Smart Scan.
 * Listens to Phase 7A2 progress events; does not perform recognition itself.
 */
(function(){
  'use strict';
  const VERSION='13.24-phase7a5a-progress-overlay1';
  let hideTimer=null;

  function installStyles(){
    if(document.getElementById('smartScanProgressStyles'))return;
    const style=document.createElement('style');style.id='smartScanProgressStyles';
    style.textContent=`
      #smartScanProgressOverlay{position:fixed;inset:0;z-index:9999;display:none;align-items:center;justify-content:center;padding:20px;background:rgba(28,28,24,.34);backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px)}
      #smartScanProgressOverlay.show{display:flex}
      .smart-scan-progress-card{width:min(360px,calc(100vw - 34px));display:grid;grid-template-columns:82px 1fr;gap:14px;align-items:center;padding:16px;border-radius:20px;background:#fffaf0;border:1px solid rgba(108,81,66,.16);box-shadow:0 16px 44px rgba(48,40,34,.22)}
      .smart-scan-progress-thumb{width:82px;height:82px;border-radius:16px;overflow:hidden;background:#eee6d8;border:1px solid rgba(108,81,66,.12);display:flex;align-items:center;justify-content:center}
      .smart-scan-progress-thumb img{width:100%;height:100%;object-fit:contain;background:#f7f3ea}
      .smart-scan-progress-copy{min-width:0;display:grid;gap:5px}
      .smart-scan-progress-kicker{font-size:10px;letter-spacing:.10em;text-transform:uppercase;font-weight:800;color:#7a7166}
      .smart-scan-progress-title{font-family:var(--serif);font-size:20px;line-height:1.15;color:var(--ink);font-weight:600}
      .smart-scan-progress-message{font-size:12px;line-height:1.4;color:#74695d}
      .smart-scan-progress-row{display:flex;align-items:center;gap:8px;margin-top:2px}
      .smart-scan-progress-spinner{width:16px;height:16px;border-radius:50%;border:2px solid rgba(102,113,90,.22);border-top-color:var(--olive);animation:smartScanSpin .8s linear infinite;flex:0 0 auto}
      .smart-scan-progress-engine{font-size:11px;font-weight:800;color:#5d6657}
      .smart-scan-progress-card[data-mode="fallback"]{border-color:rgba(178,138,61,.28)}
      .smart-scan-progress-card[data-mode="fallback"] .smart-scan-progress-engine{color:#8b6a2b}
      .smart-scan-progress-card[data-mode="error"]{border-color:rgba(160,78,72,.28)}
      .smart-scan-progress-card[data-mode="error"] .smart-scan-progress-engine{color:#8e4e49}
      @keyframes smartScanSpin{to{transform:rotate(360deg)}}`;
    document.head.appendChild(style);
  }

  function ensureOverlay(){
    installStyles();
    let overlay=document.getElementById('smartScanProgressOverlay');
    if(overlay)return overlay;
    overlay=document.createElement('div');overlay.id='smartScanProgressOverlay';overlay.setAttribute('role','status');overlay.setAttribute('aria-live','polite');overlay.setAttribute('aria-busy','true');
    overlay.innerHTML=`<div class="smart-scan-progress-card" data-mode="local"><div class="smart-scan-progress-thumb"><img id="smartScanProgressImage" alt="Item being analyzed"></div><div class="smart-scan-progress-copy"><div class="smart-scan-progress-kicker">Smart Scan</div><div class="smart-scan-progress-title" id="smartScanProgressTitle">Analyzing item</div><div class="smart-scan-progress-message" id="smartScanProgressMessage">Preparing scan…</div><div class="smart-scan-progress-row"><span class="smart-scan-progress-spinner" aria-hidden="true"></span><span class="smart-scan-progress-engine" id="smartScanProgressEngine">Local Smart Scan</span></div></div></div>`;
    document.body.appendChild(overlay);return overlay;
  }

  function setState({mode='local',title,message,engine,photo}={}){
    const overlay=ensureOverlay(),card=overlay.querySelector('.smart-scan-progress-card'),img=document.getElementById('smartScanProgressImage');
    card.dataset.mode=mode;
    if(photo&&img)img.src=photo;
    if(title)document.getElementById('smartScanProgressTitle').textContent=title;
    if(message)document.getElementById('smartScanProgressMessage').textContent=message;
    if(engine)document.getElementById('smartScanProgressEngine').textContent=engine;
  }
  function show(detail={}){clearTimeout(hideTimer);const ai=detail.engine==='ai';setState({mode:ai?'ai':'local',title:ai?'AI Smart Scan in progress':'Local Smart Scan in progress',message:detail.message||'Preparing this item…',engine:ai?'AI Smart Scan':'Local Smart Scan',photo:detail.photo});ensureOverlay().classList.add('show')}
  function update(detail={}){
    const fallback=detail.stage==='fallback-start'||detail.fallback;
    const error=detail.stage==='scan-error';
    setState({mode:error?'error':(fallback?'fallback':(detail.engine==='ai'?'ai':'local')),title:error?'Smart Scan could not finish':(fallback?'Switching to Local Smart Scan':(detail.engine==='ai'?'AI Smart Scan in progress':'Local Smart Scan in progress')),message:detail.message||'',engine:error?'Smart Scan':(fallback?'Local fallback':(detail.engine==='ai'?'AI Smart Scan':'Local Smart Scan'))});
  }
  function hide(delay=120){clearTimeout(hideTimer);hideTimer=setTimeout(()=>ensureOverlay().classList.remove('show'),delay)}

  window.addEventListener('audrey:smartscan-progress',e=>{
    const d=e.detail||{};
    if(d.stage==='scan-start')return show(d);
    if(d.stage==='scan-complete'){update(d);return hide(100)}
    if(d.stage==='scan-error'){update(d);return hide(850)}
    update(d);
  });

  const API={version:VERSION,show,update,hide};
  window.AUDREY_SMART_SCAN_PROGRESS=API;
  console.info(`Audrey Smart Scan ${VERSION} loaded: progress overlay listening for Smart Scan events.`);
})();
