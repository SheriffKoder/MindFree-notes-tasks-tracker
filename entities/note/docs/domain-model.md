# Note domain model

Why Notes is one entity, three kinds, nested categories, and two optional flags — and how notes move between roles.

**Glossary:** [docs/concepts/glossary.md](../../../docs/concepts/glossary.md)  
**Types:** `entities/note/model/types.ts`

---

## Why one table

Product needs calendar days, undated buckets (Diary, Projects, …), a Home quick slot **per category**, starring, and important days. Splitting tables (or a heavy `note_type` enum) would duplicate write paths and sync. Instead:

- One `mf_notes` row shape.
- Kind = `date` + `isQuick`.
- Undated/quick notes carry `categoryId`; calendar notes do not.
- Flags = `starred` + `isImportant`.

Consumers (Notes page, Home strips, drawer) are **read models and UI**, not separate domains. Categories live in [`../category/`](../category/README.md), not a second entity.

---

## Domain fields (client)

| Field | Role |
| ----- | ---- |
| `id` | Stable row id |
| `date` | ISO day for calendar notes; `null` for undated and quick |
| `categoryId` | Required for undated/quick; **null** for calendar |
| `title` / `content` | Editable body |
| `starred` | Membership in the matching Home strip’s starred cards |
| `isImportant` | Calendar **cell** border only |
| `isQuick` | That category’s Home quick slot |
| `lastEditedAt` | Display + sort ordering |
| `revision` | Monotonic concurrency token (PATCH `expectedRevision`) |

DB columns are snake_case (`is_important`, `is_quick`, `last_edited_at`, `revision`); `mapNoteRow` maps to camelCase.

---

## Kinds

```text
calendar: date set,     categoryId null
undated:  date null,    categoryId set, !isQuick
quick:    date null,    categoryId set,  isQuick — one per category
```

| Kind | Product intent | Hard constraints |
| ---- | -------------- | ---------------- |
| Calendar | “What happened on this day?” | One note per user per `date`; no category |
| Undated | “Something I’m writing that isn’t a day” | Lives in one category list (`?view=category:<id>`) until deleted |
| Quick | “Capture now on Home” for that category | One per category; not listed on Notes |

Calendar titles are usually the formatted date (picker / normalize rules). Undated and quick use free-form titles (quick typically starts empty).

---

## Flags

**Starred** answers Home: “which notes do I want at a glance?” Undated starred notes appear on **that category’s** strip. Starred **calendar** notes appear on the Diary (`isDefault`) strip only. Quick notes are excluded from starred cards even if starred were set — the slot is separate.

**Important** answers calendar: “which days should jump visually?” Only calendar cells use it. List cards and general grid do not restyle from `isImportant`.

---

## Lifecycle (mental model)

```text
Empty day / draft
  → user types meaningful content
  → lazy CREATE (calendar | general | quick)

Persisted note
  → PATCH autosave (fields, date moves, flags)
  → or DELETE (calendar empty content; or explicit trash)

Quick ↔ rest of world
  → graduate: title or date → isQuick false
  → promote: house-plus → isQuick true, cleared title/date/star/important
```

### Calendar ↔ undated

The pre-save orchestrator resolves whether the editor is bound to a calendar day (picker intent, formatted title, opening context). That resolve drives create vs patch vs delete — not the URL month alone.

- Date bound + content → calendar create/patch (`categoryId` cleared).
- Date unbound + title/content → undated create/patch (must have `categoryId`).
- Calendar note with content cleared → **delete** (day becomes empty again).
- Undated notes with empty fields do **not** auto-delete.

Conflict: moving onto a day that already has a note requires replace confirmation.

### Quick slot

- Opens as content-only capture on the selected Home category strip.
- Adding a **title** or **date** graduates out of quick (becomes undated in that category, or calendar).
- Promoting an existing note into quick clears metadata that belongs to “catalogued” notes.

Detail docs: [writes-and-autosave.md](./writes-and-autosave.md), [quick-note.md](./quick-note.md).
Home as consumer: [views/home/docs/notes-strip.md](../../../views/home/docs/notes-strip.md).

---

## What this model deliberately is not

- Not a separate “Home notes” entity — Home is a consumer of the same domain.
- Not Redux-owned draft state — form state lives in the drawer editor; server state in TanStack.
- Not “selectedNoteId” as the calendar navigator — for days, **selected date** is the source of truth ([state-management](../../../docs/architecture/state-management.md)).

---

## Related

| Doc | Why |
| --- | --- |
| [read-models.md](./read-models.md) | How kinds are sliced for APIs and cache keys |
| [RESPONSIBILITIES.md](../RESPONSIBILITIES.md) | Where code for each concern lives |
| Workflow archive | `app/development/workflow/notes/02-notes-page.md` (build history) |
