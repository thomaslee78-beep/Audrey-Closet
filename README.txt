Audrey Closet — v13.18-dev11 Main Update

PURPOSE
Final spacing/blending refinement for the Board folder tabs.

CHANGES

1. LEFT EDGE ALIGNMENT
- Add Items begins flush with the left edge of the workspace panel.

2. RIGHT EDGE ALIGNMENT
- Decorate ends flush with the right edge of the workspace panel.

3. MORE TAB SEPARATION
- Increased horizontal gap between Add Items / Tools / Decorate.
- Keeps them visually distinct while retaining the folder-tab treatment.

4. OUTER TAB CONTAINER BLENDS INTO APP
- Removed the slightly darker tab-strip background.
- The container behind the tabs is now transparent so the app background shows through.
- Individual tabs and the active workspace provide the visual structure instead.

UNCHANGED
- Centered serif labels
- Active workspace background
- Add Items filters
- Free-Flow picker
- Clear/New confirmations
- Reset filters

TEST
1. Confirm Add Items left edge aligns with panel.
2. Confirm Decorate right edge aligns with panel.
3. Confirm tabs have more breathing room between them.
4. Confirm the strip behind the tabs visually disappears into the app background.

ROLLBACK
Replace sw.js with v13.18-dev10.
