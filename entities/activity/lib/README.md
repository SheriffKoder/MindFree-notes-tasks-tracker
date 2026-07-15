# `entities/activity/lib` — pure helpers

The reusable, **pure** core of the Activity domain: no I/O, no React, no cache.
Everything here is deterministic (input → output) so it can back the server
reads, the client caches, and the feature UI from one place — and be unit-tested
in isolation. Decisions trace to
[`app/development/workflow/activity/pre-implementation-afterthoughts.md`](../../../app/development/workflow/activity/pre-implementation-afterthoughts.md).

## Why these exist

| File | Problem it solves |
| ---- | ----------------- |
| `parse-month.ts` | Turn a `YYYY-MM` param into a validated month key + SQL date bounds and calendar metadata, so record queries and the calendar agree on "what is this month". |
| `date-parts.ts` | Break a `YYYY-MM-DD` day into the exact strings a recurrence compares against (`weekday`, `dayOfMonth`, `DD/MM`), parsed in **UTC** so the weekday never drifts with the host timezone. |
| `matches-recurrence.ts` | Answer "does this recurrence pattern fire on this day?" from the JSON `scheduleConfig` alone — recurrence only, no window (afterthoughts §7). |
| `resolve-schedule.ts` | Gate the recurrence by the `startsAt`/`endsAt` window to get the real "active on a day / in a month" answer. Single source for the Tasks calendar and the Home Today list (§7). |
| `activity-status.ts` | Derive `active \| upcoming \| expired \| archived` from the clock, the window, and `archivedAt` — never stored, so extending `endsAt` or clearing `archivedAt` re-activates with no migration (§10). |
| `is-meaningful-record.ts` | Decide whether a record holds real work for its `trackingMode`. One predicate drives both display and the later delete-on-empty watcher; completion is derived, not a stored flag (§2). |
| `build-record-lookup.ts` | Records travel flat over the wire; consumers need O(1) access by `(taskId, date)` (recording, calendar/Home cells) and per-task grouping (metadata/progress). Both maps derive in one pass (§1, §4). |
| `map-row.ts` | Translate snake_case Supabase rows into camelCase domain objects, keeping the DB schema out of the rest of the slice. |

## Scheduling: two axes, one gate

A day is active only when **both** hold — the window admits it *and* the
recurrence fires on it:

```text
isActiveOnDay(activity, day)
  = withinWindow(day, startsAt, endsAt)      // resolve-schedule (inline gate)
  && matchesRecurrence(day, type, config)     // matches-recurrence → date-parts

date-parts ──▶ matches-recurrence ──▶ resolve-schedule ──▶ isActiveInMonth
```

`once` carries no window columns — its `scheduleConfig` date is matched directly
by the recurrence, and `activity-status` folds that same date into both bounds.

## Public vs internal

`resolve-schedule`, `activity-status`, `is-meaningful-record`, `build-record-lookup`
(and `parse-month`) are re-exported from `entities/activity/index.ts` — the
cross-slice surface features/views import. `date-parts` and `matches-recurrence`
are scheduling internals, and `map-row` is data-access plumbing: import those by
their file path **within the slice only**, never from another slice.
