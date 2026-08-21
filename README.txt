Audrey Closet — v13.18-dev5 Main Update

PURPOSE
Next Board iteration: improve Pick Pieces usability and protect the destructive Clear action.

WHAT WAS PLANNED AFTER DEV4
- Improve Pick Pieces discovery/filtering.
- Add clearer feedback when a garment is added.
- Then continue with Tools polish, Decorate redesign, and final Board/iPad polish.

DEV5 CHANGES

1. CLEAR CONFIRMATION
Tools > Clear now asks:
"Clear this board?

This will remove all items and decorations from the current board.
This action cannot be undone."

User can Cancel or continue.
Cancel leaves the Board untouched.
If Board is already empty, no confirmation is needed.

2. PICK PIECES SEARCH
Adds a Search Pieces field.
Search checks common item information including:
- item/type/name
- category
- brand
- color
- pattern
- notes

3. COLOR FILTER
Adds a compact Color filter beside Search.
Uses the app's existing color taxonomy.
Can be combined with category, search and Tier.

4. TIER FILTER
Adds Tier filtering:
- S
- A
- B
- C
- D
- Unrated
Can be combined with existing Board category filtering, Color and Search.

5. ADD-TO-BOARD FEEDBACK
When a garment is tapped:
- picker garment briefly highlights/pulses
- newly added Board piece briefly animates
- short "Added to board" message appears

This keeps feedback visible without adding a persistent selected state that could imply the garment can only be used once.

UNCHANGED
- Portrait Board geometry
- Board name/notes/save header
- Share beside New
- Pick Pieces / Tools / Decorate workspace
- Free-Flow garment picker appearance
- Existing Portfolio compatibility
- Closet/Wishlist picker source
- Existing category filters

NEXT PLANNED ITERATIONS
- Tools polish: selection states, disabled/enabled clarity, potentially icon/layout cleanup.
- Decorate redesign: simplify text/sticker/shape/doodle workflow.
- Final Board polish: spacing, animations, sticky behavior, iPhone/iPad responsiveness and optional Board format selector.

TEST
1. Open Board > Pick Pieces.
2. Search by a brand/type/color term.
3. Filter by Color.
4. Filter by Tier, including Unrated.
5. Combine category + search + color + tier.
6. Switch Closet/Wishlist and confirm filters still behave.
7. Tap a piece and confirm visual/message feedback.
8. Open Tools > Clear.
9. Tap Cancel and verify nothing is removed.
10. Tap Clear again and confirm; verify all Board objects are removed and Undo cannot restore them.
11. Verify app scale remains stable when using Search.

ROLLBACK
Replace sw.js with v13.18-dev4.
