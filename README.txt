Audrey Closet — v13.18-dev1 Main Update

PURPOSE
Apply the successful Free-Flow visual idea to the Board piece picker so selecting garments feels visual and photo-first.

WHY A NEW VERSION LINE
v13.17 focused on Catalog/Closet view modes.
v13.18 begins applying successful visual ideas to other app areas, starting with Board.

BOARD PICKER CHANGES

1. PHOTO-FIRST PICKER
- Removes visible mini-card borders/backgrounds around garment choices.
- Removes mini-card shadows and rounded corners.
- Garment photos become the primary picker content.

2. REMOVE ITEM TEXT
- Item name/type text is hidden beneath each Board picker garment.
- Secondary description/meta text is hidden.
- The picker is intentionally visual: tap the garment image to add/select it.

3. LARGER GARMENTS
- Picker garment photos are enlarged.
- Images can extend slightly beyond their invisible grid cells.
- A light drop shadow helps separate transparent garment cutouts from the page.

4. FREE-FLOW FEEL
- Subtle repeating X/Y offsets.
- Very small rotations.
- Slight scale variation.
- Some pieces sit tighter together; some have slightly more breathing room.
- Underlying picker grid and item order are unchanged for reliability.

5. PICKER CONTAINER CLEANUP
- The Board picker card itself loses its visible rounded card shell.
- The result should feel more like garments laid out for selection rather than a list of product cards.

UNCHANGED
- Board canvas/design functionality.
- Tap garment to add to the Board.
- Closet/Wishlist source switching.
- Category filtering.
- Existing item order/source logic.
- Classic/Modern/Free-Flow Catalog views.

TEST
1. Open Board.
2. Scroll to the piece picker.
3. Confirm garment choices no longer show item names/descriptions beneath them.
4. Confirm there are no visible rounded mini-card borders around each garment.
5. Confirm garments appear larger and slightly irregular in position.
6. Tap several garments and confirm they still add to the design board normally.
7. Test Closet vs Wishlist source.
8. Test category filters.
9. Confirm the Board canvas itself is unchanged.

ROLLBACK
Replace sw.js with v13.17-dev12.
