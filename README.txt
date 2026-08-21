Audrey Closet — v13.18-dev6 Main Update

FIXES

1. CLEAR CONFIRMATION
- Reworked the Clear button handler to explicitly replace the existing click behavior.
- Uses stopImmediatePropagation so the old clear action cannot fire first.
- Confirmation warns that all Board items/decorations will be removed and cannot be undone.
- Cancel leaves the Board untouched.

2. NEW BOARD CONFIRMATION
- If the current Board has content/draft state, tapping New now asks:
  "Start a new board?"
- Warns that the current unsaved Board will be cleared.
- Cancel keeps the current Board.
- If Board is empty, New opens immediately.

3. COMPACT PICKER HEADER
- Removed the redundant "Pick your pieces" text.
- Closet / Wishlist remain aligned at the top-right of the picker.
- Category/filter controls are pulled upward.
- Reduced vertical spacing before the garment grid.
- Goal: show clothing sooner and make the picker feel more like a compact workspace toolbar.

TEST
1. Add items to Board.
2. Tools > Clear -> Cancel: Board remains.
3. Tools > Clear -> Confirm: Board clears.
4. Add items again.
5. Tap New -> Cancel: Board remains.
6. Tap New -> Confirm: new empty Board starts.
7. Open Pick Pieces and confirm garments begin higher on screen.

ROLLBACK
Replace sw.js with v13.18-dev5.
