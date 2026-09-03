# Note category drawer (`features/notes/note-category-drawer`)

Notes-page **manage drawer** for user categories — add, edit, archive, restore, and hard-delete. Import from `@/features/notes/note-category-drawer`.

## How this relates to the entity editor

| Layer | Folder | Responsibility |
| ----- | ------ | -------------- |
| Page | `views/notes/model/editor/use-note-categories-drawer.ts` | Open/close only |
| Feature | `features/notes/note-category-drawer/` | Drawer island — lists, confirm, mutation wiring |
| Entity | `entities/note/category/editor/` | Reusable form — `name`, `showOnHome`, dirty/valid |

```text
NotesClient
  useNoteCategoriesDrawer()     ← views: open / close
       ↓
  <NoteCategoryDrawer />        ← feature: island orchestration
       ↓
  <NoteCategoryForm />          ← entity: controlled fields only
```

Only one Notes drawer should be open: the page closes the note editor when this manager opens, and vice versa.

## Entry point

| File | Exports |
| ---- | ------- |
| `index.ts` | `NoteCategoryDrawer` |

## This feature is responsible for

| Concern | Location |
| ------- | -------- |
| Composing `AppDrawer` + lists + form + confirm | `ui/note-category-drawer.tsx` |
| Active rows (Home toggle, edit, archive) | `ui/category-active-list.tsx` |
| Archived rows (restore, hard delete) | `ui/category-archived-list.tsx` |
| Create/edit Save actions | `ui/category-edit-form.tsx` |
| Hard-delete confirmation copy | `ui/category-delete-confirm.tsx` |
| API error copy (409 / 403) | `lib/map-category-api-error.ts` |

## This feature is not responsible for

| Concern | Owner |
| ------- | ----- |
| Form fields and validation | `entities/note/category/editor` |
| Drawer open/close | `views/notes/model/editor/use-note-categories-drawer.ts` |
| URL `view=category:<id>` after archive/delete | Notes page (`onCategoryRemoved`) |
| Category HTTP / TanStack mutations | `@/entities/note/client` |

Diary (`isDefault`) never renders **Delete forever**. Archive is allowed and hides the view until restore.
