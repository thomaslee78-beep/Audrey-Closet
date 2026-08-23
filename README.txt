Audrey Closet — v13.20-dev19 Main Update
Text Studio Clean Rebuild

This version stops repairing the accumulated dev13-dev18 Text DOM and rebuilds the
Text panel from scratch in the exact requested four-row structure.

ROW 1
Help message:
- New text: type a title/caption/note, choose a style, tap Add Text.
- Selected text: explains that changes apply to the selected Board text.

ROW 2
Two columns:
LEFT:
- visible 3-line textarea (#boardTextInput)

RIGHT:
1. Add Text / Update
2. Clear / Undo
3. Color

Clear only clears the textarea.
Undo restores the just-cleared text.
Color opens the native color picker and applies immediately.

ROW 3
Font | font chooser | Left / Center / Right

ROW 4
B | I | U | S | M | L | XL

The previous style/size design is retained.

IMPORTANT
- Exactly one Text tool card is created.
- Old placeholder/helper panels are removed.
- The Text textarea and Color input are newly created by dev19, so they no longer
  depend on older detached DOM controls.
- Direct event handlers are attached to the new controls.

TEST FIRST
New Board -> Decorate -> Text.
The 3-line textarea must be visible before doing anything else.

Then test:
- Add Text
- Clear -> Undo
- Color
- Font
- Left/Center/Right
- Bold/Italic/Underline
- S/M/L/XL
- select existing text and Update
- switch Decorate tabs and return to Text

Rollback: use v13.20-dev18 sw.js.
