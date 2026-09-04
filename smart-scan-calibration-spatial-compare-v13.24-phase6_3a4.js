/* Audrey Closet v13.24 — Smart Scan Phase 6.3A7 Hybrid Pattern Comparator
 * Compares Phase 5.3 baseline, current Calibration Lab, broad Phase 5.4 spatial model,
 * focused Phase 5.4B3 edge-contrast Solid/Graphic, and the hybrid structure-first experiment.
 */
(function(){
  'use strict';
  const VERSION='13.24-phase6.3a7-hybrid-compare2';
  const CATALOG=window.AUDREY_SMART_SCAN_CALIBRATION_CATALOG;
  const SPATIAL=window.AUDREY_SMART_SCAN_PHASE54_EXP;
  const SOLID_GRAPHIC=window.AUDREY_SMART_SCAN_PHASE54B_EXP;
  const HYBRID=window.AUDREY_SMART_SCAN_PHASE54C_EXP;
  if(!CATALOG||!SPATIAL||!SOLID_GRAPHIC||!HYBRID){console.warn('Smart Scan hybrid comparator skipped: dependencies unavailable.');return}
  function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
  function pct(v){return Math.round((Number(v)||0)*1000)/10+'%'}
  function num(v,d=2){return Number(v||0).toFixed(d)}
  function renderCombined(report,spatial,solidGraphic,hybrid){
    const host=document.getElementById('sscResult');if(!host)return;
    const z=spatial?.diagnostics?.zones||{},conn=spatial?.diagnostics?.connected||{},sg=solidGraphic?.diagnostics||{},sum=sg.summary||{},edges=sg.edges||{};
    const settings=report?.settings?.pattern||{};
    host.innerHTML=`<div class="ssc-result-grid"><div class="ssc-result-card"><h5>Phase 5.3 baseline</h5><p>Pattern: ${esc(report?.baseline?.pattern||'—')}</p><p>Color: ${esc(report?.baseline?.color||'—')}</p><p>Category: ${esc(report?.baseline?.category||'—')}</p></div><div class="ssc-result-card"><h5>Current Calibration</h5><p>Pattern: ${esc(report?.calibrated?.pattern||'—')}</p><p>Color: ${esc(report?.calibrated?.color||'—')}</p><p>Category: ${esc(report?.calibrated?.category||'—')}</p></div></div><div class="ssc-result-grid" style="margin-top:8px"><div class="ssc-result-card"><h5>Phase 5.4 Spatial</h5><p>Pattern: ${esc(spatial?.pattern||'—')}</p><p>Confidence: ${pct(spatial?.confidence||0)}</p></div><div class="ssc-result-card"><h5>Phase 5.4B3 Edge Contrast</h5><p>Pattern: ${esc(solidGraphic?.pattern||'—')}</p><p>Confidence: ${pct(solidGraphic?.confidence||0)}</p><p>Reason: ${esc(solidGraphic?.reason||'—')}</p></div></div><div class="ssc-result-card" style="margin-top:8px"><h5>Phase 5.4C Hybrid — candidate local flow</h5><p class="ssc-change">Pattern: ${esc(hybrid?.pattern||'—')}</p><p>Confidence: ${pct(hybrid?.confidence||0)}</p><p>Stage: ${esc(hybrid?.stage||'—')}</p><p>Reason: ${esc(hybrid?.reason||'—')}</p></div><div class="ssc-metrics"><strong>5.4B3 Solid/Graphic evidence</strong><br>Edge distance: ${num(edges.distance)} · edges match: ${edges.match?'yes':'no'} · edge stable: ${sg.edgeStable?'yes':'no'}<br>Chest regions sampled: ${num(sum.regionCount,0)} · graphic regions: ${num(sum.graphicRegionCount,0)}<br>Total true edge-relative contrast: ${pct(sum.totalContrastShare)} · strongest region: ${pct(sum.strongestRegionContrast)}<br>Different from both edges: ${pct(sum.differentFromBothShare)} · shadow-only share: ${pct(sum.shadowOnlyShare)}<br>Contrasting color families: ${esc((sum.contrastFamilies||[]).join(', ')||'none')} · chromatic families: ${num(sum.nonNeutralFamilyCount,0)}<br><br><strong>Structure-first settings</strong><br>Stripe repetition threshold: ${num(settings.stripeMinScore,2)} · Plaid axis threshold: ${num(settings.plaidMinAxis,2)} · Plaid coverage: ${pct(settings.plaidMinCoverage)}<br><br><strong>Broad spatial evidence</strong><br>Left edge range: ${pct(z.left?.range)} · Right edge range: ${pct(z.right?.range)} · Edges match: ${z.edgesMatch?'yes':'no'}<br>Center contrast: ${pct(z.center?.share)} · Vertical transitions: ${num(z.vertical?.count,1)} · Bottom transitions: ${num(z.bottom?.count,1)}<br>Combined contrast area: ${pct(conn.totalShare)} · Largest connected contrast: ${pct(conn.largestShare)}<br><br><strong>Testing:</strong> ${esc(report?.catalog?.label||'selected catalog photo')}</div>`;
  }
  async function run(){
    const item=CATALOG.getSelectedItem();if(!item?.photo)return CATALOG.testSelectedCatalogPhoto();
    const report=await CATALOG.testSelectedCatalogPhoto();if(!report)return null;
    const spatial=await SPATIAL.analyze(item.photo),solidGraphic=await SOLID_GRAPHIC.analyze(item.photo),hybrid=await HYBRID.analyze(item.photo);
    renderCombined(report,spatial,solidGraphic,hybrid);console.info('Audrey Smart Scan hybrid comparison',{report,spatial,solidGraphic,hybrid});return{report,spatial,solidGraphic,hybrid};
  }
  function bind(){const b=document.getElementById('sscTestPhotoBtn');if(!b)return false;b.textContent='Compare pattern models';b.onclick=run;return true}
  const tryBind=()=>{if(!bind())setTimeout(bind,200)};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',tryBind,{once:true});else tryBind();
  window.AUDREY_SMART_SCAN_CALIBRATION_SPATIAL_COMPARE={version:VERSION,run};
  console.info(`Audrey Smart Scan ${VERSION} loaded: Calibration Lab includes Phase 5.4B3 edge-contrast comparison.`);
})();
