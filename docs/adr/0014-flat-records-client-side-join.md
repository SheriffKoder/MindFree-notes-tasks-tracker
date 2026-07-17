## ADR 0014: Ship flat activity records, join on the client (vs. Notes server aggregation)

### Status

Accepted

### Context

The Tasks calendar needs one entry per day, each carrying the day's activities
paired with their records. Notes solves the equivalent problem **on the server**:
`transform/aggregate-month-notes.ts` folds a flat `Note[]` into `CalendarDay[]`
inside the query use-case, so the client mostly renders.

Activity looked like it should copy that. But the two domains differ where it
matters:

- A note-day is **one note per day** — a self-contained row, nothing to join.
  An activity-day is a **join of two independently-cached, independently-mutated
  sources**: definitions (`["activities", kind]`, stable) and records
  (`["activityRecords", month]`, month-scoped).
- The calendar is essentially Notes' **only** consumer of that shape. Activity's
  flat records feed **several** derivations: `byTaskDate` (recording cells),
  `byTaskId` (grouping), the calendar-day join, the month-progress map, and
  Home Today later.
- The per-day content depends on the **current** definition (title, color,
  `trackingMode`, schedule), which the user edits optimistically in a different
  cache.

Pre-aggregating records into calendar days on the server would bake definition
data into the records payload and pick one output shape.

### Decision

1. The records read use-case (`get-activity-records-response.ts`) returns a
   **flat `ActivityRecord[]`**; `aggregate-month-records.ts` only **sorts**
   deterministically — it does not join or fold into days.
2. The client derives everything from that flat month:
   `buildRecordLookup` → `buildTaskCalendarDays` (join) +
   `computeTaskMonthProgress` (progress), memoized in `tasks-calendar-pane.tsx`.
3. The records query **does not load definitions**; the two caches stay
   decoupled and month navigation refetches **records only**.
4. Notes keeps its server-side `CalendarDay[]` aggregation — this ADR is *not* a
   reversal there; it records why Activity deliberately diverges.

### Why

- **Live definition edits.** Renaming/recoloring/rescheduling a task is an
  optimistic write to the definitions cache; the client-side join re-renders the
  calendar instantly. A server-pre-joined payload wouldn't reflect the edit
  until a records refetch.
- **One source, many shapes.** Deriving views from one flat pass
  (`build-record-lookup`) beats committing to calendar-days and re-expanding it
  for progress, recording, and Home.
- **Decoupled caches.** Flat records keep definitions/records on independent
  lifetimes and keep month nav cheap.
- **Tiny write path.** `synchronizeActivityCaches` only upserts a definition or
  purges a task's flat records; it never reshapes day-buckets.
- **Free filtering/progress.** The per-task filter, "hide not-done", and the
  percent recompute locally with no network round-trip.
- **No payload win.** A month is ≤31 days × a few tasks; pre-aggregating
  wouldn't shrink the wire (every record still ships) and would likely grow it
  by duplicating definition fields per day.

Rejected:

- **Server `CalendarDay[]` like Notes** — couples the two caches, defeats
  optimistic definition edits, and forces the records query to also load
  definitions.
- **Embed definition fields on each record row** — duplication that drifts on
  every definition edit.

### Consequences

Positive:

- Definition edits and filter toggles are instant and network-free.
- Recording (Phase 2) writes a single `(taskId, date)` row into a flat list —
  the natural optimistic target.
- The same records back calendar, progress, and Home without new payloads.

Trade-offs:

- The join/progress logic lives in the client and must stay pure + memoized
  (locked by `build-calendar-days.test.ts`, `compute-task-month-progress.test.ts`).
- Two domains now shape month data differently (Notes server-side, Activity
  client-side) — contributors must not assume symmetry.
- If record volume per month ever grows large, or the Progress page needs
  cross-month rollups, a dedicated server-aggregated read model may be
  reconsidered then.

### Follow-up

- [entities/activity/docs/read-models.md](../../entities/activity/docs/read-models.md)
- [views/tasks/docs/data-flow.md](../../views/tasks/docs/data-flow.md)
- ADR 0012 — calendar records always visible · ADR 0013 — precomputed progress map
