## ADR 0015: Record configuration snapshots on first insert

### Status

Accepted

### Context

After dual count/duration goals landed, calendar pills and Home Today derived
progress by joining a day's record values with the **current** activity
definition (`trackingMode`, `goal`, `goalDuration`). Editing a task therefore
reinterpreted already-recorded days — a count goal of `2` could become `10`, or
a duration day could be read as a count day, changing pill labels and
meaningfulness after the fact.

Schedule membership already keeps recorded history visible regardless of later
frequency edits ([0012-calendar-records-always-visible.md](./0012-calendar-records-always-visible.md)).
Tracking configuration needed the same historical integrity: the way a day was
recorded must stay frozen even when the definition changes.

### Decision

1. `mf_task_record` stores immutable snapshots:
   - `tracking_mode_snapshot`
   - `goal_snapshot`
   - `goal_duration_snapshot`
2. PostgreSQL derives those columns from the owned `mf_task` row on **first
   insert** and restores `OLD` values on every **update** (including natural-key
   upsert conflicts). The HTTP body stays totals-only
   (`taskId`, `date`, `count`, `duration`, `description`).
3. Consumers resolve configuration with one pure helper:

   ```text
   record exists → record snapshots
   no record     → current activity trackingMode / goal / goalDuration
   ```

4. Title, color, description, and schedule remain live definition data. Only
   tracking mode and goals are historical on recorded days.
5. Delete then recreate intentionally captures the task's then-current
   configuration. There is no backfill path for pre-migration rows (empty table
   precondition).

### Why

- Application-only snapshot writes race with concurrent upserts and are easy to
  forget on a new write path; a database trigger is atomic with the row.
- Sending client-authored snapshots would let stale optimistic UI freeze the
  wrong goals; the server owning the copy is authoritative.
- Reusing ADR 0012's "history always wins" intuition for membership, while
  separately freezing interpretation, keeps schedule and tracking concerns
  distinct.

Rejected:

- **Re-read the task on every progress derivation** — simple, but changes
  history whenever goals edit.
- **Custom upsert RPC with selective `DO UPDATE SET`** — works, but forks the
  existing direct-table Supabase repository pattern.
- **Schedule snapshots** — out of scope; ADR 0012 already preserves recorded
  membership without storing the schedule of the day.

### Consequences

Positive:

- Calendar pills, Home Today, filters, month-progress numerators, and
  quick-record controls agree on historical interpretation.
- Definition edits stay free to change future empty slots and new records.

Trade-offs:

- Migration requires an empty `mf_task_record` table (or a reset) before adding
  `NOT NULL` snapshot columns.
- Optimistic UI must seed snapshots from the current activity on create and
  preserve existing ones on later upserts until the server response arrives.
- Quick-record must switch controls to the snapshot mode for an existing row,
  even if the activity definition has changed.

### Follow-up

- [entities/activity/docs/domain-model.md](../../entities/activity/docs/domain-model.md)
- [entities/activity/docs/read-models.md](../../entities/activity/docs/read-models.md)
- [entities/activity/docs/writes-and-autosave.md](../../entities/activity/docs/writes-and-autosave.md)
- [features/activity/activity-calendar-cell/docs/calendar-cell.md](../../features/activity/activity-calendar-cell/docs/calendar-cell.md)
- Migration: `supabase/migrations/005_activity_record_configuration_snapshots.sql`
