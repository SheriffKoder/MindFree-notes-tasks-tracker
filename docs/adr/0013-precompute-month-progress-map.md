## ADR 0013: Precompute month completion as a `Map<taskId, percent>`

### Status

Accepted

### Context

Each task pill on the calendar shows a month completion percent (or a check at
100%). A task recurs across many days, so the same task renders many pills in
one month — a daily task appears up to ~31 times.

Computing the percent **inside each pill** means every pill re-scans the month's
records and schedule to derive its own denominator/numerator. That is O(days ×
pills) of duplicated work per render, all recomputing the same per-task number.

### Decision

Derive completion **once per task per month**, up front, as a map:

```text
computeTaskMonthProgress(month, activities, recordLookup) → Map<taskId, percent>
percent = round(completedActiveDays / scheduledActiveDays × 100)   // 0 if none scheduled
```

1. `transform/compute-task-month-progress.ts` does a single pass over the
   month's days per task, using `isActiveOnDay` (denominator) and
   `isMeaningfulRecord` (numerator).
2. The calendar pane computes this map **once** and passes it down; each
   `ActivityCalendarCell` / `ActivityTaskPill` reads its value by `taskId`
   (`progressByTaskId.get(id)`).
3. Pills stay **dumb** — they receive `completionPercent`, never derive it.

### Why

- Turns O(days × pills) into O(days × tasks) computed once, then O(1) lookups.
- Keeps the percent definition in **one pure, testable function** instead of
  scattered in a UI component.
- The same map feeds the Progress page later without a second implementation.

Rejected:

- **Per-pill computation** — repeated work, and forks the "what counts as done"
  rule into the view.
- **Store completion on the record row** — completion is derived per
  `trackingMode` and must recompute when the mode or goal changes; a stored
  number drifts.
- **Memoize inside each pill** — still N scans on first paint and on record
  changes; the map is simpler and shared.

### Consequences

Positive:

- Calendar re-renders are cheap; pills are pure and memoizable.
- One place owns the completion formula (mirrors the "done" predicate in
  `is-meaningful-record`).

Trade-offs:

- The pane must recompute the map when records/definitions change (a `useMemo`
  keyed on both) — a deliberate single choke point.
- The map is month-scoped; cross-month progress needs its own derivation.

### Follow-up

- [entities/activity/docs/read-models.md](../../entities/activity/docs/read-models.md)
- [features/activity/activity-calendar-cell/docs/calendar-cell.md](../../features/activity/activity-calendar-cell/docs/calendar-cell.md)
