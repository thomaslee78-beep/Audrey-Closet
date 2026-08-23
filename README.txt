Audrey Closet — v13.20-dev10 Main Update
Decorate Sticker Panel Width Fix

ISSUE
In Board -> Decorate -> Stickers, the sticker content could force the new Decorate
Studio panel wider than its intended card and visually stretch toward the horizontal
screen edge.

ROOT CAUSE
The original sticker row was designed as a horizontal scrolling flex strip.

After dev9 moved it inside the new grouped Decorate Studio, it became nested inside
multiple CSS Grid containers. Grid items default to an intrinsic minimum width unless
explicitly allowed to shrink. The sticker strip's total content width could therefore
expand its parent containers instead of remaining contained.

FIX
The Decorate layout now explicitly constrains:
- board-decorate-shell
- decorate-studio-panels
- decorate-studio-panel
- decorate-studio-content
- decorate-tool-card

Each uses min-width:0 and max-width:100% so nested content cannot force the panel wider.

The sticker row itself now:
- stays width:100% of its tool card
- has max-width:100%
- scrolls horizontally inside the card
- does not wrap
- keeps each sticker button at its natural size
- hides the scrollbar for a cleaner mobile presentation
- retains iOS momentum scrolling

NO FUNCTIONALITY CHANGE
- Sticker buttons are unchanged.
- Sticker insertion behavior is unchanged.
- Text / Draw / Shapes are unchanged.
- Board / Tools / Canvas are unchanged.

TEST
1. Open Board -> Decorate -> Stickers.
2. Confirm the outer Decorate card stays inside the same left/right margins as Text,
   Draw and Shapes.
3. Swipe horizontally across the sticker buttons.
4. Confirm only the sticker strip scrolls.
5. Confirm the page itself does not gain horizontal scrolling.
6. Rotate / resize viewport if testing on iPhone or iPad.

ROLLBACK
Replace sw.js with v13.20-dev9.
