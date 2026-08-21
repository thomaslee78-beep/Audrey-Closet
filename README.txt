Audrey Closet — v13.17-dev2 Main Update

PURPOSE
Second Closet View experiment. This build makes Modern significantly more photo-forward by removing the text/metadata area beneath each item card.

BASE
- Builds directly on v13.17-dev1.
- Replace only sw.js.
- Cache/version: audrey-closet-v13.17-dev2.

MODERN VIEW CHANGE
- Item card text/body is hidden in Modern only.
- Modern cards now visually consist primarily of the garment photo and existing overlays.
- Tier ribbons remain available.
- Wear-count badges remain available.
- Thin separators and full-bleed Modern grid remain.
- Tap target remains the same full item card.
- Long-press/reorder behavior remains shared.
- Search/filter/category/tier logic remains shared.

CLASSIC
- Completely unchanged.
- Full item metadata continues to show below each photo.

FREE-FLOW
- Still visible as the planned experimental view.
- Still disabled in this build.

TEST
1. Switch to Modern.
2. Confirm no brand/color/size/type text appears beneath closet photos.
3. Confirm images now visually touch as a photo-first grid.
4. Tap an item and confirm Piece Details opens normally.
5. Test long-press/reorder.
6. Test search, categories, filters and Tier filters.
7. Confirm Tier ribbons and wear-count badges still appear.
8. Switch back to Classic and confirm all card text returns.
9. Close/reopen the PWA and confirm selected view persists.

ROLLBACK
Replace sw.js with v13.17-dev1.
