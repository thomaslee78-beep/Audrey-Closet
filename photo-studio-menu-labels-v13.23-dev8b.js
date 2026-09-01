/* Audrey Closet v13.23 Photo Studio menu labels dev8b
 * Presentation-only: rename Photo -> Reset and Background -> Canvas.
 * Underlying panel keys/behavior remain unchanged.
 */
(function(){
'use strict';
function sync(){
  const photoNav=document.querySelector('.studio-rail-btn-dev5[data-studio-nav="photo"] span:last-child');
  const bgNav=document.querySelector('.studio-rail-btn-dev5[data-studio-nav="background"] span:last-child');
  const photoTitle=document.querySelector('#studioPanelPhotoDev5 .studio-panel-title-dev5 strong');
  const bgTitle=document.querySelector('#studioPanelBackgroundDev5 .studio-panel-title-dev5 strong');
  if(photoNav)photoNav.textContent='Reset';
  if(bgNav)bgNav.textContent='Canvas';
  if(photoTitle)photoTitle.textContent='Reset';
  if(bgTitle)bgTitle.textContent='Canvas';
}
function start(){
  sync();
  document.addEventListener('click',e=>{
    if(e.target.closest?.('.studio-rail-btn-dev5'))requestAnimationFrame(sync);
  },true);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
