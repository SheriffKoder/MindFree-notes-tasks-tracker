# Note read models

Why Notes exposes **three** API payloads (and three TanStack caches) instead of one “all notes” response.

- **Domain and DB-row types:** `entities/note/model/types.ts`
- **Response types:** `entities/note/model/read-models.ts`
- **Keys:** `entities/note/client/query-keys.ts`

---

## Why multiple read models

Each surface asks a different question:

| Surface | Question | Scope |
| ------- | -------- | ----- |
| Calendar / month list | What’s on this month’s days? | One `YYYY-MM` |
| General list | What undated notes do I have? | All time; not month-scoped |
| Home strip | What’s my quick slot + starred set? | One quick + starred subset |

If month navigation refetched general notes every time, general list would flash and waste work. If Home reused calendar month payloads, starring across months would be awkward. Separate caches keep each consumer coherent.

Writes still go through one domain (mutations + `synchronizeNoteCaches`) so all caches stay aligned.

## Where each client responsibility lives

The old combined TanStack folder was split so framework lifecycle does not get
mixed with transport, cache policy, or SSR composition:

| Responsibility | Location | Why |
| -------------- | -------- | --- |
| Query keys | `client/query-keys.ts` | Gives fetchers, cache helpers, and seeders one canonical cache identity |
| Browser fetchers + query options | `client/*-notes-query.ts` | Keeps HTTP behavior beside the reusable TanStack configuration for that request |
| React read hooks | `hooks/use-*-notes-query.ts` | Keeps React lifecycle separate from request definitions |
| Calendar prefetch | `client/prefetch-*.ts` | Reuses query options without requiring a React hook |
| SSR cache seeders | `hydration/seed-*-cache.ts` | Seeds already-fetched server data into entity-owned keys; the caller dehydrates once |
| Cross-model cache policy | `cache/` | Lets mutations, realtime, and offline changes share the same membership rules |

Consumers normally import these through stable `client.ts` or `server.ts`
instead of deep-importing their implementation files.

---

## Calendar month

```text
GET /api/notes/calendar?month=YYYY-MM
→ CalendarNotesResponse
TanStack key: ["calendarNotes", month]
```

| Field | Purpose |
| ----- | ------- |
| `month` | Canonical `YYYY-MM` |
| `calendarDays` | One entry per day in the month — `note` or `null` (UI-ready grid) |
| `monthNotes` | Flat calendar notes for list / week grouping |

Server aggregates: month length, leap years, one-note-per-day layout. The client mostly renders.

**Who uses it:** Notes calendar view, month-notes list, drawer date-nav (resolve note by `activeDate` in the owning month bucket). Page and drawer **prefetch** adjacent months so swiping and month chevrons stay warm.

**Mutation ownership:** Calendar rows live in their month key; date moves relocate between month buckets (and possibly general/home via the sync hub).

---

## General list

```text
GET /api/notes/general
→ GeneralNotesResponse
TanStack key: ["generalNotes"]
```

| Field | Purpose |
| ----- | ------- |
| `generalNotes` | Notes with `date IS NULL` and `is_quick = false` |

Month param does **not** apply. Quick notes are excluded by design.

**Who uses it:** Notes `?view=general-notes`, drawer when editing a general note (cache lookup by id).

---

## Home (quick + starred)

```text
GET /api/notes/home
→ HomeNotesResponse
TanStack key: ["homeNotes"]
```

| Field | Purpose |
| ----- | ------- |
| `quickNote` | The single `is_quick = true` note, or `null` before lazy create |
| `starredNotes` | `starred = true` and **not** quick; most recently edited first |

**Who uses it:** Home notes strip only. Opening a card still uses the shared `NoteDrawer` — writes are domain mutations, not a Home-specific save path.

POST on `/api/notes/home` supports lazy quick-note create when the slot is empty.

---

## SSR hydration

| Page | Seed |
| ---- | ---- |
| `/notes` | Current calendar month + general → `hydration/seed-notes-page-cache.ts` |
| `/` (Home) | Home payload → `hydration/seed-home-notes-cache.ts` |

Hydration seeds TanStack so the first paint doesn’t wait for a client round-trip
when data was already fetched on the server. Each seeder writes only its
entity-owned keys; the route-level seed component can compose multiple entities
and dehydrate the per-request `QueryClient` once. After hydration, all client
islands share the same browser `QueryClient`.

Details: [docs/architecture/caching.md](../../../docs/architecture/caching.md), [shared/react-query/README.md](../../../shared/react-query/README.md).

---

## Consistency after writes

Any create / update / delete (mutation, realtime, offline flush) should update **every read model that cares** about membership:

- Calendar month of old/new date
- General list (enter/leave undated non-quick)
- Home (quick slot, starred membership)

That is the job of `cache/synchronize-note-caches.ts`. Callers map their event
into a `NoteChange` and call the hub once — they do not scatter `setQueryData`
for Home in one place and calendar in another.

---

## Related

| Doc | Why |
| --- | --- |
| [domain-model.md](./domain-model.md) | Kinds and flags behind the filters |
| [caching.md](../../../docs/architecture/caching.md) | Why TanStack owns server state after hydrate |
| [RESPONSIBILITIES.md](../RESPONSIBILITIES.md) | `queries/`, `client/`, `hooks/`, `cache/`, and `hydration/` navigation |
