/* Audrey Closet v13.23 Photo Studio Guide Settings dev6h
 * Presentation-only: one compact Guide Settings disclosure below Garment Shape,
 * containing the existing Reset Guide button. Removes duplicate settings UI.
 */
(function(){
'use strict';
const STYLE_ID='photoStudioGuideSettingsDev6hStyles';
function styles(){
  if(document.getElementById(STYLE_ID))return;
  const s=document.createElement('style');s.id=STYLE_ID;s.textContent=`
#cutoutGuideSettingsCleanup1{
  display:grid!important;
  width:max-content!important;
  max-width:100%!important;
  gap:0!important;
  margin:4px 0 0!important;
  padding:0!important;
  border:0!important;
  background:transparent!important;
  overflow:visible!important;
}
#cutoutGuideSettingsCleanup1 .cutout-guide-settings-toggle{
  width:auto!important;
  min-height:22px!important;
  padding:2px 3px!important;
  border:0!important;
  background:transparent!important;
  color:#817568!important;
  display:flex!important;
  align-items:center!important;
  justify-content:flex-start!important;
  gap:4px!important;
  font:800 8.3px/1 system-ui!important;
  text-align:left!important;
  cursor:pointer!important;
  pointer-events:auto!important;
}
#cutoutGuideSettingsCleanup1 .cutout-guide-settings-toggle span:last-child{display:inline!important;font-size:9px!important}
#cutoutGuideSettingsCleanup1 .cutout-guide-settings-body{display:none!important;padding:3px 0 0!important}
#cutoutGuideSettingsCleanup1:not(.is-collapsed) .cutout-guide-settings-body{display:block!important}
#cutoutGuideSettingsCleanup1 #cutoutGuideReset3B{
  display:block!important;
  width:auto!important;
  min-width:0!important;
  max-width:none!important;
  min-height:27px!important;
  padding:4px 9px!important;
  border:1px solid rgba(108,81,66,.16)!important;
  border-radius:8px!important;
  background:rgba(248,241,227,.72)!important;
  color:#675d51!important;
  font:800 8.4px/1 system-ui!important;
}
#cutoutGuideSettingsFinalDev6g{display:none!important}
`;
document.head.appendChild(s);
}
function install(){
  styles();
  const panel=document.getElementById('cutoutGuide3B');
  const picker=document.getElementById('garmentTemplatePicker3D');
  const actions=panel?.querySelector('.cutout-guide-actions');
  const reset=document.getElementById('cutoutGuideReset3B');
  let settings=document.getElementById('cutoutGuideSettingsCleanup1');
  if(!panel||!picker||!reset)return false;
  const duplicate=document.getElementById('cutoutGuideSettingsFinalDev6g');
  if(duplicate)duplicate.remove();
  if(!settings){
    settings=document.createElement('section');settings.id='cutoutGuideSettingsCleanup1';settings.className='cutout-guide-settings is-collapsed';
    settings.innerHTML='<button type="button" class="cutout-guide-settings-toggle" aria-expanded="false"><span>Guide Settings</span><span>⌄</span></button><div class="cutout-guide-settings-body"></div>';
  }
  const body=settings.querySelector('.cutout-guide-settings-body');
  if(body&&reset.parentElement!==body)body.appendChild(reset);
  if(settings.previousElementSibling!==picker)picker.insertAdjacentElement('afterend',settings);
  if(actions&&actions.previousElementSibling!==settings)settings.insertAdjacentElement('afterend',actions);
  const toggle=settings.querySelector('.cutout-guide-settings-toggle');
  if(toggle&&!toggle.dataset.dev6hBound){
    toggle.dataset.dev6hBound='1';
    toggle.onclick=e=>{
      e.preventDefault();e.stopPropagation();
      const collapsed=settings.classList.toggle('is-collapsed');
      toggle.setAttribute('aria-expanded',collapsed?'false':'true');
      const chev=toggle.querySelector('span:last-child');if(chev)chev.textContent=collapsed?'⌄':'⌃';
    };
  }
  if(!settings.dataset.dev6hInit){settings.classList.add('is-collapsed');settings.dataset.dev6hInit='1';}
  toggle?.setAttribute('aria-expanded',settings.classList.contains('is-collapsed')?'false':'true');
  const chev=toggle?.querySelector('span:last-child');if(chev)chev.textContent=settings.classList.contains('is-collapsed')?'⌄':'⌃';
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
