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
kind = "reminder"  → Reminders surface (Phase 3), no color/goal
```

`kind` is set by the **creating page**, never asked in the drawer — the Tasks
page creates `task`s, the Reminders page will create `reminder`s. This is why
the create schema takes `kind` from the caller rather than a form field
(`schema/create-activity.schema.ts`), and why definitions are cached per kind
(`["activities", kind]`).

Presentation differences fall out of `kind`, not separate types:

| Field | Task | Reminder |
| ----- | ---- | -------- |
| `color` | set (card accent) | `null` |
| `goal` / `goalDuration` | optional count / minute targets | `null` |
| `icon` | reserved (`null` for now) | `null` |
| `trackingMode` | drives recording UI | typically `boolean` |

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
| `goal` | Optional **count** target; `null` when unbounded or unused (`boolean` / `duration`) |
| `goalDuration` | Optional **minute** target; `null` when unbounded or unused (`boolean` / `count`) |
| `icon` | Reserved semantic icon id for future presentation; always `null` until an editor ships |
| `startsAt` / `endsAt` | Validity window (`null` = open-ended) |
| `archivedAt` | Manual archive stamp (ISO); `null` when active |
| `createdAt` / `updatedAt` | Timestamps; `updatedAt` drives newer-wins gates |

DB columns are snake_case (`tracking_mode`, `goal_duration`, `schedule_config`,
`archived_at`); `lib/mapping/map-row.ts` maps to camelCase inside the repository
only. Migration `004_activity_goal_duration_and_icon.sql` moved former
`duration`-mode `goal` values into `goal_duration`.

`icon` is mapped and persisted as `null`; no form field or Home renderer reads
it yet.

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
- Editing a task's mode or goals never reinterprets already-recorded days —
  [0015-record-configuration-snapshots.md](../../../docs/adr/0015-record-configuration-snapshots.md).
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
| [writes-and-autosave.md](./writes-and-autosave.md) | Create/patch/archive/delete + autosave |
| [responsibilities.md](./responsibilities.md) | Where each concern's code lives |
| [0015-record-configuration-snapshots.md](../../../docs/adr/0015-record-configuration-snapshots.md) | Record stores form-owned tracking/goal snapshots |
