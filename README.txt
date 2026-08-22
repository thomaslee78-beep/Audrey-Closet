Audrey Closet — v13.19-dev4 Main Update

PURPOSE
Refine Board locking behavior and simplify/enlarge Tools labels.

LOCK / UNLOCK CHANGES
- Lock control is hidden on unselected items.
- Select an item and the Lock/Unlock control appears.
- If an item is locked, it can still be selected.
- Selecting a locked item does NOT allow drag, resize, rotate, delete, duplicate, front/back actions.
- While the locked item is selected, the Lock control remains visible so it can be unlocked.
- Locked items can therefore remain fixed while the user selects and arranges other pieces.

TOOLS LABEL CHANGES
Row 1 now reads:
- Back
- Front
- Left
- Right
- Copy

Row 2 remains:
- Delete
- Undo
- Clear

- Tool label font size increased for easier reading.
- Icon-over-label Studio-style layout is unchanged.

TEST
1. Add two pieces.
2. Select one piece: lock icon appears.
3. Lock it: it remains selected and lock icon remains visible.
4. Try moving/resizing/rotating locked piece: nothing should happen.
5. Tap another piece and edit it normally.
6. Tap the locked piece again: it should select even though locked.
7. Unlock it and confirm normal editing returns.
8. Confirm lock icon disappears when item is not selected.
9. Confirm Tools labels are larger and simplified.

ROLLBACK
Replace sw.js with v13.19-dev3.
