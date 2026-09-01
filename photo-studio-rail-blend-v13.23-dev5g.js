/* Audrey Closet v13.23 Photo Studio rail blend dev5g
 * Presentation-only: match left rail background to the right workspace and
 * retain structure with a soft divider.
 */
(function(){
'use strict';
const id='photoStudioRailBlendDev5gStyles';
if(document.getElementById(id))return;
const style=document.createElement('style');
style.id=id;
style.textContent=`
#photoStudioDialog .studio-workspace-dev5{
  background:#f6f0e5!important;
}
#photoStudioDialog .studio-rail-dev5{
  background:#f6f0e5!important;
  border-right:1px solid rgba(108,81,66,.10)!important;
  padding-right:2px!important;
}
`;
document.head.appendChild(style);
})();
