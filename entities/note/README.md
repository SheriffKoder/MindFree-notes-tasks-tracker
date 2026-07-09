# Note entity (`entities/note`)

Business logic for calendar, general, and quick notes. Other layers import from `entities/note/index.ts` only — not from internal folders directly.

## Folder layout

```text
entities/note/
├── index.ts                 # Public API (what pages, API routes, and features import)
├── README.md
├── model/                   # Types and contracts
├── lib/                     # Pure helpers (no I/O)
├── repository/              # Supabase reads/writes
├── transform/               # Domain shaping after fetch
├── queries/                 # Read use-cases (page + API entry points)
└── editor/                  # Note form (Step 7 — not yet added)
```

## Dependency direction

```text
model/types  ←  lib  ←  transform  ←  repository
                      ↑
                   queries  →  consumed by app/(app)/notes/page.tsx and app/api/notes/*
```

- Lower layers never import from `queries/`.
- `app/api/notes/*/route.ts` stays thin: auth check → one query function → JSON response.
- Auth guards live in `shared/lib/auth/`, not in this entity.

## Files

### `index.ts`

Public barrel export. Exposes query functions, month helpers, and domain types. Does **not** export repository or transform internals.

### `model/types.ts`

Domain and API response shapes: `Note`, `CalendarDay`, `CalendarNotesResponse`, `GeneralNotesResponse`, and the raw `NoteRow` DB type. No logic — contracts only.

### `lib/parse-month.ts`

Pure month utilities: `getCurrentMonth`, `parseMonthParam`, `getMonthRange`. Used by repository (SQL bounds), transform (day count), queries, and later the month navigator.

### `lib/map-note-row.ts`

Maps a Supabase `NoteRow` (snake_case) to a domain `Note` (camelCase). Used by the repository after every select.

### `repository/note-repository.ts`

Persistence layer. Talks to `mf_notes` via Supabase; scoped to the authenticated user by RLS. Returns `Note[]` — no HTTP, no aggregation.

| Function | Filter |
| -------- | ------ |
| `getCalendarNotesForMonth(month)` | `date` in month range, `date IS NOT NULL` |
| `getGeneralNotes()` | `date IS NULL AND is_quick = false` |

### `transform/aggregate-month-notes.ts`

Business shaping after data is fetched. Turns a flat `Note[]` into calendar-ready structures.

| Function | Output |
| -------- | ------ |
| `aggregateMonthNotes(month, notes)` | `CalendarDay[]` — one entry per day, note or `null` |
| `buildCalendarNotesResponse(month, notes)` | Full `CalendarNotesResponse` including `monthNotes` |

### `queries/get-calendar-notes-response.ts`

Read use-case for `GET /api/notes/calendar`. Parses month param → repository fetch → transform. Shared by the API route and SSR.

### `queries/get-general-notes-response.ts`

Read use-case for `GET /api/notes/general`. Repository fetch wrapped in `GeneralNotesResponse`.

### `queries/get-notes-page-initial-data.ts`

SSR orchestration for `/notes`. Fetches calendar + general payloads in parallel. Used by `app/(app)/notes/page.tsx`.

## Consumers

| Consumer | Imports |
| -------- | ------- |
| `app/(app)/notes/page.tsx` | `getNotesPageInitialData` |
| `app/api/notes/calendar/route.ts` | `getCalendarNotesResponse` + `requireAuthenticatedUserId` |
| `app/api/notes/general/route.ts` | `getGeneralNotesResponse` + `requireAuthenticatedUserId` |
| `views/notes/*` | Types only (`Note`, `CalendarNotesResponse`, …) |

## Future additions (Steps 7–10)

```text
entities/note/
├── mutations/               # PATCH, create, toggle star/important
│   ├── update-note.ts
│   └── create-calendar-note.ts
└── editor/                  # Form schema + UI
    ├── model/
    └── ui/
```

Add new write operations under `mutations/`; keep `queries/` for reads only.
