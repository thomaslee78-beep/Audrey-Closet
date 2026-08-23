Audrey Closet — v13.20-dev18 Main Update
Text Studio New-Board Repair

ROOT CAUSE FOUND
v13.20-dev17 had a DOM cleanup bug.

The cleanup code did:
1. Check whether an old layout container CONTAINED a Text control.
2. Then call container.removeChild(control).

That only works when the control is a DIRECT child.

The Add/Update button is nested inside the right-side button stack. Therefore on a
new Board sync:
- the textarea could be detached first,
- cleanup reached Add/Update,
- removeChild(Add/Update) threw NotFoundError because Add/Update was not a direct child,
- JavaScript stopped before the textarea was reinserted,
- Color was never rebuilt.

That exactly produces:
New Board -> Decorate -> Text -> no text entry field.

DEV18 ROOT FIX
- Replaces unsafe container.removeChild(control) with control.remove().
- control.remove() always removes from the control's actual parent and cannot fail
  because of nesting depth.

SECOND FIX
The canonical dev17 Font row inherited the v132016 CSS class and was also matching the
"remove old v132016 rows" selector on every sync.
dev18 excludes the canonical v132017 row from that cleanup selector.

TEXT PANEL CLEANUP
- Text intro/roadmap panel remains hidden.
- Empty placeholder note remains hidden/removed.
- Legacy Board-help panel below Text is removed.

SELF-HEALING GUARD
Whenever the user:
- opens the Decorate workspace,
- taps the Text sub-tab,
- or starts a New Board,

dev18 validates the canonical Text Studio twice (immediately and after 80 ms).
This is a guard against future Board redraw timing changes; the root removeChild bug is
still fixed directly.

EXPECTED TEXT LAYOUT
Font | font chooser | Left / Center / Right

3-line text entry | Add/Update
                  | Clear/Undo
                  | Color + reset

TEST THIS FIRST
1. Start a NEW Board.
2. Tap Decorate.
3. Tap Text.
4. Confirm the 3-line text entry field is visible.
5. Type text and tap Add Text.
6. Confirm text appears on the Board.
7. Confirm Color is visible and opens the picker.
8. Switch Decorate -> Stickers -> Text and confirm the editor remains.
9. Start another New Board and repeat.

Rollback: use v13.20-dev17 sw.js.
