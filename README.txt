Audrey Closet — v13.20-dev9 Main Update
Decorate Studio Initialization + Explicit Tool Mapping Fix

WHY DEV8 LOOKED UNCHANGED
v13.20-dev8 contained the new Decorate Studio code, but the installer was called before
DECORATE_GROUPS_V13208 and the related functions had finished initializing.

That could stop the Decorate patch before the new UI was built, leaving the original
three-row Decorate menu visible.

DEV9 FIX 1 — INITIALIZATION ORDER
- Removed the premature Decorate Studio install call.
- Decorate Studio now installs only after:
  * group definitions exist
  * panel helpers exist
  * installer function exists

DEV9 FIX 2 — EXPLICIT TOOL MAPPING
The current controls are no longer assigned by heuristic text matching.

TEXT
- Existing .tool-row
- #boardTextInput
- #addBoardTextBtn

DRAW
- Existing #drawModeBtn ("doodle")
- Removed from the old mixed Shape row and placed in Draw

SHAPES
- Existing Circle
- Existing Line
- Existing Tape

STICKERS
- Existing complete .sticker-row

SHARED
- #boardHelp remains visible below the grouped studio rather than being placed into
  one specific creative group.

EXPECTED VISIBLE UI
Board -> Decorate should now visibly show four group buttons:

Text | Draw | Shapes | Stickers

TEXT:
- Add text controls

DRAW:
- Doodle control

SHAPES:
- Circle / Line / Tape

STICKERS:
- Existing sticker/emoji buttons

Each section also retains the future capability cues from dev8.

IMPORTANT
This is still primarily a reorganization build.
It does NOT yet add:
- additional fonts or text sizing
- pencil/marker/highlighter drawing modes
- new arrows/bubbles/caption shapes
- sticker theme packs

Those can now be developed cleanly within the correct section.

TEST
1. Open Board -> Decorate.
2. Confirm Text / Draw / Shapes / Stickers are visibly present.
3. Text -> enter text and Add text.
4. Draw -> confirm Doodle button is here, not Shapes.
5. Shapes -> confirm Circle / Line / Tape.
6. Stickers -> confirm existing sticker buttons.
7. Switch between all groups repeatedly.
8. Confirm Board help text remains visible.
9. Confirm Add Items / Tools / Canvas are unchanged.

ROLLBACK
Replace sw.js with v13.20-dev7.
(dev8 should be treated as a superseded/bad Decorate build.)
