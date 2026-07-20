# Progress calculation model

Why the Progress card shows the numbers it does — targets, percents, dashes,
legacy lines, and which tasks appear for a month.

**Types:** `entities/activity/model/progress-read-models.ts`  
**Math:** `entities/activity/lib/progress/`  
**Assembly:** `entities/activity/queries/progress/get-progress-page-data.ts`  
**Page path (SSR / fetch / warm):** [views/progress/docs/data-flow.md](../../../views/progress/docs/data-flow.md)

Progress is a **server-computed** monthly report for `kind === "task"` only. It
does **not** read TanStack caches and does **not** reuse
`transform/compute-task-month-progress.ts` (that helper is calendar-pill % only).

There are **two goal-accounting axes**. Which one runs is decided per task by
`activity.goalPeriod`:

| `goalPeriod` | Axis | Grades against |
| ------------ | ---- | -------------- |
| `null` | Due-day (Option B) | Per-due-day `goal` / `goalDuration` + schedule projection |
| `"week"` / `"month"` | Period goal | `periodGoal` / `periodGoalDuration` over the period window |

They are independent fields — setting a period goal does **not** clear day goals,
and Progress never mixes both axes into one percent for the same task.

---

## Quick answers

| Question | Short answer |
| -------- | ------------ |
| Where do these numbers come from? | Either due-day accumulation (records + Option B projection) **or** period-goal accumulation (recorded actuals vs a week/month target) — branched on `goalPeriod`. |
| Why is a week a dash (`—`)? | No bounded primary target in that week. Common under due-day when unbounded/boolean/completion-only; under period goals, mainly `"month"`-shaped goals (week rows stay actual-only). Weekly period goals **do** target partial edge weeks (prorated). |
| What does count / duration / both do? | Current `trackingMode` picks primary metric families; older snapshots that no longer match become muted legacy lines. Period-goal `boolean` tasks use **count** semantics (`periodGoal` = times per period). |
| Why did a past empty day count as a miss? | Option B (due-day path only): in the **currently-open** month, missing due days project as `0` against the current goal so the % stays stable through the month. Period-goal tasks never project missing days. |

---

## Where the numbers come from

For one selected `YYYY-MM` and injected `todayIso`:

```text
getProgressPageData(userId, month, todayIso)
  ├─ getActivities(userId, "task")
  ├─ getRecordsForMonth(userId, month)          → filter to task ids
  └─ getAllTimeTaskRecordValues(userId, taskIds)
       ↓
  buildProgressPageData → for each included task:
       buildTaskProgress(activity, month, todayIso, monthRecords, allTime)
         ├─ goalPeriod !== null  → buildPeriodGoalTaskProgress
         │    seed period targets (week: prorate by available days; month: direct)
         │    walk days in validity window → accumulatePeriodRecordMetrics
         │    (no isActiveOnDay / no shouldProjectDay)
         └─ goalPeriod === null  → buildDueDayTaskProgress
              walk each day in the month
                record exists  → accumulateRecordMetrics (snapshots win)
                no record      → maybe accumulateProjectedDayMetrics (Option B)
         ├─ finalize month window → percent, metrics, legacy
         ├─ finalize each ISO week window
         └─ finalize all-time totals
```

Presentation (`features/activity/activity-progress-card`) only **formats** the
resulting `ProgressTask` (including `goalPeriod` for the month caption). It does
not recompute attainment.

Duration is stored and aggregated in **minutes**; hours/minutes strings appear
only at the presentation boundary.

---

## Period-goal path

When `activity.goalPeriod` is `"week"` or `"month"`, Progress grades against
period targets instead of due-day projection.

### Rules

- **Actuals = what got recorded.** Missing days contribute nothing — no
  projection, no due-day check, no Option B miss.
- **Targets come from the definition once per window**, not from per-record
  goal snapshots. Period fields are **never snapshotted** and have **no
  historical versioning**: every month (past, current, or future) uses the
  task's **current** `goalPeriod` / `periodGoal` / `periodGoalDuration`.
