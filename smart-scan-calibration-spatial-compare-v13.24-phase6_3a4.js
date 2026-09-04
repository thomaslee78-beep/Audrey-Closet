/* Audrey Closet v13.24 — Smart Scan Phase 6.3A4 Spatial Pattern Comparator
 * Adds Phase 5.4 experimental spatial pattern output beside baseline/calibrated results.
 */
(function(){
  'use strict';
  const VERSION='13.24-phase6.3a4-spatial-compare1';
  const CATALOG=window.AUDREY_SMART_SCAN_CALIBRATION_CATALOG;
  const SPATIAL=window.AUDREY_SMART_SCAN_PHASE54_EXP;
  if(!CATALOG||!SPATIAL){console.warn('Smart Scan spatial comparator skipped: dependencies unavailable.');return}
  function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
  function pct(v){return Math.round((Number(v)||0)*1000)/10+'%'}
  function num(v,d=2){return Number(v||0).toFixed(d)}
  function renderCombined(report,spatial){
    const host=document.getElementById('sscResult');if(!host)return;
    const z=spatial?.diagnostics?.zones||{},conn=spatial?.diagnostics?.connected||{};
    host.innerHTML=`<div class="ssc-result-grid"><div class="ssc-result-card"><h5>Phase 5.3 baseline</h5><p>Pattern: ${esc(report?.baseline?.pattern||'—')}</p><p>Color: ${esc(report?.baseline?.color||'—')}</p><p>Category: ${esc(report?.baseline?.category||'—')}</p></div><div class="ssc-result-card"><h5>Current Calibration</h5><p>Pattern: ${esc(report?.calibrated?.pattern||'—')}</p><p>Color: ${esc(report?.calibrated?.color||'—')}</p><p>Category: ${esc(report?.calibrated?.category||'—')}</p></div></div><div class="ssc-result-card" style="margin-top:8px"><h5>Phase 5.4 Spatial Experiment</h5><p class="ssc-change">Pattern: ${esc(spatial?.pattern||'—')}</p><p>Confidence: ${pct(spatial?.confidence||0)}</p><p>Reason: ${esc(spatial?.reason||'—')}</p></div><div class="ssc-metrics"><strong>Spatial evidence</strong><br>Left edge range: ${pct(z.left?.range)} · Right edge range: ${pct(z.right?.range)}<br>Edge similarity distance: ${num(z.edgeDistance)} · Edges match: ${z.edgesMatch?'yes':'no'}<br>Center contrast share: ${pct(z.center?.share)} · Center mean difference: ${num(z.center?.meanDifference)}<br>Vertical-edge transitions: ${num(z.vertical?.count,1)} · regularity ${pct(z.vertical?.regularity)}<br>Bottom transitions: ${num(z.bottom?.count,1)} · regularity ${pct(z.bottom?.regularity)}<br>Combined contrast area: ${pct(conn.totalShare)} · Largest connected contrast: ${pct(conn.largestShare)}<br><br><strong>Testing:</strong> ${esc(report?.catalog?.label||'selected catalog photo')}</div>`;
  }
  async function run(){
    const item=CATALOG.getSelectedItem();if(!item?.photo)return CATALOG.testSelectedCatalogPhoto();
    const report=await CATALOG.testSelectedCatalogPhoto();if(!report)return null;
    const spatial=await SPATIAL.analyze(item.photo);renderCombined(report,spatial);console.info('Audrey Smart Scan spatial comparison',{report,spatial});return{report,spatial};
  }
  function bind(){const b=document.getElementById('sscTestPhotoBtn');if(!b)return false;b.textContent='Compare pattern models';b.onclick=run;return true}
  const tryBind=()=>{if(!bind())setTimeout(bind,200)};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',tryBind,{once:true});else tryBind();
  window.AUDREY_SMART_SCAN_CALIBRATION_SPATIAL_COMPARE={version:VERSION,run};
  console.info(`Audrey Smart Scan ${VERSION} loaded: Calibration Lab compares Phase 5.3, current calibration, and Phase 5.4 spatial experiment.`);
})();
