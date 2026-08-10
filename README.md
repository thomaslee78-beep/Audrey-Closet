# Audrey’s Clothing App v12

A phone-first GitHub Pages closet, outfit board, style portfolio, journal and wishlist.

## v12 Board layout update
- Outfit Board/design canvas is back near the top of the Board screen.
- The optional Decorate control now sits directly above the canvas.
- Outfit name, notes and Save/Share/Clear stay just below the canvas.
- Portfolio destination is no longer a permanent field on the Board. Tapping Save opens a small confirmation sheet where you choose the portfolio folder.
- The clothing picker now sits at the bottom of the Board screen.
- Clothing remains in a 3-column grid on iPhone, but the picker no longer has its own limited-height scroll box: the full filtered collection can extend down the page.
- Closet/Wishlist, Recent and clothing-category filters are retained.
- Portfolio remains a separate main tab, with Favorites and customizable folders in Preferences.

Existing IndexedDB data remains compatible with prior releases.

## GitHub Pages
Upload all files in this folder to the root of the existing GitHub Pages repository. Keep the same repository/URL to preserve device-local data.

## v12.3 stability update
- Stabilizes the iPhone/PWA bottom navigation bar during long Closet and Board scrolling.
- Cancel/close on the closet item editor now discards all unsaved field and photo edits; only **Save piece** writes changes.
- Existing-item review now shows a larger image and a quick identity header (type, color, brand).
- Photo tools have moved below the item attributes/notes to keep review focused on the garment.

## v12.4 closet refinement
- Press and hold a closet card while viewing a specific category, then drag it to set your preferred order.
- Custom ordering is stored locally and persists across app restarts.
- Item review form controls use iPhone-safe 16px text sizing to prevent Safari from zooming into Brand/Notes fields and leaving the review screen awkwardly magnified.

## v12.7 closet reorder reliability
- Reworked touch reordering for iPhone/iOS instead of relying on pointer events with `touch-action: pan-y`.
- Long-press now creates a floating visual card, leaves a placeholder, and moves that placeholder live as you drag.
- The final visual order is persisted immediately and the Closet rerenders from that saved preference order.


## v12.7 closet reorder polish
- Prevents iOS from popping/copy-dragging the garment image itself.
- Uses a stable highlighted drop slot instead of moving the full catalog card during drag.
- Improves first-left-slot snapping, throttles touch layout updates, adds smooth card reflow animation, and auto-scrolls near screen edges.


### v12.11
Closet reorder now previews a target without moving neighboring cards until drop. Outfit Board adds undo for removed objects, clearer front/back layering controls, and gentler movement sensitivity for iPhone editing. No database migration required.


### v12.11 polish
Closet reorder now uses a solid outline on the item being moved and a dotted outline on the destination. Board edit controls remain visible below the board and gray out until an object is selected; Undo remains independently available. Photo Tools opens automatically for brand-new closet items but stays collapsed when reviewing existing pieces.


### v13.1
- Fixes iPhone Closet reorder tracking so the floating garment remains attached to your finger after the long press, even after your finger leaves the original card.
- Active touch tracking now moves to the window level during reorder mode and is removed cleanly on drop/cancel.
