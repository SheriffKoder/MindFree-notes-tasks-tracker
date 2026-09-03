# Home notes strips

Why Home shows **one carousel for the selected `showOnHome` category** — quick slot + starred cards — and what Home must **not** own.

**Decision:** [ADR 0010](../../../docs/adr/0010-one-domain-multiple-consumers.md)  
**Quick rules:** [entities/note/docs/quick-note.md](../../../entities/note/docs/quick-note.md)  
**Read model:** [entities/note/docs/read-models.md](../../../entities/note/docs/read-models.md)  
**Categories:** [entities/note/category/README.md](../../../entities/note/category/README.md)  
**Workflow archive:** `app/development/workflow/home/notes-strip.md`

---

## What you see

```text
Home
  header (one row)
    category titles     switch which strip is shown
    chevron             local one-row vs two-row (only if 3+ cards)
    payment add + FileText add note
  cards for the selected strip
    ├─ [quick card or placeholder]  isQuick — always first
    └─ [starred cards]              starred && !isQuick — recent first
```

Diary is always seeded `showOnHome`. Extra categories appear in the title row only when that flag is on.

**Empty Home:** if every category has `showOnHome` off, `strips.length === 0` and the block shows “No note categories on Home.” Payment + Add note stay on the row. Turn a category on (or restore Diary) from the Notes manage drawer.

Tap opens the **same** `NoteDrawer` used on `/notes`:

- Empty quick placeholder → lazy `create-quick` for **the selected strip’s** `categoryId`
- Header FileText **Add note** → lazy `create-general` with Diary / first active category (does not overwrite a quick slot). No-op when no category exists.
- Existing card → edit

Autosave, offline, realtime, and conflict rules are not reimplemented on Home.

---

## Header controls

| Control | State | Effect |
| ------- | ----- | ------ |
| Category titles | Local selected strip (not persisted) | Shows that category’s quick + starred cards. First strip is the default. |
| Chevron beside the titles | Local `isTwoRows` (not persisted) | One carousel row vs two. Shown only when the selected strip has **3+** items (quick slot + starred). |
| FileText / payment | Same toolbar row | Shared create drawers — not strip-specific |

---

## Home's job

| Owns | Does not own |
| ---- | ------------ |
| Layout: title switcher, expand chevron, drag scroll, aside shell | Note domain mutations |
| Mount `useHomeNotesQuery` once + hydrate seed | A second save orchestrator |
| Open drawer via shared `useNotesDrawer` (`categoryId` on create) | Home-only PATCH / realtime forks |
| Mount `useOfflineSync` / realtime so strips stay live | Category CRUD UI (Notes manage drawer) |

`GET /api/notes/home` → `["homeNotes"]` is a **read model** over the same `mf_notes` rows — `strips[]`, not a single `quickNote` payload. Same entity, different shape. Home shows **one** strip at a time.

---

## Consistency

When a note is starred, unstarred, deleted, graduated from quick, moved between categories, or edited on `/notes` or another device:

1. Source (mutation / realtime / offline flush) → `NoteChange`
2. `synchronizeNoteCaches` updates calendar/general **and** the matching Home strip
3. Category `showOnHome` / archive / rename → `synchronizeNoteCategoryCaches` patches or drops strips

Home does not invent a parallel sync pipeline. See [ADR 0007](../../../docs/adr/0007-synchronize-note-caches-hub.md).

Starred **calendar** notes appear on the Diary (`isDefault`) strip only. Other strips show that category’s starred undated notes.

---

## UI reuse

- Cards: `NoteListCard` (`variant="home"`)
- Labels: shared reserved-meta (date vs title) — not Home-copied copy helpers
- Editor: `features/notes/note-drawer` + pre-save orchestrator
- Category flags: `entities/note/category` via `PATCH /api/notes/categories/:id`

---

## Related

| Doc | Why |
| --- | --- |
| [entities/note/docs/offline.md](../../../entities/note/docs/offline.md) | Offline mount on Home client island |
| [entities/note/docs/realtime.md](../../../entities/note/docs/realtime.md) | Live updates without refresh |
| [views/notes/docs/drawer-navigation.md](../../notes/docs/drawer-navigation.md) | Shared drawer behavior |
