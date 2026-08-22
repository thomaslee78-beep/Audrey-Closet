Audrey Closet — v13.18-dev10 Main Update

PURPOSE
Refine the Board folder-tab surface and Add Items layout.

CHANGES

1. CATEGORY AREA BLENDS WITH ADD ITEMS
- Category filter row now uses the same warm active-folder background as the Add Items workspace.
- Removed extra border/shadow treatment so the whole picker reads as one continuous surface.

2. WORKSPACE PANEL LIGHTENED
- The strip/panel behind Add Items / Tools / Decorate is lightened.
- Active folder tab, active panel, picker, tools and decorate surfaces now use closely matched warm tones.
- Goal: one connected folder/workspace rather than a dark panel behind lighter pieces.

3. TAB LABELS CENTERED
- Add Items / Tools / Decorate labels are centered for this experiment.
- Serif type and larger size are retained.

4. MORE SPACE ABOVE FREE-FLOW GARMENTS
- Adds extra top padding before the garment grid.
- Slightly lowers the garment field so large/offset photos are less likely to bleed into Search / Color / Tier controls.
- A few of the most upward-biased Free-Flow positions get an additional small downward correction.

UNCHANGED
- Clear/New confirmations
- Reset filters
- Search / Color / Tier
- Share beside New
- Save/Update
- Portrait Board
- Portfolio compatibility

TEST
1. Open Board > Add Items.
2. Confirm category row and filter area visually blend into the active folder panel.
3. Confirm background behind tabs/panels feels lighter and more unified.
4. Compare centered labels against the prior left-aligned treatment.
5. Confirm first row of garment photos no longer intrudes into the search/filter row.
6. Scroll through enough items to verify the Free-Flow layout still feels organic.

ROLLBACK
Replace sw.js with v13.18-dev9.
