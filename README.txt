Audrey Closet — v13.20-dev3 Main Update
Faithful Style Portfolio Board Thumbnails

ISSUE
Some Style Portfolio cards showed only part of the saved outfit — for example a shirt
could appear while the pants were missing — even though opening the full Board showed
all pieces correctly.

ROOT CAUSE
The small Portfolio card was not a true scaled copy of the Board.

The old thumbnail renderer:
- converted every piece independently into percentages
- clamped its X/Y position
- clamped its width/height
- placed everything into a fixed 130px-high thumbnail

The redesigned Design Board is a taller portrait canvas, so those independent clamps
could crop or distort lower/larger pieces in the Portfolio card.

FIX
Portfolio cards now use the same proportional snapshot approach as the full Portfolio
Board preview.

For each saved look:
1. Read the original saved boardWidth / boardHeight.
2. Give the Portfolio thumbnail the same aspect ratio.
3. Apply the saved Canvas background.
4. Calculate one uniform scale for the entire Board.
5. Render every saved Board object using that same scale.
6. Preserve original X/Y positions, size, rotation and z-order.

EXPECTED RESULT
The Portfolio card should now be a miniature of the complete Design Board:
- tops
- bottoms
- shoes/accessories
- duplicate pieces
- text/stickers/doodles
- layering
- rotations
- Canvas background

No garment should disappear merely because it was positioned lower on the Board.

BACKWARD COMPATIBILITY
Older saved Boards use their saved dimensions.
Looks without saved dimensions fall back to the original legacy dimensions.
No saved outfit data is migrated or changed.

TEST
1. Find a saved look where the Portfolio card previously showed a shirt but not pants.
2. Confirm both now appear in the small Portfolio card.
3. Open the look and compare the small card to the full preview.
4. Test a look with pieces near all four Board edges.
5. Test overlapping/layered pieces.
6. Test rotated pieces.
7. Test a Canvas background.
8. Confirm tapping the Portfolio card still opens the look normally.

ROLLBACK
Replace sw.js with v13.20-dev2.
