/* Audrey Closet v13.23 Photo Studio Layout dev3
 * Clean-area UI refinement only. Builds on the compact Photo Studio navigation
 * while preserving existing controls, handlers, Cutout processing and saved state.
 */
(function(){
'use strict';

const STYLE_ID='photoStudioLayoutV1323Dev3Styles';
const ROOT_ID='studioWorkspaceDev3';
const PANEL_IDS={clean:'studioPanelCleanDev3',cutout:'studioPanelCutoutDev3',adjust:'studioPanelAdjustDev3',photo:'studioPanelPhotoDev3',background:'studioPanelBackgroundDev3'};
const LABELS={clean:'Clean',cutout:'Cutout',adjust:'Adjust',photo:'Photo',background:'Background'};
const ICONS={clean:'✦',cutout:'✂',adjust:'◐',photo:'✥',background:'▧'};
let activePanel='cutout';
let observer=null;

function q(s,r=document){return r.querySelector(s)}
function installStyles(){
  if(document.getElementById(STYLE_ID))return;
  const s=document.createElement('style');s.id=STYLE_ID;s.textContent=`
  #photoStudioDialog.studio-layout-dev3{padding:10px!important;overflow:hidden!important}
  #photoStudioDialog.studio-layout-dev3 .studio-shell{height:min(96dvh,960px)!important;max-height:96dvh!important;display:flex!important;flex-direction:column!important;overflow:hidden!important}
  #photoStudioDialog.studio-layout-dev3 .studio-head{flex:0 0 auto;padding:2px 3px 0}
  #photoStudioDialog.studio-layout-dev3 .studio-head h2{margin-bottom:5px!important}
  #photoStudioDialog.studio-layout-dev3 .studio-template{flex:0 0 auto;margin-bottom:4px!important}
  #photoStudioDialog.studio-layout-dev3 .studio-canvas-wrap{position:relative!important;flex:0 0 auto;width:min(100%,410px)!important;max-height:min(42dvh,410px);margin:0 auto!important}
  #photoStudioDialog .studio-canvas-history-dev3{position:absolute;left:7px;top:7px;z-index:18;display:flex;gap:5px;pointer-events:auto}
  #photoStudioDialog .studio-canvas-history-dev3 .studio-action{width:38px!important;min-width:38px!important;height:34px!important;min-height:34px!important;padding:0!important;border-radius:11px!important;background:rgba(250,247,240,.92)!important;border:1px solid rgba(74,65,56,.25)!important;box-shadow:0 2px 8px rgba(45,38,31,.12)!important;color:#574f47!important;display:grid!important;place-items:center!important;font-size:0!important;backdrop-filter:blur(5px)}
  #photoStudioDialog .studio-canvas-history-dev3 .studio-action span:first-child{font-size:18px!important;line-height:1!important}
  #photoStudioDialog .studio-canvas-history-dev3 .studio-action span:last-child{display:none!important}
  #photoStudioDialog .studio-canvas-history-dev3 .studio-action:disabled{opacity:.42!important}
  #photoStudioDialog.studio-layout-dev3 .studio-toolbar-fixed{display:none!important}
  #photoStudioDialog.studio-layout-dev3 .studio-controls-scroll{flex:1 1 auto!important;min-height:150px!important;overflow:hidden!important;padding:0!important;border-top:1px solid rgba(108,81,66,.13)!important;margin-top:4px!important}
  #photoStudioDialog .studio-workspace-dev3{height:100%;min-height:0;display:grid;grid-template-columns:58px minmax(0,1fr);gap:3px;background:transparent}
  #photoStudioDialog .studio-rail-dev3{position:relative;z-index:20;display:flex;flex-direction:column;gap:2px;width:58px;min-width:58px;overflow-y:auto;overflow-x:hidden;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;background:transparent;padding-top:3px}
  #photoStudioDialog .studio-rail-btn-dev3{appearance:none;-webkit-appearance:none;width:58px;min-width:58px;min-height:45px;padding:4px 2px;border:1px solid rgba(82,72,62,.18);border-radius:0;background:rgba(224,217,205,.84);color:#625f58;display:grid;grid-template-rows:21px auto;place-items:center;gap:2px;font:800 8.7px/1 var(--sans,system-ui,sans-serif);text-align:center;-webkit-tap-highlight-color:transparent}
  #photoStudioDialog .studio-rail-btn-dev3.active{background:#f6f0e5;color:#4f4b45;border-color:rgba(20,20,20,.30)}
  #photoStudioDialog .studio-rail-icon-dev3{display:grid;place-items:center;width:21px;height:21px;font:800 15px/1 system-ui}
  #photoStudioDialog .studio-stage-dev3{min-width:0;min-height:0;height:100%;overflow:hidden;background:#f6f0e5}
  #photoStudioDialog .studio-panel-dev3{display:none;height:100%;min-height:0;overflow-y:auto;overflow-x:hidden;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;padding:8px;background:#f6f0e5}
  #photoStudioDialog .studio-panel-dev3.active{display:block}
  #photoStudioDialog .studio-panel-title-dev3{display:flex;align-items:baseline;justify-content:space-between;gap:8px;margin:0 0 7px;padding-bottom:6px;border-bottom:1px solid rgba(108,81,66,.12)}
  #photoStudioDialog .studio-panel-title-dev3 strong{font:850 12px/1 var(--sans,system-ui,sans-serif);color:#5d5348}
  #photoStudioDialog .studio-panel-title-dev3 small{font:700 9px/1.2 var(--sans,system-ui,sans-serif);color:#8a7d70;text-align:right}
  #photoStudioDialog .studio-panel-dev3 details{display:block!important;margin:0!important;padding:0!important;border:0!important;background:transparent!important}
  #photoStudioDialog .studio-panel-dev3 details>summary{display:none!important}
  #photoStudioDialog .studio-panel-dev3 .studio-cutout-body{display:block!important;padding:0!important}
  #photoStudioDialog .studio-panel-dev3 .studio-more-grid{display:grid!important;grid-template-columns:1fr 1fr!important;gap:7px!important;margin:0!important}
  #photoStudioDialog .studio-panel-dev3 #studioResetAll{grid-column:1/-1}
  #photoStudioDialog .studio-panel-dev3 .studio-bg-row{margin-top:0!important}
  #photoStudioDialog .studio-panel-dev3 #studioViewHint,#photoStudioDialog .studio-panel-dev3 #studioMoveHint,#photoStudioDialog .studio-panel-dev3 #studioToolInstruction{margin:0 0 7px!important}
  #photoStudioDialog .studio-panel-dev3 .studio-brush-control{margin:0 0 7px!important}
  #photoStudioDialog .clean-actions-dev3{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px;margin:0 0 8px}
  #photoStudioDialog .clean-actions-dev3 .studio-action{display:grid!important;place-items:center;align-content:center;gap:3px;width:100%!important;min-width:0!important;min-height:48px!important;padding:5px 3px!important;border-radius:11px!important}
  #photoStudioDialog .clean-actions-dev3 .studio-action span:first-child{font-size:16px;line-height:1}
  #photoStudioDialog .clean-actions-dev3 .studio-action span:last-child{font-size:9px;line-height:1.05}
  #photoStudioDialog #studioPanelCleanDev3>.studio-panel-title-dev3{display:none!important}
  #photoStudioDialog #studioPanelCleanDev3{padding-top:7px!important}
  #photoStudioDialog #studioPanelCleanDev3 #studioMoveHint{display:none!important}
  #photoStudioDialog #studioPanelCleanDev3 #studioToolInstruction{font-size:12px!important;line-height:1.42!important;padding:9px 10px!important}
  #photoStudioDialog #studioPanelCleanDev3 #studioToolInstruction strong{font-weight:850;color:inherit}
  #photoStudioDialog #studioPanelCleanDev3 #studioViewHint{font-size:11px!important;line-height:1.38!important}
  #photoStudioDialog #studioPanelCleanDev3 .studio-brush-control{font-size:11px!important}
  #photoStudioDialog .studio-status{flex:0 0 auto!important;min-height:24px!important;margin:4px 2px 2px!important;padding:4px 7px!important;font-size:9px!important;line-height:1.25!important}
  #photoStudioDialog.studio-layout-dev3 .studio-save-actions{flex:0 0 auto!important;margin-top:3px!important;padding-top:7px!important;box-shadow:0 -5px 14px rgba(70,55,40,.08)!important}
  @media(max-width:390px){
    #photoStudioDialog.studio-layout-dev3{width:calc(100% - 8px)!important;padding:8px!important}
    #photoStudioDialog .studio-workspace-dev3{grid-template-columns:54px minmax(0,1fr);gap:2px}
    #photoStudioDialog .studio-rail-dev3,#photoStudioDialog .studio-rail-btn-dev3{width:54px;min-width:54px}
    #photoStudioDialog .studio-rail-btn-dev3{min-height:43px;font-size:8.2px}
    #photoStudioDialog .studio-panel-dev3{padding:7px}
    #photoStudioDialog #studioPanelCleanDev3 #studioToolInstruction{font-size:11.5px!important}
  }
  @media(max-height:740px){#photoStudioDialog.studio-layout-dev3 .studio-canvas-wrap{width:min(100%,330px)!important;max-height:38dvh}}
  `;document.head.appendChild(s);
}
function makePanel(stage,key,help){
  let p=document.getElementById(PANEL_IDS[key]);
  if(!p){p=document.createElement('section');p.id=PANEL_IDS[key];p.className='studio-panel-dev3';p.dataset.studioPanel=key;p.innerHTML=`<div class="studio-panel-title-dev3"><strong>${LABELS[key]}</strong><small>${help}</small></div>`;stage.appendChild(p);}
  return p;
}
function move(node,parent){if(node&&parent&&node.parentElement!==parent)parent.appendChild(node)}
function setActive(key){
  if(!PANEL_IDS[key])key='cutout';activePanel=key;
  document.querySelectorAll('.studio-rail-btn-dev3').forEach(b=>{const on=b.dataset.studioNav===key;b.classList.toggle('active',on);b.setAttribute('aria-pressed',on?'true':'false')});
  document.querySelectorAll('.studio-panel-dev3').forEach(p=>p.classList.toggle('active',p.dataset.studioPanel===key));
  const panel=document.getElementById(PANEL_IDS[key]);if(panel)panel.scrollTop=0;
}
function cleanModeInstruction(){
  const tip=document.getElementById('studioToolInstruction');if(!tip)return;
  const move=document.getElementById('studioMoveToggle');
  const erase=q('.brush-btn[data-brush="erase"]'),restore=q('.brush-btn[data-brush="restore"]');
  if(move?.classList.contains('active'))tip.innerHTML='<strong>Adjust Mode</strong> — drag to reposition; pinch to resize and gently twist to rotate. Tap Adjust again to lock it.';
  else if(restore?.classList.contains('active'))tip.innerHTML='<strong>Restore Mode</strong> — use one finger to bring back pixels from the captured original photo and recover clothing details removed by the cutout. Tap Restore again to return to view mode.';
  else if(erase?.classList.contains('active'))tip.innerHTML='<strong>Erase Mode</strong> — use one finger to erase unwanted pixels. Tap Erase again to return to view mode.';
}
function bindCleanInstructionRefresh(){
  ['studioMoveToggle'].forEach(id=>{const b=document.getElementById(id);if(b&&!b.dataset.cleanHelpBound){b.dataset.cleanHelpBound='1';b.addEventListener('click',()=>requestAnimationFrame(cleanModeInstruction))}});
  document.querySelectorAll('.brush-btn').forEach(b=>{if(!b.dataset.cleanHelpBound){b.dataset.cleanHelpBound='1';b.addEventListener('click',()=>requestAnimationFrame(cleanModeInstruction))}});
}
function installLayout(){
  const dialog=document.getElementById('photoStudioDialog'),scroll=q('.studio-controls-scroll',dialog),toolbar=q('.studio-toolbar-fixed',dialog),canvasWrap=q('.studio-canvas-wrap',dialog),status=document.getElementById('studioStatus');
  if(!dialog||!scroll||!toolbar||!canvasWrap)return false;
  installStyles();dialog.classList.add('studio-layout-dev3');
  let root=document.getElementById(ROOT_ID);
  if(!root){
    root=document.createElement('div');root.id=ROOT_ID;root.className='studio-workspace-dev3';
    const rail=document.createElement('nav');rail.className='studio-rail-dev3';rail.setAttribute('aria-label','Photo Studio tools');
    const stage=document.createElement('div');stage.className='studio-stage-dev3';
    ['clean','cutout','adjust','photo','background'].forEach(key=>{const b=document.createElement('button');b.type='button';b.className='studio-rail-btn-dev3';b.dataset.studioNav=key;b.innerHTML=`<span class="studio-rail-icon-dev3" aria-hidden="true">${ICONS[key]}</span><span>${LABELS[key]}</span>`;b.onclick=()=>setActive(key);rail.appendChild(b)});
    root.append(rail,stage);scroll.prepend(root);
  }
  const stage=q('.studio-stage-dev3',root);if(!stage)return false;
  const clean=makePanel(stage,'clean','');
  const cutout=makePanel(stage,'cutout','Automatic or Guided');
  const adjust=makePanel(stage,'adjust','Tone & detail');
  const photo=makePanel(stage,'photo','Center, fit & reset');
  const background=makePanel(stage,'background','Canvas background');

  let history=q('.studio-canvas-history-dev3',canvasWrap);if(!history){history=document.createElement('div');history.className='studio-canvas-history-dev3';history.setAttribute('aria-label','Undo and redo');canvasWrap.appendChild(history)}
  move(document.getElementById('studioUndo'),history);move(document.getElementById('studioRedo'),history);

  let cleanActions=q('.clean-actions-dev3',clean);if(!cleanActions){cleanActions=document.createElement('div');cleanActions.className='clean-actions-dev3';clean.appendChild(cleanActions)}
  move(document.getElementById('studioMoveToggle'),cleanActions);
  toolbar.querySelectorAll('.brush-btn').forEach(b=>move(b,cleanActions));
  move(document.getElementById('studioBrushControl'),clean);move(document.getElementById('studioViewHint'),clean);move(document.getElementById('studioMoveHint'),clean);move(document.getElementById('studioToolInstruction'),clean);
  bindCleanInstructionRefresh();cleanModeInstruction();

  const cutoutDetails=q('.studio-cutout-tools',scroll)||q('.studio-cutout-tools',dialog);if(cutoutDetails){cutoutDetails.open=true;move(cutoutDetails,cutout)}
  const adjustDetails=q('.studio-adjust-tools',scroll)||q('.studio-adjust-tools',dialog);if(adjustDetails){adjustDetails.open=true;move(adjustDetails,adjust)}
  const more=q('.studio-more-tools',scroll)||q('.studio-more-tools',dialog);if(more){more.open=true;move(q('.studio-more-grid',more),photo);move(q('.studio-bg-row',more),background);move(document.getElementById('studioBgPalette'),background);if(!more.children.length)more.hidden=true;}

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
window.__audreyPhotoStudioLayout={phase:'dev3',installLayout,setActive,get activePanel(){return activePanel;}};
})();
