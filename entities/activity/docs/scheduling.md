# Scheduling

How an activity decides **which days it is due on**, and how its **lifecycle
status** is derived — two axes gated into one answer.

**Code:** `entities/activity/lib/schedule/`
**Config shapes:** `entities/activity/model/types.ts` (`ScheduleConfig`),
`entities/activity/schema/activity-form.schema.ts` (validation)

---

## Two axes, one gate

A day is due only when **both** hold: the validity window admits it **and** the
recurrence pattern fires on it.

```text
isActiveOnDay(activity, day)
  = withinWindow(day, startsAt, endsAt)     // resolve-schedule
  && matchesRecurrence(day, type, config)   // matches-recurrence → date-parts

date-parts ─▶ matches-recurrence ─▶ resolve-schedule ─▶ isActiveInMonth
```

- **Window** (`resolve-schedule.ts`) — inclusive `startsAt`/`endsAt`
  comparison; `null` bounds are open-ended. ISO `YYYY-MM-DD` strings compare
  correctly lexicographically, so no date parsing is needed.
- **Recurrence** (`matches-recurrence.ts`) — interprets `scheduleConfig` per
  `scheduleType`; assumes the config shape is valid (Zod enforces it on write,
  malformed config resolves to `false`).
- **Date parts** (`date-parts.ts`) — splits a day into weekday / day-of-month /
  `DD/MM`, parsed in **UTC** so the weekday never shifts with the host timezone.

`isActiveInMonth` just walks the month and returns true on the first active day
— it's how a definition decides whether it belongs on a given month at all.

---

## `scheduleConfig` per `scheduleType`

| Type | `scheduleConfig` | Fires when |
| ---- | ---------------- | ---------- |
| `once` | `"YYYY-MM-DD"` | the day equals the config date |
| `daily` | `null` | every day |
| `weekly` | `Weekday[]` (`["mon","tue"]`) | weekday code is in the list |
| `monthly` | day-of-month `["01","15"]` | zero-padded day-of-month is in the list |
| `yearly` | `DD/MM` `["25/01","23/02"]` | zero-padded `DD/MM` is in the list |

Weekday codes are Monday-first (`WEEKDAYS` in `model/types.ts`). Validation of
each shape lives in `addScheduleConfigIssues` (`schema/activity-form.schema.ts`)
and runs on every create/update body.

---

## `once` has no window

A one-time activity carries no `startsAt`/`endsAt` columns — its single config
date **is** the window. Two places fold that in so `once` behaves like a
one-day window without special-casing callers:

- `resolve-schedule` — `once` needs no window check; the recurrence match
  (`config === day`) is the whole gate.
- `activity-status` (`resolveWindowBounds`) — for `once`, the config date acts
  as **both** `start` and `end`.

---

## Where the gate is (and isn't) used

`isActiveOnDay` answers "is this activity **due** here":

| Consumer | Uses the gate for |
| -------- | ----------------- |
| Calendar join (`transform/build-calendar-days`) | adding **empty due slots** only |
| Month progress (`transform/compute-task-month-progress`) | the denominator (scheduled days) |
| Home Today (Phase 3) | today's due list |
| Progress **due-day** path (`lib/progress/build-task-progress`) | Option B projection of missing days |

**Recorded history does not go through this gate.** A day with a record always
shows on the calendar even if the schedule changed since — see
[read-models.md](./read-models.md) and [0012-calendar-records-always-visible.md](../../../docs/adr/0012-calendar-records-always-visible.md). Frequency is about *future
visibility*, not erasing the past.

**Period goals never use this gate.** When a task has `goalPeriod` set,
Progress grades against week/month targets from recorded actuals only —
`isActiveOnDay` / due-day appearance stay schedule-owned and unchanged. Period
goals are Progress-only; they do not add or remove Home/calendar due slots.
See [progress.md](./progress.md).

The validity window helpers (`isWithinValidityWindow`,
`overlapsValidityWindow`) are shared by both Progress axes and by
`isActiveOnDay` itself — they bound *when* an activity can exist, not *which*
weekdays it is due.

---

## Derived lifecycle status

`getActivityStatus(activity, today)` returns one of `active` / `upcoming` /
`expired` / `archived`, resolved in this precedence:

```text
archivedAt set                → archived   (manual intent wins)
today < effective start       → upcoming
today > effective end         → expired
otherwise                     → active
```

Status is **never stored**. It powers two surfaces from one function:

- **List grouping** — active (`active` + `upcoming`) vs collapsed inactive
  (`expired` + `archived`) in `features/activity/activity-groups`.
- **Form banner** — `editor/activity-form-status-banner.tsx` renders
  "Starts {date}" / "Expired {date}" (silent for active/archived), reusing
  `getActivityStatus` against a draft-shaped activity so the banner reacts to
  live form edits before save.

---

## Related

| Doc | Why |
| --- | --- |
| [domain-model.md](./domain-model.md) | Fields and kinds behind the schedule |
| [progress.md](./progress.md) | Due-day projection vs period-goal path (period goals skip this gate) |
| [read-models.md](./read-models.md) | Why history ignores the gate; calendar join |
| [responsibilities.md](./responsibilities.md) | `lib/schedule/` file map |
| [0012-calendar-records-always-visible.md](../../../docs/adr/0012-calendar-records-always-visible.md) | Calendar records always visible |
