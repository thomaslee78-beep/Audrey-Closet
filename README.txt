Audrey Closet — v13.16-dev3 Main Update

WHAT CHANGES
- Replace only sw.js on the main branch.
- Builds on the existing S-Tier rating and Tier filter work.
- Cache/version becomes audrey-closet-v13.16-dev3.

S-TIER CARD MARKER REFINEMENT
1. Show a marker only for S-tier
   - Closet cards no longer show markers for A / B / C / D.
   - A / B / C / D ratings still remain saved on the item and still work in the Tier filter.

2. Replace the badge with a ribbon
   - S-tier pieces now display a small ribbon across the upper-left area of the card photo.
   - The ribbon text is “S-Tier”.

3. More impactful S-tier color
   - The ribbon uses a muted antique gold / brushed brass treatment.
   - Primary tones are in the #B8944E / #B38A3D / #8B6A2B range.
   - This is meant to feel premium and important without becoming loud.

UNCHANGED
- Piece Details still supports S / A / B / C / D rating.
- Tap the selected tier again to clear it.
- Tier persists on item.tier.
- Tier filter still supports All tiers, S, A, B, C, D, and Not rated.
- No tier analytics or automatic sorting yet.

UPLOAD TO MAIN
1. Open Audrey-Closet on GitHub.
2. Stay on main.
3. Replace root sw.js with this package's sw.js.
4. Commit using your normal process.
5. Let GitHub Pages redeploy.
6. Open the PWA once online; if the old build is still visible, fully close and reopen it.

TEST
1. Confirm only S-tier pieces show a visual marker in Closet.
2. Confirm A / B / C / D pieces no longer show a card marker.
3. Confirm the S-tier ribbon looks visible but not too loud.
4. Test the Tier filter for S and A/B/C/D.
5. Change a piece from S to A and confirm the ribbon disappears.
6. Change a piece from A to S and confirm the ribbon appears.
7. Confirm search, category filters, and reorder behavior still work.

ROLLBACK
Replace sw.js with the prior v13.16-dev2 version. Existing item.tier values remain preserved.
