Audrey Closet — v13.20-dev4 Main Update
Canvas Default + Share Export Bug Fix

1. SHARE / EXPORT RESTORED

Issue:
All three Share export modes failed with "Could not create the outfit image."

Root cause:
The original app's share renderer was patched to call the new Canvas drawing helper,
but the Canvas helper lives inside the injected patch scope. The original share function
could not see that helper at runtime.

Fix:
- Canvas export painter is now exposed through a controlled global bridge.
- Unsaved Board shares use the current live Canvas.
- Saved Portfolio shares use that outfit's saved Canvas.
- Legacy saved outfits with no Canvas use Default.
- All three existing export modes continue using the same Share workflow.

2. PORTFOLIO CANVAS BLEED FIXED

Issue:
Choosing a Canvas on the current Design Board could make older Portfolio looks appear
to use that same Canvas even though no Canvas had been selected for those looks.

Root cause:
When outfit.canvasBackground was undefined, the helper's JavaScript default parameter
fell back to the currently active Design Board Canvas.

Fix:
- Missing / undefined saved Canvas now explicitly resolves to Default.
- A live Board Canvas can no longer leak into unrelated Portfolio cards or previews.

3. DEFAULT VS ORIGINAL

Canvas now has two separate concepts:

DEFAULT
- Restores the original pre-Canvas Design Board surface.
- Warm cream board.
- Fine grid.
- Subtle design accents/arrows.
- New outfits start on Default.
- Clear Board returns to Default.
- Older saved looks with no Canvas information render as Default.

ORIGINAL
- Clean white-paper Canvas.
- No grid or design pattern.
- Useful when the user wants a plain neutral sheet.

The existing empty-board instructional text still appears naturally on a new/empty
Default Board because it is part of the original Design Board UI rather than the Canvas asset.

4. BACKWARD COMPATIBILITY

- Existing looks explicitly saved with a Canvas continue to use it.
- Existing looks saved before Canvas was introduced use Default.
- Existing looks explicitly saved as the former "Original" preset remain Original
  and now appear as clean white paper.
- No closet, Portfolio, or Board item data migration is required.

TEST

A. Share
1. Create a Board with Default Canvas and export each of the 3 modes.
2. Repeat with Plaid or Denim.
3. Repeat with Custom Color.
4. Share a saved Portfolio look.

B. Portfolio isolation
1. Pick Plaid on the current Design Board.
2. Open Portfolio.
3. Confirm older looks without Canvas do NOT become Plaid.
4. Confirm looks explicitly saved with Plaid still show Plaid.

C. Default / Original
1. Start New Board -> should show Default original-board design.
2. Confirm empty-board instructional text is present.
3. Select Original -> should become clean white paper.
4. Select Default -> should restore cream/grid/design accents.
5. Clear Board -> should return to Default.

ROLLBACK
Replace sw.js with v13.20-dev3.
