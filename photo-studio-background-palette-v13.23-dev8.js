/* Audrey Closet v13.23 Photo Studio Background palette dev8
 * Presentation-only: keep the full existing palette but wrap swatches into
 * iPhone-safe rows inside the narrower Photo Studio Background panel.
 */
(function(){
'use strict';
const STYLE_ID='photoStudioBackgroundPaletteDev8Styles';
function styles(){
  if(document.getElementById(STYLE_ID))return;
  const s=document.createElement('style');s.id=STYLE_ID;s.textContent=`
#studioPanelBackgroundDev5 .studio-bg-palette{
  width:100%!important;
  max-width:100%!important;
  overflow:hidden!important;
  padding:4px 0 10px!important;
  gap:8px!important;
}
#studioPanelBackgroundDev5 .studio-palette-row{
  width:100%!important;
  min-width:0!important;
  display:grid!important;
  grid-template-columns:52px minmax(0,1fr)!important;
  gap:7px!important;
  align-items:start!important;
}
#studioPanelBackgroundDev5 .studio-palette-label{
  padding-top:6px!important;
  font-size:8px!important;
  line-height:1.1!important;
}
#studioPanelBackgroundDev5 .studio-palette-swatches{
  width:100%!important;
  min-width:0!important;
  display:grid!important;
  grid-template-columns:repeat(5,minmax(0,1fr))!important;
  gap:5px!important;
  align-items:center!important;
}
#studioPanelBackgroundDev5 .studio-bg-swatch{
  width:100%!important;
  max-width:30px!important;
  min-width:0!important;
  aspect-ratio:1/1!important;
  justify-self:center!important;
}
@media(max-width:390px){
  #studioPanelBackgroundDev5 .studio-palette-row{
    grid-template-columns:48px minmax(0,1fr)!important;
    gap:5px!important;
  }
  #studioPanelBackgroundDev5 .studio-palette-swatches{
    grid-template-columns:repeat(5,minmax(0,1fr))!important;
    gap:4px!important;
  }
}
`;
document.head.appendChild(s);
}
function start(){styles();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
