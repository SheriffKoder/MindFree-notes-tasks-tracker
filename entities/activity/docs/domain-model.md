# Activity domain model

Why Activity is **one model, two kinds** (tasks + reminders) — and how a day's
work is recorded, derived, and read back.

**Types:** `entities/activity/model/types.ts`
**Read models:** [read-models.md](./read-models.md) ·
**Scheduling:** [scheduling.md](./scheduling.md)

---

## Why one model

A task ("meditate 10 min, daily") and a reminder ("dentist on the 23rd") differ
only in **where they show and how they're presented** — not in shape. Splitting
them into two tables would fork the write path, the caches, the drawer, and the
sync hub for no domain gain. Instead:

- One `mf_task` row shape backs both.
- `kind` (`task` | `reminder`) decides the surface and presentation.
- Records (`mf_task_record`) hang off any activity by `taskId`.

Pages and Home are **consumers** of this one domain, not separate domains.

---

## The `kind` flag

```text
kind = "task"      → Tasks page, colored cards, goals, calendar completion
kind = "reminder"  → Reminders page, theme-neutral cards, boolean completion
```

`kind` is set by the **creating page**, never asked in the drawer — the Tasks
page creates `task`s and the Reminders page creates `reminder`s. This is why
the create schema takes `kind` from the caller rather than a form field
(`schema/create-activity.schema.ts`), and why definitions are cached per kind
(`["activities", kind]`).

Reminder fields are canonical invariants, not presentation conventions:

| Field | Task | Reminder |
| ----- | ---- | -------- |
| `color` | optional card accent | **always `null`** |
| `goal` / `goalDuration` | optional per-due-day count / minute targets | `null` |
| `goalPeriod` / `periodGoal` / `periodGoalDuration` | optional week/month Progress targets | `null` |
| `priority` | optional Low/Medium/High | **always `null`** |
| `icon` | reserved (`null` for now) | `null` |
| `trackingMode` | drives recording UI | **always `"boolean"`** |

`lib/definition/normalize-activity-definition.ts` enforces these values. It runs
at both trust boundaries:

- **Server create/PATCH:** `mutations/create-activity.ts` normalizes the
  submitted kind; `mutations/update-activity.ts` loads the owned row first and
  normalizes against its persisted kind (PATCH does not accept `kind`).
- **Optimistic client create/update:** the mutation hooks normalize before
  writing cache state and before sending the request, so optimistic UI matches
  the eventual server row.

The reminder form also hides color, day/period goals, priority, and
tracking-mode controls, but that is only presentation. The write-boundary
normalization is what guarantees that crafted or stale payloads cannot persist
task-only values on reminders.

---

## Domain fields (client)

| Field | Role |
| ----- | ---- |
| `id` | Stable row id |
| `kind` | `task` \| `reminder` — surface + presentation |
| `title` / `description` | Editable body |
| `color` | Card accent (tasks); `null` for reminders |
| `trackingMode` | How completion is recorded (see below) |
| `scheduleType` / `scheduleConfig` | Recurrence pattern + its config ([scheduling.md](./scheduling.md)) |
| `goal` | Optional **per-due-day count** target; `null` when unbounded or unused (`boolean` / `duration`) |
| `goalDuration` | Optional **per-due-day minute** target; `null` when unbounded or unused (`boolean` / `count`) |
| `goalPeriod` | Optional Progress period unit: `"week"` \| `"month"` \| `null` (off → due-day Progress model) |
| `periodGoal` | Optional **count-shaped** target for that period; also used by `boolean` tasks as “times per period” |
| `periodGoalDuration` | Optional **minute-shaped** target for that period |
| `priority` | Optional `"low"` \| `"medium"` \| `"high"`; **tasks only**. Stored/editable; Home Today groups by it; no list sort, badge, or filter elsewhere yet |
| `icon` | Reserved semantic icon id for future presentation; always `null` until an editor ships |
| `startsAt` / `endsAt` | Validity window (`null` = open-ended) |
| `archivedAt` | Manual archive stamp (ISO); `null` when active |
| `createdAt` / `updatedAt` | Timestamps; `updatedAt` drives newer-wins gates |

Day goals (`goal` / `goalDuration`) and period goals (`goalPeriod` /
`periodGoal` / `periodGoalDuration`) are **independent axes** — neither is
derived from the other. Schedule still decides due-day appearance; period goals
are Progress-only ([progress.md](./progress.md), [scheduling.md](./scheduling.md)).

DB columns are snake_case (`tracking_mode`, `goal_duration`, `goal_period`,
`period_goal`, `period_goal_duration`, `priority`, `schedule_config`,
`archived_at`); `lib/mapping/map-row.ts` maps to camelCase inside the repository
only. Migration `004_activity_goal_duration_and_icon.sql` moved former
`duration`-mode `goal` values into `goal_duration`. Migration
`006_activity_period_goals_and_priority.sql` added the period-goal and priority
columns.

`icon` is mapped and persisted as `null`; no form field or Home renderer reads
it yet. `priority` is editable in the Tasks drawer; Home Today groups cards by
it (High → Medium → Low → Other).

---

## Tracking modes → recording

`trackingMode` is the single input the recording UI derives from — there is no
per-activity "how do I record this" config beyond it:

