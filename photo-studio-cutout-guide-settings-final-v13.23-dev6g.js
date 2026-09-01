/* Audrey Closet v13.23 Photo Studio Guide Settings final dev6g
 * Presentation-only. Creates a lightweight independent disclosure for Reset Guide
 * so older cleanup logic cannot force it open or remove its toggle behavior.
 */
(function(){
'use strict';
const STYLE_ID='photoStudioGuideSettingsFinalDev6gStyles';
const BOX_ID='cutoutGuideSettingsFinalDev6g';
function styles(){
  if(document.getElementById(STYLE_ID))return;
  const s=document.createElement('style');s.id=STYLE_ID;s.textContent=`
#${BOX_ID}{display:grid!important;gap:0!important;margin:0!important;padding:0!important;border:0!important;background:transparent!important;width:max-content!important;max-width:100%!important}
#${BOX_ID} .guide-settings-toggle-dev6g{width:auto!important;min-height:22px!important;padding:2px 3px!important;border:0!important;background:transparent!important;color:#817568!important;display:flex!important;align-items:center!important;gap:4px!important;font:800 8.3px/1 system-ui!important;text-align:left!important;cursor:pointer!important}
#${BOX_ID} .guide-settings-body-dev6g{display:none!important;padding-top:3px!important}
#${BOX_ID}.is-open .guide-settings-body-dev6g{display:block!important}
#${BOX_ID} #cutoutGuideReset3B{width:auto!important;min-width:0!important;max-width:none!important;min-height:27px!important;padding:4px 9px!important;border:1px solid rgba(108,81,66,.16)!important;border-radius:8px!important;background:rgba(248,241,227,.72)!important;color:#675d51!important;font:800 8.4px/1 system-ui!important}
#cutoutGuideSettingsCleanup1{display:none!important}
`;
document.head.appendChild(s);
}
function install(){
  styles();
  const panel=document.getElementById('cutoutGuide3B');
  const reset=document.getElementById('cutoutGuideReset3B');
  if(!panel||!reset)return false;
  let box=document.getElementById(BOX_ID);
  if(!box){
    box=document.createElement('section');box.id=BOX_ID;
    box.innerHTML='<button type="button" class="guide-settings-toggle-dev6g" aria-expanded="false"><span>Guide Settings</span><span>⌄</span></button><div class="guide-settings-body-dev6g"></div>';
    const actions=panel.querySelector('.cutout-guide-actions');
    (actions||panel.lastElementChild)?.insertAdjacentElement('afterend',box);
    const toggle=box.querySelector('.guide-settings-toggle-dev6g');
    toggle.addEventListener('click',e=>{
      e.preventDefault();e.stopPropagation();
      const open=box.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded',open?'true':'false');
      const chev=toggle.querySelector('span:last-child');if(chev)chev.textContent=open?'⌃':'⌄';
    });
  }
  const body=box.querySelector('.guide-settings-body-dev6g');
  if(body&&reset.parentElement!==body)body.appendChild(reset);
  return true;
}
function start(){
  install();
  document.addEventListener('click',e=>{
    if(e.target.closest?.('[data-workflow="guided"],#garmentTemplatePicker3D,#cutoutGuide3B'))requestAnimationFrame(install);
  },true);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
