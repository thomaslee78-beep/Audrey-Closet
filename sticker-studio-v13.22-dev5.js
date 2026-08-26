/* Audrey Closet v13.22 Sticker Studio dev5
 * Narrow presentation polish over dev4:
 * - warm off-white / beige sticker sheet so sticker art pops more
 * - right-justified compact Outline control
 * - preserves dev4 scaling and all sticker behavior
 */
(function(){
  'use strict';

  const STYLE_ID='stickerStudioV1322Dev5Styles';

  function installStyles(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      .screen[data-screen="outfits"] #stickerStudioV1322Dev1 #stickerOutlineControlDev3{
        justify-content:flex-end!important;
        width:100%!important;
      }
      .screen[data-screen="outfits"] #stickerStudioV1322Dev1 #stickerOutlineControlDev3 .sticker-outline-label{
        margin-left:auto!important;
      }

      .screen[data-screen="outfits"] #stickerStudioV1322Dev1{
        background:linear-gradient(145deg,rgba(250,246,237,.98),rgba(242,235,223,.98))!important;
        border:1px solid rgba(126,105,82,.20)!important;
        box-shadow:inset 0 1px 0 rgba(255,255,255,.72),0 2px 6px rgba(82,62,51,.055)!important;
      }
      .screen[data-screen="outfits"] #stickerStudioV1322Dev1 .sticker-browser{
        background:linear-gradient(180deg,rgba(255,253,248,.95),rgba(248,242,232,.92))!important;
        border-color:rgba(126,105,82,.16)!important;
        box-shadow:inset 0 1px 2px rgba(82,62,51,.025)!important;
      }
      .screen[data-screen="outfits"] #stickerStudioV1322Dev1 .sticker-tile{
        background:rgba(255,255,255,.48)!important;
        border-color:rgba(126,105,82,.13)!important;
      }
      .screen[data-screen="outfits"] #stickerStudioV1322Dev1 .sticker-tile:active,
      .screen[data-screen="outfits"] #stickerStudioV1322Dev1 .sticker-tile.adding-dev3{
        background:rgba(255,255,255,.82)!important;
        border-color:rgba(126,105,82,.28)!important;
      }
      .screen[data-screen="outfits"] #stickerStudioV1322Dev1 .sticker-outline-segment{
        background:rgba(255,255,255,.58)!important;
        border-color:rgba(126,105,82,.16)!important;
      }
    `;
    document.head.appendChild(style);
  }

  function start(){installStyles()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
