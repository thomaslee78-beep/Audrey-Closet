Audrey Closet — v13.20-dev13 Main Update
Text Studio Compact Controls

Changes:
- Adds a small instruction message when no text is selected.
- Hides that instruction while editing selected text.
- Moves Font into a compact button beneath Add/Update.
- Font dropdown is hidden until Font is tapped.
- Removes the standalone Font label.
- Adds Left / Center / Right alignment.
- Adds per-text-object color picker.
- Adds Default color reset to Audrey burgundy.
- Alignment/color persist on saved Boards and older text defaults safely to Center + burgundy.
- Portfolio/full preview inherits the stored alignment/color.
- Share/export uses stored font alignment and text color.

Test:
1. Decorate -> Text with no selected text: instruction should show.
2. Select text: editing message should show instead.
3. Font button should open/close the font list.
4. Test L/C/R alignment.
5. Test several colors and Default reset.
6. Save/reopen Board.
7. Check Portfolio preview and Share.

Rollback: use v13.20-dev12 sw.js.
