Audrey Closet — v13.16-dev5 Main Update

WHAT CHANGES
- Replace only sw.js on the main branch.
- Builds directly on v13.16-dev4.
- Cache/version becomes audrey-closet-v13.16-dev5.

1) MULTI-SELECT TIER FILTER
- The single Tier dropdown is replaced by selectable chips:
  S  A  B  C  D  Not rated
- Any combination can be selected.
- Examples:
  S + A shows S-tier OR A-tier pieces.
  B + C + D shows any piece in those three tiers.
  S + Not rated shows S-tier and unrated pieces.
- Tier selections still combine with Category, Season, Color, Search and Include archived.
- Clear Filters clears all selected tier chips.
- No tier chips selected means All tiers.

2) RANDOMIZED TIER REACTIONS
- The helper text beside the selected tier now shows a short personality message instead of “Tap again to clear”.
- Each tier has 15 preset reactions.
- A reaction is selected randomly when the tier is selected.
- The same message stays stable during normal UI re-rendering.
- The session avoids immediately repeating the same reaction for a tier when alternatives are available.
- Reactions are UI-only and are not stored in closet data.

UNCHANGED
- Existing S/A/B/C/D tier data and selection behavior.
- Tap selected tier again to clear it.
- Gold S ribbon and progressively lighter green A/B/C/D ribbons.
- Manual Closet ordering.
- Settings toggle and Settings reorganization remain planned for later iterations.

UPLOAD TO MAIN
1. Open Audrey-Closet on GitHub.
2. Stay on main.
3. Replace root sw.js with this package's sw.js.
4. Commit using your normal process.
5. Let GitHub Pages redeploy.
6. Open the PWA once online; fully close/reopen if the old cached version remains.

TEST
1. Select S + A and confirm both tiers appear.
2. Add/remove individual tier chips and confirm the grid updates.
3. Test combinations with Not rated.
4. Combine Tier selection with Category/Color/Search.
5. Use Clear Filters and confirm every tier chip clears.
6. Open a piece and change between S/A/B/C/D; confirm each selection gets a fitting reaction.
7. Confirm the reaction does not flicker/change during normal re-rendering.
8. Tap the selected tier again and confirm it clears normally.
9. Confirm ribbons and long-press Closet ordering still work.

ROLLBACK
Replace sw.js with v13.16-dev4. Stored item.tier values remain preserved.
