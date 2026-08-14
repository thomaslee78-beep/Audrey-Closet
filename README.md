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


## v13.9-dev2
Second incremental cutout-quality pass. Keeps the v13.9-dev1.1 background-detection calibration while improving edge/detail handling: fine foreground details adjacent to the main mask can be rescued, only genuinely tiny isolated mask fragments are removed (instead of broad component pruning), enclosed garment regions are preserved again after cleanup, and boundary alpha is tightened to reduce fuzzy halos without changing cutout sensitivity behavior. Service-worker cache: `audrey-closet-v13.9-dev2`.


## v13.9-dev2.1
Calibration update for cutout behavior and restore. Automatic cutout now adapts to overall subject/background contrast: low-contrast items are treated more conservatively, while medium/high-contrast items remove obvious outer background more aggressively. Restore now paints back pixels from the captured original photo, so clothing details can be recovered even when the cutout removed them completely. Service-worker cache: `audrey-closet-v13.9-dev2.1`.


## v13.10-dev1
Adds non-destructive Photo Studio adjustments for Exposure, Contrast, and Highlights. Adjustments are previewed live, persist when reopening the photo, export with the saved image, and can be reset without affecting cutout or masking work. Service-worker cache: `audrey-closet-v13.10-dev1`.


## v13.10-dev1.1
Refines Photo Studio layout for iPhone editing. The photo canvas remains fixed in the upper portion of the sheet while the editing menus scroll independently below, so slider and cutout changes stay visible without repeatedly scrolling back to the image. Service-worker cache: `audrey-closet-v13.10-dev1.1`.


## v13.10-dev1.2
Photo Studio layout refinement: the primary Adjust / Undo / Redo / Restore / Erase toolbar now stays fixed directly below the photo canvas. Tool guidance, brush controls, Cutout, Adjustments, More options, and status messaging remain in the independently scrollable controls area. Service-worker cache: `audrey-closet-v13.10-dev1.2`.


## v13.10-dev1.3
Minor layout fixes: active Photo Studio tool instructions now appear directly beneath the active tool controls; Today's Look journal rows are contained within their card; and the bottom navigation is explicitly centered on tablet-width screens. Service-worker cache: `audrey-closet-v13.10-dev1.3`.


## v13.11-dev1
Portfolio foundation and detail refresh. Adds stable per-folder portfolio ordering groundwork, a redesigned saved-look detail view with an upper-right favorite star, full notes area, collapsible unique item listing with copy counts, and a fixed bottom action bar. Existing saved looks are normalized without changing the database schema. Service-worker cache: `audrey-closet-v13.11-dev1`.


## v13.11-dev2
Adds Portfolio Duplicate Look and safe Design Board switching. New Look, Edit on Board, and Duplicate now detect an existing Board draft and offer Save current & continue, Replace current board, or Cancel. Duplicate loads a new unsaved copy with a fresh board-item identity and a “— Copy” title so the original saved look is preserved. Service-worker cache: `audrey-closet-v13.11-dev2`.


## v13.11-dev3
Portfolio interaction and sharing refinements. Portfolio preview images are protected from native image actions, item rows open a read-only garment detail view, saved-look share rendering now uses uniform board geometry for more faithful text/graphic sizing, and Share offers Look only, Look + item details, or Look + items + notes. Service-worker cache: `audrey-closet-v13.11-dev3`.


## v13.11-dev4
Adds long-press drag-and-drop reordering for saved Portfolio looks within a selected folder, using the same stable ghost/drop-cue interaction style as Closet reordering. All/Favorites remain read-only aggregate views for order. Also improves Portfolio share rendering for emoji/stickers by prioritizing native color-emoji fonts and explicit emoji presentation, preventing dark emoji from incorrectly exporting as white where supported. Service-worker cache: `audrey-closet-v13.11-dev4`.


## v13.11-dev4.1
Reorder interaction calibration. Portfolio drag now supports continuous edge auto-scroll and more reliable vertical movement across rows, including iPhone touch tracking outside the original card. All/Favorites show a toast after a reorder long-press reminding the user to choose a specific portfolio category. Closet reorder receives matching lift/target/drop animations for consistent feedback. Service-worker cache: `audrey-closet-v13.11-dev4.1`.


## v13.11-dev4.2
Polishes Portfolio and Closet reorder gestures. Portfolio cards now lift from their actual position without jumping from the top of the screen; long-press attempts in All/Favorites are suppressed from opening look details after release. Closet reorder visuals now match Portfolio: a clean lifted ghost with no source outline and a two-layer turquoise + burgundy dashed destination cue. Service-worker cache: `audrey-closet-v13.11-dev4.2`.


