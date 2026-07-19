# Note entity — developer navigation

Paths are relative to `entities/note/`. The folders name technical
responsibilities, while `index.ts`, `server.ts`, and `client.ts` remain the
stable import surfaces for consumers.

## Public surfaces

- `index.ts` — domain/read-model types and pure month helpers for any layer
- `server.ts` — read use-cases, SSR cache seeders, write use-cases, conflict
  error, and authenticated-user lookup for RSC and route handlers
- `client.ts` — browser query configuration, read/mutation hooks, realtime hook,
  and public note/read-model types for `"use client"` consumers
- `editor/index.ts` — reusable note-form schema, state hook, UI, and display helpers

Prefer these surfaces outside the entity. Internal barrels such as
`repository/index.ts`, `cache/index.ts`, and `hooks/index.ts` keep imports stable
between responsibility groups without exposing every implementation globally.

## Model and contracts

- `model/types.ts` — domain `Note` and raw database `NoteRow`. Keeping the DB row
  beside the domain type makes the mapping boundary explicit without mixing
  prepared response payloads into persistence types.
- `model/read-models.ts` — `CalendarDay`, `CalendarNotesResponse`,
  `GeneralNotesResponse`, and `HomeNotesResponse`; these describe consumer-ready
  read payloads rather than database records.
- `schema/create-note.schema.ts` — Zod bodies for calendar/general creation and
  the shared create response; quick creation intentionally reuses the general
  body because both are undated form payloads.
- `schema/update-note.schema.ts` — PATCH body and response validation.
- `errors/note-date-conflict-error.ts` — `NoteDateConflictError`, including the
  conflicting note id used by date-collision handling.

## Pure helpers and transforms

- `lib/parse-month.ts` — `getCurrentMonth`, `parseMonthParam`, and
  `getMonthRange`; month parsing stays independent of storage and React.
- `transform/map-note-row.ts` — converts snake_case `NoteRow` persistence data
  to the domain `Note`.
- `transform/aggregate-month-notes.ts` — turns flat month notes into the
  UI-ready calendar-day grid and `CalendarNotesResponse`.
- `transform/index.ts` — public transform surface.

## Repository: Supabase data access

The repository is split by operation so server use-case policy does not collect
inside a monolithic CRUD file. Import repository functions through
`repository/index.ts`.

- `repository/get-authenticated-user-id.ts` — resolves the authenticated user id
- `repository/get-calendar-notes.ts` — reads one calendar month
- `repository/get-general-notes.ts` — reads undated, non-quick notes
- `repository/get-quick-note.ts` — reads the single quick-note slot
- `repository/get-starred-notes.ts` — reads recently edited starred, non-quick notes
- `repository/create-calendar-note.ts` — inserts a dated note
- `repository/create-general-note.ts` — inserts general and quick undated notes
- `repository/update-note.ts` — updates by id and handles calendar-date
  lookup/replacement operations
- `repository/delete-note.ts` — deletes by id

## Server reads

- `queries/get-calendar-notes-response.ts` — month input → repository read →
  calendar transform → API/SSR payload
- `queries/get-general-notes-response.ts` — general-notes payload
- `queries/get-home-notes-response.ts` — quick slot + starred carousel payload
  for `GET /api/notes/home`
- `queries/get-notes-page-initial-data.ts` — parallel calendar and general reads
  for `/notes` SSR
- `queries/index.ts` — server-read surface consumed by `server.ts`

These files own read orchestration; repository files only perform persistence
operations.

## Server writes

- `mutations/create-calendar-note.ts` — validates and performs lazy calendar creation
- `mutations/create-general-note.ts` — validates and performs lazy general creation
- `mutations/create-quick-note.ts` — validates and creates the Home quick slot
- `mutations/update-note.ts` — PATCH use-case, including date moves and same-day
  replacement policy
- `mutations/delete-note.ts` — hard-delete use-case
- `mutations/index.ts` — server-write surface consumed by `server.ts`

