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

`model/types.ts` — `Activity`, `ActivityRecord`, row types, `ActivityKind`,
`TrackingMode`, `GoalPeriod`, `ActivityPriority`, `ScheduleType`,
`ScheduleConfig`, `ActivityStatus`, `WEEKDAYS`
`model/read-models.ts` — `ActivitiesResponse`, `ActivityRecordsResponse`,
`TaskCalendarDay`, `ActivityPageData`, `HomeActivityData`, `TasksPageData`
(deprecated alias), `TodayActivity`, `TodayProgress`, `TodayProgressDimension`
`model/progress-read-models.ts` — Progress page server contract
(`ProgressPageData`, `ProgressTask`, week/month/all-time windows, metric values)

---

## Validation

`schema/activity-form.schema.ts` — base editable fields, enum/config validators, `addScheduleConfigIssues`, `addWindowIssues`
`schema/create-activity.schema.ts` — POST body (`+ kind`) + response
`schema/update-activity.schema.ts` — PATCH body (partial `+ archivedAt`) + response
`schema/record/upsert-activity-record.schema.ts` — natural-key record upsert body + response

New record write files use an asymmetric `record/` subfolder inside each layer;
existing definition and read files remain flat. Layer barrels re-export the
record surface so consumers never deep-import these implementation paths.

---

## Pure helpers (`lib/`)

`lib/month/parse-month.ts` — `getCurrentMonth`, `parseMonthParam`, `getMonthRange`
`lib/schedule/date-parts.ts` — `getScheduleDateParts` (UTC weekday / day-of-month / `DD/MM`)
`lib/schedule/matches-recurrence.ts` — `matchesRecurrence` (pattern only, no window)
`lib/schedule/resolve-schedule.ts` — `isActiveOnDay`, `isActiveInMonth`,
`isWithinValidityWindow`, `overlapsValidityWindow` (window + recurrence)
`lib/schedule/activity-status.ts` — `getActivityStatus` (archived → upcoming → expired → active)
`lib/record/is-meaningful-record.ts` — `isMeaningfulRecord` (done per tracking mode)
`lib/record/resolve-record-configuration.ts` — snapshot vs current activity configuration
`lib/record/build-record-lookup.ts` — `recordKey`, `buildRecordLookup` (`byTaskDate` / `byTaskId`)
`lib/record/derive-today-progress.ts` — per-dimension goal-aware value / remaining / percent / `done`
`lib/record/is-remote-record-newer.ts` — record newer-wins `updatedAt` gate
`lib/today/build-today-activities.ts` — definitions + today's lookup → `TodayActivity[]`
`lib/definition/normalize-activity-definition.ts` — canonical task goals and
enforced reminder fields (`boolean`, no color/day goals/period goals/priority)
`lib/mapping/map-row.ts` — `mapActivityRow`, `mapActivityRecordRow` (incl. record
snapshots, `goalDuration`, period-goal fields, `priority`, `icon`)
`lib/is-remote-activity-newer.ts` — `isRemoteActivityNewer` (newer-wins `updatedAt` gate)

### Progress calculation (`lib/progress/`)

Pure server-side report math — not TanStack, not calendar-pill %. WHY:
[progress.md](./progress.md). Two axes: due-day (Option B) when
`goalPeriod === null`; period-goal when set.

`lib/progress/tracking-mode-metrics.ts` — tracking mode → semantic metric
families (`periodGoal: true` maps `boolean` → `count`)
`lib/progress/accumulate-record-metrics.ts` — window accumulators, finalize,
combine percents, all-time finalize; also `seedPrimaryGoal` /
`addUnconditionalPrimaryActual` for period seeding
`lib/progress/accumulate-period-goal-metrics.ts` — week available-days /
proration, `seedPeriodGoalsForActivity`, `accumulatePeriodRecordMetrics`
`lib/progress/build-task-progress.ts` — one `ProgressTask` (branches due-day vs
period-goal)
`lib/progress/build-progress-page-data.ts` — assemble `ProgressPageData` +
membership (period-goal tasks use validity-window overlap)
`lib/progress/index.ts` — barrel

Shared week ranges: `shared/week-grouping/lib/get-weeks-in-month.ts`.

---

## Domain shaping (`transform/`)

