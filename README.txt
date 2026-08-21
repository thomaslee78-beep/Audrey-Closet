Audrey Closet — v13.17-dev11 Main Update

PURPOSE
Free-Flow experiment: larger garments, no rotation, and a dynamic scatter that changes after a successful closet reorder.

CHANGES

1. LARGER GARMENTS
- Free-Flow garment footprint increased again.
- Photo area is now 112% of the nominal card width.
- Scale varies approximately from 1.08 to 1.18.
- This intentionally lets garments feel closer and occasionally visually overlap the invisible grid space.

2. ROTATION REMOVED
- All Free-Flow rotations are removed.
- Garments stay upright.
- Organic feeling now comes only from scale and X/Y position.

3. DYNAMIC X/Y SCATTER
- Each Free-Flow card receives a controlled horizontal and vertical offset.
- X varies roughly +/-10 px.
- Y varies roughly +/-12 px.
- Initial arrangement is stable during normal renders.

4. REORDER CAUSES A NEW SETTLE
- After a successful Free-Flow drag/reorder, the scatter pattern is regenerated.
- This means the garments do more than simply swap slots: the whole visible layout subtly settles into a different arrangement.
- The underlying closet order is still the only data order being changed.
- No arbitrary X/Y coordinates are stored on individual items yet.

WHY THIS APPROACH
This tests the emotional/visual idea of items shifting around after you move one without introducing a permanent spatial-position data model.

UNCHANGED
- Classic view.
- Modern view.
- Search/category/filter/Tier filtering.
- Tier ribbons.
- Tap-to-open.
- Drag/reorder semantics: dragging still changes closet order.

TEST
1. Choose Free-Flow.
2. Notice garments are larger and upright.
3. Long-press an item and move it to another position.
4. After the reorder completes, confirm the surrounding garments subtly change X/Y spacing too.
5. Reorder again and confirm a different scatter appears.
6. Verify the actual closet order remains correct when switching to Classic or Modern.
7. Test filters and category changes to ensure cards still render correctly.

ROLLBACK
Replace sw.js with v13.17-dev10.
