Audrey Closet — v13.16-dev11 Main Update

WHAT CHANGES
- Replace only sw.js on the main branch.
- Builds directly on v13.16-dev10.
- Cache/version becomes audrey-closet-v13.16-dev11.
- Visual-only Journal refinement.

TODAY'S LOOK PANEL REFINEMENT
- Today's Look now uses the same warm Journal panel treatment as Wear Log / Wear Insights / Planned looks.
- Background: #EFE6D5
- Border: var(--line)
- Border radius: 16px
- Padding aligned to the other Journal section headers.
- Heading uses the app serif font at 19px / 600 weight.
- Heading color changes from burgundy to the normal dark ink for consistency.
- Subtitle uses the same muted Journal text color: #7B7065.
- Expand/collapse icon remains burgundy as the accent.

UNCHANGED
- Today's Look expand/collapse behavior.
- Today's Look content.
- Planned looks styling from dev10.
- Wear Log / Wear Insights.
- Journal ordering and saved state.
- Tier functionality and Configuration styling.
- All closet and journal data.

UPLOAD TO MAIN
1. Open Audrey-Closet on GitHub.
2. Stay on main.
3. Replace root sw.js with this package's sw.js.
4. Commit using your normal process.
5. Let GitHub Pages redeploy.
6. Open the PWA once online; fully close/reopen if the old cached version remains.

TEST
1. Open Journal.
2. Compare Today's Look with Planned looks, Wear Log and Wear Insights.
3. Confirm the background, border and typography now feel consistent.
4. Expand/collapse Today's Look.
5. Confirm its content and behavior are unchanged.

ROLLBACK
Replace sw.js with v13.16-dev10.
