Audrey Closet — v13.17-dev4 Main Update

PURPOSE
Small Modern-only visual cleanup on top of v13.17-dev3.

CHANGES

1. ADD PIECE BUTTON
- The Add piece button in the Modern Clothing Catalog banner now uses hard/square edges.
- Classic keeps its existing rounded button styling.

2. ODD-ROW GRID BACKGROUND
- The Modern full-bleed Closet grid background now uses the same warm card tone (#FFFAF0) instead of white.
- When a filtered/category result has an odd number of items, the unused half of the last row no longer appears as a stark white block.
- Existing item cards and separators remain unchanged.

UNCHANGED
- Modern category row behavior.
- Search and Filter behavior.
- Tier ribbons.
- Wear-count remains hidden in Modern.
- Tap/open and drag/reorder behavior.
- Classic view.
- Free-Flow remains disabled.

TEST
1. Switch to Modern.
2. Confirm Add piece has square corners.
3. Filter/select a category with an odd number of items.
4. Confirm the empty space in the last row blends with the warm card background rather than showing white.
5. Switch to Classic and confirm its styling is unchanged.

ROLLBACK
Replace sw.js with v13.17-dev3.
