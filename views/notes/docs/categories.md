# Notes categories on `/notes`

Why the Notes page has a **manage drawer** and **dynamic undated views** instead of a single “General notes” pane.

**Domain:** [entities/note/category/README.md](../../../entities/note/category/README.md)  
**ADR:** [0017](../../../docs/adr/0017-note-categories.md)

---

## Views

URL `?view=` is still owned by the page ([ADR 0004](../../../docs/adr/0004-url-owned-application-state.md)):

| View | Meaning |
| ---- | ------- |
| `calendar` | Month grid |
| `month-notes` | Same month as cards |
| `category:<uuid>` | Undated list for one **active** category |

Legacy `?view=general-notes` remaps to the Diary `category:<id>` for one release.

Archiving a category hides its view. Restoring brings it back. Hard delete removes the view and cascaded notes; the page must not leave a dead `category:<id>` in the URL (`onCategoryRemoved`).

## Manage drawer

`features/notes/note-category-drawer` owns add / edit / archive / restore / hard-delete. The page only opens and closes it (`useNoteCategoriesDrawer`). Opening it closes the note editor (one overlay).

Diary never shows **Delete forever**. Archive is allowed.

## Create

Toolbar **Add note** opens `create-general` with the current category view’s id, else Diary / first active. The editor can still change category before the first save. Disabled when no active category exists.