- **Schedule is ignored for accounting.** `isActiveOnDay` / `shouldProjectDay`
  are not called. Schedule still controls Home/calendar appearance only.
- **Validity window still applies.** Days outside `startsAt`/`endsAt` do not
  contribute actuals; week proration and card membership intersect the month
  with that window (`isWithinValidityWindow` / `overlapsValidityWindow`).
- **Progress-only.** Period goals do not affect Home Today, quick-record, the
  calendar pill, or reminders.

### Seeding targets

| `goalPeriod` | Week windows | Month window (donut) |
| ------------ | ------------ | -------------------- |
| `"week"` | Every overlapping week with available days gets a target: full `periodGoal` / `periodGoalDuration` when 7 days available, else `goal × availableDays / 7` | **Sum of those week targets** (including prorated edges) |
| `"month"` | No per-week target (`goal` / `percent` stay `null` → week shows `—`) | Direct `periodGoal` / `periodGoalDuration` |

`availableDays` = days in the week ∩ selected month ∩ validity window.

### Metrics under period goals

| Tracking mode | Primary metric(s) | Period target field(s) |
| ------------- | ----------------- | ---------------------- |
| `boolean` | **`count`** (not `completion`) | `periodGoal` = times per period |
| `count` | `count` | `periodGoal` |
| `duration` | `duration` | `periodGoalDuration` |
| `count+duration` | both, independently | optional `periodGoal` and/or `periodGoalDuration`; combined % averages non-null bounded dimensions |

Boolean records still store `count = 1` physically; under a period goal they are
graded as count quantity toward `periodGoal`.

### Card caption

| `goalPeriod` | Summary label | Value shape |
| ------------ | ------------- | ----------- |
| `"week"` | Weekly done | `actual / goal` (goal muted) |
| `"month"` | Monthly done | `actual / goal` (goal muted) |
| `null` | This month | due-day formatting (unchanged) |

Implemented in `lib/progress/accumulate-period-goal-metrics.ts` and the
`buildPeriodGoalTaskProgress` branch of `build-task-progress.ts`.

---

## Month timeline rule (Option B) — due-day path only

Applies when `goalPeriod === null`. For each date in the selected month:

| Selected month | Record | Source |
| -------------- | ------ | ------ |
| Closed past | exists | Record values + configuration snapshots |
| Closed past | missing | Nothing — do **not** invent targets from today's schedule |
| Currently open (month of `todayIso`) | exists (any day) | Record values + snapshots; history wins |
| Currently open | missing (any day) | Current definition when `isActiveOnDay` **and** day ≥ `activity.createdAt` — counts as a **miss** (`0` actual vs current goal) |
| Future | exists | Record values + snapshots |
| Future | missing | Current definition when `isActiveOnDay` (and createdAt floor) |

Never add both a record snapshot target and a current-definition target for the
same task/date.

### Why Option B

The first draft treated past days with no record as zero weight (neither miss
nor hit). Combined with “project remaining due days,” the month/week percent
**drifted by viewing day** for identical underlying data.

**Stabilize the currently-open month:** every due day in that month with no
record projects as a missed target. Closed past months stay records-only;
future months still project every due day. Known one-time cosmetic: when a
month rolls from “current” to “closed,” unlogged projected misses leave the
denominator again (live tracker → historical archive).

Implemented in `shouldProjectDay` / `hasProjectableDueDay`
(`lib/progress/build-task-progress.ts`).

Period-goal tasks do **not** need this stabilization — they never invent
missing-day targets, so the percent does not drift with the viewing day.

---

## Why a week shows `—`

The week column renders:

```text
week.percent === null ? "—" : `${week.percent}%`
```

`percent` is `null` when there is **no bounded primary target** in that week.

### Due-day path (`goalPeriod === null`)

| Situation | Result |
| --------- | ------ |
| No due days / no records / no projected goals in the week | `—` |
| Current mode is `boolean` (`completion`) | Completions have **no numeric goal** → `—` |
| Goals are null on every contributing day (unbounded work only) | `—`; actual may still show |
| `goal === 0` after finalize | Treated as unbounded → `—` |
| `count+duration` but **neither** dimension has a goal | `—` |
| Only one of count/duration is bounded | That dimension's % is used (not a dash) |

