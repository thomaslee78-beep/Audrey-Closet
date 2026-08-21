Audrey Closet — v13.18-dev7 Main Update

PURPOSE
Fix Clear/New confirmation reliability and add one-click reset for Board picker filters.

1. ROBUST CLEAR CONFIRMATION
Previous builds replaced the button onclick handler, but the base Board code can re-bind that handler later.

dev7 now uses a capture-phase document guard:
- intercepts the click BEFORE button onclick handlers run
- blocks the old handler
- displays the confirmation
- only calls clearBoard() after explicit confirmation

Message:
Clear this board?

This will remove all items and decorations from the current board.
This action cannot be undone.

Cancel keeps the Board unchanged.

2. ROBUST NEW CONFIRMATION
The same capture-phase protection is used for New:
- if current Board has draft content, user must confirm
- Cancel keeps current Board
- empty Board opens New immediately

3. RESET PICKER FILTERS
Adds a compact Reset button beside Search / Color / Tier.

Reset returns Pick Pieces to its normal starting state:
- Search cleared
- Color = All
- Tier = All
- Source = Closet
- Category = Recent
- Color/Tier panels closed

This gives users a simple way to recover after combining several filters.

TEST
1. Add at least one item to Board.
2. Tools > Clear.
3. Confirm dialog MUST appear before anything disappears.
4. Tap Cancel: Board remains exactly unchanged.
5. Tap Clear again and confirm: Board empties.
6. Add items and tap New.
7. Cancel: current Board remains.
8. Confirm: new empty Board starts.
9. In Pick Pieces, apply Search + Color + Tier + Category.
10. Tap Reset.
11. Confirm Search clears, Closet is active, Recent is selected and all pieces return.

ROLLBACK
Replace sw.js with v13.18-dev6.
