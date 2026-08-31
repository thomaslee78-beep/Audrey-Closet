/* Audrey Closet v13.23 Photo Studio Layout dev1
 * Presentation/navigation refactor only. Reuses the existing Photo Studio canvas,
 * controls, handlers, Cutout DOM, save/apply behavior and canonical v13.23 state.
 */
(function(){
'use strict';

const STYLE_ID='photoStudioLayoutV1323Dev1Styles';
const ROOT_ID='studioWorkspaceDev1';
const PANEL_IDS={photo:'studioPanelPhotoDev1',cutout:'studioPanelCutoutDev1',cleanup:'studioPanelCleanupDev1',adjust:'studioPanelAdjustDev1',background:'studioPanelBackgroundDev1'};
const LABELS={photo:'Photo',cutout:'Cutout',cleanup:'Cleanup',adjust:'Adjust',background:'Background'};
const ICONS={photo:'✥',cutout:'✂',cleanup:'⌫',adjust:'◐',background:'▧'};
let activePanel='cutout';
let observer=null;

function q(s,r=document){return r.querySelector(s)}
function installStyles(){
  if(document.getElementById(STYLE_ID))return;
  const s=document.createElement('style');s.id=STYLE_ID;s.textContent=`
  #photoStudioDialog.studio-layout-dev1{padding:10px!important;overflow:hidden!important}
  #photoStudioDialog.studio-layout-dev1 .studio-shell{height:min(96dvh,960px)!important;max-height:96dvh!important;display:flex!important;flex-direction:column!important;overflow:hidden!important}
  #photoStudioDialog.studio-layout-dev1 .studio-head{flex:0 0 auto;padding:2px 3px 0}
  #photoStudioDialog.studio-layout-dev1 .studio-head h2{margin-bottom:5px!important}
  #photoStudioDialog.studio-layout-dev1 .studio-template{flex:0 0 auto;margin-bottom:4px!important}
  #photoStudioDialog.studio-layout-dev1 .studio-canvas-wrap{flex:0 0 auto;width:min(100%,410px)!important;max-height:min(42dvh,410px);margin:0 auto!important}
  #photoStudioDialog.studio-layout-dev1 .studio-toolbar-fixed{flex:0 0 auto;display:flex!important;justify-content:center!important;gap:6px!important;padding:5px 2px!important;margin:3px 0!important;background:transparent!important;box-shadow:none!important;border:0!important}
  #photoStudioDialog.studio-layout-dev1 .studio-toolbar-fixed .studio-action{display:none!important}
  #photoStudioDialog.studio-layout-dev1 .studio-toolbar-fixed #studioUndo,#photoStudioDialog.studio-layout-dev1 .studio-toolbar-fixed #studioRedo{display:grid!important;min-width:66px!important;min-height:34px!important;border-radius:11px!important}
  #photoStudioDialog.studio-layout-dev1 .studio-controls-scroll{flex:1 1 auto!important;min-height:150px!important;overflow:hidden!important;padding:0!important;border-top:1px solid rgba(108,81,66,.13)!important}
  #photoStudioDialog .studio-workspace-dev1{height:100%;min-height:0;display:grid;grid-template-columns:58px minmax(0,1fr);gap:3px;background:transparent}
  #photoStudioDialog .studio-rail-dev1{position:relative;z-index:20;display:flex;flex-direction:column;gap:2px;width:58px;min-width:58px;overflow-y:auto;overflow-x:hidden;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;background:transparent;padding-top:3px}
  #photoStudioDialog .studio-rail-btn-dev1{appearance:none;-webkit-appearance:none;width:58px;min-width:58px;min-height:45px;padding:4px 2px;border:1px solid rgba(82,72,62,.18);border-radius:0;background:rgba(224,217,205,.84);color:#625f58;display:grid;grid-template-rows:21px auto;place-items:center;gap:2px;font:800 8.7px/1 var(--sans,system-ui,sans-serif);text-align:center;-webkit-tap-highlight-color:transparent}
  #photoStudioDialog .studio-rail-btn-dev1.active{background:#f6f0e5;color:#4f4b45;border-color:rgba(20,20,20,.30)}
  #photoStudioDialog .studio-rail-icon-dev1{display:grid;place-items:center;width:21px;height:21px;font:800 15px/1 system-ui}
  #photoStudioDialog .studio-stage-dev1{min-width:0;min-height:0;height:100%;overflow:hidden;background:#f6f0e5}
  #photoStudioDialog .studio-panel-dev1{display:none;height:100%;min-height:0;overflow-y:auto;overflow-x:hidden;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;padding:8px;background:#f6f0e5}
  #photoStudioDialog .studio-panel-dev1.active{display:block}
  #photoStudioDialog .studio-panel-title-dev1{display:flex;align-items:baseline;justify-content:space-between;gap:8px;margin:0 0 7px;padding-bottom:6px;border-bottom:1px solid rgba(108,81,66,.12)}
  #photoStudioDialog .studio-panel-title-dev1 strong{font:850 12px/1 var(--sans,system-ui,sans-serif);color:#5d5348}.studio-panel-title-dev1 small{font:700 9px/1.2 var(--sans,system-ui,sans-serif);color:#8a7d70;text-align:right}
  #photoStudioDialog .studio-panel-dev1 details{display:block!important;margin:0!important;padding:0!important;border:0!important;background:transparent!important}
  #photoStudioDialog .studio-panel-dev1 details>summary{display:none!important}
  #photoStudioDialog .studio-panel-dev1 .studio-cutout-body{display:block!important;padding:0!important}
  #photoStudioDialog .studio-panel-dev1 .studio-more-grid{display:grid!important;grid-template-columns:1fr 1fr!important;gap:7px!important;margin:0 0 8px!important}
  #photoStudioDialog .studio-panel-dev1 #studioResetAll{grid-column:1/-1}
  #photoStudioDialog .studio-panel-dev1 .studio-bg-row{margin-top:0!important}
  #photoStudioDialog .studio-panel-dev1 .studio-context-controls{margin:0!important;padding:0!important;border:0!important}
  #photoStudioDialog .studio-panel-dev1 #studioViewHint,#photoStudioDialog .studio-panel-dev1 #studioMoveHint,#photoStudioDialog .studio-panel-dev1 #studioToolInstruction{margin:0 0 7px!important}
  #photoStudioDialog .studio-panel-dev1 .studio-brush-control{margin:0 0 7px!important}
  #photoStudioDialog .studio-panel-dev1 .studio-action{width:100%;min-height:43px}
  #photoStudioDialog .cleanup-actions-dev1{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-bottom:8px}
  #photoStudioDialog .photo-position-actions-dev1{display:grid;grid-template-columns:1fr;gap:7px;margin-bottom:8px}
  #photoStudioDialog .studio-status{flex:0 0 auto!important;min-height:24px!important;margin:4px 2px 2px!important;padding:4px 7px!important;font-size:9px!important;line-height:1.25!important}
  #photoStudioDialog.studio-layout-dev1 .studio-save-actions{flex:0 0 auto!important;margin-top:3px!important;padding-top:7px!important;box-shadow:0 -5px 14px rgba(70,55,40,.08)!important}
  @media(max-width:390px){
    #photoStudioDialog.studio-layout-dev1{width:calc(100% - 8px)!important;padding:8px!important}
    #photoStudioDialog .studio-workspace-dev1{grid-template-columns:54px minmax(0,1fr);gap:2px}
    #photoStudioDialog .studio-rail-dev1,#photoStudioDialog .studio-rail-btn-dev1{width:54px;min-width:54px}
    #photoStudioDialog .studio-rail-btn-dev1{min-height:43px;font-size:8.2px}
    #photoStudioDialog .studio-panel-dev1{padding:7px}
  }
  @media(max-height:740px){#photoStudioDialog.studio-layout-dev1 .studio-canvas-wrap{width:min(100%,330px)!important;max-height:38dvh}}
  `;document.head.appendChild(s);
}

function makePanel(stage,key,help){
  let p=document.getElementById(PANEL_IDS[key]);
  if(!p){p=document.createElement('section');p.id=PANEL_IDS[key];p.className='studio-panel-dev1';p.dataset.studioPanel=key;p.innerHTML=`<div class="studio-panel-title-dev1"><strong>${LABELS[key]}</strong><small>${help}</small></div>`;stage.appendChild(p);}
  return p;
}
function move(node,parent){if(node&&parent&&node.parentElement!==parent)parent.appendChild(node)}
function setActive(key){
  if(!PANEL_IDS[key])key='cutout';activePanel=key;
  document.querySelectorAll('.studio-rail-btn-dev1').forEach(b=>{const on=b.dataset.studioNav===key;b.classList.toggle('active',on);b.setAttribute('aria-pressed',on?'true':'false')});
  document.querySelectorAll('.studio-panel-dev1').forEach(p=>p.classList.toggle('active',p.dataset.studioPanel===key));
  const panel=document.getElementById(PANEL_IDS[key]);if(panel)panel.scrollTop=0;
}
function installLayout(){
  const dialog=document.getElementById('photoStudioDialog'),scroll=q('.studio-controls-scroll',dialog),toolbar=q('.studio-toolbar-fixed',dialog),status=document.getElementById('studioStatus');
  if(!dialog||!scroll||!toolbar)return false;
  installStyles();dialog.classList.add('studio-layout-dev1');
  let root=document.getElementById(ROOT_ID);
  if(!root){
    root=document.createElement('div');root.id=ROOT_ID;root.className='studio-workspace-dev1';
    const rail=document.createElement('nav');rail.className='studio-rail-dev1';rail.setAttribute('aria-label','Photo Studio tools');
    const stage=document.createElement('div');stage.className='studio-stage-dev1';
    ['photo','cutout','cleanup','adjust','background'].forEach(key=>{const b=document.createElement('button');b.type='button';b.className='studio-rail-btn-dev1';b.dataset.studioNav=key;b.innerHTML=`<span class="studio-rail-icon-dev1" aria-hidden="true">${ICONS[key]}</span><span>${LABELS[key]}</span>`;b.onclick=()=>setActive(key);rail.appendChild(b)});
    root.append(rail,stage);scroll.prepend(root);
  }
  const stage=q('.studio-stage-dev1',root);if(!stage)return false;
  const photo=makePanel(stage,'photo','Position & source tools');
  const cutout=makePanel(stage,'cutout','Automatic or Guided');
  const cleanup=makePanel(stage,'cleanup','Manual edge cleanup');
  const adjust=makePanel(stage,'adjust','Tone & detail');
  const background=makePanel(stage,'background','Canvas background');

  let photoActions=q('.photo-position-actions-dev1',photo);if(!photoActions){photoActions=document.createElement('div');photoActions.className='photo-position-actions-dev1';photo.appendChild(photoActions)}
  move(document.getElementById('studioMoveToggle'),photoActions);
  const more=q('.studio-more-tools',scroll)||q('.studio-more-tools',dialog);
  if(more){move(q('.studio-more-grid',more),photo)}
  move(document.getElementById('studioViewHint'),photo);move(document.getElementById('studioMoveHint'),photo);

  const cutoutDetails=q('.studio-cutout-tools',scroll)||q('.studio-cutout-tools',dialog);move(cutoutDetails,cutout);

  let cleanupActions=q('.cleanup-actions-dev1',cleanup);if(!cleanupActions){cleanupActions=document.createElement('div');cleanupActions.className='cleanup-actions-dev1';cleanup.appendChild(cleanupActions)}
  toolbar.querySelectorAll('.brush-btn').forEach(b=>move(b,cleanupActions));
  move(document.getElementById('studioBrushControl'),cleanup);move(document.getElementById('studioToolInstruction'),cleanup);

  const adjustDetails=q('.studio-adjust-tools',scroll)||q('.studio-adjust-tools',dialog);move(adjustDetails,adjust);

  if(more){move(q('.studio-bg-row',more),background);move(document.getElementById('studioBgPalette'),background);if(!more.children.length)more.hidden=true;}

  if(status&&status.parentElement===scroll)scroll.parentElement.insertBefore(status,scroll.nextSibling);
  setActive(activePanel);return true;
}
function schedule(){requestAnimationFrame(()=>requestAnimationFrame(installLayout))}
function start(){
  installStyles();schedule();
  const dialog=document.getElementById('photoStudioDialog');if(dialog&&!observer){observer=new MutationObserver(schedule);observer.observe(dialog,{subtree:true,childList:true});}
  window.addEventListener('resize',schedule);window.visualViewport?.addEventListener('resize',schedule);
}

if(typeof openPhotoStudio==='function'){
  const open0=openPhotoStudio;
  openPhotoStudio=async function(){activePanel='cutout';const out=await open0.apply(this,arguments);installLayout();setActive('cutout');return out;};
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
window.__audreyPhotoStudioLayout={phase:'dev1',installLayout,setActive,get activePanel(){return activePanel;}};
})();