### Period-goal path

| Situation | Result |
| --------- | ------ |
| `goalPeriod === "month"` | Every week is actual-only → `—` (target lives on the month donut only) |
| `goalPeriod === "week"` and available days in week ∩ validity > 0 | Real target (full or prorated) → percent, not `—` |
| `goalPeriod === "week"` but zero available days in that week | No seed → `—` |
| Period target field null for a dimension (`periodGoal` / `periodGoalDuration`) | That dimension stays unbounded; combined % uses only bounded dimensions |

Actual/goal text under the dash can still show recorded work
(`formatProgressActualGoal`). Legacy `+ N counts` lines are independent of the
headline percent.

The month donut uses the same null rule: no bounded current metrics → no
percentage in the center.

---

## Tracking modes → metric families

```ts
type ProgressMetric = "completion" | "count" | "duration";
```

| Tracking mode | Due-day metrics | Period-goal metrics |
| ------------- | --------------- | ------------------- |
| `boolean` | `completion` | **`count`** |
| `count` | `count` | `count` |
| `duration` | `duration` | `duration` |
| `count+duration` | `count` **and** `duration` | same |

On the due-day path, boolean records are treated as **completions**, never as
historical count quantity. On the period-goal path, boolean maps to count so
`periodGoal` can mean “times per week/month.”

### What each mode shows on the card (due-day)

| Current mode | Primary lines | Donut / week % |
| ------------ | ------------- | -------------- |
| `boolean` | Completions as quantity; no `/ goal` | Usually `—` (no numeric target) |
| `count` | `actual / goal` counts when goals exist | Count attainment |
| `duration` | `Xh Ym / Xh Ym` (minutes → display) | Duration attainment |
| `count+duration` | Both lines independently | Average of **non-null** bounded dimension percents |

Projected due-day goals come from the definition: `goal` → count,
`goalDuration` → duration. A null definition goal creates no target contribution
for that dimension.

---

## Current metrics versus legacy

The task's **current** `trackingMode` selects primary card metrics.

For each historical record:

- Snapshot metric also in the current set → primary month/week totals.
- Snapshot metric **not** in the current set → `legacyMetrics` (muted
  `+ N …` lines).
- Never convert count ↔ duration ↔ completion.

| Current mode | Historical snapshot | Primary | Legacy |
| ------------ | ------------------- | ------- | ------ |
| `duration` | `count` | — | count |
| `duration` | `count+duration` | duration | count |
| `count+duration` | `count` | count | — |
| `count` | `boolean` | — | completion |

On the period-goal path, current-metric actuals always count toward both
`totalActual` and `targetedActual` (there is no per-record period-goal snapshot
to gate on). Legacy routing for non-current snapshot metrics stays the same.

Example week cell:

```text
W1                         80%
8h / 10h
+ 14 historical counts
```

---

## Targeted vs unbounded actuals

Each primary `ProgressMetricValue` tracks:

| Field | Meaning |
| ----- | ------- |
| `totalActual` | Every compatible recorded value (“This month” / week actual) |
| `targetedActual` | Due-day: actuals whose matching snapshot/current goal was non-null. Period: same as total for current metrics (window target seeded once). |
| `unboundedActual` | Compatible actuals with no matching goal (due-day path) |
| `goal` | Due-day: sum of snapshot goals + projected current goals. Period: seeded period target (possibly prorated / summed). |
| `percent` | Capped attainment from `targetedActual / goal`, or `null` |

Work logged without a target does **not** inflate later target percentages on
the due-day path. When `unboundedActual > 0` and a goal exists, the card shows a
secondary `+ …` line for that unbounded portion.

---

## Percentage math

### Per dimension

```text
rawPercent     = targetedActual / goal × 100
displayPercent = min(100, max(0, round(rawPercent)))
```

- No goal or `goal === 0` → `percent = null`.
- Chart and week headline use `displayPercent`.
- Actual/goal text stays **uncapped** so over-target work remains visible.

