/* Audrey Closet v13.22 Decorate Function Layout prototype 2
 * Presentation-only polish for Text, Draw, Shapes, and Stickers.
 * Reorders existing controls without replacing their handlers/data model.
 */
(function(){
  'use strict';
  const STYLE_ID='decorateFunctionLayoutProto2Styles';

  function installStyles(){
    let s=document.getElementById(STYLE_ID);
    if(!s){s=document.createElement('style');s.id=STYLE_ID;document.head.appendChild(s);}
    s.textContent=`
      /* TEXT */
      .screen[data-screen="outfits"] .decorate-studio-panel[data-decorate-group="text"] .text-font-align-row{grid-template-columns:minmax(0,1fr) auto 32px!important;gap:5px!important;align-items:center!important}
      .screen[data-screen="outfits"] .decorate-studio-panel[data-decorate-group="text"] .text-font-align-row>.text-studio-label:first-child{display:none!important}
      .screen[data-screen="outfits"] .decorate-studio-panel[data-decorate-group="text"] .text-font-select{width:100%!important;min-width:0!important}

      /* DRAW — tool strip, status/help + Undo, size/color, Line + style. */
      .screen[data-screen="outfits"] #drawStudioDev10{gap:5px!important}
      .screen[data-screen="outfits"] #drawStudioDev10 .draw-status-wrap.draw-status-row-proto1{display:grid!important;grid-template-columns:minmax(0,1fr) auto!important;gap:8px!important;align-items:center!important;min-width:0!important;padding:0 2px 1px!important}
      .screen[data-screen="outfits"] #drawStudioDev10 .draw-status-copy-proto2{display:grid!important;gap:2px!important;min-width:0!important}
      .screen[data-screen="outfits"] #drawStudioDev10 .draw-status-copy-proto2 .draw-tool-status{white-space:normal!important;overflow:visible!important;text-overflow:clip!important}
      .screen[data-screen="outfits"] #drawStudioDev10 .draw-status-row-proto1 .draw-undo-btn{height:34px!important;min-width:74px!important;padding:0 9px!important;justify-self:end!important}
      .screen[data-screen="outfits"] #drawStudioDev10 .draw-control-row{display:grid!important;grid-template-columns:minmax(0,1fr) 42px!important;gap:8px!important;align-items:center!important}
      .screen[data-screen="outfits"] #drawStudioDev10 .draw-control-row .draw-thickness{grid-template-columns:auto minmax(90px,1fr) 28px!important}
      .screen[data-screen="outfits"] #drawStudioDev10 .draw-control-row .draw-color-wrap{width:42px!important;min-width:42px!important;justify-self:end!important}
      .screen[data-screen="outfits"] #drawStudioDev10 .draw-secondary-row{display:grid!important;grid-template-columns:auto minmax(0,1fr)!important;gap:7px!important;align-items:center!important}
      .screen[data-screen="outfits"] #drawStudioDev10 .draw-secondary-row .draw-line-label-proto2{font:800 8px/1 var(--sans,system-ui,sans-serif);text-transform:uppercase;letter-spacing:.05em;color:#786f64;white-space:nowrap}
      .screen[data-screen="outfits"] #drawStudioDev10 .draw-secondary-row .draw-segment{justify-content:flex-start!important;gap:5px!important}
      .screen[data-screen="outfits"] #drawStudioDev10 .draw-secondary-row .draw-arrow-settings{grid-column:1/-1!important}
      @media(max-width:410px){
        .screen[data-screen="outfits"] #drawStudioDev10 .draw-control-row{grid-template-columns:minmax(0,1fr) 38px!important;gap:6px!important}
        .screen[data-screen="outfits"] #drawStudioDev10 .draw-control-row .draw-color-wrap{width:38px!important;min-width:38px!important}
        .screen[data-screen="outfits"] #drawStudioDev10 .draw-control-row .draw-thickness{grid-template-columns:auto minmax(70px,1fr) 26px!important}
      }

      /* SHAPES — Border row matched to Fill row; Fill + Line styles share second row. */
      .screen[data-screen="outfits"] #shapeEditPanelV132203 .shape-border-control.shape-border-layout-proto1{display:grid!important;grid-template-columns:auto minmax(0,1fr) 34px 78px!important;gap:5px!important;align-items:center!important}
      .screen[data-screen="outfits"] #shapeEditPanelV132203 .shape-border-control .shape-border-color-inline-proto1{display:flex!important;align-items:center!important;justify-content:space-between!important;gap:4px!important;width:78px!important;min-width:78px!important;min-height:30px!important;margin:0!important;padding:3px 4px!important;border:1px solid rgba(108,81,66,.14)!important;border-radius:8px!important;background:#fffaf0!important;box-sizing:border-box!important}
      .screen[data-screen="outfits"] #shapeEditPanelV132203 .shape-border-control .shape-border-color-inline-proto1 span{font-size:8px!important;font-weight:800!important;color:#665c50!important}
      .screen[data-screen="outfits"] #shapeEditPanelV132203 .shape-border-control .shape-border-color-inline-proto1 input[type="color"]{width:28px!important;height:22px!important;padding:1px!important}
      .screen[data-screen="outfits"] #shapeStyleControlsV132206{display:grid!important;grid-template-columns:78px minmax(0,1fr)!important;gap:7px!important;padding-top:0!important;align-items:center!important}
      .screen[data-screen="outfits"] #shapeStyleControlsV132206 .shape-color-row{display:block!important;min-width:0!important}
      .screen[data-screen="outfits"] #shapeStyleControlsV132206 .shape-color-control{width:78px!important;min-width:78px!important;box-sizing:border-box!important}
      .screen[data-screen="outfits"] #shapeStyleControlsV132206 .shape-border-style-row{display:grid!important;grid-template-columns:auto minmax(0,1fr)!important;gap:5px!important;align-items:center!important;min-width:0!important}
      .screen[data-screen="outfits"] #shapeStyleControlsV132206 .shape-border-style-row>span{display:block!important;font-size:8px!important;font-weight:800!important;color:#665c50!important;white-space:nowrap!important}
      .screen[data-screen="outfits"] #shapeStyleControlsV132206 .shape-border-style-options{display:flex!important;gap:5px!important;justify-content:flex-start!important;min-width:0!important}
      .screen[data-screen="outfits"] #shapeStyleControlsV132206 .shape-border-style-btn{display:inline-flex!important;align-items:center!important;justify-content:center!important;gap:5px!important;min-width:70px!important;min-height:34px!important;padding:0 8px!important;font-size:9px!important}
      .screen[data-screen="outfits"] #shapeStyleControlsV132206 .shape-border-style-btn i{width:20px!important;height:0!important;border-top-width:2px!important}
      @media(max-width:390px){
        .screen[data-screen="outfits"] #shapeEditPanelV132203 .shape-border-control.shape-border-layout-proto1{grid-template-columns:auto minmax(0,1fr) 32px 72px!important}
        .screen[data-screen="outfits"] #shapeEditPanelV132203 .shape-border-control .shape-border-color-inline-proto1,
        .screen[data-screen="outfits"] #shapeStyleControlsV132206 .shape-color-control{width:72px!important;min-width:72px!important}
        .screen[data-screen="outfits"] #shapeStyleControlsV132206{grid-template-columns:72px minmax(0,1fr)!important;gap:5px!important}
        .screen[data-screen="outfits"] #shapeStyleControlsV132206 .shape-border-style-btn{min-width:62px!important;padding:0 6px!important}
      }

      /* STICKERS — compact outline switch in the pack header, above count. */
      .screen[data-screen="outfits"] #stickerStudioV1322Release .sticker-pack-head{align-items:flex-start!important}
      .screen[data-screen="outfits"] #stickerStudioV1322Release .sticker-pack-meta-proto2{display:grid!important;justify-items:end!important;gap:4px!important;flex:0 0 auto!important}
      .screen[data-screen="outfits"] #stickerStudioV1322Release .sticker-pack-meta-proto2 .sticker-outline-row{display:block!important;min-height:0!important;padding:0!important;margin:0!important;border:0!important}
      .screen[data-screen="outfits"] #stickerStudioV1322Release .sticker-pack-meta-proto2 .sticker-outline-label{display:none!important}
      .screen[data-screen="outfits"] #stickerStudioV1322Release .sticker-pack-meta-proto2 .sticker-outline-segment{padding:1px!important;border-radius:999px!important}
      .screen[data-screen="outfits"] #stickerStudioV1322Release .sticker-pack-meta-proto2 .sticker-outline-btn{min-width:34px!important;height:22px!important;padding:0 6px!important;border-radius:999px!important;font-size:7px!important}
      .screen[data-screen="outfits"] #stickerStudioV1322Release .sticker-pack-count{white-space:nowrap!important}
    `;
  }

  function polishText(){
    const row=document.querySelector('.decorate-studio-panel[data-decorate-group="text"] .text-font-align-row');
    if(!row)return false;
    const label=row.querySelector(':scope > .text-studio-label:first-child');if(label)label.setAttribute('aria-hidden','true');
    return true;
  }

  function polishDraw(){
    const root=document.getElementById('drawStudioDev10');if(!root)return false;
    const strip=root.querySelector('.draw-tool-strip'),controls=root.querySelector('.draw-control-row'),secondary=root.querySelector('.draw-secondary-row'),status=root.querySelector('.draw-status-wrap'),segment=root.querySelector('.draw-segment'),undo=root.querySelector('.draw-undo-btn');
    if(!strip||!controls||!secondary||!status||!segment||!undo)return false;

    if(status.parentNode!==root||status.previousElementSibling!==strip)strip.insertAdjacentElement('afterend',status);
    status.classList.add('draw-status-row-proto1');
    let copy=status.querySelector(':scope > .draw-status-copy-proto2');
    if(!copy){
      copy=document.createElement('div');copy.className='draw-status-copy-proto2';
      [...status.children].filter(x=>x!==undo).forEach(x=>copy.appendChild(x));
      status.insertBefore(copy,status.firstChild);
    }
    if(undo.parentNode!==status)status.appendChild(undo);

    let lineLabel=secondary.querySelector(':scope > .draw-line-label-proto2');
    if(!lineLabel){lineLabel=document.createElement('span');lineLabel.className='draw-line-label-proto2';lineLabel.textContent='Line';secondary.insertBefore(lineLabel,secondary.firstChild);}
    if(segment.parentNode!==secondary)secondary.appendChild(segment);
    if(lineLabel.nextElementSibling!==segment)lineLabel.insertAdjacentElement('afterend',segment);
    return true;
  }

  function polishShapes(){
    const panel=document.getElementById('shapeEditPanelV132203'),borderControl=panel?.querySelector('.shape-border-control'),styles=document.getElementById('shapeStyleControlsV132206'),colorRow=styles?.querySelector('.shape-color-row'),borderColor=document.getElementById('shapeBorderColorV132206')?.closest('.shape-color-control'),fillColor=document.getElementById('shapeFillColorV132206')?.closest('.shape-color-control'),styleRow=styles?.querySelector('.shape-border-style-row');
    if(!panel||!borderControl||!styles||!colorRow||!borderColor||!fillColor||!styleRow)return false;

    borderControl.classList.add('shape-border-layout-proto1');borderColor.classList.add('shape-border-color-inline-proto1');
    if(borderColor.parentNode!==borderControl)borderControl.appendChild(borderColor);
    if(fillColor.parentNode!==colorRow)colorRow.appendChild(fillColor);
    if(colorRow.parentNode!==styles)styles.insertBefore(colorRow,styles.firstChild);
    if(styleRow.parentNode!==styles)styles.appendChild(styleRow);

    const lineLabel=styleRow.querySelector(':scope > span');if(lineLabel){lineLabel.removeAttribute('aria-hidden');lineLabel.textContent='Line';}
    const solid=styleRow.querySelector('[data-border-style="solid"]'),dashed=styleRow.querySelector('[data-border-style="dashed"]');
    if(solid)solid.innerHTML='<i class="solid-line" aria-hidden="true"></i><span>Solid</span>';
    if(dashed)dashed.innerHTML='<i class="dashed-line" aria-hidden="true"></i><span>Dashed</span>';
    return true;
  }

  function polishStickers(){
    const root=document.getElementById('stickerStudioV1322Release');if(!root)return false;
    const outline=root.querySelector('.sticker-outline-row'),head=root.querySelector('.sticker-pack-head'),count=head?.querySelector('.sticker-pack-count');
    if(!outline||!head||!count)return false;
    outline.classList.remove('sticker-outline-below-proto1');
    let meta=head.querySelector('.sticker-pack-meta-proto2');
    if(!meta){meta=document.createElement('div');meta.className='sticker-pack-meta-proto2';count.insertAdjacentElement('beforebegin',meta);meta.appendChild(count);}
    if(outline.parentNode!==meta)meta.insertBefore(outline,count);
    const label=outline.querySelector('.sticker-outline-label');if(label)label.setAttribute('aria-hidden','true');
    return true;
  }

  function reconcile(){installStyles();polishText();polishDraw();polishShapes();polishStickers();}
  function schedule(){requestAnimationFrame(()=>requestAnimationFrame(reconcile));setTimeout(reconcile,100);}
  function start(){
    reconcile();[100,300,700,1200].forEach(ms=>setTimeout(reconcile,ms));
    document.addEventListener('click',e=>{const t=e.target;if(!(t instanceof Element))return;if(t.closest('.decorate-studio-tab[data-decorate-group],.board-workspace-tab[data-board-panel="decorate"],#decorateToggle,#boardFocusToggleDev1,.sticker-pack-btn'))schedule();},false);
    window.addEventListener('pageshow',schedule);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
