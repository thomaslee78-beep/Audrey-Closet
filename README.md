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

## v12.1 stability update
- Stabilizes the iPhone/PWA bottom navigation bar during long Closet and Board scrolling.
- Cancel/close on the closet item editor now discards all unsaved field and photo edits; only **Save piece** writes changes.
- Existing-item review now shows a larger image and a quick identity header (type, color, brand).
- Photo tools have moved below the item attributes/notes to keep review focused on the garment.
