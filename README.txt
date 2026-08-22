Audrey Closet — v13.20-dev7 Main Update
Photo Studio Original Restoration Fix

ISSUE
In Photo Studio:
1. Open a garment.
2. Choose Quick background removal.
3. Quick removes background but may also remove some garment pixels.
4. Tap Original.
5. Some garment pixels remain missing instead of returning to the untouched captured photo.

ROOT CAUSE
The previous Original workflow did this:
- restore studioBaseCanvas from the original image
- call rebuildStudioWorkCanvas()
- rebuildStudioWorkCanvas() then reapplied manual erase/restore masks

That meant Original was not actually guaranteed to be pristine.

There was also a related source-selection problem:
ensureStudioOriginalCanvas() always referenced itemOriginalPhoto, even when Photo Studio
was editing a Wishlist item.

FIX

ORIGINAL
- Original now reconstructs its canvas directly from the correct captured source.
- It does not apply cutout alpha masks.
- It does not apply manual Erase/Restore masks.
- Quick/Clean cutout pixels cannot remain baked into Original.
- The status clearly says "Original captured photo selected."

QUICK / CLEAN
- Quick and Clean remain non-destructive alternatives.
- Existing manual Erase/Restore masks remain available when returning to Quick/Clean.
- Switching to Original does not destroy those retouch edits; it simply bypasses them
  while Original is selected.

TARGET CORRECTION
- Closet Photo Studio uses itemOriginalPhoto / itemWorkingPhoto.
- Wishlist Photo Studio uses wishOriginalPhoto / wishWorkingPhoto.
- Each Studio session therefore rebuilds Original from the correct target source.

EXPECTED BEHAVIOR

Original:
Untouched captured/selected source photo.

Quick:
Automatic fast background removal.

Clean:
More aggressive/cleaner background removal.

Erase / Restore:
Retouch the Quick/Clean cutout without altering Original.

TEST
1. Open an item whose Quick cutout visibly removes part of the garment.
2. Tap Quick.
3. Verify pixels/background are removed.
4. Tap Original.
Expected:
- complete original garment returns
- original background returns
- no garment pixels remain missing
5. Tap Quick again.
Expected:
- Quick cutout returns
6. Use Erase or Restore on Quick.
7. Tap Original.
Expected:
- pristine original still appears
8. Return to Quick.
Expected:
- Quick retouch state is still available
9. Repeat with a Wishlist photo if available.

No closet photo data migration is required.

ROLLBACK
Replace sw.js with v13.20-dev6.