## v13.11-dev4.3
Polishes Closet reordering with continuous finger-follow/edge auto-scroll behavior and saves newly created Portfolio looks at the front of their selected category. Existing saved looks keep their manually chosen order when edited in place. Service-worker cache: `audrey-closet-v13.11-dev4.3`.


## v13.11-dev4.4
Closet reorder calibration: the floating drag card now uses visual-viewport-aware touch coordinates so it stays under the finger on iPhone/PWA while scrolling and auto-scrolling. Consolidated older Closet drag CSS into one canonical rule set to remove conflicting legacy source/ghost/drop-target styles. Service-worker cache: `audrey-closet-v13.11-dev4.4`.


## v13.11-dev4.5
Closet reorder drag mapping fix. The floating card now uses raw client coordinates inside a dedicated fixed viewport overlay, matching `getBoundingClientRect()` and avoiding page/visual-viewport offset mixing on iPhone. The ghost uses explicit left/top positioning and remains independent of document scrolling. Service-worker cache: `audrey-closet-v13.11-dev4.5`.


## v13.11-dev5
Portfolio folder/order refinement: All and Favorites are now protected but movable system tabs in Preferences, and saved-look detail stays locked at the top until Items in this look is expanded. Service-worker cache: `audrey-closet-v13.11-dev5`.


## v13.11-dev5.1
Locks the page behind Portfolio look detail and read-only item preview dialogs so edge swipes cannot scroll the underlying app. Adds the same caret-style expandable indicator used elsewhere to the Items in this look section. Service-worker cache: `audrey-closet-v13.11-dev5.1`.


## v13.11-dev6
Adds Portfolio discovery: keyword search across looks and closet-item metadata, a thumbnail-based closet item filter with multi-select AND matching, selected-item filter chips, and clear-filter controls. Reordering is temporarily disabled while discovery filters are active to protect manual folder order. Service-worker cache: `audrey-closet-v13.11-dev6`.


## v13.12-dev1
Closet review UI refinement. Existing saved pieces now use compact upper-right Camera and Smart Scan controls; new pieces retain the full Photo Tools disclosure. Smart Scan is separated from photo tools and presents detected attributes for confirmation before applying them. Service-worker cache: `audrey-closet-v13.12-dev1`.


## v13.12-dev1.1
Closet review UI polish: camera and Smart Scan controls now sit on the upper-right of the closet card rather than beside the close button; photo-picker cancellation/return is hardened so the item editor stays open; Photo Studio is hidden for a new item until a photo exists; restoring the original photo now requires confirmation before discarding current photo edits. Service-worker cache: `audrey-closet-v13.12-dev1.1`.


## v13.12-dev1.2
Moves the saved-piece Camera and Smart Scan controls directly onto the upper-right of the photo. Hardens iPhone camera/library picker return behavior so canceling or returning from the native picker preserves and restores the current Add/Review Piece dialog instead of dropping back to Closet. Service-worker cache: `audrey-closet-v13.12-dev1.2`.


## v13.12-dev1.3
Closet review swipe polish: saved-piece review styling is more borderless/floating, the swipe hint text is removed, horizontal gestures direction-lock to avoid vertical jitter, and a lightweight outgoing/incoming transform animation gives clearer movement between closet pieces. Service-worker cache: `audrey-closet-v13.12-dev1.3`.


## v13.12-dev1.4
Keeps the borderless Closet review, hidden swipe hint, and horizontal gesture locking from dev1.3, but removes the two-stage outgoing/incoming transition that could look like a flash. Restores the earlier simple single-step swipe transition after the gesture completes. Service-worker cache: `audrey-closet-v13.12-dev1.4`.


## v13.12-dev1.5
Closet review polish: photo background now matches the review card surface and subtle previous/next arrows appear at the lower corners only when another item exists in that direction. Existing horizontal swipe locking and simple swipe transition are preserved. Service-worker cache: `audrey-closet-v13.12-dev1.5`.


## v13.12-dev1.6
Closet review polish: the existing-piece photo area now uses a transparent, shadow-free surface so it blends directly into the review card instead of reading like a separate panel. Camera, Smart Scan, and previous/next review controls are approximately 25% larger for easier touch interaction. Service-worker cache: `audrey-closet-v13.12-dev1.6`.
