Audrey Closet — v13.19-dev5 Main Update

PURPOSE
Move Lock / Unlock from the Board object corner into the Tools panel.

CHANGES

1. LOCK / UNLOCK MOVED INTO TOOLS
Second Tools row is now:
- Delete
- Undo
- Lock / Unlock
- Clear

The button dynamically changes:
- selected unlocked item -> Lock
- selected locked item -> Unlock
- no selected item -> disabled

2. CORNER CONTROL REMOVED
- No clickable Lock / Unlock button appears on the Board object itself.
- This avoids the problem of trying to reach a tiny lock control on an item that is partially covered.

3. PASSIVE LOCK INDICATOR
- If the selected item is locked, a small lock indicator appears on the item.
- Unlocked items show no lock indicator.
- Unselected locked items also show no indicator, keeping the Board visually clean.

4. LOCKED ITEM BEHAVIOR
A locked item can still be selected.
While locked:
- drag disabled
- resize disabled
- rotate disabled
- Back / Front disabled
- Copy disabled
- Delete disabled
- Lock button changes to Unlock

After Unlock:
- normal editing actions immediately return.

5. TOOL LAYOUT
Row 1 remains:
Back / Front / Left / Right / Copy

Row 2 becomes:
Delete / Undo / Lock-or-Unlock / Clear

TEST
1. Add two overlapping items.
2. Select one item and open Tools.
3. Tap Lock.
4. Confirm passive lock indicator appears on selected item.
5. Confirm Back/Front/Left/Right/Copy/Delete disable.
6. Tap another item and edit it normally.
7. Reselect the locked item; it should still be selectable.
8. Tools should show Unlock.
9. Tap Unlock and confirm normal editing returns.
10. Confirm no clickable lock control appears directly on the object.

ROLLBACK
Replace sw.js with v13.19-dev4.
