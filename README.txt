Audrey Closet — v13.18-dev4 Main Update

PURPOSE
Board usability polish after testing v13.18-dev3.

1. PREVENT IPHONE INPUT ZOOM
Safari auto-zooms focused form controls when their text size is too small.
Board text-entry controls are now explicitly 16px on phone:
- Board name
- Board notes
- Decorate text input

This should prevent the app view from zooming in when tapping these controls.

2. NOTES PANEL
- Notes textarea stretches across the full available width.
- Notes remains under the notebook button.
- The layout should stay at the current page scale instead of forcing the user to zoom back out.

3. SHARE MOVED BESIDE NEW
- Share is removed from Tools.
- Share now sits in the upper-right Board header beside New.
- Makes Share available immediately after creating a look.

4. CLEAR INTEGRATED INTO TOOLS
- Clear is moved into the same Board edit-control row as:
  Send Back / Bring Front / Undo / Rotate / Duplicate / Delete.
- It now reads visually as one of the Tools options rather than a separate action below them.

5. COMPACT PICK PIECES HEADER
- Closet / Wishlist source tabs are moved beside the "Pick your pieces" heading.
- Saves vertical space and keeps source switching physically closer to the picker.
- Category filters and garment grid remain below.

UNCHANGED
- Portrait Board canvas.
- Name / Notes / Save placement.
- Pick Pieces / Tools / Decorate workspace.
- Free-Flow picker visuals.
- Existing Portfolio compatibility logic.
- Save/share behavior.

TEST
1. Tap Notes on iPhone/PWA. Confirm the page does NOT zoom in.
2. Confirm Notes spans the full panel width.
3. Open Decorate and tap the text field. Confirm the page does NOT zoom.
4. Confirm Share is beside New at the top-right.
5. Open Tools and confirm Clear is integrated into the control row.
6. Confirm Closet/Wishlist sit beside Pick your pieces.
7. Add garments, decorate, save, share, and confirm the app stays at normal scale throughout.

ROLLBACK
Replace sw.js with v13.18-dev3.
