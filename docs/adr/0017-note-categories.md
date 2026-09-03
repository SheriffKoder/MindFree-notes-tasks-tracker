## ADR 0017: Note categories nested in the note entity

### Status

Accepted

### Context

Undated notes needed more than one bucket (Diary vs Projects, etc.). Calendar notes stay day-scoped and must not pick a category. Home needed a strip per category the user wants visible, with one quick slot each.

A separate top-level `entities/category` would split note writes, cache fan-out, and RLS across two domains for a concept that only exists to group notes.

### Decision

1. **Nest** category code under `entities/note/category/`. Public imports stay `@/entities/note/server` and `@/entities/note/client`.
2. **Calendar:** `date` set, `categoryId` null. **Undated / quick:** `date` null, `categoryId` required.
3. **One quick note per category** (`mf_notes_user_category_quick_unique`), not per user.
4. **Soft delete** archives a category (hidden views, notes kept). **Hard delete** cascades notes; **Diary (`isDefault`) cannot be hard-deleted**.
5. Home reads `HomeNotesResponse.strips` for active `showOnHome` categories; the UI switches titles rather than stacking every carousel.

### Why

- Same table, drawer, and `synchronizeNoteCaches` hub (ADR 0010 / 0007).
- Category list changes have their own hub (`synchronizeNoteCategoryCaches`) so Home strip presence and names stay consistent without a second notes domain.
- Seeded Diary keeps a default bucket for new users and for starred calendar notes on Home.

Rejected:

- Top-level category entity — extra barrels, duplicate auth/RLS patterns, views importing two “sources of truth” for notes.
- Categories on calendar notes — would fight one-note-per-day and month views.
- Persisting Home strip collapse on the category row — UI layout is local; `showOnHome` is the only Home visibility flag.

### Consequences

Positive:

- Notes `?view=category:<uuid>` lists and Home strips share one category row.
- Archive/restore without destroying notes; hard delete is an explicit cascade.

Trade-offs:

- General TanStack keys are `["generalNotes", categoryId]` (prefix `["generalNotes"]` for scans).
- Contributors must not deep-import `category/repository/` from views/features.

**Code:** [`entities/note/category/README.md`](../../entities/note/category/README.md)  
**Plan folder:** `app/development/changelogs/note-category/`
