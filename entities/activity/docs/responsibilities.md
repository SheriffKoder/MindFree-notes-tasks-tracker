# Activity entity — where to look

File map by responsibility. Paths are relative to `entities/activity/` unless
noted. For the *why* behind these, see the WHY docs in this folder
([README.md](./README.md)).

---

## Entry points

`index.ts` — domain types + pure helpers (any layer)
`server.ts` — server reads, SSR hydrate, write use-cases, `getAuthenticatedUserId` (API routes, RSC)
`client.ts` — TanStack keys, fetchers, read hooks, mutation hooks (client only)
`editor/index.ts` — form schema types, `useActivityForm`, `ActivityForm`, `ScheduleInput`

---

## Domain model

`model/types.ts` — `Activity`, `ActivityRecord`, row types, `ActivityKind`, `TrackingMode`, `ScheduleType`, `ScheduleConfig`, `ActivityStatus`, `WEEKDAYS`
`model/read-models.ts` — `ActivitiesResponse`, `ActivityRecordsResponse`, `TaskCalendarDay`, `TasksPageData`

---

## Validation

`schema/activity-form.schema.ts` — base editable fields, enum/config validators, `addScheduleConfigIssues`, `addWindowIssues`
`schema/create-activity.schema.ts` — POST body (`+ kind`) + response
`schema/update-activity.schema.ts` — PATCH body (partial `+ archivedAt`) + response

---

## Pure helpers (`lib/`)

`lib/month/parse-month.ts` — `getCurrentMonth`, `parseMonthParam`, `getMonthRange`
`lib/schedule/date-parts.ts` — `getScheduleDateParts` (UTC weekday / day-of-month / `DD/MM`)
`lib/schedule/matches-recurrence.ts` — `matchesRecurrence` (pattern only, no window)
`lib/schedule/resolve-schedule.ts` — `isActiveOnDay`, `isActiveInMonth` (window + recurrence)
`lib/schedule/activity-status.ts` — `getActivityStatus` (archived → upcoming → expired → active)
`lib/record/is-meaningful-record.ts` — `isMeaningfulRecord` (done per tracking mode)
`lib/record/build-record-lookup.ts` — `recordKey`, `buildRecordLookup` (`byTaskDate` / `byTaskId`)
`lib/mapping/map-row.ts` — `mapActivityRow`, `mapActivityRecordRow` (row → domain; repository-only)
`lib/is-remote-activity-newer.ts` — `isRemoteActivityNewer` (newer-wins `updatedAt` gate)

---

## Domain shaping (`transform/`)

`transform/aggregate-month-records.ts` — flat records → sorted `ActivityRecordsResponse`
`transform/build-calendar-days.ts` — definitions + lookup → `TaskCalendarDay[]` (records always; schedule adds empty due slots)
`transform/compute-task-month-progress.ts` — one completion `Map<taskId, percent>` per month

---

## Persistence (`repository/`, RLS-scoped)

`repository/get-authenticated-user-id.ts` — resolve the current user for RLS
`repository/get-activities.ts` — definitions for a kind
`repository/get-records-for-month.ts` — a month's records
`repository/create-activity.ts` — insert a definition
`repository/update-activity.ts` — `updateActivityById` (edit / archive / restore), `archiveActivityById`
`repository/delete-activity.ts` — `deleteActivityById`

---

## Server reads (`queries/`)

`queries/get-activities-response.ts` — definitions payload
`queries/get-activity-records-response.ts` — month records payload
`queries/get-tasks-page-initial-data.ts` — parallel definitions + current-month records for `/tasks` SSR

---

## Server writes (`mutations/`)

`mutations/create-activity.ts` — parse `createActivityBodySchema` → repo create
`mutations/update-activity.ts` — parse `updateActivityBodySchema` → repo update
`mutations/archive-activity.ts` — archive/restore via `archivedAt`
`mutations/delete-activity.ts` — hard delete (404 when missing)

API routes (outside entity): `app/api/activities/route.ts` (GET/POST), `app/api/activities/[id]/route.ts` (PATCH/DELETE).

---

## Client fetchers + cache (`client/`)

