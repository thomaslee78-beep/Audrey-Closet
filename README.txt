Audrey Closet — v13.16-dev10 Main Update

WHAT CHANGES
- Replace only sw.js on the main branch.
- Builds directly on v13.16-dev9.
- Cache/version becomes audrey-closet-v13.16-dev10.
- Visual-only Journal adjustment.

PLANNED LOOKS COLOR REFINEMENT
- The Planned looks collapsible header now matches the warmer Journal panel palette used by Wear Log / Wear Insights.
- Header background: #EFE6D5
- Border: var(--line)
- Helper/subtitle text: #7B7065
- Expand/collapse icon now uses the app burgundy accent.
- Planned-look rows themselves keep their existing subtle turquoise/future-look treatment, so future entries remain visually distinguishable.

UNCHANGED
- Planned looks behavior and collapse state.
- Journal ordering.
- Wear Log and Wear Insights.
- Tier functionality.
- Configuration styling and behavior.
- All saved closet/journal data.

UPLOAD TO MAIN
1. Open Audrey-Closet on GitHub.
2. Stay on main.
3. Replace root sw.js with this package's sw.js.
4. Commit using your normal process.
5. Let GitHub Pages redeploy.
6. Open the PWA once online; fully close/reopen if the old cached version remains.

TEST
1. Open Journal.
2. Compare Planned looks against Wear Log / Wear Insights.
3. Confirm the Planned looks collapsible header feels consistent with the other panels.
4. Expand/collapse Planned looks.
5. Confirm planned individual rows still retain their future-look visual distinction.

ROLLBACK
Replace sw.js with v13.16-dev9.
