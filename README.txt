Audrey Closet — v13.20-dev8 Main Update
Decorate Studio Grouping

PURPOSE
Reorganize the Board Decorate area into clearer creative groups without changing
the underlying creative tools yet.

NEW DECORATE STRUCTURE
Decorate is now presented as a mini creative studio with four grouped sections:

1. Text
2. Draw
3. Shapes
4. Stickers

WHAT THIS BUILD DOES
- Adds a new grouped Decorate Studio layout inside the existing Decorate tab.
- Keeps the current working creative controls intact.
- Redistributes the existing creative tool blocks into the new groups.
- Adds a clearer visual structure so the area feels less like a loose stack of controls
  and more like a creative studio tray.
- Adds small roadmap chips in each group to hint at planned improvements.

GROUP THEMES

TEXT
- Existing text-related controls stay functional.
- Roadmap cues:
  - More fonts
  - Adjust text size
  - Tap text to edit

DRAW
- Existing doodle / draw-related controls stay functional.
- Roadmap cues:
  - Pencil / Pen
  - Marker / Highlighter
  - Sharper doodle tools

SHAPES
- Existing shape-related controls stay functional.
- Roadmap cues:
  - Captions & arrows
  - Thought bubbles
  - Fills / patterns

STICKERS
- Existing sticker / emoji-related controls stay functional.
- Roadmap cues:
  - Sticker themes
  - Cute / animal packs
  - Sparkles / stamps

TECHNICAL APPROACH
- Existing creative controls are not rewritten in this build.
- Instead, the current #creativeTools content is reorganized into grouped panels.
- This keeps behavior stable while establishing a cleaner structure for future iterations.
- Empty/future sections now have a designed placeholder instead of just feeling missing.

WHY THIS IS A GOOD DEV8 SCOPE
This gives the Decorate area stronger information architecture and a more fun,
intentional feel without combining too many interaction changes into the same build.
It creates the structure we can now enhance in later dev cycles.

WHAT TO TEST
1. Open Board -> Decorate.
2. Confirm new group tabs: Text / Draw / Shapes / Stickers.
3. Switch between all four groups.
4. Confirm the existing creative controls still appear and work.
5. Add text and confirm current behavior still functions.
6. Use current doodle/draw behavior if available.
7. Try any existing sticker/shape controls.
8. Confirm no Board / Tools / Canvas behavior is affected.

NEXT NATURAL ITERATIONS
- Text: more fonts, text size control, tap-to-edit selected text
- Draw: tool styles such as pencil / marker / highlighter
- Shapes: better callouts and bubble / arrow interactions
- Stickers: theme packs, curated sets, visual browsing

ROLLBACK
Replace sw.js with v13.20-dev7.
