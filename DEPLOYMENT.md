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
