# Glossary

Short definitions for Notes product language. Implementation detail lives under `entities/note/docs/`.

---

## Note kinds

One table (`mf_notes`). Kind is derived from `date` and `isQuick` — not a separate enum column.

| Kind | Rule | Where you see it |
| ---- | ---- | ---------------- |
| **Calendar note** | `date` is set (`YYYY-MM-DD`) | Notes calendar + month list for that month; Home starred if starred |
| **General note** | `date` is null and `isQuick` is false | Notes general list (all time); Home starred if starred |
| **Quick note** | `date` is null and `isQuick` is true | Home quick slot only — never on the Notes page |

Rules:

- One calendar note per user per day.
- One quick note per user.
- Starred and important are flags on any kind (quick notes clear them when entering the quick slot).

---

## Flags

| Term | Field | Meaning |
| ---- | ----- | ------- |
| **Starred** | `starred` | Pin for Home starred strip. No calendar cell style. |
| **Important** | `isImportant` | Visual emphasis — dark red border on that **calendar day** only. |

Independent: a note can be starred, important, both, or neither.

---

## Surfaces & views

| Term | Meaning |
| ---- | ------- |
| **Notes page** | `/notes` — calendar, month notes list, general notes |
| **Home notes strip** | Quick slot + starred cards; opens the shared note drawer |
| **`?view=calendar`** | Month grid of calendar notes |
| **`?view=month-notes`** | Same month’s calendar notes as cards |
| **`?view=general-notes`** | Undated general notes (excludes quick) |
| **Note drawer** | Shared editor shell for create/edit across Notes and Home |

---

## Read models

Different API shapes over the same note rows. Clients hold them as separate TanStack Query caches.

| Term | Query key | Payload idea |
| ---- | --------- | ------------ |
| **Calendar month** | `["calendarNotes", month]` | `calendarDays` + `monthNotes` for one `YYYY-MM` |
| **General list** | `["generalNotes"]` | All general notes |
| **Home** | `["homeNotes"]` | `quickNote` + `starredNotes` |

See [read-models.md](../../entities/note/docs/read-models.md).

---

## Editing vocabulary

| Term | Meaning |
| ---- | ------- |
| **Lazy create** | Opening an empty day or draft does not insert a row; first meaningful edit creates it |
| **Autosave** | Debounced PATCH (or create/delete) via the pre-save orchestrator |
| **Selected date** | Drawer date-nav source of truth — resolve note from cache by day, not by selected note id alone |
| **Date ↔ general cycle** | Clearing a calendar date (title/picker rules) can turn a note general; picking a date can bind calendar again |
| **Same-day conflict** | Another note already occupies the target day — user must confirm replace before save |
| **Graduate (quick)** | Setting a title or date on a quick note clears `isQuick` (leaves the quick slot) |
| **Promote (quick)** | House-plus on a persisted note moves it into the quick slot (clears title/date/star/important) |
| **Synchronization hub** | `synchronizeNoteCaches` — one place that applies create/update/delete to all relevant read models |
| **Live sync** | Supabase realtime on `mf_notes` patches TanStack caches across tabs/devices |
| **Offline queue** | Pending writes in user-scoped `localStorage`; merge on load; flush when online |

---

## Auto-delete (clean database)

- **Calendar notes:** clearing **content** (while dirty) deletes the row — empty day, no leftover shell.
- **General notes:** never auto-delete on empty; user deletes explicitly.
- Full write rules: [writes-and-autosave.md](../../entities/note/docs/writes-and-autosave.md) _(Phase 3)_.