`transform/aggregate-month-records.ts` — flat records → sorted `ActivityRecordsResponse`
`transform/build-calendar-days.ts` — definitions + lookup → `TaskCalendarDay[]` (records always; schedule adds empty due slots)
`transform/compute-task-month-progress.ts` — calendar-pill completion
`Map<taskId, percent>` only (not the Progress page report)

---

## Persistence (`repository/`, RLS-scoped)

`repository/get-authenticated-user-id.ts` — resolve the current user for RLS
`repository/get-activities.ts` — definitions for a kind
`repository/get-records-for-month.ts` — a month's records
`repository/create-activity.ts` — insert a definition
`repository/update-activity.ts` — `updateActivityById` (edit / archive / restore), `archiveActivityById`
`repository/delete-activity.ts` — `deleteActivityById`
`repository/record/upsert-record.ts` — natural-key `(taskId, date)` upsert
`repository/record/delete-record.ts` — natural-key record delete
`repository/progress/get-all-time-task-record-values.ts` — minimal all-time
rows for Progress (`task_id`, snapshot mode, count, duration)
`repository/progress/index.ts` — Progress repository barrel

---

## Server reads (`queries/`)

`queries/get-activities-response.ts` — definitions payload
`queries/get-activity-records-response.ts` — month records payload
`queries/get-activity-page-initial-data.ts` — parallel definitions + current-month records for activity-page SSR (`kind`)
`queries/get-home-activity-initial-data.ts` — task definitions + reminder
definitions + one shared current-month records response for Home SSR
`queries/progress/get-progress-page-data.ts` — Progress SSR report assembly
`queries/progress/index.ts` — Progress queries barrel (`server.ts` re-exports)

---

## Server writes (`mutations/`)

`mutations/create-activity.ts` — parse `createActivityBodySchema` → repo create
`mutations/update-activity.ts` — parse `updateActivityBodySchema` → repo update
`mutations/archive-activity.ts` — archive/restore via `archivedAt`
`mutations/delete-activity.ts` — hard delete (404 when missing)
`mutations/record/upsert-activity-record.ts` — validate + upsert one daily aggregate
`mutations/record/delete-activity-record.ts` — validate natural key + delete

API routes (outside entity): `app/api/activities/route.ts` (GET/POST),
`app/api/activities/[id]/route.ts` (PATCH/DELETE), and
`app/api/activity-records/route.ts` (GET/POST/DELETE).

---

## Client requests (`client/`)

`client/query-keys.ts` — `activitiesQueryKey(kind)`, `activityRecordsQueryKey(month)`
`client/activities-query.ts` — `fetchActivities`, `activitiesQueryOptions`
`client/activity-records-query.ts` — `fetchActivityRecords`, `activityRecordsQueryOptions`
`client/post-activity.ts` / `patch-activity.ts` / `delete-activity.ts` — write fetchers
`client/record/activity-records-mutation.ts` — POST upsert + DELETE record fetchers

---

## SSR cache seeding (`hydration/`)

`hydration/seed-activity-caches.ts` —
- `seedActivityCaches(qc, data)`: one kind's definitions + month records (Tasks /
  Reminders pages)
- `seedHomeActivityCaches(qc, data)`: both definition kinds + **one** month
  records bucket (Home)

`queries/get-activity-page-initial-data.ts` — kind-scoped page SSR payload
`queries/get-home-activity-initial-data.ts` — Home SSR payload (tasks +
reminders + one records fetch)

---

## Cache updates (`cache/`, pure + hub)

`cache/activity-cache-mutations.ts` — `upsertActivityInCache`, `removeActivityFromCache`
`cache/record/upsert-record-in-cache.ts` — upsert one record in its flat month
`cache/record/remove-record-from-cache.ts` — remove by `(taskId, date)`
`cache/record/record-month-key.ts` — derive `YYYY-MM` from a record date
`cache/purge-activity-records-in-cache.ts` — drop one task's records from a month bucket
`cache/find-activity-in-cache.ts` — `findActivityByIdInCache`, `findActivityInEitherKind`
`cache/find-record-in-cache.ts` — `findRecordInCache`, `findRecordByIdInCache`, `hasRecordMonthCache`
`cache/apply-realtime-activity-change.ts` — `mf_task` event → gated hub call
`cache/apply-realtime-activity-record-change.ts` — `mf_task_record` → gated hub
`cache/synchronize-activity-caches.ts` — definition + record `ActivityChange` fan-out hub

---

## Offline (`offline/`)

