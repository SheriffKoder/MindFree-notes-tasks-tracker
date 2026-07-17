# Note entity — where to look

Short map by business responsibility. Paths are relative to `entities/note/`.

---

## Entry points

`index.ts` — domain types + pure month helpers (any layer)  
`server.ts` — server reads, SSR cache seeders, write use-cases (API routes, RSC); exports `getHomeNotesResponse`, `seedHomeNotesCache`  
`client.ts` — TanStack keys, fetchers, hooks, mutations, realtime (client only); exports `useHomeNotesQuery`, `homeNotesQueryKey`  
`editor/index.ts` — form schema, hook, UI exports

---

## Domain model

`model/types.ts` — `Note`, `NoteRow`, `CalendarDay`, `CalendarNotesResponse`, `GeneralNotesResponse`, `HomeNotesResponse`

---

## Pure helpers

`lib/parse-month.ts` — `getCurrentMonth`, `parseMonthParam`, `getMonthRange`  
`lib/map-note-row.ts` — Supabase row → domain `Note`  
`lib/find-note-in-cache.ts` — `findNoteByIdInCache`, `findNoteOnDateInCache` from TanStack cache

---

## Persistence

`repository/note-repository.ts` — Supabase CRUD, month/general reads, `getQuickNote`, `getStarredNotes`, `findCalendarNoteByDate`, `replaceNoteOnDate`

---

## Domain shaping

`transform/aggregate-month-notes.ts` — flat `Note[]` → `CalendarDay[]` + `CalendarNotesResponse`

---

## Server reads

`queries/get-calendar-notes-response.ts` — month param → repo → transform → API/SSR payload  
`queries/get-general-notes-response.ts` — general notes list payload  
`queries/get-home-notes-response.ts` — quick note slot + starred carousel for Home (`GET /api/notes/home`)  
`queries/get-notes-page-initial-data.ts` — parallel calendar + general for `/notes` SSR

---

## Server writes

`mutations/update-note.ts` — PATCH use-case, date move, same-day replace  
`mutations/create-calendar-note.ts` — lazy calendar POST use-case  
`mutations/create-general-note.ts` — lazy general POST use-case  
`mutations/delete-note.ts` — hard delete use-case  
`mutations/update-note.schema.ts` — PATCH body/response Zod  
`mutations/create-note.schema.ts` — calendar/general POST Zod  
`mutations/note-date-conflict-error.ts` — 409 error with `conflictingNoteId`

---

## Client API fetchers

`mutations/patch-note.ts` — `fetchPatchNote` → PATCH `/api/notes/:id`  
`mutations/post-note.ts` — `fetchPostCalendarNote`, `fetchPostGeneralNote`  
`mutations/delete-note-client.ts` — `fetchDeleteNote` → DELETE `/api/notes/:id`

---

## Cache updates (pure)

`mutations/note-cache-mutations.ts` — upsert/remove calendar & general rows, `relocateNoteInCache`, optimistic calendar build  
`mutations/patch-note-in-cache.ts` — merge form values into one cached row, `resolveOwningQueryKey`

---

## TanStack read cache

`tanstack/query-keys.ts` — `calendarNotesQueryKey`, `generalNotesQueryKey`, `homeNotesQueryKey`  
`tanstack/calendar-notes-query.ts` — fetcher, options, `useCalendarNotesQuery`  
`tanstack/general-notes-query.ts` — fetcher, options, `useGeneralNotesQuery`  
`tanstack/home-notes-query.ts` — fetcher, options, `useHomeNotesQuery` (`["homeNotes"]`)

---

## TanStack write mutations

`tanstack/use-update-note-mutation.ts` — PATCH autosave, optimistic patch/relocate, rollback  
`tanstack/use-create-calendar-note-mutation.ts` — lazy calendar create + month cache upsert  
`tanstack/use-create-general-note-mutation.ts` — lazy general create + list cache upsert  
`tanstack/use-delete-note-mutation.ts` — delete + cache removal, rollback

---

## Prefetch & SSR hydrate

`tanstack/seed-notes-page-cache.ts` — `seedNotesPageCache(qc, data)`: write `/notes` caches from SSR (void; caller dehydrates)  
`tanstack/seed-home-notes-cache.ts` — `seedHomeNotesCache(qc, data)`: write `["homeNotes"]` from `/` SSR (void; caller dehydrates)  
`tanstack/prefetch-calendar-month.ts` — prefetch one month  
`tanstack/prefetch-adjacent-calendar-months.ts` — prefetch prev/next month

