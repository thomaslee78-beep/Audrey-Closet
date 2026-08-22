Audrey Closet — v13.20-dev1 Main Update
Canvas Backgrounds — First Iteration

WHY "CANVAS"
Canvas describes the surface underneath the outfit rather than a particular background style.
The Board workspace is now:
Add Items | Tools | Decorate | Canvas

CANVAS EXPERIENCE
- New fourth workspace tab: Canvas
- Visual category chips: All / Color / Paper / Fabric / Pattern / Fun
- Tap a visual swatch to apply it immediately
- Active Canvas has a check indicator
- Custom color picker is available without a separate settings screen
- Canvas choice saves with the outfit and reloads when editing or duplicating a saved look
- New Board and Clear reset to Original

16 STARTER PRESETS

Original
1. Original cream board

Color
2. Blush
3. Sage
4. Powder Blue
5. Charcoal

Paper
6. Sketchbook
7. Kraft
8. Graph Paper

Fabric
9. Linen
10. Denim
11. Leather

Pattern
12. Gingham
13. Plaid
14. Checker

Fun
15. Tic-Tac-Toe
16. Postcard

PLUS
- Custom Color picker

ARCHITECTURE
- Canvas is stored as a Board/outfit property, not a draggable Board object.
- Presets are metadata-driven by id/category/name/style.
- This makes it possible to add future background packs without changing the core Board object model.
- Starter backgrounds are generated locally with CSS; no external images or network calls are required.

FUTURE PACK DIRECTION
- Designer Paper
- Textile Studio
- Paris
- New York
- Travel
- Seasonal
- Y2K / Retro
- Playground
- School / Notebook
- Minimalist

NOT YET PART OF DEV1
- Intensity / fade control
- Image/photo scene backgrounds
- downloadable background packs
- user-imported custom background images
- dedicated background management screen

TEST
1. Confirm four folder tabs fit: Add Items / Tools / Decorate / Canvas.
2. Open Canvas and tap each category.
3. Apply several presets and confirm the Board updates immediately.
4. Try Custom Color.
5. Add garments over light, dark, textured and patterned Canvas choices.
6. Save a look and reopen it; confirm Canvas selection returns.
7. Duplicate a saved look; confirm Canvas selection carries over.
8. Start New or Clear; confirm Canvas resets to Original.
9. Confirm Add Items, Tools and Decorate behavior is unchanged.

ROLLBACK
Replace sw.js with v13.19-dev5.