`offline/activity-offline-storage.ts` — keys/payloads, pending apply, merge, flush,
`saveActivityOfflinePending`, `createActivityOfflineSyncAdapter`
`offline/activity-change-from-offline.ts` — successful flush → `ActivityChange`
(incl. optimistic-create id reconcile)
`offline/index.ts` — offline adapter surface

Offline transport is separate from cache policy; successful replay rejoins the
same hub as online mutations and realtime. WHY: [offline.md](./offline.md).

---

## Read hooks + mutations (`hooks/`)

`hooks/use-activities-query.ts` — `useActivitiesQuery(kind)`
`hooks/use-activity-records-query.ts` — `useActivityRecordsQuery(month)`
`hooks/use-home-today-query.ts` — `useHomeTodayQuery(kind)`, a memoized selector
over the matching definitions bucket + shared current-month records
`hooks/build-optimistic-activity.ts` — shared optimistic definition create shape
(+ `pinnedDraftActivityId` for offline drafts)
`hooks/merge-form-values-into-activity.ts` — shared optimistic definition patch shape
`hooks/use-create-activity-mutation.ts` — create + optimistic upsert + rollback
`hooks/use-update-activity-mutation.ts` — patch autosave + optimistic + newer-wins
`hooks/use-archive-activity-mutation.ts` — `useArchiveActivityMutation`, `useRestoreActivityMutation`
`hooks/use-delete-activity-mutation.ts` — delete + cache removal + record purge
`hooks/activity-mutation-pending.ts` — in-flight ids (realtime echo skip)
`hooks/use-activity-realtime-sync.ts` — dual-table `postgres_changes` → apply adapters
`hooks/record/use-upsert-activity-record-mutation.ts` — absolute upsert + optimistic + newer-wins
`hooks/record/build-optimistic-activity-record.ts` — apply form-submitted configuration snapshots for optimistic rows
`hooks/record/use-delete-activity-record-mutation.ts` — optimistic delete + rollback
`hooks/record/record-mutation-pending.ts` — in-flight natural keys (realtime echo skip)

---

## Editor form (`editor/`)

### Contracts & state

`editor/model/types.ts` — `ActivityFormValues`, change/footer meta, form/hook props
`editor/model/normalize-activity-goals.ts` — clear inapplicable `goal` / `goalDuration` on mode change
`editor/model/normalize-period-goals.ts` — clear period fields when toggle Off;
mode-compatible `periodGoal` / `periodGoalDuration` (boolean keeps count)
`editor/model/use-activity-form.ts` — local fields (incl. `goalDuration`, period
goals, `priority`), dirty/valid meta, reset on `resetKey`/`commitKey`, pull on
`remoteSyncKey` bump (realtime idle/clean)

### UI

`editor/activity-form.tsx` — composes sections, rows, status banner
`editor/activity-form-status-banner.tsx` — upcoming/expired banner via `getActivityStatus`
`editor/activity-form-last-saved.tsx` — last-edited / save-status label
`editor/fields/*` — section + field-row primitives; title (with actions), color,
priority, day goal, period goal, tracking-mode, schedule, window rows
`editor/schedule-input/*` — `ScheduleInput` orchestrator + per-type controls (once date, weekday, day-of-month, day/month pickers)

### Display helpers

`editor/lib/default-schedule-config.ts` — seed config when `scheduleType` changes
`editor/lib/format-last-edited.ts` — footer timestamp formatting
`editor/lib/format-schedule-summary.ts` — human-readable schedule summary
`editor/lib/form-labels.ts` — field labels / option lists
`editor/lib/form-classes.ts` — shared Tailwind + menu z-index classes
`editor/lib/toggle-chip-value.ts` — add/remove a value from a chip array

---

## Shared Tasks / Reminders page (`features/activity/activity-page/`)

This feature owns the reusable page workflow. `views/tasks` and
`views/reminders` are thin route-specific wrappers that provide `kind`, title,
subtitle, and their matching SSR seed; they do not fork calendar, list, filter,
selection, or drawer logic.

- `ui/activity-page-client.tsx` — shared shell: month/view URL state, selection,
  filter provider, Add action, definition drawer, and selected-day records
  drawer
- `ui/activity-views-section.tsx` — kind-scoped definition query + shared month
  records query; resolves loading/error states and mounts calendar/list panes
