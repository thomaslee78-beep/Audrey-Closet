/* Audrey Closet v13.22-dev7 — Shape Studio layout cleanup */
(function(){
  'use strict';

  function looksLikeLegacyShapesIntro(node){
    if(!node)return false;
    if(node.querySelector?.('#shapeStudioV132201'))return false;
    const text=String(node.textContent||'').replace(/\s+/g,' ').trim();
    if(!text)return false;
    const heading=[...node.querySelectorAll?.('h1,h2,h3,h4,strong')||[]]
      .map(x=>String(x.textContent||'').trim().toLowerCase())
      .find(Boolean)||'';
    return heading==='shapes' ||
      (/^Shapes\b/.test(text) && /Captions\s*&\s*arrows/i.test(text) && /Thought bubbles/i.test(text));
  }

  function installShapeStudioLayoutV132207(){
    const studio=document.getElementById('shapeStudioV132201');
    if(!studio)return;

    const content=studio.closest('.decorate-studio-content');
    const studioCard=studio.closest('.decorate-tool-card')||studio.parentElement;
    if(!content||!studioCard)return;

    // Remove the older generic Shapes intro/placeholder card above Shape Studio.
    [...content.children].forEach(child=>{
      if(child===studioCard||child.contains?.(studio))return;
      if(looksLikeLegacyShapesIntro(child))child.remove();
    });

    // Move the existing help sentence out of the Shape Studio card and present it
    // as a compact informational callout immediately above the studio.
    let info=document.getElementById('shapeStudioInfoV132207');
    const oldHint=studio.querySelector('.shape-studio-hint');
    const helpText=String(oldHint?.textContent||'Select a shape on the Board to move, rotate or resize it. Side handles stretch width or height independently.').trim();
    if(oldHint)oldHint.remove();

    if(!info){
      info=document.createElement('div');
      info.id='shapeStudioInfoV132207';
      info.className='shape-studio-info';
      info.setAttribute('role','note');
      info.innerHTML=`
        <span class="shape-studio-info-icon" aria-hidden="true">i</span>
        <div class="shape-studio-info-copy">
          <strong>Shape editing</strong>
          <span>${helpText}</span>
        </div>`;
      studioCard.insertAdjacentElement('beforebegin',info);
    }else{
      const copy=info.querySelector('.shape-studio-info-copy span');
      if(copy)copy.textContent=helpText;
      if(info.nextElementSibling!==studioCard)studioCard.insertAdjacentElement('beforebegin',info);
    }
  }

  function installStylesV132207(){
    if(document.getElementById('shapeStudioStylesV132207'))return;
    const style=document.createElement('style');
    style.id='shapeStudioStylesV132207';
    style.textContent=`
      .screen[data-screen="outfits"] .decorate-studio-panel[data-decorate-group="shapes"]>.decorate-studio-intro{display:none!important}
      .screen[data-screen="outfits"] .decorate-studio-panel[data-decorate-group="shapes"]{gap:0!important}
      .screen[data-screen="outfits"] .shape-studio-info{display:grid;grid-template-columns:24px minmax(0,1fr);gap:8px;align-items:start;margin:0 0 9px;padding:8px 10px;border:1px solid rgba(102,113,90,.18);border-radius:11px;background:rgba(238,240,232,.72);color:#665c50}
      .screen[data-screen="outfits"] .shape-studio-info-icon{display:grid;place-items:center;width:22px;height:22px;border-radius:50%;background:#6d7863;color:#fff;font:800 12px/1 var(--sans)}
      .screen[data-screen="outfits"] .shape-studio-info-copy{display:grid;gap:2px;min-width:0}
      .screen[data-screen="outfits"] .shape-studio-info-copy strong{font-size:9px;line-height:1.15;font-weight:800;color:#52604c;letter-spacing:.02em}
      .screen[data-screen="outfits"] .shape-studio-info-copy span{font-size:9px;line-height:1.35;color:#74695d}
      .screen[data-screen="outfits"] #shapeStudioV132201{gap:8px}
    `;
    document.head.appendChild(style);
  }

  installStylesV132207();
  installShapeStudioLayoutV132207();
  setTimeout(installShapeStudioLayoutV132207,200);
  setTimeout(installShapeStudioLayoutV132207,700);

  window.__audreyShapeStudioV132207={sync:installShapeStudioLayoutV132207};
})();
