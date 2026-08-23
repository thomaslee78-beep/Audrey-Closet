Audrey Closet — v13.20-dev15 Main Update
Text Studio Control Cleanup

1. ENTRY AREA
- Text entry forced to a compact two-line height.
- Add Text / Update sits ABOVE Clear.
- Clear remains an editor-only action.
- After Clear, button becomes Undo and restores the just-cleared draft.

2. FONT + ALIGNMENT
- Small Font label is always visible.
- Font chooser sits next to the label.
- Left / Center / Right controls sit immediately to the right of Font.
- Alignment buttons use line icons, not letters.
- Alignment handling is now authoritative and updates the selected Board text immediately.

3. COLOR
- Color moved onto the SAME row as Bold / Italic / Underline.
- Uses the compact native color button.
- Color applies immediately.
- A small reset ↺ button beside the color control restores the Audrey default burgundy.
- No separate Apply Color button is needed.

4. EXTRA PANEL REMOVAL
- Old dev13/dev14 Font and Color popovers/panels are removed/hidden.
- The Text section should no longer show an extra panel underneath the font area.

5. RENDERING
- Live Board alignment/color are forced after redraw.
- Existing font/size/B/I/U behavior remains intact.

TEST
- Text area should be about 2 lines high.
- Add/Update above Clear.
- Font label + chooser + alignment on one row.
- Alignment immediately changes Board text.
- B/I/U row includes color picker + reset.
- No leftover extra panel.
- Reset color returns to #7d3547.
- Clear -> Undo works without modifying Board text until Update.

Rollback: use v13.20-dev14 sw.js.
