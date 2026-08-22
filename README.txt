Audrey Closet — v13.19-dev3 Main Update

PURPOSE
Fix the remaining legacy Board controls and add per-object Lock / Unlock.

1. LEGACY TOOL ROW REMOVED FROM BOARD LAYOUT
Root cause:
- The new Studio-style Tools buttons still call the original #boardEditbar buttons internally.
- Those original controls were hidden but remained inside the active Board workspace, where base styles could make them visible again.

Fix:
- #boardEditbar is moved into a dedicated hidden backing container outside the Board layout.
- Strong CSS forces that backing container and original controls to remain non-rendering.
- New Studio-style proxy buttons continue to use the original actions behind the scenes.

Expected result:
- No old button row directly beneath the Design Board.
- Only Add Items / Tools / Decorate folder tabs appear beneath the canvas.
- Inside Tools, only the compact 5 + 3 Studio-style buttons appear.

2. PER-OBJECT LOCK / UNLOCK
Every object on the Design Board gets a small control in its upper-left corner:
- unlocked icon = item can be moved/resized/rotated normally
- locked icon = item is frozen in place

When locked:
- drag is blocked
- pinch resize/rotate is blocked
- resize handle is hidden
- quick remove handle is hidden
- tapping the object itself does not accidentally select/move it
- the Lock button remains available so the object can be unlocked

When unlocked:
- the item becomes selectable again immediately

3. LOCK STATE PERSISTS
The existing Board save format already stores all Board-object properties.
The new `locked` property therefore travels with:
- saved outfits
- Portfolio editing
- duplicated looks

No Portfolio migration is required.

TEST
1. Open Board and confirm the old editbar is completely gone below the canvas.
2. Open Tools and confirm only the new compact 5 + 3 controls appear.
3. Add two or more garments.
4. Tap the lock control on one garment.
5. Try dragging/pinching the locked garment — it should not move.
6. Move another unlocked garment around it.
7. Unlock the first garment and confirm normal movement returns.
8. Save the look, reopen from Portfolio, and confirm locked state remains.
9. Confirm Share/Portfolio snapshots do not show the lock UI itself.

ROLLBACK
Replace sw.js with v13.19-dev2.
