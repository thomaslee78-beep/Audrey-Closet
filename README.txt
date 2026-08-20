Audrey Closet — v13.16-dev6 Main Update

NEW
- Adds a Catalog / Closet settings card with a Show Tier ribbons toggle.
- Default is ON.
- Turning it OFF hides S/A/B/C/D ribbons only.
- Ratings, multi-tier filtering, and randomized reactions remain active.
- Preference is saved as state.settings.showTierRibbons.

UPLOAD
Replace only sw.js on main, commit normally, and let GitHub Pages redeploy.

TEST
1. Open Settings / Configuration and find Catalog / Closet.
2. Turn Show Tier ribbons off and confirm Closet ribbons disappear.
3. Confirm Tier filters and item ratings still work.
4. Turn ribbons back on and confirm they return.
5. Reopen the PWA and confirm the preference persists.

PLANNED NEXT
v13.16-dev7: expandable Settings groups for General, Catalog / Closet, Board, Portfolio, Journal, Wishlist, and About.
