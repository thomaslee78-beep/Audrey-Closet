/* Audrey Closet v13.22-dev8 — hide redundant Shapes intro panel */
(function(){
  'use strict';
  if(document.getElementById('shapeStudioStylesV132208'))return;
  const style=document.createElement('style');
  style.id='shapeStudioStylesV132208';
  style.textContent=`
    .screen[data-screen="outfits"] .decorate-studio-panel[data-decorate-group="shapes"]>.decorate-studio-intro{display:none!important}
    .screen[data-screen="outfits"] .decorate-studio-panel[data-decorate-group="shapes"]{gap:0!important}
  `;
  document.head.appendChild(style);
})();
