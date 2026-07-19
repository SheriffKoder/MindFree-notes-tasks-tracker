## ADR 0015: Record configuration snapshots

### Status

Accepted (revised: form-owned snapshots)

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

A first revision copied snapshots from `mf_task` via a PostgreSQL trigger on
insert and locked them on update. The calendar-day records drawer later made
per-day goals editable, so ownership moved to the record card form (the same
POST path that writes count/duration/description).

### Decision

1. `mf_task_record` stores configuration snapshots:
   - `tracking_mode_snapshot`
   - `goal_snapshot`
   - `goal_duration_snapshot`
2. The HTTP upsert body includes those fields. The card form seeds them from
   the current task on first create and resubmits them on later edits.
3. `trackingModeSnapshot` is treated as immutable in product UI after create
   (changing it would reinterpret which value fields are meaningful).
   `goalSnapshot` / `goalDurationSnapshot` are editable per day in the records
   drawer; Home does not expose goal editors.
4. Consumers resolve configuration with one pure helper:

   ```text
   record exists → record snapshots
   no record     → current activity trackingMode / goal / goalDuration
   ```

5. Title, color, description, and schedule remain live definition data. Only
   tracking mode and goals are historical on recorded days.
6. Delete then recreate intentionally captures the task's then-current
   configuration. There is no backfill path for pre-migration rows (empty table
   precondition).

### Why

- The record card already behaves like a form for values, description, and
  goals; one write path keeps optimistic UI and the database aligned.
- A trigger that froze goals conflicted with per-day goal editing in the
  calendar records drawer.
- Reusing ADR 0012's "history always wins" intuition for membership, while
  separately storing interpretation on the record, keeps schedule and tracking
  concerns distinct.

Rejected:

- **Re-read the task on every progress derivation** — simple, but changes
  history whenever goals edit.
- **Database trigger as sole snapshot owner** — atomic, but blocks editable
  per-day goals and duplicates form ownership.
- **Schedule snapshots** — out of scope; ADR 0012 already preserves recorded
  membership without storing the schedule of the day.

### Consequences

Positive:

- Calendar pills, Home Today, filters, month-progress numerators, and
  quick-record controls agree on historical interpretation.
- Definition edits stay free to change future empty slots and new records.
- Drawer goal edits persist through the same upsert as values and notes.

Trade-offs:

- Migration requires an empty `mf_task_record` table (or a reset) before adding
  `NOT NULL` snapshot columns.
- Clients must always submit the three snapshot fields on upsert.
- Quick-record must switch controls to the snapshot mode for an existing row,
  even if the activity definition has changed.

### Follow-up

- [entities/activity/docs/domain-model.md](../../entities/activity/docs/domain-model.md)
- [entities/activity/docs/read-models.md](../../entities/activity/docs/read-models.md)
- [entities/activity/docs/writes-and-autosave.md](../../entities/activity/docs/writes-and-autosave.md)
- [features/activity/activity-calendar-cell/docs/calendar-cell.md](../../features/activity/activity-calendar-cell/docs/calendar-cell.md)
- Migration: `supabase/migrations/005_activity_record_configuration_snapshots.sql`
