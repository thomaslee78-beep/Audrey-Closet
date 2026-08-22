Audrey Closet — v13.19-dev1 Main Update

PURPOSE
First dedicated Board Tools redesign, inspired by the Photo Studio controls.

TOOLS REDESIGN

1. STUDIO-STYLE ACTION BUTTONS
Tools now use larger, easier-to-read action tiles with:
- clear icon
- primary label
- short supporting description
- larger touch target
- soft neutral surface matching the app

2. GROUPED TOOL SECTIONS

Layer
- Send Back
- Bring Front

Transform
- Rotate Left
- Rotate Right
- Duplicate

Edit
- Delete
- Undo
- Clear

3. CLEARER ENABLED / DISABLED STATES
- Selection-dependent tools visibly disable when no item is selected.
- Undo enables only when there is something to restore.
- Clear enables only when the Board contains content.
- A short helper message appears when nothing is selected.

4. STRONGER SELECTED-OBJECT FEEDBACK
- Selected Board item gets a more visible turquoise outline.
- Selected object retains visible handles.
- Keeps selection obvious while using Tools.

5. LIGHTWEIGHT ACTION FEEDBACK
Short messages confirm:
- Send Back
- Bring Front
- Rotate Left / Right
- Duplicate
- Delete
- Undo

6. EXISTING INTERACTIONS PRESERVED
No changes to:
- drag to move
- pinch resize / rotate
- Board geometry
- Add Items
- Decorate
- Portfolio compatibility
- Clear/New confirmation behavior

TEST
1. Open Tools with nothing selected.
2. Confirm selection-dependent buttons are visibly disabled.
3. Select an item and confirm relevant buttons enable.
4. Test Send Back / Bring Front.
5. Test Rotate Left / Right.
6. Test Duplicate.
7. Test Delete and Undo.
8. Test Clear confirmation.
9. Confirm selected item outline is clearer than before.
10. Confirm the Studio-style buttons are easier to scan and tap.

ROLLBACK
Replace sw.js with v13.18-dev12.