### Combined (`count+duration`)

```text
combinedPercent = average(non-null bounded display percentages)
```

- Cap each dimension **before** averaging so one dimension cannot cover for the
  other.
- One bounded dimension → that dimension alone.
- None → `null`.
- Month % is computed from **month totals**, not by averaging weekly percents
  (weeks can carry unequal target weight — especially under weekly period goals
  with prorated edges).

---

## Which tasks get a card

A task appears when either:

1. It has **at least one record** in the selected month (including **archived**
   tasks); or
2. **Period-goal path:** the task is **not** archived, `goalPeriod !== null`, and
   the selected month **overlaps** its validity window (`startsAt`/`endsAt`) —
   even with zero records; or
3. **Due-day path:** the month is currently open or future, the task is **not**
   archived, and its schedule has at least one **projectable** due day in that
   month (Option B: for the open month, past due days count too).

Also:

- Archived tasks with month records stay as history.
- Archived tasks never receive target projection **or** the period-goal
  zero-record membership boost.
- Closed past months never invent empty due-day cards from the current schedule.
- Period-goal tasks outside their validity window (e.g. June when `startsAt` is
  July) do not appear unless they have a record that month.
- Deleted tasks are gone (definition delete owns record cleanup).
- Reminders are excluded even though records share one table.

---

## Week boundaries

- ISO weeks: Monday–Sunday.
- First/last week clipped to the selected month.
- Every overlapping week is emitted (including empty ones) as `W1`…`W6`.
- Ranges from `shared/week-grouping/lib/get-weeks-in-month.ts`.
- Under weekly period goals, clipped edge weeks still get a **prorated** target
  when they have available days inside the validity window.

---

## Month and all-time totals

- **This month / Weekly done / Monthly done** — `totalActual` for current
  metric(s), plus `/ goal` when the window has a target; plus legacy month lines.
- **All time** — every record for the task, aggregated by semantic metric;
  current metrics first, non-current retained as earlier-tracking history.
  All-time is axis-agnostic (same scan for due-day and period-goal tasks).
- All-time input is minimal (`task_id`, `tracking_mode_snapshot`, `count`,
  `duration`) via `repository/progress/get-all-time-task-record-values.ts`.

```text
Current mode: duration · goalPeriod: week
Weekly done: 2h 26m / 3h
All time: 84h 15m
```

```text
Current mode: count+duration · goalPeriod: null
This month: 18 counts · 9h 10m
All time: 140 counts · 62h
```

---

## Not this model

| Surface | Helper | Role |
| ------- | ------ | ---- |
| Calendar pills | `transform/compute-task-month-progress.ts` | One % per task: scheduled days vs meaningful records under the **current** schedule |
| Home Today | `lib/record/derive-today-progress.ts` | Per-day dimensions from snapshots/current config |
| Progress report | `lib/progress/*` | Month/week/all-time report: due-day Option B **or** period-goal accumulation + legacy metrics |

Home Today still derives from TanStack `["activities"]` +
`["activityRecords"]`. Progress does **not** — after a write, Progress is fresh
on the next RSC navigation to `/progress`, not via the activity cache hub.

---

## Related

| Doc | Why |
| --- | --- |
| [read-models.md](./read-models.md) | Client definition/record caches; calendar + Home joins |
| [domain-model.md](./domain-model.md) | Day goals, period goals, priority, record snapshots |
| [scheduling.md](./scheduling.md) | `isActiveOnDay` behind due-day projection; period goals stay off this gate |
| [responsibilities.md](./responsibilities.md) | File map for `lib/progress`, `queries/progress`, … |
| [views/progress/docs/data-flow.md](../../../views/progress/docs/data-flow.md) | SSR page path, fetch, adjacent-month warming |
| [0015-record-configuration-snapshots.md](../../../docs/adr/0015-record-configuration-snapshots.md) | Why day-goal snapshots win on recorded days |
| [5-period-goals-plan.md](../../../app/development/workflow/activity/substeps/5-period-goals-plan.md) | Design decisions for the period-goal axis |
