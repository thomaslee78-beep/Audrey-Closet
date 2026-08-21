Audrey Closet — v13.16-dev8 Main Update

WHAT CHANGES
- Replace only sw.js on the main branch.
- Builds directly on v13.16-dev7.
- Cache/version becomes audrey-closet-v13.16-dev8.
- This release is visual refinement only; settings behavior is unchanged.

SETTINGS ACCORDION VISUAL REFINEMENT
- Collapsed Settings groups now use a muted sage background:
  #E1E5DA
- Pressed state uses a slightly deeper sage:
  #D4DACD
- Expanded section headers use a lighter cream-sage:
  #F0F1EA
- Expanded content area remains light/cream for readability.
- Borders are slightly stronger:
  rgba(108,81,66,.16)
- Subtitle contrast is increased slightly.
- The plus/minus affordance is a little stronger for easier scanning.

DESIGN INTENT
- Collapsed sections should be easier to distinguish from the page background.
- Expanded areas should still feel open and light.
- All sections share one restrained sage treatment so Settings remains cohesive.
- No section-specific rainbow colors were introduced.

UNCHANGED
- General / Catalog / Closet / Board / Portfolio / Journal / Wishlist / About grouping
- General opens by default
- Tier ribbon preference
- Multi-select Tier filtering
- Randomized Tier reactions
- Portfolio folder editing
- Journal layout editing
- Export / import and reset behavior

UPLOAD TO MAIN
1. Open Audrey-Closet on GitHub.
2. Stay on main.
3. Replace root sw.js with this package's sw.js.
4. Commit using your normal process.
5. Let GitHub Pages redeploy.
6. Open the PWA once online; fully close/reopen if the prior cached version remains.

TEST
1. Open Settings / Configuration.
2. Confirm collapsed sections have clear muted-sage contrast.
3. Expand a section and confirm the header becomes lighter.
4. Confirm the expanded content remains easy to read.
5. Check the plus/minus affordance.
6. Confirm no settings behavior changed.
7. Confirm Tier, Portfolio, Journal and data controls still work normally.

ROLLBACK
Replace sw.js with v13.16-dev7.
