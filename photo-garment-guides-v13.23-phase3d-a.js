/* Audrey Closet v13.23 Cutout Phase 3D-A — garment guide registry + dynamic points.
 * Registers garment template geometry without changing the Phase 3C cutout engine.
 * Reconciles edit handles from the active guide definition so point counts are no
 * longer structurally tied to Shirt's original 10-point overlay.
 */
(function(){
'use strict';

const stateApi=()=>window.__audreyCutoutState;
const workflowApi=()=>window.__audreyCutoutWorkflow3B;
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
const DEF_TRANSFORM={x:360,y:360,width:330,height:430,rotation:0};

const TEMPLATES=[
  {
    id:'shirt',label:'Shirt',geometryVersion:2,
    defaultPoints:[[.30,.05],[.42,0],[.58,0],[.70,.05],[.96,.22],[.73,.32],[.73,1],[.27,1],[.27,.32],[.04,.22]],
    pointLabels:['Left shoulder','Left neck','Right neck','Right shoulder','Right sleeve tip','Right underarm','Right hem','Left hem','Left underarm','Left sleeve tip'],
    defaultTransform:{...DEF_TRANSFORM}
  },
  {
    id:'long-sleeve-shirt',label:'Long-Sleeve Shirt',geometryVersion:2,
    defaultPoints:[[.30,.05],[.42,0],[.58,0],[.70,.05],[.98,.19],[.94,.86],[.79,.85],[.73,.34],[.69,1],[.31,1],[.27,.34],[.21,.85],[.06,.86],[.02,.19]],
    pointLabels:['Left shoulder','Left neck','Right neck','Right shoulder','Right outer sleeve','Right outer cuff','Right inner cuff','Right underarm','Right hem','Left hem','Left underarm','Left inner cuff','Left outer cuff','Left outer sleeve'],
    defaultTransform:{x:360,y:360,width:360,height:470,rotation:0}
  },
  {
    id:'tank',label:'Tank / Sleeveless Top',geometryVersion:1,
    defaultPoints:[[.31,.02],[.43,0],[.45,.18],[.55,.18],[.57,0],[.69,.02],[.75,.26],[.72,1],[.28,1],[.25,.26]],
    pointLabels:['Left shoulder outer','Left shoulder inner','Left armhole','Right armhole','Right shoulder inner','Right shoulder outer','Right side upper','Right hem','Left hem','Left side upper'],
    defaultTransform:{x:360,y:360,width:300,height:430,rotation:0}
  },
  {
    id:'hoodie',label:'Hoodie / Sweatshirt',geometryVersion:1,
    defaultPoints:[[.36,.08],[.40,0],[.60,0],[.64,.08],[.72,.10],[.98,.20],[.92,.76],[.76,.70],[.72,1],[.28,1],[.24,.70],[.08,.76],[.02,.20],[.28,.10]],
    pointLabels:['Left hood base','Left hood crown','Right hood crown','Right hood base','Right shoulder','Right outer sleeve','Right cuff','Right underarm','Right hem','Left hem','Left underarm','Left cuff','Left outer sleeve','Left shoulder'],
    defaultTransform:{x:360,y:360,width:370,height:480,rotation:0}
  },
  {
    id:'pants',label:'Pants',geometryVersion:1,
    defaultPoints:[[.27,0],[.73,0],[.78,.18],[.80,1],[.58,1],[.53,.48],[.50,.40],[.47,.48],[.42,1],[.20,1],[.22,.18],[.27,.08]],
    pointLabels:['Left waist','Right waist','Right hip','Right outer ankle','Right inner ankle','Right inner thigh','Crotch right','Crotch left','Left inner ankle','Left outer ankle','Left hip','Left waist side'],
    defaultTransform:{x:360,y:365,width:310,height:520,rotation:0}
  },
  {
    id:'shorts',label:'Shorts',geometryVersion:1,
    defaultPoints:[[.25,0],[.75,0],[.80,.20],[.78,.88],[.58,.88],[.53,.54],[.50,.44],[.47,.54],[.42,.88],[.22,.88],[.20,.20],[.25,.08]],
    pointLabels:['Left waist','Right waist','Right hip','Right outer hem','Right inner hem','Right inner leg','Crotch right','Crotch left','Left inner hem','Left outer hem','Left hip','Left waist side'],
    defaultTransform:{x:360,y:345,width:320,height:340,rotation:0}
  },
  {
    id:'skirt',label:'Skirt',geometryVersion:1,
    defaultPoints:[[.32,0],[.68,0],[.73,.12],[.88,1],[.12,1],[.27,.12]],
    pointLabels:['Left waist','Right waist','Right hip','Right hem','Left hem','Left hip'],
    defaultTransform:{x:360,y:355,width:330,height:390,rotation:0}
  },
  {
    id:'dress',label:'Dress',geometryVersion:1,
    defaultPoints:[[.32,.02],[.43,0],[.57,0],[.68,.02],[.76,.22],[.64,.36],[.90,1],[.10,1],[.36,.36],[.24,.22]],
    pointLabels:['Left shoulder','Left neck','Right neck','Right shoulder','Right upper side','Right waist','Right hem','Left hem','Left waist','Left upper side'],
    defaultTransform:{x:360,y:365,width:390,height:560,rotation:0}
  },
  {
    id:'coat',label:'Coat / Jacket',geometryVersion:1,
    defaultPoints:[[.29,.05],[.41,0],[.59,0],[.71,.05],[.98,.18],[.92,.76],[.76,.70],[.74,1],[.26,1],[.24,.70],[.08,.76],[.02,.18]],
    pointLabels:['Left shoulder','Left neck','Right neck','Right shoulder','Right outer sleeve','Right cuff','Right underarm','Right hem','Left hem','Left underarm','Left cuff','Left outer sleeve'],
    defaultTransform:{x:360,y:360,width:390,height:520,rotation:0}
  }
];

const byId=new Map(TEMPLATES.map(t=>[t.id,t]));

function registerTemplates(){
  const api=stateApi();if(!api?.registerGuideType)return false;
  TEMPLATES.forEach(t=>api.registerGuideType({
    id:t.id,label:t.label,geometryVersion:t.geometryVersion,
    defaultPoints:t.defaultPoints,pointLabels:t.pointLabels
  }));
  return true;
}

function getTemplate(id){return clone(byId.get(id)||byId.get('shirt'));}
function createGuide(id='shirt',{transform=null,protection=70}={}){
  const def=byId.get(id)||byId.get('shirt');
  return {
    schemaVersion:1,type:def.id,geometryVersion:def.geometryVersion,
    applied:false,dirty:false,points:clone(def.defaultPoints),
    transform:clone(transform||def.defaultTransform||DEF_TRANSFORM),
    protection,baseResult:'',appliedShape:null
  };
}

function migrateLegacyLongSleeve(){
  const api=stateApi(),current=api?.getState?.(),def=byId.get('long-sleeve-shirt');
  const guide=current?.guide;
  if(!api||!current||!def||guide?.type!=='long-sleeve-shirt')return false;
  const pointCount=Array.isArray(guide.points)?guide.points.length:0;
  const version=Number.isFinite(Number(guide.geometryVersion))?Number(guide.geometryVersion):1;
  if(version>=def.geometryVersion&&pointCount===def.defaultPoints.length)return false;
  const next=clone(current);
  // Phase 3D-B refinement: keep the user's placement/protection, but old 12-point
  // Long-Sleeve geometry cannot be safely mapped to the new cuff/underarm anchors.
  // Reseed only the polygon and clear applied protection/base state.
  next.workflow='guided';
  next.guide={
    ...next.guide,
    geometryVersion:def.geometryVersion,
    points:clone(def.defaultPoints),
    applied:false,
    dirty:false,
    appliedShape:null,
    baseResult:''
  };
  api.persist?.(undefined,next);
  return true;
}

function pointHost(){return document.getElementById('cutoutShirtOverlay3B');}
function activeGuide(){return stateApi()?.getState?.()?.guide||null;}
function reconcilePointControls(){
  const overlay=pointHost(),guide=activeGuide();if(!overlay||!guide)return false;
  const def=byId.get(guide.type)||stateApi()?.getGuideTypes?.().find(x=>x.id===guide.type)||null;
  const count=Array.isArray(guide.points)?guide.points.length:0;
  const labels=def?.pointLabels||[];
  const existing=[...overlay.querySelectorAll('.cutout-shirt-point')];
  const wrong=existing.length!==count||overlay.dataset.guideType!==guide.type;
  if(wrong){
    existing.forEach(b=>b.remove());
    for(let i=0;i<count;i++){
      const b=document.createElement('button');b.type='button';b.className='cutout-shirt-point';
      b.dataset.i=String(i);b.setAttribute('aria-label',labels[i]||('Point '+(i+1)));overlay.appendChild(b);
    }
  }else{
    existing.forEach((b,i)=>b.setAttribute('aria-label',labels[i]||('Point '+(i+1))));
  }
  overlay.dataset.guideType=guide.type;
  const label=overlay.querySelector('.cutout-shirt-label');if(label)label.textContent=(def?.label||guide.type||'Garment').toUpperCase()+' GUIDE';
  return true;
}

registerTemplates();

const open0=openPhotoStudio;
openPhotoStudio=async function(){
  const out=await open0.apply(this,arguments);
  registerTemplates();
  migrateLegacyLongSleeve();
  reconcilePointControls();
  workflowApi()?.sync?.();
  return out;
};

const workflow=workflowApi();
if(workflow?.sync){
  const sync0=workflow.sync;
  workflow.sync=function(){const out=sync0.apply(this,arguments);reconcilePointControls();return out;};
}

// Phase 3D-B uses this public seam for template selection.
window.__audreyGarmentGuides={
  phase:'3D-A2',
  getTemplates:()=>TEMPLATES.map(clone),
  getTemplate,
  createGuide,
  registerTemplates,
  migrateLegacyLongSleeve,
  reconcilePointControls
};
})();
