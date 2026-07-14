# State management

Which layer owns which kind of state — and why mixing them caused (or would cause) bugs.

Notes is the first full example; the same split applies as Tasks and other domains land.

---

## Three buckets

| Bucket | Owner | Examples (Notes) | Survives refresh? |
| ------ | ----- | ---------------- | ----------------- |
| **Application / URL** | Search params | `?month=2026-07`, `?view=calendar` | Yes — shareable, back-button friendly |
| **Server state** | TanStack Query (hydrated from SSR) | `["calendarNotes", month]`, `["generalNotes"]`, `["homeNotes"]` | Cache may be warm; authoritative row data is in Supabase |
| **Ephemeral UI** | Feature / view islands | Drawer `isOpen`, editor request, drawer `activeDate` | No |

Keep each bucket at the **closest boundary** that needs it. The calendar does not own drawer open state; the drawer does not own URL month.

---

## URL owns month and view

```text
/notes?month=2026-07&view=calendar
/notes?month=2026-07&view=month-notes
/notes?month=2026-07&view=general-notes
```

**Why URL, not React state alone:** bookmarking, reload, and browser history match what the user was looking at. Changing `month` or `view` is client-side URL work so the server page does not re-run on every toggle (see caching / routing docs).

**What URL does _not_ own:** which note is open in the drawer. Closing the drawer should not require rewriting the month.

---

## Drawer: selected date, not selected note

For calendar editing, the drawer’s source of truth is **`activeDate` / selected day**, not a sticky `selectedNoteId`.

**Why:**

1. Empty days must open an editor without inventing a fake id.
2. Lazy create: no row until meaningful content exists.
3. Day swipe / prev-next navigate **dates**; the note for that day is resolved from cache (`monthNotes` / calendar day cell).
4. The page calendar can show July while the drawer browses March — drawer date nav must **not** rewrite page `?month=`.

General / quick / edit-by-id opens still use a note id (or create request) when there is no date-nav mode. That is a different editor request shape — not a replacement for calendar date-as-truth.

Formal ADR: selected-date decision _(Phase 2, ADR 0005)_.

---

## Server state lives in Query

After SSR hydrate (or first fetch), calendar, list, Home strip, and drawer all read **the same** TanStack caches. The drawer does not `GET /notes/:id` on open when the row is already in a read model.

Mutations update those caches optimistically; realtime and offline flush go through the same synchronization path so tabs and devices converge without a full page refresh.

---

## Ephemeral UI stays local

| State | Lives in | Why local |
| ----- | -------- | --------- |
| Drawer open / request | Notes/Home drawer hooks | UI chrome, not domain data |
| Form field values while typing | `useNoteForm` | Must not reset on every optimistic cache write |
| Conflict banner / replace confirm | Pre-save orchestrator | Save-gate UX for one session |
| Home aside drawer open | Home aside context | Must not re-render the whole Home server tree |

If form values were driven solely by the cached `Note` prop on every cache update, typing would snap back — that was the optimistic-snap class of bugs. Form state is local; remote sync into the form is gated (idle, not dirty).

---

## Who talks to whom (Notes)

```text
URL (month, view)
  → NotesClient / views section
       → useCalendarNotesQuery / useGeneralNotesQuery   ← server state
       → open drawer(request, optional date)

Drawer island
  → ephemeral: open, request, activeDate
  → resolve note from Query cache
  → form local state → orchestrator → mutations → Query cache (+ offline)
```

Home mounts the same drawer and `["homeNotes"]` — it does not invent a second state tree for note content.

---

## Related

| Doc | Why |
| --- | --- |
| [caching.md](./caching.md) | How server state is keyed and hydrated |
| [entities/note/docs/domain-model.md](../../entities/note/docs/domain-model.md) | Domain meanings behind the caches |
| [entities/note/docs/read-models.md](../../entities/note/docs/read-models.md) | Payload shapes |
| Workflow | `02-notes-page.md` — Drawer Navigation Decisions |
