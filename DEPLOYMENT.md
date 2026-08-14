# GitHub Pages deployment

This is a static web app. It does not require Node.js, npm, or a build step.

Recommended GitHub Pages setup:
1. Upload the CONTENTS of this folder to the repository root (index.html must be at the root).
2. In Settings > Pages, choose Deploy from a branch.
3. Select main and /(root), then Save.
4. Commit any small change to main to trigger a fresh deployment if needed.

The `.nojekyll` file is included so GitHub Pages serves the static files directly without Jekyll processing.

A Node.js deprecation warning shown by the GitHub-generated Pages workflow is about GitHub Actions runtime dependencies, not this app; this app contains no Node package and no npm dependencies.

### v12.3
This is a bug-fix/refinement release. It uses the same IndexedDB database as v12 and does not intentionally migrate or erase closet data. After GitHub Pages deploys, refresh the Pages URL in Safari once, then close/reopen the Home Screen app.

### v12.4
Closet preference ordering and iPhone form-zoom stabilization. Uses the existing IndexedDB database and settings object; no destructive migration is required.

### v12.7
Closet drag-and-drop reliability update for iPhone. No database migration is required; the existing `settings.closetOrder` preference data is reused. The service-worker cache is bumped to v12.7.


### v12.7
Closet reorder interaction polish. No database migration required. Service-worker cache is v12.7.


### v12.11
Closet reorder now previews a target without moving neighboring cards until drop. Outfit Board adds undo for removed objects, clearer front/back layering controls, and gentler movement sensitivity for iPhone editing. No database migration required.


### v12.11 polish
Closet reorder now uses a solid outline on the item being moved and a dotted outline on the destination. Board edit controls remain visible below the board and gray out until an object is selected; Undo remains independently available. Photo Tools opens automatically for brand-new closet items but stays collapsed when reviewing existing pieces.


## v13.0
Closet drag tracking fix for iPhone. No database migration required. Service-worker cache is v13.0.

## v13.8-dev1
Upload the complete package together so `index.html`, `app.js`, `styles.css`, and `sw.js` stay in sync. The service-worker cache name is `audrey-closet-v13.8-dev1.2`.

## v13.8-dev1.1
Upload the complete package together. This build keeps the v13.8 editing-engine scope and fixes framing plus touch-mode separation. Service-worker cache: `audrey-closet-v13.8-dev1.2`.


## v13.8-dev1.2
Upload the complete package together. This build preserves the current edited Studio image on re-entry, resets viewport zoom when entering Move mode so placement matches the saved canvas, and allows the Studio to scroll when More options is expanded. Service-worker cache: `audrey-closet-v13.8-dev1.2`.


## v13.8-dev1.4
Photo Studio editing-engine bugfix: full non-shrinking square canvas, collapsible compact Cutout controls below the main editing toolbar, one-finger neutral-mode board panning, and board/guidelines that pan and zoom together with the viewport. Service-worker cache: `audrey-closet-v13.8-dev1.4`.


## v13.8-dev1.5
Small Photo Studio polish: renames the camera action to `Take photo` and reorders the primary Studio toolbar to Move, Undo, Redo, Restore, Erase. Service-worker cache: `audrey-closet-v13.8-dev1.5`.


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
