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
| `goal` | optional target | `null` |
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
| `goal` | Target value (tasks); `null` otherwise |
| `startsAt` / `endsAt` | Validity window (`null` = open-ended) |
| `archivedAt` | Manual archive stamp (ISO); `null` when active |
| `createdAt` / `updatedAt` | Timestamps; `updatedAt` drives newer-wins gates |

DB columns are snake_case (`tracking_mode`, `schedule_config`, `archived_at`);
`lib/mapping/map-row.ts` maps to camelCase inside the repository only.

---

## Tracking modes → recording

`trackingMode` is the single input the recording UI derives from — there is no
per-activity "how do I record this" config beyond it:

| Mode | Records | "Done" means |
| ---- | ------- | ------------ |
| `boolean` | a checkbox | `count > 0` |
| `count` | a number ("8 glasses") | `count > 0` |
| `duration` | minutes ("30 min") | `duration > 0` |
| `count+duration` | both dimensions | either positive |

That "done" column is exactly `lib/record/is-meaningful-record.ts`. It is the
one predicate behind both **display** (render a completion) and the future
**delete-on-empty** watcher (Phase 2) — completion is derived, never a stored
flag.

---

## Records: one row per activity-day

```text
mf_task_record natural key = (taskId, date)
```

A record is a **daily aggregate** for one activity: `count`, `duration`, and an
optional note. There is no stored `isCompleted` — whether a day counts is
derived from the record values and the activity's `trackingMode`
(`is-meaningful-record`). Records travel flat over the wire; the client derives
O(1) lookup maps from them (see [read-models.md](./read-models.md)).

Consequences:

- Editing a task's schedule never touches its records — history is
  schedule-independent ([read-models.md](./read-models.md), [0012-calendar-records-always-visible.md](../../../docs/adr/0012-calendar-records-always-visible.md)).
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
