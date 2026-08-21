Audrey Closet — v13.17-dev6 Main Update

PURPOSE
Fix the remaining rounded dotted reorder outline in Modern Closet view.

ROOT CAUSE
The closet reorder drop outline is dynamically inserted into a separate drag overlay outside the Catalog screen. The v13.17-dev5 CSS was scoped as a descendant of the Modern Catalog screen, so it could not match that overlay element.

FIX
- applyClosetView now adds a page-level body state:
  body.closet-view-modern
- Modern reorder overlay styling now targets:
  body.closet-view-modern .closet-drop-outline
  body.closet-view-modern .closet-drag-ghost
- Both receive border-radius: 0 !important.
- Classic keeps the existing rounded reorder visuals.

UNCHANGED
- Modern empty-card placeholder from dev5.
- Modern hard-edge hero/category/search/filter styling.
- Modern hides wear count.
- Tier ribbons remain.
- Catalog reorder behavior and persistence are unchanged.
- Classic remains unchanged.

TEST
1. Switch to Modern.
2. Long-press a closet item.
3. Drag it over another card.
4. Confirm the purple/red dotted destination rectangle now has completely square corners.
5. Confirm the lifted drag card also has square corners.
6. Switch to Classic and confirm its rounded reorder appearance remains.

ROLLBACK
Replace sw.js with v13.17-dev5.
