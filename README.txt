Audrey Closet — v13.20-dev5 Main Update
Share Return Navigation Repair + Full Board Undo

1. BOTTOM NAVIGATION / SHARE RETURN

Issue:
After using Share and returning to the installed PWA, the bottom navigation could become
detached from the bottom of the viewport and appear to float in the middle of the screen.

Root cause:
Portfolio preview uses a body-level fixed-position scroll lock. iOS Safari / installed PWAs
can preserve or mis-compose that fixed layer across native Share-sheet and visibility changes.
Because the bottom navigation is also fixed, it can then render relative to the stale frozen
body instead of the current viewport.

Fix:
- Detect and clear stale portfolio body-lock state when no Portfolio modal is actually open.
- Rebuild the bottom navigation's fixed compositing layer after:
  * returning from the native Share sheet
  * closing Share preview
  * opening the fallback share image
  * pageshow
  * app visibility returning to visible
  * visual viewport resize
- Preserve the existing responsive bottom-nav behavior and scroll position.

2. BOARD UNDO UPGRADED

Issue:
Undo appeared inconsistent after loading an existing Portfolio look. Moving or resizing an
item did not enable Undo.

Root cause:
The original Board Undo implementation was delete-only. boardUndoStack received entries when
an object was removed, but drag, resize, pinch, rotate and layering actions did not create
history.

Fix:
Undo is now Board-state based for editing actions.

Undo now supports:
- drag / move
- resize handle
- pinch resize
- pinch rotation / movement
- Rotate Left / Right
- Back / Front layer changes
- Copy
- Delete (existing delete history remains compatible)

How it works:
- A Board snapshot is captured before a gesture/action.
- If the Board actually changes, the prior state is placed in Undo history.
- Up to 20 recent Board actions are retained.
- Undo restores the full previous Board state including position, size, rotation, z-order,
  lock state and selection.

Loaded Portfolio looks:
- Loading a saved look intentionally starts with a clean Undo history.
- The first edit made after loading (move/resize/etc.) should immediately enable Undo.
- Undo then returns the look to the state it had immediately before that edit.

TEST

Bottom Nav:
1. Share from the active Board.
2. Use each Share mode and return to Audrey Closet.
3. Confirm bottom navigation remains attached to the viewport bottom.
4. Repeat sharing from a Portfolio preview.
5. Close the Share preview and Portfolio preview in different orders.

Undo:
1. Load an existing look from Portfolio.
2. Move a garment -> Undo should enable.
3. Undo -> garment returns to previous position.
4. Resize a garment -> Undo -> previous size returns.
5. Pinch resize/rotate -> Undo.
6. Rotate Left / Right -> Undo.
7. Front / Back -> Undo.
8. Copy -> Undo removes the copied-state change.
9. Delete -> Undo restores the item.
10. Perform several edits and Undo them one by one.

ROLLBACK
Replace sw.js with v13.20-dev4.
