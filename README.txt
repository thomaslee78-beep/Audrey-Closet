Audrey Closet — v13.16-dev7 Main Update

WHAT CHANGES
- Replace only sw.js on the main branch.
- Builds directly on v13.16-dev6.
- Cache/version becomes audrey-closet-v13.16-dev7.

NEW: EXPANDABLE SETTINGS ORGANIZATION
The Settings / Configuration screen is reorganized into expandable sections:

1. General
   - App identity
   - Data export / import
   - Reset
   - Open by default

2. Catalog / Closet
   - Show Tier ribbons
   - Smart photo scan information

3. Board
   - Expandable home for future Outfit Board preferences
   - Currently contains a lightweight placeholder only

4. Portfolio
   - Portfolio folders

5. Journal
   - Journal layout ordering

6. Wishlist
   - Expandable home for future wishlist / shopping preferences
   - Currently contains a lightweight placeholder only

7. About
   - Current app version
   - Short product description
   - Space reserved for credits and future easter eggs

IMPLEMENTATION NOTES
- Existing settings cards are moved into expandable groups rather than recreated.
- Existing controls keep their original IDs and event handlers.
- Tier functionality itself is unchanged from dev6.
- Multiple settings groups can be open at once.
- General starts open; the other groups start collapsed.

UNCHANGED FROM DEV6
- S / A / B / C / D tier rating
- Randomized tier reactions
- Multi-select tier filtering
- Gold S ribbon and progressive green A/B/C/D ribbons
- Show Tier ribbons preference
- Portfolio folder editing
- Journal layout editing
- Export / import and reset behavior

UPLOAD TO MAIN
1. Open Audrey-Closet on GitHub.
2. Stay on main.
3. Replace the root sw.js with this package's sw.js.
4. Commit using your normal process.
5. Let GitHub Pages redeploy.
6. Open the PWA once online; fully close/reopen if the old cached version remains.

TEST
1. Open Settings / Configuration.
2. Confirm seven expandable groups appear.
3. Confirm General is open by default.
4. Expand/collapse each group.
5. Test App name save/reset.
6. Test Show Tier ribbons on/off.
7. Confirm Portfolio folder controls still render and work.
8. Confirm Journal layout controls still render and work.
9. Confirm Export backup still triggers normally.
10. Return to Closet and confirm Tier filters/ribbons/reactions are unchanged.

ROLLBACK
Replace sw.js with v13.16-dev6. Stored app and tier data remain preserved.
