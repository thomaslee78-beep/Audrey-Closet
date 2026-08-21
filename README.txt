Audrey Closet — v13.17-dev5 Main Update

PURPOSE
Small Modern-only refinement after testing v13.17-dev4.

CHANGES

1. MODERN DRAG / REORDER OUTLINE
- The dotted drop-target outline now has hard 0px corners in Modern.
- The drag ghost is also squared off so the reorder interaction matches the Modern design language.
- Classic reorder styling is unchanged.

2. ODD-ROW EMPTY CARD
- Instead of simply coloring the entire grid background, Modern now creates a visual empty card cell when the final row contains one item.
- The empty cell uses the same photo-tile background as a Modern closet card:
  linear-gradient(140deg,#E7DFCD,#F8F3E8)
- It also uses the same thin light separator/border.
- This should make the unused half of the row look like an intentional empty card slot rather than page background.

UNCHANGED
- Add piece hard-edge styling.
- Modern category/search/filter hard-edge controls.
- Wear count remains hidden in Modern.
- Tier ribbons remain.
- Tap/open and reorder behavior.
- Classic view.
- Free-Flow remains disabled.

TEST
1. Switch to Modern.
2. Long-press an item and drag over another card.
3. Confirm the dotted target outline has square corners.
4. Select/filter to a category with an odd number of items.
5. Confirm the unused last-row cell looks like an empty Modern photo card.
6. Switch to Classic and confirm its rounded reorder visuals remain unchanged.

ROLLBACK
Replace sw.js with v13.17-dev4.
