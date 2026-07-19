## ADR 0013: Precompute month completion as a `Map<taskId, percent>`

### Status

Accepted (superseded for calendar *pill cues* — see Consequences)

### Context

Each task pill on the calendar originally showed a month completion percent (or
a check at 100%). A task recurs across many days, so the same task renders many
pills in one month — a daily task appears up to ~31 times.

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
2. Callers that need month-% (Progress page / list summaries) compute this map
   **once** and look up by `taskId`.
3. Calendar **day pills** no longer display this map. They show that day's
   record vs goals (`1/2`, `5m/5m`) via `deriveTodayProgress` +
   `formatPillProgress` — see
   [calendar-cell.md](../../features/activity/activity-calendar-cell/docs/calendar-cell.md).

### Why

- Turns O(days × pills) into O(days × tasks) computed once, then O(1) lookups
  for month-level consumers.
- Keeps the percent definition in **one pure, testable function** instead of
  scattered in a UI component.
- The same map feeds the Progress page later without a second implementation.

Rejected:

- **Per-pill month-% computation** — repeated work, and forks the "what counts
  as done" rule into the view.
- **Store completion on the record row** — completion is derived per
  `trackingMode` and must recompute when the mode or goal changes; a stored
  number drifts.
- **Memoize inside each pill** — still N scans on first paint and on record
  changes; the map is simpler and shared.

### Consequences

Positive:

- Month-% stays one pure formula for Progress / list consumers.
- Day pills use the same progress dimensions as Home Today, so count and
  minute goals read consistently.

Trade-offs:

- Callers that need the map must recompute when records/definitions change (a
  `useMemo` keyed on both) — a deliberate single choke point.
- The map is month-scoped; cross-month progress needs its own derivation.
- Calendar pills and month-% are now separate cues; do not reintroduce month `%`
  on the pill without revisiting this ADR.

### Follow-up

- [entities/activity/docs/read-models.md](../../entities/activity/docs/read-models.md)
- [features/activity/activity-calendar-cell/docs/calendar-cell.md](../../features/activity/activity-calendar-cell/docs/calendar-cell.md)