Validation belongs in `schema/`, domain failures in `errors/`, and Supabase
operations in `repository/`; `mutations/` coordinates those responsibilities.

## Browser queries and HTTP writes

- `client/query-keys.ts` — canonical calendar, general, and Home TanStack keys
- `client/calendar-notes-query.ts` — calendar fetcher + reusable query options
- `client/general-notes-query.ts` — general fetcher + reusable query options
- `client/home-notes-query.ts` — Home fetcher + reusable query options
- `client/prefetch-calendar-month.ts` — prefetches one month from its query options
- `client/prefetch-adjacent-calendar-months.ts` — warms previous/next months
- `client/post-note.ts` — calendar, general, and quick POST fetchers
- `client/patch-note.ts` — PATCH fetcher
- `client/delete-note.ts` — DELETE fetcher
- `client/index.ts` — browser request/configuration surface used by `client.ts`

Fetchers and options live together because both define how browser server state
is requested. React lifecycle and optimistic orchestration do not belong here.

## React hooks

- `hooks/use-calendar-notes-query.ts` — calendar read hook
- `hooks/use-general-notes-query.ts` — general read hook
- `hooks/use-home-notes-query.ts` — Home read hook
- `hooks/use-create-calendar-note-mutation.ts` — calendar create orchestration and cache update
- `hooks/use-create-general-note-mutation.ts` — general create orchestration and cache update
- `hooks/use-create-quick-note-mutation.ts` — quick-slot create orchestration and cache update
- `hooks/use-update-note-mutation.ts` — autosave, optimistic update/relocation,
  and rollback
- `hooks/use-delete-note-mutation.ts` — delete, optimistic removal, and rollback
- `hooks/use-notes-realtime-sync.ts` — Supabase subscription lifecycle
- `hooks/note-mutation-pending.ts` — in-flight note-id tracker used to suppress
  realtime echoes
- `hooks/index.ts` — React surface used by `client.ts`

## Cache policy and synchronization

- `cache/find-note-in-cache.ts` — locates notes by id or calendar date across
  TanStack read models
- `cache/note-cache-mutations.ts` — pure calendar/general/Home
  upsert/remove/relocate helpers and optimistic-note builders
- `cache/patch-note-in-cache.ts` — merges form values, patches owner payloads,
  and resolves the owner key
- `cache/synchronize-note-caches.ts` — source-agnostic `NoteChange` hub that
  keeps calendar, general, and Home memberships aligned
- `cache/apply-realtime-note-change.ts` — maps INSERT/UPDATE/DELETE events,
  applies pending/newer-wins gates, and delegates accepted changes to the hub
- `cache/index.ts` — cache surface used by mutation hooks, realtime, and offline
  reconciliation

Centralizing membership policy here is why HTTP writes, remote events, and
offline flushes do not each maintain divergent `setQueryData` logic.

## SSR hydration

- `hydration/seed-notes-page-cache.ts` — writes the SSR calendar and general
  payloads into a per-request `QueryClient`
- `hydration/seed-home-notes-cache.ts` — writes the SSR Home payload
- `hydration/index.ts` — seeder surface consumed by `server.ts`

Seeders only seed entity-owned keys. The route-level caller composes entities
and dehydrates once, avoiding duplicate repository requests and duplicated
hydration boundaries.

## Realtime

- `hooks/use-notes-realtime-sync.ts` owns the authenticated Supabase
  `postgres_changes` subscription and React cleanup.
- `cache/apply-realtime-note-change.ts` owns row mapping, mutation-echo
  suppression, `lastEditedAt` ordering, and cache application.
- `hooks/note-mutation-pending.ts` owns the in-flight mutation-id set.

The drawer form sync guard lives in `features/notes/note-drawer/model/`, outside
this entity, because it decides whether a particular editor may adopt an
already-updated cache value.

## Offline

- `offline/notes-offline-storage.ts` — note queue keys/payloads, pending-write
  storage, and sync adapter
- `offline/note-change-from-offline.ts` — converts a successful flush into the
  same normalized `NoteChange` consumed by the cache hub
