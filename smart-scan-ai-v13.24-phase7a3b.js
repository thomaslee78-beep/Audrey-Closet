/* Audrey Closet v13.24 — Smart Scan Phase 7A3B Editable Review
 * Lets users accept, modify, or skip Smart Scan suggestions directly in the review dialog.
 * Uses existing Audrey taxonomy and apply pipeline; no saved-item schema changes.
 */
(function(){
  'use strict';
  const VERSION='13.24-phase7a3b-editable-review1';
  const CORE=window.AUDREY_SMART_SCAN;
  const TELEMETRY=window.AUDREY_SMART_SCAN_TELEMETRY;
  if(!CORE?.taxonomy){console.warn('Smart Scan Phase 7A3B skipped: Smart Scan contract unavailable.');return}

  const clone=x=>x==null?x:JSON.parse(JSON.stringify(x));
  const escHtml=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const KNOWN=['category','type','color','pattern','brand','size'];
  let proposal={};

  function installStyles(){
    if(document.getElementById('smartScanEditableReviewStyles'))return;
    const style=document.createElement('style');style.id='smartScanEditableReviewStyles';
    style.textContent=`
      #smartScanReviewFields.smart-scan-editable-fields{display:grid;gap:9px}
      .smart-scan-edit-row{display:grid;grid-template-columns:24px minmax(0,1fr);gap:9px;align-items:start;padding:10px 11px;border:1px solid rgba(108,81,66,.12);border-radius:14px;background:rgba(255,250,240,.72)}
      .smart-scan-edit-row>input[type="checkbox"]{margin-top:9px;width:17px;height:17px}
      .smart-scan-edit-main{display:grid;gap:5px;min-width:0}
      .smart-scan-edit-label{display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:12px;font-weight:750;color:var(--ink,#443d36)}
      .smart-scan-edit-control{width:100%;min-height:36px;border:1px solid rgba(108,81,66,.18);border-radius:10px;background:#fff;padding:7px 9px;font:inherit;color:inherit}
      .smart-scan-edit-control:disabled{opacity:.52;background:rgba(120,110,100,.06)}
      .smart-scan-edit-original{font-size:10px;font-weight:600;color:#8a7f74;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .smart-scan-edit-row.modified{border-color:rgba(178,138,61,.28);background:rgba(255,248,230,.72)}
      .smart-scan-edit-row.modified .smart-scan-edit-label::after{content:'Modified';font-size:9px;letter-spacing:.04em;text-transform:uppercase;color:#8b6a2b;font-weight:800}
    `;
    document.head.appendChild(style);
  }

  function options(values,selected,{includeBlank=false}={}){
    const list=Array.isArray(values)?values:[];
    return `${includeBlank?'<option value="">Not set</option>':''}${list.map(v=>`<option value="${escHtml(v)}"${String(v)===String(selected)?' selected':''}>${escHtml(v)}</option>`).join('')}`;
  }

  function controlFor(key,value){
    if(key==='category')return `<select class="smart-scan-edit-control" data-scan-edit="category">${options(CORE.taxonomy.categories,value)}</select>`;
    if(key==='type'){
      const category=proposal.category||'';
      return `<select class="smart-scan-edit-control" data-scan-edit="type">${options(CORE.taxonomy.types?.[category]||[],value,{includeBlank:true})}</select>`;
    }
    if(key==='color')return `<select class="smart-scan-edit-control" data-scan-edit="color">${options(CORE.taxonomy.colors,value)}</select>`;
    if(key==='pattern')return `<select class="smart-scan-edit-control" data-scan-edit="pattern">${options(CORE.taxonomy.patterns,value)}</select>`;
    return `<input class="smart-scan-edit-control" data-scan-edit="${escHtml(key)}" type="text" value="${escHtml(value)}" autocomplete="off" spellcheck="false">`;
  }

  function labelFor(key){return typeof window.smartScanFieldLabel==='function'?window.smartScanFieldLabel(key):key}

  function setRowState(row){
    const key=row?.dataset?.field;if(!key)return;
    const checkbox=row.querySelector('input[data-scan-field]'),control=row.querySelector('[data-scan-edit]');
    if(control)control.disabled=!checkbox?.checked;
    const current=control?.value??'',original=String(proposal[key]??'');
    row.classList.toggle('modified',Boolean(checkbox?.checked)&&String(current)!==original);
  }

  function refreshTypeOptions({fromCategoryChange=false}={}){
    const cat=document.querySelector('[data-scan-edit="category"]')?.value||proposal.category||'';
    const type=document.querySelector('[data-scan-edit="type"]');if(!type)return;
    const allowed=CORE.taxonomy.types?.[cat]||[];
    const current=type.value;
    type.innerHTML=options(allowed,allowed.includes(current)?current:'',{includeBlank:true});
    if(fromCategoryChange&&!allowed.includes(current))type.value='';
    setRowState(type.closest('.smart-scan-edit-row'));
  }

  function bindEditableReview(){
    const fields=document.getElementById('smartScanReviewFields');if(!fields)return;
    fields.querySelectorAll('.smart-scan-edit-row').forEach(row=>{
      const check=row.querySelector('input[data-scan-field]'),control=row.querySelector('[data-scan-edit]');
      check?.addEventListener('change',()=>setRowState(row));
      control?.addEventListener('input',()=>setRowState(row));
      control?.addEventListener('change',()=>{
        if(control.dataset.scanEdit==='category')refreshTypeOptions({fromCategoryChange:true});
        setRowState(row);
      });
      setRowState(row);
    });
  }

  const previousOpen=window.openSmartScanReview;
  window.openSmartScanReview=function(result){
    installStyles();
    proposal=clone(result||{});
    const fields=document.getElementById('smartScanReviewFields');
    if(!fields)return typeof previousOpen==='function'?previousOpen(result):undefined;
    const entries=KNOWN.filter(key=>String(proposal[key]??'').trim());
    fields.classList.add('smart-scan-editable-fields');
    fields.innerHTML=entries.length?entries.map(key=>{
      const value=proposal[key];
      return `<div class="smart-scan-edit-row" data-field="${escHtml(key)}"><input type="checkbox" data-scan-field="${escHtml(key)}" checked aria-label="Apply ${escHtml(labelFor(key))}"><div class="smart-scan-edit-main"><div class="smart-scan-edit-label"><span>${escHtml(labelFor(key))}</span></div>${controlFor(key,value)}<div class="smart-scan-edit-original">Suggested: ${escHtml(value)}</div></div></div>`;
    }).join(''):'<p class="empty-note">No reliable attributes were detected. You can still enter the details manually.</p>';
    const apply=document.getElementById('applySmartScanReviewBtn');if(apply)apply.disabled=!entries.length;
    bindEditableReview();refreshTypeOptions();
    const dialog=document.getElementById('smartScanReviewDialog');if(dialog&&!dialog.open)dialog.showModal();
  };

  const previousApply=window.applyPendingSmartScan;
  window.applyPendingSmartScan=function(){
    if(!pendingSmartScanResult)return typeof previousApply==='function'?previousApply.apply(this,arguments):undefined;
    const selected=[],edited=clone(pendingSmartScanResult||{}),decisions={};
    KNOWN.forEach(key=>{
      const check=document.querySelector(`#smartScanReviewFields input[data-scan-field="${key}"]`);
      const control=document.querySelector(`#smartScanReviewFields [data-scan-edit="${key}"]`);
      const original=String(proposal[key]??'');
      if(!check){return}
      if(!check.checked){decisions[key]='not_applied';return}
      selected.push(key);
      const value=String(control?.value??original).trim();
      edited[key]=value;
      decisions[key]=value===original?'accepted':'modified';
    });

    // Keep a clean telemetry context before replacing pending values with edited values.
    TELEMETRY?.setReviewContext?.({proposal:clone(proposal),appliedValues:clone(edited),selectedFields:[...selected],decisions:clone(decisions)});
    pendingSmartScanResult={...pendingSmartScanResult,...edited};
    return typeof previousApply==='function'?previousApply.apply(this,arguments):undefined;
  };

  const API={version:VERSION,getProposal:()=>clone(proposal),refreshTypeOptions};
  window.AUDREY_SMART_SCAN_EDITABLE_REVIEW=API;
  console.info(`Audrey Smart Scan ${VERSION} loaded: editable accept/modify/skip review enabled.`);
})();
