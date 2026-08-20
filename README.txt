Audrey Closet — v13.16-dev2 Main Update

WHAT CHANGES
- Replace only sw.js on the main branch.
- Builds on the v13.16-dev1 S-Tier rating control.
- Cache/version becomes audrey-closet-v13.16-dev2.

NEW S-TIER FUNCTIONALITY
1. Closet card tier badge
   - Rated pieces show a small, restrained S/A/B/C/D badge on the photo.
   - Unrated pieces remain visually unchanged.
   - Badge uses the app's existing olive visual language rather than five permanent colors.

2. Tier filter
   - The existing Closet Filter panel now includes:
     All tiers
     S-Tier
     A-Tier
     B-Tier
     C-Tier
     D-Tier
     Not rated
   - Tier works together with category, season, color, search, and archived filters.
   - Clear Filters also clears the tier filter.

3. Immediate refresh
   - Changing a tier on a Piece Details card refreshes the Closet behind it so the badge/filter state is current.

UNCHANGED
- Tap a tier to select it.
- Tap the selected tier again to clear it.
- Tier persists on item.tier.
- Tier survives normal item edits.
- No tier statistics or automatic tier sorting yet.
- Existing manual closet ordering is preserved.

UPLOAD TO MAIN
1. Open Audrey-Closet on GitHub.
2. Stay on main.
3. Replace root sw.js with this package's sw.js.
4. Commit using your normal process.
5. Let GitHub Pages redeploy.
6. Open the PWA once online; if the old build is still visible, fully close and reopen it.

TEST
1. Rate several pieces S/A/B/C/D.
2. Return to Closet and confirm only rated pieces display badges.
3. Open Filter and test S-Tier and Not rated.
4. Combine Tier with Category or Color and confirm both filters apply.
5. Clear filters and confirm the whole Closet returns.
6. Change a tier and confirm its badge updates.
7. Long-press/reorder within a category and confirm manual ordering still works.

ROLLBACK
Replace sw.js with the prior v13.16-dev1 version. Existing item.tier values remain harmless and preserved.
