Audrey Closet — v13.18-dev9 Main Update

PURPOSE
Refine the Board folder-tab treatment for readability, contrast and more stable navigation.

CHANGES
- Tab labels left aligned.
- Larger serif tab typography for a more Classic/Times-like feel.
- "Pick Pieces" renamed to "Add Items".
- Darker warm-neutral tab strip and inactive tabs for stronger contrast.
- Active tab and content panel share a lighter warm paper background.
- Switching Add Items / Tools / Decorate preserves the user's screen position instead of jumping back toward the Board top.

UNCHANGED
- Clear/New confirmations.
- Reset filters.
- Share beside New.
- Save/Update labels.
- Portrait Board.
- Portfolio compatibility.

TEST
1. Scroll until the folder tabs are near the top of the screen.
2. Switch Add Items -> Tools -> Decorate.
3. Confirm the page stays in place.
4. Confirm labels are left aligned and easier to read.
5. Confirm serif font feels cohesive.
6. Confirm darker folder treatment provides more contrast.

ROLLBACK
Replace sw.js with v13.18-dev8.
