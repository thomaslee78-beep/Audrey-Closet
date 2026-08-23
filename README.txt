Audrey Closet — v13.20-dev17 Main Update
Text Studio Stability Fix

ISSUE
In dev16 the Font row could be visible while the text entry area and Color control disappeared.

CAUSE
The Text Studio had accumulated several layout wrappers from dev13-dev16.
Some of those functions rebuilt and detached controls during every synchronization.
A later wrapper could therefore remove the textarea or color input after dev16 had created them.

DEV17
- Establishes one canonical Text Studio DOM.
- Stops repeatedly rebuilding the editor on every sync.
- If #boardTextInput is missing, it is recreated.
- If the color input is missing, it is recreated.
- Future syncs update values/styles only.

LAYOUT
Top:
Font | chooser | Left / Center / Right

Below:
3-line text editor | Add/Update
                   | Clear/Undo
                   | Color + ↺ default reset

COLOR
The actual native <input type=color> is now visible in the third row.
Tapping the color swatch directly opens the native color picker on iPhone.
↺ restores Audrey burgundy.

PANEL CLEANUP
- Removes obsolete Text tool cards/placeholders.
- Removes the old shared Board-help panel below the Text editor.
- Removes old hidden Font/Color popover containers.

TEST
1. Board -> Decorate -> Text.
2. Confirm textarea is visible and approximately 3 lines high.
3. Confirm Color swatch + ↺ are visible.
4. Confirm Font + alignment row remains visible.
5. Add text and edit existing text.
6. Test Clear -> Undo.
7. Test color chooser and reset.
8. Switch between Decorate tabs repeatedly and return to Text.
9. Save/reopen Board and verify controls remain present.

Rollback: use v13.20-dev16 sw.js.
