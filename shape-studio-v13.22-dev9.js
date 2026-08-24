/* Audrey Closet v13.22-dev9 — compact Shape Studio messaging */
(function(){
  'use strict';

  function selectedShape(){
    const model=boardItems.find(x=>String(x.uid)===String(selectedBoardUid));
    return model?.kind==='shape'?model:null;
  }

  function ensureInfoCopy(){
    const studio=document.getElementById('shapeStudioV132201');
    if(!studio)return;

    const info=document.getElementById('shapeStudioInfoV132207');
    if(!info)return;

    const title=info.querySelector('.shape-studio-info-copy strong');
    const copy=info.querySelector('.shape-studio-info-copy span');
    if(!title||!copy)return;

    if(selectedShape()){
      title.textContent='Shape Editing';
      copy.textContent='Select a shape on the Board to move, rotate or resize it. Side handles stretch width or height independently.';
    }else{
      title.textContent='Shape Studio';
      copy.textContent='Tap a shape to add it to the Board.';
    }

    const head=studio.querySelector('.shape-studio-head');
    if(head)head.remove();
    studio.querySelectorAll('.shape-studio-label').forEach(label=>label.remove());
  }

  function installStyles(){
    if(document.getElementById('shapeStudioStylesV132209'))return;
    const style=document.createElement('style');
    style.id='shapeStudioStylesV132209';
    style.textContent=`
      .screen[data-screen="outfits"] #shapeStudioV132201 .shape-studio-head{display:none!important}
      .screen[data-screen="outfits"] #shapeStudioV132201 .shape-studio-label{display:none!important}
      .screen[data-screen="outfits"] #shapeStudioV132201 .shape-studio-section{gap:3px}
      .screen[data-screen="outfits"] #shapeStudioV132201{gap:5px}
      .screen[data-screen="outfits"] .shape-studio-info{margin-bottom:6px}
    `;
    document.head.appendChild(style);
  }

  const previousDrawBoard=drawBoard;
  drawBoard=function(){
    const result=previousDrawBoard.apply(this,arguments);
    requestAnimationFrame(ensureInfoCopy);
    return result;
  };

  document.addEventListener('pointerup',e=>{
    if(e.target.closest?.('#outfitBoard'))setTimeout(ensureInfoCopy,0);
  },true);
  document.addEventListener('click',e=>{
    if(e.target.closest?.('[data-decorate-group="shapes"]')||e.target.closest?.('#outfitBoard'))setTimeout(ensureInfoCopy,0);
  },true);

  installStyles();
  ensureInfoCopy();
  setTimeout(ensureInfoCopy,200);
  setTimeout(ensureInfoCopy,700);

  window.__audreyShapeStudioV132209={sync:ensureInfoCopy};
})();
