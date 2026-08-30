/* Audrey Closet v13.23 Cutout Phase 3D-B — Guided garment template picker.
 * Exposes Shirt and Long-Sleeve Shirt only. Switching templates replaces polygon
 * geometry while preserving the user's current guide transform/protection and
 * clears applied state so protection must be explicitly reapplied.
 */
(function(){
'use strict';

const ENABLED=['shirt','long-sleeve-shirt'];
const stateApi=()=>window.__audreyCutoutState;
const guidesApi=()=>window.__audreyGarmentGuides;
const workflowApi=()=>window.__audreyCutoutWorkflow3B;
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));

function currentState(){return stateApi()?.getState?.()||null;}
function def(id){return guidesApi()?.getTemplate?.(id)||null;}
function style(){
  if(document.getElementById('garmentTemplatePicker3DStyles'))return;
  const s=document.createElement('style');s.id='garmentTemplatePicker3DStyles';s.textContent=`
  .garment-template-picker-3d{display:grid;gap:6px;padding:8px;border:1px solid rgba(108,81,66,.13);border-radius:12px;background:rgba(248,241,227,.62)}
  .garment-template-picker-head{display:flex;align-items:center;justify-content:space-between;gap:8px}.garment-template-picker-head strong{font:850 10px/1 system-ui;color:#62584d}.garment-template-picker-head small{font:700 8.5px/1 system-ui;color:#8a7d70}
  .garment-template-options{display:grid;grid-template-columns:1fr 1fr;gap:6px}.garment-template-btn{min-height:38px;padding:7px 8px;border:1px solid rgba(108,81,66,.18);border-radius:10px;background:#fffaf0;color:#675d51;font:800 9.5px/1.15 system-ui;text-align:center}.garment-template-btn.active{background:#6d7863;border-color:#6d7863;color:#fff}.garment-template-btn:active{transform:scale(.98)}
  .garment-template-note{margin:0;font:8.8px/1.3 system-ui;color:#817568}
  `;document.head.appendChild(s);
}

function install(){
  style();
  const panel=document.getElementById('cutoutGuide3B');if(!panel)return false;
  let picker=document.getElementById('garmentTemplatePicker3D');
  if(!picker){
    picker=document.createElement('section');picker.id='garmentTemplatePicker3D';picker.className='garment-template-picker-3d';
    picker.innerHTML='<div class="garment-template-picker-head"><strong>Garment Template</strong><small>Phase 3D-B</small></div><div class="garment-template-options"></div><p class="garment-template-note">Choose the outline that best matches the garment. Switching templates keeps the guide position and size, but requires you to apply the new guide.</p>';
    const head=panel.querySelector('.cutout-guide-head');
    (head||panel.firstElementChild)?.insertAdjacentElement('afterend',picker);
  }
  const options=picker.querySelector('.garment-template-options');
  if(options&&!options.children.length){
    ENABLED.forEach(id=>{
      const d=def(id);if(!d)return;
      const b=document.createElement('button');b.type='button';b.className='garment-template-btn';b.dataset.template=id;b.textContent=d.label;
      b.onclick=()=>selectTemplate(id);options.appendChild(b);
    });
  }
  sync();return true;
}

function selectTemplate(id){
  if(!ENABLED.includes(id))return false;
  const api=stateApi(),gapi=guidesApi(),cur=currentState();if(!api||!gapi||!cur)return false;
  const previous=cur.guide;
  if(previous?.type===id){sync();return true;}
  const transform=previous?.transform?clone(previous.transform):null;
  const protection=Number.isFinite(Number(previous?.protection))?Number(previous.protection):70;
  const next=clone(cur);next.workflow='guided';next.guide=gapi.createGuide(id,{transform,protection});
  // A template switch changes the protection geometry. Do not carry over any
  // accepted/applied polygon or saved guided base from the previous template.
  next.guide.applied=false;next.guide.dirty=false;next.guide.appliedShape=null;next.guide.baseResult='';
  api.persist?.(undefined,next);
  gapi.reconcilePointControls?.();workflowApi()?.sync?.();sync();
  const edit=document.getElementById('cutoutGuideEdit3B');
  if(!workflowApi()?.visible)document.getElementById('cutoutGuideShow3B')?.click();
  if(!workflowApi()?.editing)edit?.click();
  const status=document.getElementById('studioStatus'),label=def(id)?.label||'Garment';
  if(status)status.textContent=label+' template selected. Adjust the outline, then Apply '+label+' Guide.';
  return true;
}

function sync(){
  const picker=document.getElementById('garmentTemplatePicker3D'),s=currentState();if(!picker||!s)return;
  const guided=s.workflow==='guided';picker.hidden=!guided;picker.setAttribute('aria-hidden',guided?'false':'true');
  picker.querySelectorAll('[data-template]').forEach(b=>{const active=b.dataset.template===(s.guide?.type||'shirt');b.classList.toggle('active',active);b.setAttribute('aria-pressed',active?'true':'false');});
}

const open0=openPhotoStudio;
openPhotoStudio=async function(){const out=await open0.apply(this,arguments);install();sync();return out;};

const wf=workflowApi();
if(wf?.sync){const sync0=wf.sync;wf.sync=function(){const out=sync0.apply(this,arguments);install();sync();return out;};}

window.__audreyGarmentTemplatePicker={phase:'3D-B1',enabledTemplates:[...ENABLED],install,selectTemplate,sync};
})();
