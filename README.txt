Audrey Closet — v13.17-dev3 Main Update

PURPOSE
Third Closet View experiment. This build pushes Modern further toward a hard-edge, full-bleed visual language while keeping Classic untouched.

BASE
- Builds directly on v13.17-dev2.
- Replace only sw.js.
- Cache/version: audrey-closet-v13.17-dev3.

MODERN VIEW REFINEMENTS

1. CATEGORY / ITEM TYPE ROW
- Category row now stretches to the left and right edges of the Closet screen.
- Buttons sit directly against one another.
- Rounded corners are removed.
- Buttons use straight rectangular edges.
- Active category behavior remains unchanged.

2. WEAR COUNT
- Wear-count badge is hidden on Modern catalog cards.
- Tier ribbons remain visible according to the Tier ribbon setting.
- Classic continues to show wear count normally.

3. SEARCH
- Search box uses square/straight edges in Modern.
- Search behavior is unchanged.

4. FILTER BUTTON
- Filter button uses square/straight edges in Modern.
- Filter behavior is unchanged.

DESIGN INTENT
Modern should feel distinctly different from Classic:
- full-bleed
- rectangular
- image-forward
- minimal visual chrome
- fewer rounded-card cues

UNCHANGED
- Classic view.
- Closet item data.
- Card tap/open behavior.
- Long-press / drag reorder.
- Search/filter/category logic.
- Tier filtering and Tier ribbons.
- Free-Flow remains disabled.
- App Style/themes remain a separate future feature.

TEST
1. Switch to Modern.
2. Confirm category buttons stretch edge-to-edge.
3. Confirm category buttons have square corners.
4. Confirm search box has square corners.
5. Confirm Filter button has square corners.
6. Confirm wear-count badge is gone from Modern cards.
7. Confirm Tier ribbons still appear.
8. Test category selection, search and filters.
9. Test card tap and long-press/reorder.
10. Switch to Classic and confirm all prior rounded styling and wear counts return.

ROLLBACK
Replace sw.js with v13.17-dev2.
