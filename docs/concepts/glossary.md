# Glossary

Short definitions for Notes product language. Implementation detail lives under `entities/note/docs/`.

---

## Note kinds

One table (`mf_notes`). Kind is derived from `date` and `isQuick` — not a separate enum column. Undated and quick notes also have a **category**.

| Kind | Rule | Where you see it |
| ---- | ---- | ---------------- |
| **Calendar note** | `date` is set (`YYYY-MM-DD`); `categoryId` null | Notes calendar + month list for that month; Home starred on the **Diary** strip if starred |
| **Undated note** | `date` is null, `isQuick` is false, `categoryId` set | Notes `?view=category:<id>`; Home starred on that category’s strip if starred |
| **Quick note** | `date` is null, `isQuick` is true, `categoryId` set | That category’s Home quick slot only — never on the Notes page |

Rules:

- One calendar note per user per day.
- One quick note per user **per category**.
- Starred and important are flags on any kind (quick notes clear them when entering the quick slot).

---

## Categories

| Term | Meaning |
| ---- | ------- |
| **Note category** | User-named bucket for undated and quick notes (`mf_note_categories`) |
| **Diary** | Seeded default category (`isDefault`). Hard delete forbidden; archive allowed |
| **`showOnHome`** | When true and active, the category appears in Home’s title switcher |
| **Archive (soft delete)** | Hides the Notes view and Home strip; notes stay until restore or hard delete |
| **Hard delete** | Removes the category row; attached notes cascade |

---

## Flags

| Term | Field | Meaning |
| ---- | ----- | ------- |
| **Starred** | `starred` | Pin for the matching Home strip. No calendar cell style. |
| **Important** | `isImportant` | Visual emphasis — dark red border on that **calendar day** only. |

Independent: a note can be starred, important, both, or neither.

---

## Surfaces & views

| Term | Meaning |
| ---- | ------- |
| **Notes page** | `/notes` — calendar, month notes list, per-category undated lists |
| **Home notes strip** | Selected category’s quick slot + starred cards; titles switch strips |
| **`?view=calendar`** | Month grid of calendar notes |
| **`?view=month-notes`** | Same month’s calendar notes as cards |
| **`?view=category:<id>`** | Undated notes for one category (legacy `general-notes` remaps to Diary) |
| **Note drawer** | Shared editor shell for create/edit across Notes and Home |
| **Category manage drawer** | Add / edit / archive / restore / hard-delete categories |

---

## Read models

Different API shapes over the same note rows. Clients hold them as separate TanStack Query caches.

| Term | Query key | Payload idea |
| ---- | --------- | ------------ |
| **Calendar month** | `["calendarNotes", month]` | `calendarDays` + `monthNotes` for one `YYYY-MM` |
| **Undated list** | `["generalNotes", categoryId]` | Undated non-quick notes in one category |
| **Home** | `["homeNotes"]` | `strips[]` — `quickNote` + `starredNotes` per `showOnHome` category |
| **Categories** | `["noteCategories"]` | Active category rows (optional with-deleted key for the manager) |

See [read-models.md](../../entities/note/docs/read-models.md).

---

## Editing vocabulary

| Term | Meaning |
| ---- | ------- |
| **Lazy create** | Opening an empty day or draft does not insert a row; first meaningful edit creates it |
| **Autosave** | Debounced PATCH (or create/delete) via the pre-save orchestrator |
| **Selected date** | Drawer date-nav source of truth — resolve note from cache by day, not by selected note id alone |
| **Date ↔ undated cycle** | Clearing a calendar date (title/picker rules) can turn a note undated (needs `categoryId`); picking a date can bind calendar again |
| **Same-day conflict** | Another note already occupies the target day — user must confirm replace before save |
| **Graduate (quick)** | Setting a title or date on a quick note clears `isQuick` (leaves the quick slot) |
| **Promote (quick)** | House-plus on a persisted note moves it into that category’s quick slot (clears title/date/star/important) |
| **Synchronization hub** | `synchronizeNoteCaches` — one place that applies create/update/delete to all relevant read models |
| **Live sync** | Supabase realtime on `mf_notes` patches TanStack caches across tabs/devices |
| **Offline queue** | Pending writes in user-scoped `localStorage`; merge on load; flush when online |

---

## Auto-delete (clean database)

- **Calendar notes:** clearing **content** (while dirty) deletes the row — empty day, no leftover shell.
- **Undated notes:** never auto-delete on empty; user deletes explicitly.
- Full write rules: [writes-and-autosave.md](../../entities/note/docs/writes-and-autosave.md).
