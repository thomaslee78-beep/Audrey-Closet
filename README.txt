Audrey Closet — v13.18-dev8 Main Update

PURPOSE
Minor Board visual refinement after v13.18-dev7.

1. SAVE LABEL SIMPLIFIED
- "Save outfit" becomes "Save".
- After editing a saved look, the button becomes "Update".
- Keeps the Board compose bar compact.

2. SHARE POSITION
- Share remains beside New in the Board header.
- This was kept intentionally because Share is an action on the current Board, not a global app action.
- The global top bar remains reserved for app-wide Add Item and Configuration actions.

3. FOLDER-TAB WORKSPACE TREATMENT
Pick Pieces / Tools / Decorate now behave visually more like folder tabs:
- no outer border around the tab strip
- tabs have rounded TOP corners only
- bottoms are square so they visually connect to the open workspace
- active tab background matches the workspace panel beneath it
- workspace panel border is removed
- Tools and Decorate containers also lose their separate card borders
- spacing between Board and tabs is reduced so the controls sit closer to the canvas

4. ACTIVE AREA BLENDING
- Selected tab uses the same warm cream background as its content area.
- This should make the active tool feel like one connected folder/page rather than a button floating above a separate panel.

UNCHANGED
- Clear/New confirmations
- Picker Reset
- Search / Color / Tier filters
- Free-Flow picker
- Portrait Board
- Portfolio compatibility
- Share behavior

TEST
1. Confirm Save now reads "Save".
2. Confirm Share remains beside New.
3. Switch Pick Pieces / Tools / Decorate.
4. Confirm active tab visually blends into its content panel.
5. Confirm tabs only round at the top corners.
6. Confirm the tab strip sits closer to the Board and no heavy borders remain.

ROLLBACK
Replace sw.js with v13.18-dev7.
