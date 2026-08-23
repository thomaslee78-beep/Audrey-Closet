Audrey Closet — v13.20-dev14 Main Update
Text Studio Layout Refinement

1. FONT
- Font is always visible again.
- Small "Font" label restored.
- Font chooser sits directly beside the label.
- Removed the dev13 Font disclosure button/popover.

2. ALIGNMENT
- Left / Center / Right now use line-style alignment icons rather than L/C/R letters.
- Alignment controls sit on the same typography row as Font.

3. COLOR
- Color moved to the same typography row.
- The visible control is a compact Color button with a live color dot.
- Tapping Color opens the native color chooser area.
- "Default color" now lives inside the Color popover instead of taking permanent space.
- Color changes remain immediate; there is intentionally no Apply button.
- Closing the native color picker keeps the selected color, which is consistent with
  the rest of the Board's immediate-edit behavior.

4. CLEAR / UNDO
- The old dev13 Font button under Add/Update is removed.
- A Clear button now sits beneath Add/Update.
- Clear only clears the editor field; it does NOT delete or modify the Board text until
  Update is pressed.
- After Clear, the button becomes Undo.
- Undo restores the text that was just cleared.
- This works both for a new draft and while editing selected Board text.

5. PERSISTENCE
No schema changes. Font, size, formatting, alignment, and color remain stored per text object.

TEST
1. Confirm Font is permanently visible with label.
2. Confirm alignment icons sit beside Font.
3. Confirm Color is on the same row.
4. Choose a color, close chooser: color should already be applied.
5. Pick Default color from inside Color menu.
6. Enter text -> Clear -> Undo.
7. Select existing Board text -> Clear -> Undo -> Update.
8. Confirm Clear alone does not erase the Board object.
9. Save/reopen and verify typography remains.

Rollback: use v13.20-dev13 sw.js.