`client/query-keys.ts` — `activitiesQueryKey(kind)`, `activityRecordsQueryKey(month)`
`client/activities-query.ts` — `fetchActivities`, `activitiesQueryOptions`
`client/activity-records-query.ts` — `fetchActivityRecords`, `activityRecordsQueryOptions`
`client/post-activity.ts` / `patch-activity.ts` / `delete-activity.ts` — write fetchers
`client/seed-activity-caches.ts` — `seedActivityCaches(qc, data)`: write both caches from SSR (void; caller dehydrates)

---

## Cache updates (`cache/`, pure + hub)

`cache/activity-cache-mutations.ts` — `upsertActivityInCache`, `removeActivityFromCache`
`cache/purge-activity-records-in-cache.ts` — drop one task's records from a month bucket
`cache/find-activity-in-cache.ts` — `findActivityByIdInCache`
`cache/synchronize-activity-caches.ts` — the `ActivityChange` fan-out hub (single write entry point)

---

## Read hooks + mutations (`hooks/`)

`hooks/use-activities-query.ts` — `useActivitiesQuery(kind)`
`hooks/use-activity-records-query.ts` — `useActivityRecordsQuery(month)`
`hooks/use-create-activity-mutation.ts` — create + optimistic upsert + rollback
`hooks/use-update-activity-mutation.ts` — patch autosave + optimistic + newer-wins
`hooks/use-archive-activity-mutation.ts` — `useArchiveActivityMutation`, `useRestoreActivityMutation`
`hooks/use-delete-activity-mutation.ts` — delete + cache removal + record purge
`hooks/activity-mutation-pending.ts` — in-flight ids (realtime echo skip, Phase 5)

---

## Editor form (`editor/`)

### Contracts & state

`editor/model/types.ts` — `ActivityFormValues`, change/footer meta, form/hook props
`editor/model/use-activity-form.ts` — local fields, dirty/valid meta, reset on `resetKey`/`commitKey`

### UI

`editor/activity-form.tsx` — composes sections, rows, status banner
`editor/activity-form-status-banner.tsx` — upcoming/expired banner via `getActivityStatus`
`editor/activity-form-last-saved.tsx` — last-edited / save-status label
`editor/fields/*` — section + field-row primitives; title (with actions), color, goal, tracking-mode, schedule, window rows
`editor/schedule-input/*` — `ScheduleInput` orchestrator + per-type controls (once date, weekday, day-of-month, day/month pickers)

### Display helpers

`editor/lib/default-schedule-config.ts` — seed config when `scheduleType` changes
`editor/lib/format-last-edited.ts` — footer timestamp formatting
`editor/lib/format-schedule-summary.ts` — human-readable schedule summary
`editor/lib/form-labels.ts` — field labels / option lists
`editor/lib/form-classes.ts` — shared Tailwind + menu z-index classes
`editor/lib/toggle-chip-value.ts` — add/remove a value from a chip array

---

## Quick lookup

| I need to… | Start here |
| ---------- | ---------- |
| Change activity fields / kinds | `model/types.ts` |
| Fix month parsing / bounds | `lib/month/parse-month.ts` |
| Change what "due today" means | `lib/schedule/resolve-schedule.ts`, `matches-recurrence.ts` |
| Change lifecycle status rules | `lib/schedule/activity-status.ts` |
| Change what counts as "done" | `lib/record/is-meaningful-record.ts` |
| Change calendar day shape | `transform/build-calendar-days.ts` |
| Change completion-% math | `transform/compute-task-month-progress.ts` |
| Change DB queries | `repository/*` |
| Change GET/POST/PATCH/DELETE server logic | `queries/*`, `mutations/*` |
| Fix optimistic UI after save | `cache/synchronize-activity-caches.ts`, `activity-cache-mutations.ts` |
| Fix list/calendar not updating | `hooks/use-activities-query.ts`, `use-activity-records-query.ts` |
| Change autosave decision | `features/activity/activity-drawer/pre-save-orchestrator/evaluate-activity-save.ts` |
| Wire drawer save routing | `features/activity/activity-drawer/model/use-config-orchestrator.ts` |
| Change form fields / validation | `editor/model/*`, `editor/fields/*`, `schema/activity-form.schema.ts` |
| Change schedule inputs | `editor/schedule-input/*` |
