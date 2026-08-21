Audrey Closet — v13.17-dev10 Main Update

PURPOSE
Push the Free-Flow experiment slightly further toward an organic "laid out on a surface" look.

FREE-FLOW REFINEMENTS
- Garment image footprint is slightly larger overall.
- Average grid spacing is tighter.
- Repeating variation pattern expanded from 6 items to 12 items.
- Each pattern position now mixes:
  - slight horizontal offset
  - slight vertical offset
  - slightly different scale
  - very small rotation
- Rotation is intentionally restrained (roughly +/- 1.3 degrees).
- Some pieces sit closer together, while others leave a little more breathing room.
- Pattern is deterministic, not truly random, so the Closet does not reshuffle visually every render.

UNCHANGED
- No metadata text.
- No wear count.
- Tier ribbons remain.
- Tap-to-open remains.
- Search/category/filter/Tier filters remain.
- Drag still means reorder.
- Same closet order across Classic, Modern and Free-Flow.
- Modern and Classic are unchanged.

WHAT TO EVALUATE
1. Does Free-Flow now feel more like garments casually laid out rather than a hidden grid?
2. Are the larger images better, or do they begin to crowd each other?
3. Do the tiny rotations add personality without looking messy?
4. Does the mix of tighter and looser spacing feel natural?
5. Does drag/reorder remain understandable despite the visual offsets?

ROLLBACK
Replace sw.js with v13.17-dev8.
