# `entities/activity/lib` — pure helpers

The reusable, **pure** core of the Activity domain: no I/O, no React, no cache.
Everything here is deterministic (input → output) so it can back the server
reads, the client caches, and the feature UI from one place — and be unit-tested
in isolation. Decisions trace to
[`app/development/workflow/activity/pre-implementation-afterthoughts.md`](../../../app/development/workflow/activity/pre-implementation-afterthoughts.md).

Read-model composition (calendar days, month progress, API record shaping) lives
in [`../transform/`](../transform/) — not here.

## Layout

```
lib/
├── month/          # month key + SQL/calendar bounds
├── schedule/       # recurrence, validity window, lifecycle status
├── record/         # record semantics + client lookup maps
└── mapping/        # Supabase row → domain (repository-only internal)
```

| Segment | Files | Problem it solves |
| ------- | ----- | ----------------- |
| **`month/`** | `parse-month.ts` | Turn a `YYYY-MM` param into a validated month key + SQL date bounds and calendar metadata, so record queries and the calendar agree on "what is this month". |
| **`schedule/`** | `date-parts.ts`, `matches-recurrence.ts`, `resolve-schedule.ts`, `activity-status.ts` | Recurrence matching, per-day validity window, and derived lifecycle (`active` / `upcoming` / `expired` / `archived`). |
| **`record/`** | `is-meaningful-record.ts`, `build-record-lookup.ts` | Whether a record counts as done for its `trackingMode`, and O(1) lookup by `(taskId, date)` from a flat month of records. |
| **`mapping/`** | `map-row.ts` | Translate snake_case Supabase rows into camelCase domain objects — import within `repository/` only. |

## `transform/` (sibling layer)

| File | Problem it solves |
| ---- | ----------------- |
| `aggregate-month-records.ts` | Server: sort flat records into `ActivityRecordsResponse`. |
| `build-calendar-days.ts` | Client: join activities + record lookup → `TaskCalendarDay[]`. |
| `compute-task-month-progress.ts` | Client: one completion % per task for the month (`Map<taskId, number>`). |

## Scheduling: two axes, one gate

A day is active only when **both** hold — the window admits it *and* the
recurrence fires on it:

```text
isActiveOnDay(activity, day)
  = withinWindow(day, startsAt, endsAt)      // schedule/resolve-schedule
  && matchesRecurrence(day, type, config)     // schedule/matches-recurrence → date-parts

date-parts ──▶ matches-recurrence ──▶ resolve-schedule ──▶ isActiveInMonth
```

`once` carries no window columns — its `scheduleConfig` date is matched directly
by the recurrence, and `activity-status` folds that same date into both bounds.

## Public vs internal

Each segment exposes a barrel `index.ts`. Cross-slice consumers import from
`entities/activity/index.ts` only — never from segment paths.

| Public (re-exported from slice `index.ts`) | Segment |
| ------------------------------------------ | ------- |
| `parseMonthParam`, `getMonthRange`, `getCurrentMonth` | `lib/month` |
| `isActiveOnDay`, `isActiveInMonth`, `getActivityStatus` | `lib/schedule` |
| `isMeaningfulRecord`, `buildRecordLookup`, `recordKey` | `lib/record` |
| `buildTaskCalendarDays`, `computeTaskMonthProgress` | `transform` |

| Internal (within-slice imports only) | Segment |
| ------------------------------------ | ------- |
| `date-parts`, `matches-recurrence` | `lib/schedule` |
| `map-row` | `lib/mapping` |