| Mode | Records | Meaningful (delete-on-empty) | Goal-aware "done" |
| ---- | ------- | ---------------------------- | ----------------- |
| `boolean` | a checkbox | `count > 0` | same (no goals) |
| `count` | a number ("8 glasses") | `count > 0` | `count >= goal` when `goal` set |
| `duration` | minutes ("30 min") | `duration > 0` | `duration >= goalDuration` when set |
| `count+duration` | both dimensions | either positive | **every configured** goal reached |

`lib/record/is-meaningful-record.ts` decides whether a daily row is worth
keeping (quick-record delete-on-empty + month progress numerator). Home Today
and calendar progress use `lib/record/derive-today-progress.ts` with
configuration from `resolveRecordConfiguration`: when goals are set, every
configured dimension must reach its target; when none are set, completion falls
back to meaningful. Completion is derived, never a stored flag. See
[writes-and-autosave.md](./writes-and-autosave.md#daily-record-path) and
[read-models.md](./read-models.md#home-today-join).

Switching `trackingMode` in the Tasks form clears goals that no longer apply
(`editor/model/normalize-activity-goals.ts`) so count and minute targets stay
mode-consistent on save.

---

## Records: one row per activity-day

```text
mf_task_record natural key = (taskId, date)
```

A record is a **daily aggregate** for one activity: `count`, `duration`, an
optional note, and **configuration snapshots** stored on the row (migration
`005`). The record form submits them on every upsert:

| Snapshot field | First create | Later edits |
| -------------- | ------------ | ----------- |
| `trackingModeSnapshot` | seeded from `mf_task.tracking_mode` | kept as submitted (UI does not change mode) |
| `goalSnapshot` | seeded from `mf_task.goal` | editable per day in the records drawer |
| `goalDurationSnapshot` | seeded from `mf_task.goal_duration` | editable per day in the records drawer |

Delete then recreate intentionally captures the task's then-current
configuration.

There is no stored `isCompleted` — whether a day counts is derived from the
record values and the **effective** tracking mode via
`resolveRecordConfiguration` (record snapshots when present, otherwise the
activity's current fields). Records travel flat over the wire; the client
derives O(1) lookup maps from them (see [read-models.md](./read-models.md)).

Live vs historical:

| Concern | Source |
| ------- | ------ |
| Title, color, schedule | current activity definition |
| How a recorded day is interpreted | record snapshots |
| Count / duration / note | mutable record values |

Consequences:

- Editing a task's schedule never touches its records — history is
  schedule-independent ([read-models.md](./read-models.md), [0012-calendar-records-always-visible.md](../../../docs/adr/0012-calendar-records-always-visible.md)).
- Editing a task's mode or **day** goals never reinterprets already-recorded
  days — [0015-record-configuration-snapshots.md](../../../docs/adr/0015-record-configuration-snapshots.md).
- **Period goals are not snapshotted.** Unlike `goalSnapshot` /
  `goalDurationSnapshot`, there is no historical version of
  `goalPeriod` / `periodGoal` / `periodGoalDuration`. Progress always grades
  against the task's **current** period fields ([progress.md](./progress.md)).
- On the Progress **due-day** path, recorded days always use day-goal snapshots;
  only **missing** due days in the currently-open or future month may project
  the **current** definition. On the **period-goal** path, recorded actuals
  accumulate against the current period target with no missing-day projection.
- Record upserts carry absolute daily totals and clearing every meaningful
  dimension deletes the row ([writes-and-autosave.md](./writes-and-autosave.md#daily-record-path)).
- Deleting a task must purge its records from every cached month
  (`cache/purge-activity-records-in-cache.ts`).

---

## Lifecycle (mental model)

```text
Draft (drawer open, no row)
  → first meaningful title → CREATE

Persisted activity
  → autosave PATCH (fields, schedule, window)
  → archive  (archivedAt set)  ↔  restore (archivedAt cleared)
  → DELETE   (explicit, purges records)
```

Status is **derived, never stored** — `getActivityStatus` folds the validity
window and `archivedAt` into `active` / `upcoming` / `expired` / `archived`
([scheduling.md](./scheduling.md)). Extending `endsAt` or clearing `archivedAt`
re-activates with no migration.

Write path (create/patch/archive/restore/delete) and autosave:
[writes-and-autosave.md](./writes-and-autosave.md).

---

## What this model deliberately is not

- **Not two entities.** Reminders is a consumer of the same domain, not a fork.
- **Not a stored completion flag.** "Done" is derived per `trackingMode`.
- **Not schedule-filtered history.** The calendar shows every recorded day
  regardless of the current schedule ([0012-calendar-records-always-visible.md](../../../docs/adr/0012-calendar-records-always-visible.md)); the schedule only decides
  where *empty* due slots appear.

---

## Related

| Doc | Why |
| --- | --- |
| [scheduling.md](./scheduling.md) | Recurrence, validity window, derived status |
| [read-models.md](./read-models.md) | How definitions/records are cached and joined |
| [progress.md](./progress.md) | How Progress uses day-goal snapshots vs projected current goals, and the separate period-goal axis |
| [writes-and-autosave.md](./writes-and-autosave.md) | Create/patch/archive/delete + autosave |
| [responsibilities.md](./responsibilities.md) | Where each concern's code lives |
| [0015-record-configuration-snapshots.md](../../../docs/adr/0015-record-configuration-snapshots.md) | Record stores form-owned tracking/goal snapshots |