- `ui/activity-calendar-pane.tsx` / `activity-list-pane.tsx` — calendar join and
  grouped definition-list endpoints
- `model/use-activity-page-url-state.ts`,
  `use-activity-page-selection.ts`, `use-activity-definition-drawer.ts`, and
  `use-activity-records-drawer.ts` — page interaction state
- `model/activity-filter-context.tsx` — calendar-only definition visibility and
  incomplete-record filter
- `lib/activity-page-copy.ts` / `activity-views.ts` — kind-aware labels and view
  configuration
- `lib/activity-filter.ts` / `resolve-view-query-state.ts` — pure visibility and
  query-state decisions
- `index.ts` — public surface; consumers do not deep-import internals

`kind` is the only domain switch. Tasks retain colors/goals/progress; reminders
use theme-neutral presentation and boolean done/not-done records. Shared month
records remain keyed independently of kind.

---

## Quick lookup

| I need to… | Start here |
| ---------- | ---------- |
| Change activity fields / kinds | `model/types.ts` |
| Fix month parsing / bounds | `lib/month/parse-month.ts` |
| Change what "due today" means | `lib/schedule/resolve-schedule.ts`, `matches-recurrence.ts` |
| Change lifecycle status rules | `lib/schedule/activity-status.ts` |
| Change what counts as "done" | `lib/record/is-meaningful-record.ts` |
| Change Home Today membership | `lib/today/build-today-activities.ts` |
| Change Home Today goal/progress math | `lib/record/derive-today-progress.ts` |
| Change snapshot vs current configuration | `lib/record/resolve-record-configuration.ts` |
| Change which goals survive a mode switch | `editor/model/normalize-activity-goals.ts` |
| Change period-goal toggle / mode cleanup | `editor/model/normalize-period-goals.ts` |
| Force reminder-safe definition fields | `lib/definition/normalize-activity-definition.ts` |
| Load one definition by id | `repository/get-activity-by-id.ts` |
| Add `goal_duration` / `icon` columns | `supabase/migrations/004_activity_goal_duration_and_icon.sql` |
| Add period-goal / priority columns | `supabase/migrations/006_activity_period_goals_and_priority.sql` |
| Add record tracking/goal snapshot columns | `supabase/migrations/005_activity_record_configuration_snapshots.sql` |
| Apply optimistic record snapshots from the form | `hooks/record/build-optimistic-activity-record.ts` |
| Change calendar day shape | `transform/build-calendar-days.ts` |
| Change calendar-pill completion-% | `transform/compute-task-month-progress.ts` |
| Change Progress report math (due-day or period) | `lib/progress/*` — [progress.md](./progress.md) |
| Change period-goal seeding / proration | `lib/progress/accumulate-period-goal-metrics.ts` |
| Change Progress all-time fetch | `repository/progress/get-all-time-task-record-values.ts` |
| Change Progress SSR assembly | `queries/progress/get-progress-page-data.ts` |
| Change DB queries | `repository/*` |
| Change GET/POST/PATCH/DELETE server logic | `queries/*`, `mutations/*` |
| Fix optimistic record writes | `hooks/record/*`, `cache/record/*` |
| Change quick-record debounce/delete-on-empty | `features/activity/quick-record/model/use-quick-record.ts` |
| Fix optimistic UI after save | `cache/synchronize-activity-caches.ts`, `activity-cache-mutations.ts`, `cache/record/*` |
| Fix list/calendar not updating | `hooks/use-activities-query.ts`, `use-activity-records-query.ts` |
| Fix multi-tab / live sync | [realtime.md](./realtime.md), `hooks/use-activity-realtime-sync.ts`, `cache/apply-realtime-*` |
| Fix offline replay / pending keys | [offline.md](./offline.md), `offline/activity-offline-storage.ts`, `offline/activity-change-from-offline.ts` |
| Fix remote overwrite while typing in definition drawer | `features/activity/activity-drawer/model/activity-editor-sync-guard.ts`, `use-activity-drawer-realtime-sync.ts` |
| Change autosave decision | `features/activity/activity-drawer/pre-save-orchestrator/evaluate-activity-save.ts` |
| Wire drawer save routing (incl. offline branch) | `features/activity/activity-drawer/model/use-config-orchestrator.ts` |
| Change form fields / validation | `editor/model/*`, `editor/fields/*`, `schema/activity-form.schema.ts` |
| Change schedule inputs | `editor/schedule-input/*` |
