Audrey Closet — v13.20-dev2 Main Update
Canvas Rendering Persistence Fix

ROOT CAUSE
v13.20-dev1 correctly applied the Canvas choice to the live Design Board and stored
the selection on the saved outfit. However, Audrey Closet has several independent
rendering paths for saved looks:

1. Design Board
2. Portfolio thumbnail
3. Portfolio full preview
4. Share/export image

Only #1 had been updated to consume Canvas styling. #2–#4 were still rebuilding
the outfit against the old default board surface.

FIXES

PORTFOLIO CARDS
- Saved-look thumbnails now read outfit.canvasBackground.
- Colors, paper, fabric, patterns and fun Canvas presets appear behind the pieces.

FULL PORTFOLIO PREVIEW
- #viewOutfitBoard now receives the saved Canvas styling before/while its pieces render.
- Preview should visually match the Design Board.

SHARE / EXPORT
- Share image generation no longer hard-codes the old cream/grid board.
- The JPEG renderer now paints the selected Canvas background before drawing garments.
- Current CSS-generated Canvas presets have matching Canvas-2D drawing equivalents.

SAVE-BEFORE-SWITCH
- The special workflow that saves a current Board before switching to another look now
  also persists canvasBackground.
- Normal Save/Update behavior from dev1 is retained.

EXPECTED CONSISTENCY
One saved look should now show the same Canvas in:
Design Board -> Portfolio card -> Portfolio preview -> Share preview/export.

BACKWARD COMPATIBILITY
- Looks saved before Canvas existed still use Original.
- Existing saved looks with canvasBackground from dev1 should begin rendering correctly
  without needing to be recreated.

TEST
1. Create look with Plaid Canvas and save.
2. Verify Plaid in Portfolio tile.
3. Open look and verify Plaid in full preview.
4. Share it and verify Plaid in image preview.
5. Repeat with solid color, Graph Paper, Denim, Tic-Tac-Toe and Custom Color.
6. Reopen/edit saved look and verify Canvas remains selected.
7. Test Save Current Board during a board-switch conflict.
8. Confirm legacy looks still render with Original canvas.

ROLLBACK
Replace sw.js with v13.20-dev1.
