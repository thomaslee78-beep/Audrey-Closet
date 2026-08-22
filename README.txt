Audrey Closet — v13.20-dev6 Main Update
Unified Board Undo + Safe Per-Item Delete

ISSUE 1 — MOVE/RESIZE UNDO STILL SHOWED "ITEM RESTORED"

Observed workflow:
Portfolio -> saved look -> Edit on Board -> Replace current board -> move an item -> Undo

Observed result:
Toast said "Item Restored" and the moved item did not return to its previous position.

Root cause:
Audrey Closet still had two competing Undo systems.

Legacy system:
- undoBoardDelete()
- knows only how to restore a deleted item
- emits "Item Restored"

New v13.20-dev5 system:
- stores complete Board-state snapshots
- supports move / resize / rotate / layer / copy / delete

v13.20-dev5 initially assigned a new onclick handler to #undoBoardBtn, but the normal
app initialization later ran bindBoard() and assigned the legacy undoBoardDelete handler
again. The legacy handler therefore won depending on initialization timing.

FIX:
- v13.20-dev6 adds a capture-phase Undo authority.
- Clicks on either:
    * the visible Studio-style Undo proxy
    * the hidden original #undoBoardBtn
  are intercepted before any legacy onclick can run.
- Every Undo now flows through undoBoardActionV13205().
- The old "Item Restored" handler can no longer take over the visible Undo button.
- Undoing a movement keeps the edited item selected when possible.

ISSUE 2 — ITEM X COULD REMOVE THE WHOLE BOARD

The original Board X removes an item during pointerdown, while later pointer/click events
can occur after drawBoard() has already rebuilt the Board DOM. With the growing set of
capture/proxy handlers this created an unsafe event path and could expose another control
beneath the removed node.

FIX:
- The X is now intercepted before the legacy remove handler.
- The clicked Board piece UID is resolved explicitly.
- Exactly one array element is removed with splice(idx, 1).
- A complete pre-delete Board snapshot is pushed to the unified Undo stack.
- Pointer propagation is stopped before the old handler sees it.
- The following synthesized click is swallowed so it cannot hit an underlying Board control.

EXPECTED UNDO MODEL

Move item -> Undo -> previous position
Resize -> Undo -> previous size
Pinch / rotate -> Undo -> previous geometry
Left / Right -> Undo -> previous rotation
Back / Front -> Undo -> previous layer
Copy -> Undo -> removes copy state
X / Delete -> Undo -> restores previous complete Board

TEST 1 — LOADED BOARD MOVEMENT
1. Portfolio.
2. Choose saved Board.
3. Edit on Board.
4. Replace current board.
5. Select shirt.
6. Move shirt to a visibly different location.
7. Open Tools.
8. Undo.
Expected:
- shirt returns to previous location
- toast should say "Undid move / resize"
- NOT "Item Restored"

TEST 2 — ITEM X
1. Use a Board with at least 3 pieces.
2. Select one garment.
3. Tap its X.
Expected:
- only that garment disappears
- all other Board items remain
4. Tap Undo.
Expected:
- complete prior Board is restored

TEST 3 — MULTIPLE HISTORY
Move -> resize -> rotate -> X
Then Undo four times.
Each action should unwind one at a time in reverse order.

No saved outfit data migration is required.

ROLLBACK
Replace sw.js with v13.20-dev5.
