Audrey Closet — v13.16-dev1 Main Update

WHAT CHANGES
- Replace only sw.js on the main branch.
- No changes are required to app.js, index.html, styles.css, manifest, or icons.
- Cache name changes from audrey-closet-v13.15 to audrey-closet-v13.16-dev1.

S-TIER BEHAVIOR
- S / A / B / C / D appears on the existing Piece Details / Closet Review card.
- One tier can be selected at a time.
- Tap the selected tier again to clear it.
- Tier is saved on the existing closet item as item.tier.
- Existing unrated items require no migration.
- Tier survives normal item edits.
- No catalog badges, sorting, filtering, or statistics are added in this build.

UPLOAD TO MAIN
1. Open the Audrey-Closet repository on GitHub.
2. Stay on the main branch.
3. Replace the root sw.js with the sw.js from this package.
4. Commit the change to main using your normal process.
5. Wait for GitHub Pages to redeploy.
6. Open the installed iPhone PWA/site once while online, then fully close and reopen it if needed.

TEST
1. Open Closet.
2. Open an existing piece.
3. Confirm the S/A/B/C/D control appears at the top of Piece Details.
4. Select S, close the item, and reopen it.
5. Confirm S remains selected.
6. Tap S again and confirm the rating clears.
7. Select another tier, edit another field on the item, save, and reopen.
8. Confirm the tier survives the edit.
9. Swipe between pieces and confirm each piece retains its own tier.

ROLLBACK
Replace sw.js with the prior v13.15 version. Existing item.tier values are harmless if the UI is rolled back.
