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

---

## Quick answers

| Question | Short answer |
| -------- | ------------ |
| Where do these numbers come from? | Month records + optional projected due-day goals, aggregated into current metrics; all-time is a separate scan of every record for the task. |
| Why is a week a dash (`—`)? | No comparable target in that week — `percent` is `null` (unbounded, completion-only, or no projectable/recorded goals). |
| What does count / duration / both do? | Current `trackingMode` picks primary metric families; older snapshots that no longer match become muted legacy lines. |
| Why did a past empty day count as a miss? | Option B: in the **currently-open** month, missing due days project as `0` against the current goal so the % stays stable through the month. |

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
         ├─ walk each day in the month
         │    record exists  → accumulateRecordMetrics (snapshots win)
         │    no record      → maybe accumulateProjectedDayMetrics (Option B)
         ├─ finalize month window → percent, metrics, legacy
         ├─ finalize each ISO week window
         └─ finalize all-time totals
```

Presentation (`features/activity/activity-progress-card`) only **formats** the
resulting `ProgressTask`. It does not recompute attainment.

Duration is stored and aggregated in **minutes**; hours/minutes strings appear
only at the presentation boundary.

---

## Month timeline rule (Option B)

For each date in the selected month:

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

---

## Why a week shows `—`

The week column renders:

```text
week.percent === null ? "—" : `${week.percent}%`
```

`percent` is `null` when there is **no bounded primary target** in that week:

| Situation | Result |
| --------- | ------ |
| No due days / no records / no projected goals in the week | `—` (and often `0` or empty actual lines) |
| Current mode is `boolean` (`completion`) | Completions have **no numeric goal** → `—` |
| Goals are null on every contributing day (unbounded work only) | `—`; actual may still show as a quantity without `/ goal` |
| `goal === 0` after finalize | Treated as unbounded → `—` |
| `count+duration` but **neither** dimension has a goal | `—` |
| Only one of count/duration is bounded | That dimension's % is used (not a dash) |

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

| Tracking mode | Metrics on that record / projected day |
| ------------- | -------------------------------------- |
| `boolean` | `completion` |
| `count` | `count` |
| `duration` | `duration` |
| `count+duration` | `count` **and** `duration` |

Boolean records physically store `count = 1`, but Progress treats them as
**completions**, never as historical count quantity.

### What each mode shows on the card

| Current mode | Primary lines | Donut / week % |
| ------------ | ------------- | -------------- |
| `boolean` | Completions as quantity; no `/ goal` | Usually `—` (no numeric target) |
| `count` | `actual / goal` counts when goals exist | Count attainment |
| `duration` | `Xh Ym / Xh Ym` (minutes → display) | Duration attainment |
| `count+duration` | Both lines independently | Average of **non-null** bounded dimension percents |

Projected goals come from the definition: `goal` → count, `goalDuration` →
duration. A null definition goal creates no target contribution for that
dimension.

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
| `targetedActual` | Compatible actuals whose matching snapshot/current goal was non-null |
| `unboundedActual` | Compatible actuals with no matching goal |
| `goal` | Sum of snapshot goals + projected current goals |
| `percent` | Capped attainment from `targetedActual / goal`, or `null` |

Work logged without a target does **not** inflate later target percentages.
When `unboundedActual > 0` and a goal exists, the card shows a secondary
`+ …` line for that unbounded portion.

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
  (weeks can carry unequal target weight).

---

## Which tasks get a card

A task appears when either:

1. It has **at least one record** in the selected month (including **archived**
   tasks); or
2. The month is currently open or future, the task is **not** archived, and its
   schedule has at least one **projectable** due day in that month (Option B:
   for the open month, past due days count too).

Also:

- Archived tasks with month records stay as history.
- Archived tasks never receive target projection.
- Closed past months never invent empty cards from the current schedule.
- Deleted tasks are gone (definition delete owns record cleanup).
- Reminders are excluded even though records share one table.

---

## Week boundaries

- ISO weeks: Monday–Sunday.
- First/last week clipped to the selected month.
- Every overlapping week is emitted (including empty ones) as `W1`…`W6`.
- Ranges from `shared/week-grouping/lib/get-weeks-in-month.ts`.

---

## Month and all-time totals

- **This month** — `totalActual` for current metric(s), plus legacy month lines.
- **All time** — every record for the task, aggregated by semantic metric;
  current metrics first, non-current retained as earlier-tracking history.
- All-time input is minimal (`task_id`, `tracking_mode_snapshot`, `count`,
  `duration`) via `repository/progress/get-all-time-task-record-values.ts`.

```text
Current mode: duration
This month: 12h 30m
All time: 84h 15m
Earlier tracking: 42 counts
```

```text
Current mode: count+duration
This month: 18 counts · 9h 10m
All time: 140 counts · 62h
```

---

## Not this model

| Surface | Helper | Role |
| ------- | ------ | ---- |
| Calendar pills | `transform/compute-task-month-progress.ts` | One % per task: scheduled days vs meaningful records under the **current** schedule |
| Home Today | `lib/record/derive-today-progress.ts` | Per-day dimensions from snapshots/current config |
| Progress report | `lib/progress/*` | Month/week/all-time report with Option B projection + legacy metrics |

Home Today still derives from TanStack `["activities"]` +
`["activityRecords"]`. Progress does **not** — after a write, Progress is fresh
on the next RSC navigation to `/progress`, not via the activity cache hub.

---

## Related

| Doc | Why |
| --- | --- |
| [read-models.md](./read-models.md) | Client definition/record caches; calendar + Home joins |
| [domain-model.md](./domain-model.md) | Record snapshots and historical consequences |
| [scheduling.md](./scheduling.md) | `isActiveOnDay` behind projection |
| [responsibilities.md](./responsibilities.md) | File map for `lib/progress`, `queries/progress`, … |
| [views/progress/docs/data-flow.md](../../../views/progress/docs/data-flow.md) | SSR page path, fetch, adjacent-month warming |
| [0015-record-configuration-snapshots.md](../../../docs/adr/0015-record-configuration-snapshots.md) | Why snapshots win on recorded days |