- `offline/index.ts` — offline adapter surface

Offline transport is separate from cache policy; successful replay rejoins the
normal synchronization path instead of inventing a fourth read model.

## Home read model

Home combines one quick note (`is_quick = true`) with starred non-quick notes.
The UI lives in `views/home/`; the entity owns the response, request, hooks, and
cross-cache consistency:

- `model/read-models.ts` — `HomeNotesResponse`
- `repository/get-quick-note.ts`, `repository/get-starred-notes.ts` — persistence reads
- `queries/get-home-notes-response.ts` — server composition
- `client/home-notes-query.ts` — fetcher and options
- `hooks/use-home-notes-query.ts` — React query hook
- `hydration/seed-home-notes-cache.ts` — SSR seed
- `cache/note-cache-mutations.ts`, `cache/synchronize-note-caches.ts` — Home
  membership updates after local, remote, or offline changes

## Editor form

- `editor/model/note-form.schema.ts` — Zod form values
- `editor/model/types.ts` — form props, values, save status, and `remoteSyncKey`
- `editor/model/use-note-form.ts` — local fields, dirty/valid state, and resets
- `editor/ui/` — form composition, title/content rows, toggles, date picker, and
  last-saved label
- `editor/lib/` — date/title formatting, status/style configuration, and shared
  classes

The entity editor owns reusable fields and local form behavior. Drawer opening,
note resolution, navigation, and save routing remain feature responsibilities.

## Quick lookup

| I need to… | Start here |
| ---------- | ---------- |
| Change domain or DB-row types | `model/types.ts` |
| Change a response payload | `model/read-models.ts`, then `queries/*` |
| Change write validation | `schema/create-note.schema.ts`, `schema/update-note.schema.ts` |
| Change date-conflict behavior | `mutations/update-note.ts`, `errors/note-date-conflict-error.ts` |
| Fix month parsing / bounds | `lib/parse-month.ts` |
| Change DB reads or writes | the matching split file in `repository/` |
| Change DB-row mapping | `transform/map-note-row.ts` |
| Change the calendar day grid | `transform/aggregate-month-notes.ts` |
| Change a GET use-case | the matching file in `queries/` |
| Change PATCH/POST/DELETE server policy | the matching file in `mutations/` |
| Change query keys | `client/query-keys.ts` |
| Change browser fetch/options | `client/*-notes-query.ts` |
| Change POST/PATCH/DELETE transport | `client/post-note.ts`, `patch-note.ts`, `delete-note.ts` |
| Change a React read hook | `hooks/use-*-notes-query.ts` |
| Fix optimistic create/update/delete | the matching mutation hook plus `cache/` |
| Fix calendar/general/Home cross-cache drift | `cache/synchronize-note-caches.ts`, `cache/note-cache-mutations.ts` |
| Fix home strip loading | `queries/get-home-notes-response.ts`, `client/home-notes-query.ts`, `hooks/use-home-notes-query.ts` |
| Fix Home becoming stale after edits | `cache/synchronize-note-caches.ts`, `cache/note-cache-mutations.ts` |
| Fix SSR cache population | `hydration/seed-notes-page-cache.ts`, `seed-home-notes-cache.ts` |
| Fix month prefetch | `client/prefetch-calendar-month.ts`, `prefetch-adjacent-calendar-months.ts` |
| Fix realtime subscription lifecycle | `hooks/use-notes-realtime-sync.ts` |
| Fix realtime event application | `cache/apply-realtime-note-change.ts` |
| Fix local-write realtime echoes | `hooks/note-mutation-pending.ts` and the mutation hooks |
| Fix offline replay reconciliation | `offline/note-change-from-offline.ts`, `cache/synchronize-note-caches.ts` |
| Fix remote overwrite while typing | `features/notes/note-drawer/model/note-editor-sync-guard.ts` |
| Change form fields / validation | `editor/model/*`, `editor/ui/*` |
| Wire drawer save routing | `features/notes/note-drawer/pre-save-orchestrator/` |
