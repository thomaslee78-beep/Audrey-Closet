Audrey Closet — v13.17-dev12 Main Update

PURPOSE
Final Free-Flow refinement pass: keep the dynamic scatter and organic feeling, but balance it so the closet feels less oversized and more naturally laid out.

CHANGES

1. GARMENT SIZE REDUCED SLIGHTLY
- Garment footprint reduced from dev11.
- Thumb width reduced from 112% to 107%.
- Aspect ratio eased back from 1/1.06 to 1/1.08.
- Scale now varies more softly, roughly from 1.02 to 1.10.

2. VERY SUBTLE ROTATION RETURNS
- Rotation added back in at a very restrained amount.
- Typical range is only about -0.55deg to +0.55deg.
- The goal is a hint of natural irregularity, not a messy or tilted look.

3. X/Y OFFSETS REDUCED SLIGHTLY
- Horizontal offset range reduced.
- Vertical offset range reduced.
- Layout should still feel organic, but more controlled than dev11.

4. MORE VARIED EDGE / ROW FEEL
- Scatter still regenerates after a successful Free-Flow reorder.
- The generator now includes gentle row and edge biasing so some rows feel tighter, some looser, and some garments sit a bit closer to the outer edges.
- This is still deterministic per arrangement, but feels more random and less repetitive.

UNCHANGED
- Dynamic scatter regeneration after reorder.
- No metadata or wear count in Free-Flow.
- Tier ribbons remain.
- Tap-to-open.
- Shared closet order with Classic and Modern.
- Modern and Classic remain unchanged.

WHAT TO EVALUATE
1. Does Free-Flow now feel better balanced than dev11?
2. Are the garments still prominent enough?
3. Do the slight rotations add life without becoming distracting?
4. Does the row/edge variation make the layout feel more random and natural?
5. Does the post-drop reshuffle still feel pleasing?

ROLLBACK
Replace sw.js with v13.17-dev11.
