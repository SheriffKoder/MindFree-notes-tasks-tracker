/**
 * @file entities/activity/lib/progress/accumulate-period-goal-metrics.ts
 * Period-goal Progress windows — seed targets once, accumulate recorded actuals.
 *
 * Purpose: Second Progress accumulation path for tasks with `goalPeriod` set.
 *          Never touches schedule / due-day projection; actuals are "what got
 *          recorded" only. Reuses the same window/finalize machinery as the
 *          due-day path.
 * Used in: `entities/activity/lib/progress/build-task-progress.ts`
 * Used for: Week/month period targets on the Progress page (period-goals plan).
 *
 * Function index:
 * - inclusiveDayCount / availableDaysInWeek: day spans for week proration
 * - prorateWeekPeriodGoal: scale a weekly target by available days / 7
 * - seedPeriodGoal / seedPeriodGoalsForActivity: seed window goals
 * - accumulatePeriodRecordMetrics: ingest one recorded day into a period window
 */

import {
  addUnconditionalPrimaryActual,
  seedPrimaryGoal,
  type ProgressWindowAccumulator,
} from "@/entities/activity/lib/progress/accumulate-record-metrics";
import { metricsForTrackingMode } from "@/entities/activity/lib/progress/tracking-mode-metrics";
import type { ProgressMetric } from "@/entities/activity/model/progress-read-models";
import type {
  Activity,
  ActivityRecord,
  TrackingMode,
} from "@/entities/activity/model/types";
import type { WeekInMonthRange } from "@/shared/week-grouping/lib/get-weeks-in-month";

const PERIOD_OPTIONS = { periodGoal: true } as const;
const FULL_WEEK_DAYS = 7;

/**
 * Inclusive day count between two ISO dates (`YYYY-MM-DD`).
 */
export function inclusiveDayCount(rangeStart: string, rangeEnd: string): number {
  const start = Date.UTC(
    Number(rangeStart.slice(0, 4)),
    Number(rangeStart.slice(5, 7)) - 1,
    Number(rangeStart.slice(8, 10)),
  );
  const end = Date.UTC(
    Number(rangeEnd.slice(0, 4)),
    Number(rangeEnd.slice(5, 7)) - 1,
    Number(rangeEnd.slice(8, 10)),
  );

  return Math.round((end - start) / 86_400_000) + 1;
}

/**
 * Days in a clipped month week that also fall inside `startsAt`/`endsAt`.
 *
 * Returns 0 when the week lies entirely outside the validity window.
 *
 * @param week - clipped week range from `getWeeksInMonth`
 * @param activity - definition carrying the validity window
 */
export function availableDaysInWeek(
  week: WeekInMonthRange,
  activity: Pick<Activity, "startsAt" | "endsAt">,
): number {
  let rangeStart = week.rangeStart;
  let rangeEnd = week.rangeEnd;

  if (activity.startsAt && activity.startsAt > rangeStart) {
    rangeStart = activity.startsAt;
  }

  if (activity.endsAt && activity.endsAt < rangeEnd) {
    rangeEnd = activity.endsAt;
  }

  if (rangeStart > rangeEnd) {
    return 0;
  }

  return inclusiveDayCount(rangeStart, rangeEnd);
}

/**
 * Scales a weekly period target by available days in the clipped week.
 *
 * Full weeks (`availableDays >= 7`) keep the full goal. Partial edge weeks
 * (and weeks clipped by `startsAt`/`endsAt`) use `goal × days / 7`.
 *
 * @param goal - full-week period target
 * @param availableDays - days grading this week (0–7+)
 */
export function prorateWeekPeriodGoal(
  goal: number,
  availableDays: number,
): number {
  if (availableDays <= 0) {
    return 0;
  }

  if (availableDays >= FULL_WEEK_DAYS) {
    return goal;
  }

  return (goal * availableDays) / FULL_WEEK_DAYS;
}

function actualForMetric(
  metric: ProgressMetric,
  count: number,
  duration: number,
): number {
  switch (metric) {
    case "completion":
      return count > 0 ? 1 : 0;
    case "count":
      return count;
    case "duration":
      return duration;
  }
}

function addLegacyActual(
  legacy: Map<ProgressMetric, number>,
  metric: ProgressMetric,
  actual: number,
): void {
  if (actual === 0) {
    return;
  }

  legacy.set(metric, (legacy.get(metric) ?? 0) + actual);
}

/**
 * Seeds one primary dimension from the task's period-goal fields.
 *
 * @param window - mutable month or week accumulator
 * @param activity - definition carrying `periodGoal` / `periodGoalDuration`
 * @param dimension - which primary slot to seed (`count` or `duration`)
 * @param availableDays - when set, prorates a weekly target by days / 7
 */
export function seedPeriodGoal(
  window: ProgressWindowAccumulator,
  activity: Pick<Activity, "periodGoal" | "periodGoalDuration">,
  dimension: "count" | "duration",
  availableDays: number = FULL_WEEK_DAYS,
): void {
  const raw =
    dimension === "count" ? activity.periodGoal : activity.periodGoalDuration;

  if (raw === null) {
    return;
  }

  seedPrimaryGoal(window, dimension, prorateWeekPeriodGoal(raw, availableDays));
}

/**
 * Seeds every primary dimension the current tracking mode uses for period goals.
 *
 * Boolean → count from `periodGoal`. `count+duration` seeds each dimension
 * independently (a null period field leaves that dimension goal-less).
 *
 * @param window - mutable month or week accumulator
 * @param activity - definition with tracking mode + period fields
 * @param availableDays - when set, prorates weekly targets by days / 7
 */
export function seedPeriodGoalsForActivity(
  window: ProgressWindowAccumulator,
  activity: Pick<
    Activity,
    "trackingMode" | "periodGoal" | "periodGoalDuration"
  >,
  availableDays: number = FULL_WEEK_DAYS,
): void {
  for (const metric of metricsForTrackingMode(
    activity.trackingMode,
    PERIOD_OPTIONS,
  )) {
    if (metric === "completion") {
      continue;
    }

    seedPeriodGoal(window, activity, metric, availableDays);
  }
}

/**
 * Applies one historical record into a period-goal window.
 *
 * Current-metric actuals always land in both `totalActual` and
 * `targetedActual` — the period target is window-level (seeded once), not
 * gated by per-record goal snapshots. Legacy routing matches the due-day path.
 *
 * Boolean period-goal tasks grade done days as `count` quantity.
 *
 * @param window - mutable month or week accumulator
 * @param record - day record (values + snapshots)
 * @param currentTrackingMode - task's current definition mode
 */
export function accumulatePeriodRecordMetrics(
  window: ProgressWindowAccumulator,
  record: Pick<
    ActivityRecord,
    "trackingModeSnapshot" | "count" | "duration"
  >,
  currentTrackingMode: TrackingMode,
): void {
  const currentMetrics = new Set(
    metricsForTrackingMode(currentTrackingMode, PERIOD_OPTIONS),
  );

  // Boolean period goals: completions count as count quantity (decision 3).
  if (
    currentTrackingMode === "boolean" &&
    record.trackingModeSnapshot === "boolean"
  ) {
    addUnconditionalPrimaryActual(window, "count", record.count);
    return;
  }

  for (const metric of metricsForTrackingMode(record.trackingModeSnapshot)) {
    const actual = actualForMetric(metric, record.count, record.duration);

    if (currentMetrics.has(metric)) {
      addUnconditionalPrimaryActual(window, metric, actual);
      continue;
    }

    addLegacyActual(window.legacy, metric, actual);
  }
}