---

## Realtime

`tanstack/use-notes-realtime-sync.ts` — Supabase `postgres_changes` subscription on `mf_notes`  
`tanstack/apply-realtime-note-change.ts` — INSERT/UPDATE/DELETE → cache helpers, `last_edited_at` gate, date relocate  
`tanstack/note-mutation-pending.ts` — in-flight mutation ids; realtime skips echo

Drawer form sync guard lives in `features/notes/note-drawer/model/` — not this entity.

---

## Home read model

Quick note (`is_quick = true`) + starred carousel (`starred = true`, `is_quick = false`). Home UI lives in `views/home/`; entity owns fetch + cache only.

`queries/get-home-notes-response.ts` — parallel `getQuickNote` + `getStarredNotes` → `HomeNotesResponse`  
`repository/note-repository.ts` — `getQuickNote`, `getStarredNotes` (cap 20, `last_edited_at DESC`)  
`tanstack/home-notes-query.ts` — `fetchHomeNotes`, `useHomeNotesQuery`  
`tanstack/seed-home-notes-cache.ts` — SSR seed for `homeNotesQueryKey`  
`app/api/notes/home/route.ts` — `GET` route (outside entity; calls `getHomeNotesResponse`)  
`app/(app)/home-hydration-seed.tsx` — Home route SSR boundary (outside entity)

Step 2+ (pending): home cache patches in mutations/realtime — see `app/development/workflow/home/notes-strip.md`.

---

## Editor form

### Contracts & validation

`editor/model/note-form.schema.ts` — Zod for title, content, starred, isImportant  
`editor/model/types.ts` — `NoteFormValues`, `NoteFormProps`, save status, `remoteSyncKey`

### State

`editor/model/use-note-form.ts` — local fields, dirty/valid meta, reset on `resetKey`/`remoteSyncKey`

### UI

`editor/ui/note-form.tsx` — composes title + content rows  
`editor/ui/note-form-title-row.tsx` — title input + toggle row  
`editor/ui/note-form-toggle-buttons.tsx` — star, important, date-picker trigger  
`editor/ui/note-date-picker-trigger.tsx` — native date input, forwards ISO pick  
`editor/ui/note-form-content-row.tsx` — description textarea  
`editor/ui/note-form-last-saved.tsx` — last-edited / save-status label

### Display helpers

`editor/lib/format-last-edited.ts` — footer timestamp formatting  
`editor/lib/format-calendar-note-title.ts` — formatted date title, date-binding check  
`editor/lib/note-form-style-config.ts` — toggle/status color tokens  
`editor/lib/note-form-classes.ts` — shared Tailwind classes

---

## Quick lookup

| I need to… | Start here |
| ---------- | ---------- |
| Change note types | `model/types.ts` |
| Fix month parsing / bounds | `lib/parse-month.ts` |
| Change DB queries | `repository/note-repository.ts` |
| Change calendar day grid shape | `transform/aggregate-month-notes.ts` |
| Change GET API payload | `queries/*` |
| Change PATCH/POST/DELETE server logic | `mutations/update-note.ts`, `create-*`, `delete-note.ts` |
| Change autosave fetch | `mutations/patch-note.ts` |
| Fix optimistic UI after save | `mutations/note-cache-mutations.ts`, `patch-note-in-cache.ts` |
| Fix list/calendar not updating | `tanstack/calendar-notes-query.ts`, `general-notes-query.ts` |
| Fix home strip not loading | `queries/get-home-notes-response.ts`, `tanstack/home-notes-query.ts` |
| Fix home strip stale after edit | `mutations/note-cache-mutations.ts` (Step 3), `apply-realtime-note-change.ts` |
| Fix realtime sync | `tanstack/use-notes-realtime-sync.ts`, `apply-realtime-note-change.ts` |
| Fix remote overwrite while typing | `features/notes/note-drawer/model/note-editor-sync-guard.ts` |
| Change form fields / validation | `editor/model/*`, `editor/ui/*` |
| Wire drawer save routing | `features/notes/note-drawer/pre-save-orchestrator/` |
