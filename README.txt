Audrey Closet — v13.17-dev8 Main Update

PURPOSE
First working Free-Flow Closet experiment.

NOTE
v13.17-dev7 was a planning/stabilization checkpoint only. No dev7 package was created. This build continues directly from v13.17-dev6.

FREE-FLOW
Configuration > Catalog / Closet > Closet view now allows:
- Classic
- Modern
- Free-Flow

FREE-FLOW DESIGN
- Closet item cards lose their visible card surface.
- No card border.
- No card shadow.
- No metadata/text beneath the image.
- No wear-count badge.
- Garment photo becomes the primary visual object.
- Garment images receive a very light drop shadow for separation from the page.
- The underlying 2-column order/grid is retained for safe drag/reorder behavior.
- Small repeating differences in scale and vertical position make the items feel less mechanically gridded and more like garments laid out on a surface.
- Tier ribbons remain available, but are reduced slightly so the garment stays dominant.
- Archived badge remains for safety/clarity.

INTERACTION
- Tap an item to open its normal details.
- Search, category filters, advanced filters and Tier filters remain shared.
- Long-press / drag still means reorder, not free X/Y positioning.
- The same closet order is shared across Classic, Modern and Free-Flow.
- Free-Flow reorder ghost is stripped of the normal card surface.

IMPORTANT
This is intentionally NOT arbitrary spatial placement yet. The goal of dev8 is to test whether the visual idea is compelling before changing the data model or drag semantics.

MODERN
- Modern remains exactly as established through dev6.
- No additional Modern visual changes in this build.

CLASSIC
- Classic remains unchanged.

TEST
1. Configuration > Catalog / Closet > choose Free-Flow.
2. Return to Closet.
3. Confirm items appear as floating garment photos with no visible card/body.
4. Confirm no wear-count or metadata text appears.
5. Confirm Tier ribbons remain if enabled.
6. Tap several garments and confirm normal item details open.
7. Test category, search, filters and Tier filters.
8. Long-press/reorder and verify order persists.
9. Switch to Classic and Modern and confirm the same item order is preserved.
10. Close/reopen the PWA and verify Free-Flow selection persists.
11. Pay attention to whether the subtle size/vertical variation feels organic or distracting.

ROLLBACK
Replace sw.js with v13.17-dev6.
