Audrey Closet — v13.20-dev16 Main Update
Text Studio iPhone Layout Fix

WHY FONT DISAPPEARED
dev15 could remove the old font container before safely reattaching the font selector.
Depending on load/order, #boardTextFontV132011 could therefore disappear and the layout
builder would stop early.

DEV16 FIX
- If the font selector is missing, it is rebuilt from the Text Studio font library.
- Font is always placed into one canonical row.

FINAL TOP ROW
Font | [font chooser] | [left] [center] [right]

- Font label is visible.
- Font chooser stays visible.
- Alignment buttons remain on the same row to the RIGHT of the chooser.
- Alignment icons use line symbols.

EDITOR LAYOUT
The text editor is now approximately 3 lines tall.

Beside it is one narrow vertical stack:
1. Add Text / Update
2. Clear / Undo
3. Color + small reset arrow

This gives the text field slightly more room while keeping the action stack inside the
iPhone panel width.

COLOR
- Color is removed from the B/I/U row.
- The third side control is Color.
- Tapping Color opens the native color picker.
- Color applies immediately.
- Small ↺ beside Color resets to Audrey burgundy.

ALIGNMENT RENDERING
Text now renders through a full-width inner text element.
That means Left / Center / Right uses normal text-align across the entire saved text box
instead of relying on anonymous flexbox text sizing.

This fixes alignment consistency for:
- live Board
- resized text boxes
- saved Board
- Portfolio/full preview

TEST
1. Open Board -> Decorate -> Text.
2. Confirm Font label + chooser are visible.
3. Confirm L/C/R icons appear directly to the right.
4. Confirm text editor is around 3 lines high.
5. Confirm Add/Update, Clear/Undo, Color stack vertically beside it and remain inside panel.
6. Test all three text alignments.
7. Test Color and ↺ default reset.
8. Test B/I/U and sizes remain working.
9. Save/reopen and inspect Portfolio preview.

Rollback: use v13.20-dev15 sw.js.
