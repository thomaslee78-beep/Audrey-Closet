Audrey Closet — v13.18-dev3 Main Update

PURPOSE
Structural redesign of the Outfit Board workspace.

MAIN LAYOUT

1. BOARD COMPOSE BAR
- Outfit/board name moved above the canvas.
- Notes moved behind a compact notebook button.
- Save Outfit moved beside the name/notes controls so the most common save action stays near the Board.
- Existing save-to-Portfolio-folder dialog remains unchanged.

2. PORTRAIT BOARD
- Board becomes a responsive Portrait 4:5 canvas.
- It fills the phone width but is capped at 620px wide on larger screens.
- This gives noticeably more vertical composition room while keeping workspace controls nearby.
- Existing move/resize/rotate/doodle behavior still uses the live Board dimensions.

3. BOARD FORMAT FOUNDATION
The code now defines future Board formats:
- Portrait 4:5 (current default)
- Portrait 3:4
- Square
- Landscape 4:3

The selector is NOT exposed to users yet. This is architecture for a future phone/iPad setting.

4. EXISTING PORTFOLIO COMPATIBILITY
- Existing saved looks continue to retain their original boardWidth/boardHeight.
- Portfolio thumbnails already calculate positions proportionally using those saved dimensions.
- When an older saved look is loaded for editing or duplication, dev3 rescales its piece coordinates/sizes to the current portrait editing canvas.
- Existing Portfolio data is not migrated or rewritten simply by installing this update.

5. CONTEXTUAL WORKSPACE DIRECTLY BELOW THE BOARD
A new three-tab workspace sits immediately under the canvas:
- Pick Pieces
- Tools
- Decorate

Only one workspace is visible at a time.
The tab bar is sticky while scrolling within the work area, so switching tasks does not require scrolling between separate sections.

6. PICK PIECES
- Default open workspace.
- Reuses the v13.18 Free-Flow visual picker.
- Existing Closet/Wishlist and category filtering continue to work.
- Search/color/Tier filtering is planned for the next iteration.

7. TOOLS
Moves the existing Board editing controls into one expandable workspace:
- Send Back
- Bring Front
- Undo
- Rotate
- Duplicate
- Delete
Also moves Share and Clear into this workspace.

8. DECORATE
Moves the current text/sticker/shape/doodle controls into the Decorate workspace.
This is a relocation only; a visual redesign of Decorate can happen later.

UNCHANGED
- Existing saved Portfolio looks.
- Board piece data model.
- Save-to-folder dialog.
- Share logic.
- Tap-to-add from picker.
- Board item move/resize/rotate/layer behavior.
- Closet Catalog views.

TEST
1. Open Board.
2. Confirm name + notes icon + Save Outfit appear above the canvas.
3. Confirm canvas is taller/portrait.
4. Add and move several pieces around the taller Board.
5. Confirm Pick Pieces is directly beneath the canvas and open by default.
6. Switch Pick Pieces -> Tools -> Decorate and confirm each occupies the same workspace position.
7. Test Send Back / Front / Rotate / Duplicate / Delete / Undo.
8. Test Decorate text/stickers/doodle.
9. Save a new look and inspect it in Portfolio.
10. Load an older Portfolio look for editing and confirm its composition scales onto the new portrait canvas.
11. Duplicate an older Portfolio look and confirm the composition also scales.
12. Test on iPhone/PWA close + reopen.

ROLLBACK
Replace sw.js with v13.18-dev2.
