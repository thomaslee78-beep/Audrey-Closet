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


### v13.2
- Fixes iPhone Closet reorder tracking so the floating garment remains attached to your finger after the long press, even after your finger leaves the original card.
- Active touch tracking now moves to the window level during reorder mode and is removed cleanly on drop/cancel.


### v13.4-dev1
- Locks the background while logging or editing a Journal day.
- Keeps scrolling contained inside the Journal editor and its bottom actions anchored.
- Centers the date selector for a cleaner iPhone layout.


### v13.4-dev4
- Removed duplicate rating text below the rating/favorite panel.
- Made Journal notes collapsible in the daily wear detail view.
- Based on v13.4-dev1 / stable v13.3 catalog code.


### v13.7-dev2
- Clean rebuild from the verified v13.4-dev4 Journal baseline.
- Adds a dedicated Today’s Look section above Planned Looks.
- Journal garment taps open a read-only preview; Back returns to the same day, Edit intentionally switches to Closet editing.
- No IndexedDB schema/version changes.
- Service worker registration uses a versioned URL and bypasses HTTP cache for update checks.

### v13.8-dev1
Photo Studio editing-engine rebuild for user testing:
- Smooth continuous Erase and Restore strokes with adjustable brush size.
- Mask/work-layer Undo and Redo history (up to 12 recent editing actions).
- Restore paints back only from the current starting layer (Original / Quick cutout / Clean cutout), so it does not unexpectedly restore the removed original background after a cutout.
- Two-finger editing-view pinch zoom plus dedicated − / 100% / + zoom controls.
- Dedicated Move mode: drag to reposition and pinch to resize; toggle Move off to lock the garment before masking.
- Fixed, compact primary toolbar for Erase / Restore / Undo / Redo / Move with secondary options collapsed below.
- Photo adjustments (exposure/contrast/highlights) and improved automatic cutout quality are intentionally deferred to later v13.8 development cycles.

### v13.8-dev1.1
Photo Studio editing-engine fixes: cutouts preserve the original framing/position, no editing tool is selected by default, neutral two-finger gestures zoom/pan the board without moving the garment, Erase/Restore are exclusive one-finger edit modes, and Move mode supports drag, pinch resize, and low-sensitivity two-finger rotation.


### v13.8-dev1.2
- Photo Studio now reopens from the currently applied/edited photo instead of automatically returning to the captured original.
- The starting-image tab is labeled Current photo; captured original remains an explicit restore option.
- Entering Move mode resets only the editor viewport to 100% so the dashed placement guide matches the saved output canvas.
- Studio content can scroll when More options is expanded, with save controls kept accessible at the bottom.


## v13.8-dev1.4
Photo Studio cosmetic cleanup: removes the obsolete Quick Photo Cleanup shortcut, adds a Cutout disclosure arrow, tightens the brush slider layout, adds rounded/dotted placement guides with center crosshairs, and adds custom/preset background colors in More options. Service-worker cache: `audrey-closet-v13.8-dev1.4`.


## v13.8-dev1.5
Small Photo Studio polish: renames the camera action to `Take photo` and reorders the primary Studio toolbar to Move, Undo, Redo, Restore, Erase. Service-worker cache: `audrey-closet-v13.8-dev1.5`.


## v13.8-dev1.6
Photo Studio bug-fix polish: Use captured original now resets the Studio in place; Color background expands a 10-step light-to-dark palette and hides for other background modes; Cutout uses the same disclosure marker as More options; canvas placement and center guides are darker, with center lines extending edge-to-edge. Service-worker cache: `audrey-closet-v13.8-dev1.6`.


## v13.8-dev1.8
Photo Studio final editing-engine fixes: reliable matching disclosure arrows; English localization-resource foundation for Studio strings; automatic Quick/Clean cutout now runs only from the captured source and is disabled after a cutout until the captured original is restored; legacy edited/transparency state is handled conservatively; permanent-delete typography is locked against iPhone orientation text resizing; and the background picker is a reusable four-row 40-color palette ordered Neutrals, Pastels, Colors, Brights. Service-worker cache: `audrey-closet-v13.8-dev1.8`.

## v13.8-dev1.9
Photo Studio Restore now respects the currently selected cutout layer. With Quick or Clean selected, Restore brings back only pixels that exist in that cutout result instead of restoring pixels directly from the captured original. Original mode continues to restore from the original source. Manual erase/restore masks, placement, scale, rotation, and the non-destructive cutout workflow are otherwise unchanged. Service-worker cache: `audrey-closet-v13.8-dev1.9`.


## v13.8-dev1.10
Photo Studio transform-history polish: Undo/Redo now includes completed reposition, resize, and rotation gestures in addition to Erase/Restore strokes. The primary transform tool is renamed from `Move` to `Adjust`. More options now separates `Center` (position only) and `Fit` (scale only); neither changes cutout or manual masks. Both Center and Fit are themselves undoable. Service-worker cache: `audrey-closet-v13.8-dev1.10`.


## v13.9-dev1
Improves automatic cutout quality with a more conservative background-removal pass. Quick and Clean now remove only background-connected regions, better protect similarly colored garment interiors, fill enclosed holes, and produce cleaner edges; Clean additionally removes small leftover fragments and keeps the main foreground component. Service-worker cache: `audrey-closet-v13.9-dev1`.


## v13.9-dev1.1
Calibration update for the first cutout-quality pass. Quick and Clean are tuned to remove more obvious outer background at default sensitivity while better protecting large light-colored foreground objects such as shoes. Added stronger likely-foreground protection, broader fragment cleanup, and a light mask close on both modes. Service-worker cache: `audrey-closet-v13.9-dev1.1`.
