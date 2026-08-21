Audrey Closet — v13.17-dev1 Main Update

PURPOSE
First step of the Closet View experiment. This build introduces a safe presentation-layer setting while preserving the existing Classic catalog.

BASE
- Built directly on v13.16-dev12.
- Replace only sw.js.
- Cache/version: audrey-closet-v13.17-dev1.

NEW: CLOSET VIEW SETTING
Configuration > Catalog / Closet now contains:

Classic
- Existing Closet design.
- Remains the default for existing users.

Modern
- First-pass full-bleed catalog experiment.
- Clothing Catalog hero banner stretches horizontally to the edges of the catalog screen.
- Closet card grid stretches horizontally to the edges.
- Cards touch with thin light/white separators instead of open gutters.
- Card corners and shadows are removed.
- Photos are slightly more prominent and metadata is compacted.
- Category/search/filter controls remain inset for comfortable use.

Free-Flow
- Visible in Configuration as the planned experimental third mode.
- Disabled in dev1 so the app does not pretend an unfinished layout is ready.
- Intended for a later dev build with photo-only floating garment presentation.

ARCHITECTURE
- New setting: state.settings.closetView
- Supported values: classic / modern / free-flow
- Missing/invalid setting defaults safely to classic.
- View mode only controls presentation.
- Shared catalog filtering, item order, tiers, archived state, click-to-review and drag/reorder logic remain shared.
- The same manual item order is used across all views.
- Future App Style / theme selection remains independent from Closet View.

TEST
1. Open Configuration > Catalog / Closet.
2. Confirm Closet view selector appears.
3. Confirm Classic is selected initially.
4. Switch to Modern.
5. Return to Closet and confirm hero + catalog grid are full-bleed.
6. Test Category chips, Search, Filter and multi-tier filtering.
7. Open a closet card and verify item review still works.
8. Long-press/reorder items and confirm order persists.
9. Confirm Tier ribbons still display according to the ribbon setting.
10. Switch back to Classic and confirm the prior design returns unchanged.
11. Close/reopen the PWA and confirm the selected view persists.

ROLLBACK
Replace sw.js with the stable v13.16-dev12 / v13.16 checkpoint.
