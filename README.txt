Audrey Closet — v13.16-dev9 Main Update

WHAT CHANGES
- Replace only sw.js on the main branch.
- Builds directly on v13.16-dev8.
- Cache/version becomes audrey-closet-v13.16-dev9.
- Visual-only adjustment.

SETTINGS HEADER REFINEMENT
- Collapsed Settings headers remain muted sage: #E1E5DA.
- Expanded Settings headers now use the exact same muted sage: #E1E5DA.
- Expanded content remains light/cream.
- The + / − indicator and revealed content continue to communicate open vs. closed state.
- Pressed state remains #D4DACD.

UNCHANGED
- All Settings grouping and behavior.
- Tier functionality.
- Multi-select Tier filtering.
- Tier reactions and ribbons.
- Portfolio and Journal settings.
- Data export/import and reset.

UPLOAD TO MAIN
1. Open Audrey-Closet on GitHub.
2. Stay on main.
3. Replace root sw.js with this package's sw.js.
4. Commit using your normal process.
5. Let GitHub Pages redeploy.
6. Open the PWA once online; fully close/reopen if the prior cached version remains.

TEST
1. Open Settings.
2. Compare a collapsed section with an expanded section.
3. Confirm both headers use the same muted sage.
4. Confirm expanded content remains light and readable.
5. Confirm all configuration controls still behave normally.

ROLLBACK
Replace sw.js with v13.16-dev8.
