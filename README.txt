Audrey Closet — v13.16-dev4 Main Update

WHAT CHANGES
- Replace only sw.js on the main branch.
- Builds directly on deployed v13.16-dev3.
- Cache/version becomes audrey-closet-v13.16-dev4.

TIER RIBBON HIERARCHY
- S-Tier keeps the existing antique-gold ribbon.
- A / B / C / D now also receive upper-left ribbons.
- A through D use a muted sage-green progression that becomes lighter as the tier decreases:
  A — deep muted sage
  B — medium sage
  C — soft sage
  D — pale sage
- This keeps all rated pieces identifiable while preserving S as the visually premium tier.
- Unrated pieces still have no ribbon.

CLOSET FILTER LAYOUT
- The Tier filter is moved above / before the “Include archived” checkbox.
- Tier filtering behavior itself is unchanged.
- Clear Filters continues to clear the Tier filter.

UNCHANGED
- S / A / B / C / D selection on Piece Details.
- Tap the current tier again to clear it.
- Tier persists on item.tier.
- Tier filter still supports All tiers, S, A, B, C, D and Not rated.
- Manual Closet ordering remains unchanged.
- No tier analytics or automatic tier sorting yet.

UPLOAD TO MAIN
1. Open Audrey-Closet on GitHub.
2. Stay on main.
3. Replace the root sw.js with this package's sw.js.
4. Commit using your normal process.
5. Let GitHub Pages redeploy.
6. Open the PWA once online; fully close/reopen if the prior cached version remains.

TEST
1. Rate one piece at each S / A / B / C / D tier.
2. Confirm S remains gold.
3. Confirm A / B / C / D use green ribbons and progressively lighten.
4. Confirm unrated pieces have no ribbon.
5. Open Filter and confirm Tier appears before Include archived.
6. Test tier filtering and Clear Filters.
7. Change a piece between tiers and confirm its ribbon updates.
8. Confirm search, category filters and long-press reorder still work.

ROLLBACK
Replace sw.js with the prior v13.16-dev3 version. Stored item.tier values remain preserved.
