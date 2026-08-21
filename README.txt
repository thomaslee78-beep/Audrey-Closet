Audrey Closet — v13.18-dev2 Main Update

PURPOSE
Fix the Board picker Free-Flow treatment from v13.18-dev1.

ROOT CAUSE
The deployed Board tab is:
  <section class="screen" data-screen="outfits">

v13.18-dev1 incorrectly scoped the new picker CSS under:
  .screen[data-screen="board"]

As a result, the CSS existed in the code but never matched the actual Board screen.

FIX
- Updated all 21 Board Free-Flow selectors from data-screen="board" to data-screen="outfits".
- This now targets the live "Pick your pieces" section (#pieceTray).

EXPECTED RESULT
In Board > Pick your pieces:
- no visible rounded mini-card outline/background around each garment
- no item-name text beneath the garment
- no secondary description/meta text
- larger garment images
- subtle free-flow offsets/scale/rotation
- tapping a garment still adds it to the design board
- Closet/Wishlist and category filtering still work

TEST
1. Open Board.
2. Scroll to Pick your pieces.
3. Confirm only garment images are visually prominent.
4. Confirm text beneath each garment is gone.
5. Confirm the rounded card/outline around each picker item is gone.
6. Tap several garments and confirm they still add to the Board.
7. Test Closet/Wishlist and category filters.

ROLLBACK
Replace sw.js with v13.18-dev1 or v13.17-dev12.
