# Note entity (`entities/note`)

Business logic for calendar, general, and quick notes. Use the correct entry point for your runtime — not every file imports from the same barrel.

## Entry points

| File | Use in | Exports |
| ---- | ------ | ------- |
| `index.ts` | Any layer | Domain types, pure month helpers |
| `server.ts` | Server Components, API routes, server actions | Repository-backed reads, SSR hydration |
| `client.ts` | `"use client"` modules | TanStack Query keys, fetchers, hooks |

## Folder layout

```text
entities/note/
├── index.ts                 # Types + pure helpers
├── server.ts                # Server read API
├── client.ts                # TanStack Query API
├── README.md
├── model/                   # Types and contracts
├── lib/                     # Pure helpers (no I/O)
├── repository/              # Supabase reads/writes
├── transform/               # Domain shaping after fetch
├── queries/                 # Server read use-cases
├── tanstack/                # Client cache layer (keys, fetchers, hooks, hydrate)
└── editor/                  # Note form (schema, hook, UI)
```

## Dependency direction

```text
model/types  ←  lib  ←  transform  ←  repository
                      ↑
              queries/ (server)  →  server.ts  →  page + API routes
              tanstack/ (client) →  client.ts  →  views + drawer
```

- Lower layers never import from `queries/` or `tanstack/`.
- `app/api/notes/*/route.ts` stays thin: auth check → one server export → JSON response.
- Auth guards live in `shared/lib/auth/`, not in this entity.

## Files

### `index.ts`

Shared domain exports: `Note`, `CalendarNotesResponse`, `GeneralNotesResponse`, `CalendarDay`, and `parseMonthParam` / `getMonthRange` / `getCurrentMonth`.

### `server.ts`

Server-side reads and SSR cache seeding:

- `getCalendarNotesResponse`
- `getGeneralNotesResponse`
- `getNotesPageInitialData`
- `hydrateNotesPageQueries`

### `client.ts`

Client-side TanStack Query surface:

- `calendarNotesQueryKey`, `generalNotesQueryKey`
- `fetchCalendarNotes`, `fetchGeneralNotes`
- `calendarNotesQueryOptions`, `generalNotesQueryOptions`
- `useCalendarNotesQuery`, `useGeneralNotesQuery`

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

### `tanstack/query-keys.ts`

TanStack Query key factories: `calendarNotesQueryKey(month)` → `["calendarNotes", month]`, `generalNotesQueryKey` → `["generalNotes"]`.

### `tanstack/calendar-notes-query.ts`

Client read cache for calendar notes: API fetcher, `calendarNotesQueryOptions`, and `useCalendarNotesQuery(month)`.

### `tanstack/general-notes-query.ts`

Client read cache for general notes: API fetcher, `generalNotesQueryOptions`, and `useGeneralNotesQuery()`.

### `tanstack/hydrate-notes-page-queries.ts`

Seeds a `QueryClient` from SSR payloads (`setQueryData`) and returns `dehydrate()` output. Exported via `server.ts` because it runs on the server page.

### `tanstack/prefetch-calendar-month.ts`

Prefetches one month into `["calendarNotes", month]` via `queryClient.prefetchQuery`.

### `tanstack/prefetch-adjacent-calendar-months.ts`

Prefetches `shiftMonth(month, ±1)` — used by the notes page after the active month loads; reused by `features/notes/note-drawer` for drawer month-boundary navigation.

### `editor/`

Reusable **note editor form** — the controlled input surface for editing a single note. Import from `@/entities/note/editor` in client components.

**The entity editor is responsible for:**

| Concern | Location |
| ------- | -------- |
| Field schema and validation (`title`, `content`, `starred`, `isImportant`) | `model/note-form.schema.ts` |
| Form contracts (`NoteFormProps`, `NoteFormValues`, save status types) | `model/types.ts` |
| Local field state, dirty tracking, validation errors | `model/use-note-form.ts` |
| Form UI (title row, toggles, scrollable content, last-saved label) | `ui/*` |
| Display helpers (last-edited formatting, toggle color tokens, layout classes) | `lib/*` |

**The entity editor is not responsible for:**

- Drawer shell, open/close, or *which* note to show
- TanStack cache lookup or date navigation
- Autosave / create mutations (Step 9–10 — see `mutations/` and `features/notes/note-drawer`)
- Page URL state or calendar highlight

Think of `editor/` as a **dumb, reusable form**: pass it a `Note | null`, it renders fields and reports changes. It does not know about the drawer, the page, or the cache.

| File | Role |
| ---- | ---- |
| `model/note-form.schema.ts` | Zod validation for title, content, starred, isImportant |
| `model/types.ts` | `NoteFormValues`, `NoteFormProps`, `NoteSaveStatus`, `NoteFormFooterMeta` |
| `model/use-note-form.ts` | Local field state, dirty tracking, validation |
| `ui/note-form.tsx` | Composes title row + content row |
| `ui/note-form-title-row.tsx` | Plain title input + star/important toggles |
| `ui/note-form-content-row.tsx` | Scrollable description textarea |
| `ui/note-form-last-saved.tsx` | Last-edited / save-status label (overlay or inline) |
| `lib/format-last-edited.ts` | Footer timestamp formatting |
| `lib/note-form-style-config.ts` | Toggle and status color tokens |
| `lib/note-form-classes.ts` | Shared Tailwind class tokens |
| `index.ts` | Public editor exports |

**Paired feature:** drawer orchestration lives in `features/notes/note-drawer/` — see that README for how the form is wired inside the drawer island.

## Editor vs drawer — where does code go?

```text
views/notes/model/editor/     Page-level drawer intent (open/close, NoteEditorRequest)
        ↓ passes drawer state
features/notes/note-drawer/   Drawer island (shell, cache lookup, date nav, footer)
        ↓ passes Note | null
entities/note/editor/         Reusable form (fields, validation, local state)
```

| Question | Put it in |
| -------- | --------- |
| "How do I validate the title field?" | `entities/note/editor` |
| "How do I render star / important toggles?" | `entities/note/editor` |
| "How do I resolve the note for the active drawer date?" | `features/notes/note-drawer` |
| "How do I swipe between calendar days in the drawer?" | `features/notes/note-drawer` |
| "How do I open the drawer from a calendar cell click?" | `views/notes` (`useNotesDrawer`) |
| "How do I PATCH autosave?" | `entities/note/mutations/` (Step 9) + wire in `features/notes/note-drawer` |

## Consumers

| Consumer | Imports |
| -------- | ------- |
| `app/(app)/notes/page.tsx` | `entities/note/server` |
| `app/api/notes/calendar/route.ts` | `entities/note/server` |
| `app/api/notes/general/route.ts` | `entities/note/server` |
| `views/notes/*` (client) | `entities/note/client` |
| `features/notes/note-drawer` | `entities/note/client`, `entities/note/editor` |
| Features, cards, types | `entities/note` (types) |

## Future additions (Steps 9–10)

```text
entities/note/
└── mutations/               # PATCH, create, toggle star/important
    ├── update-note.ts
    └── create-calendar-note.ts
```

Add new write operations under `mutations/`; keep `queries/` for server reads and `tanstack/` for client cache.
