Audrey Closet — v13.16-dev12 Main Update

WHAT CHANGES
- Replace only sw.js on the main branch.
- Builds directly on v13.16-dev11.
- Cache/version becomes audrey-closet-v13.16-dev12.
- Visual-only Journal refinement.

TODAY'S LOOK BLENDED PANEL
- The entire Today's Look section now uses one continuous light warm background:
  #F2EADB
- The Today's Look header uses the same exact background color as the section behind it.
- The visible header border is removed.
- The header radius is removed so it visually blends into the surrounding section.
- The outer Today's Look section keeps the rounded 16px shape.
- The content area beneath the header remains inside the same blended panel.
- The title/subtitle typography from dev11 is retained.
- The burgundy expand/collapse icon remains as the accent.

DESIGN INTENT
- Today's Look should feel like one integrated Journal surface rather than a card sitting on another card.
- The section remains slightly lighter than the other Journal panels so it still feels like the current/today highlight.
- Individual wear-log rows remain distinct inside the blended panel.

UNCHANGED
- Today's Look behavior and data.
- Planned looks styling.
- Wear Log / Wear Insights.
- Journal ordering.
- Tier functionality and Configuration styling.
- All saved closet and journal data.

UPLOAD TO MAIN
1. Open Audrey-Closet on GitHub.
2. Stay on main.
3. Replace root sw.js with this package's sw.js.
4. Commit using your normal process.
5. Let GitHub Pages redeploy.
6. Open the PWA once online; fully close/reopen if the old cached version remains.

TEST
1. Open Journal.
2. Confirm Today's Look header and surrounding panel use the same light warm color.
3. Confirm there is no visible border around the Today's Look header.
4. Expand/collapse Today's Look.
5. Confirm the content still reads clearly inside the blended section.

ROLLBACK
Replace sw.js with v13.16-dev11.
