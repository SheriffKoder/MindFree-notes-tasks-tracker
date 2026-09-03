# Note categories (`entities/note/category/`)

User-managed buckets for **undated** and **quick** notes. Calendar notes keep `categoryId` null.

This nest owns category CRUD, types, read queries, client fetchers/hooks, cache helpers, and the reusable manage-drawer form (`editor/`). It is **not** a top-level entity — consumers import through the parent note barrels.

**Server import:** `@/entities/note/server` (re-exports `category/server.ts`).  
**Client import:** `@/entities/note/client` (re-exports `category/client.ts`).

Do **not** deep-import `category/repository/` from views or features. Repository is for queries/mutations inside this nest (and note-entity server use-cases that already sit beside it).

## Domain rules

| Rule | Meaning |
| ---- | ------- |
| Diary | Seeded `isDefault` category. Soft-delete (archive) is allowed; **hard delete is blocked**. |
| Soft delete | Sets `deletedAt`. Hidden from Notes views and Home until restore. Notes stay attached. |
| Hard delete | Physical row delete. Notes cascade via `category_id ON DELETE CASCADE`. Not offered for Diary. |
| `showOnHome` | Active categories with this flag appear in Home’s title switcher (empty quick placeholder included). |
| Names | Unique among **active** categories per user (case-insensitive). |

## Folder map

```text
entities/note/category/
├── model/          # NoteCategory + DB row
├── schema/         # Create/update Zod bodies
├── errors/         # Diary protection, name conflict
├── repository/     # Supabase only — not a public consumer API
├── transform/      # Row → domain
├── queries/        # List response
├── mutations/      # Create / update / archive / restore / hard delete
├── client/         # Keys, fetchers, query options
├── hooks/          # React query + mutations
├── cache/          # synchronizeNoteCategoryCaches (lists + Home strips)
├── hydration/      # SSR seed for ["noteCategories"]
├── editor/         # Dumb form (name + showOnHome)
├── server.ts       # Nest server barrel
└── client.ts       # Nest client barrel
```

## Consumers

| Who | How |
| --- | --- |
| `app/api/notes/categories/*` | `@/entities/note/server` |
| Notes page switcher + manage drawer | `@/entities/note/client` |
| Home strips / `showOnHome` | Home read model + `synchronizeNoteCategoryCaches` |
| Note drawer category picker | `@/entities/note/client` + entity editor form |

Manage-drawer shell: [`features/notes/note-category-drawer`](../../../features/notes/note-category-drawer/README.md).
