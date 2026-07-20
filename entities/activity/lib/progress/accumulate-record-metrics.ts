/**
 * @file entities/activity/lib/progress/accumulate-record-metrics.ts
 * Accumulators for Progress primary and legacy metric windows.
 *
 * Purpose: Own all Progress math in one place — targeted vs unbounded actuals,
 *          goal sums, percent calculation, current-vs-legacy split, and
 *          `count+duration` headline averaging.
 * Used in: `entities/activity/lib/progress/build-task-progress.ts` only.
 * Used for: Rolling up one day, one week, one month, or all-time into
 *           `ProgressMetricValue` / `ProgressLegacyMetric` shapes.
 *
 * Function index:
 * - createProgressWindowAccumulator: empty month/week window
 * - accumulateRecordMetrics: ingest one recorded day (snapshot-aware)
 * - accumulateProjectedDayMetrics: ingest a projected due day (current goals)
 * - accumulateAllTimeActuals: ingest one all-time value row
 * - combineMetricPercents: average capped percents for `count+duration`
 * - finalizeProgressWindow: window → metrics + headline percent
 * - finalizeAllTimeMetrics: all-time totals → ordered legacy metrics
 */

import { metricsForTrackingMode } from "@/entities/activity/lib/progress/tracking-mode-metrics";
import type {
  ProgressLegacyMetric,
  ProgressMetric,
  ProgressMetricValue,
} from "@/entities/activity/model/progress-read-models";
import type {
  Activity,
  ActivityRecord,
  TrackingMode,
} from "@/entities/activity/model/types";

interface MetricAccumulator {
  totalActual: number;
  targetedActual: number;
  unboundedActual: number;
  goalSum: number;
  hadGoal: boolean;
}

/**
 * Mutable metric window for a month or week.
 */
export interface ProgressWindowAccumulator {
  /** Primary metrics for the current tracking mode. */
  primary: Map<ProgressMetric, MetricAccumulator>;
  /** Snapshot metrics that are no longer current. */
  legacy: Map<ProgressMetric, number>;
}

function createMetricAccumulator(): MetricAccumulator {
  return {
    totalActual: 0,
    targetedActual: 0,
    unboundedActual: 0,
    goalSum: 0,
    hadGoal: false,
  };
}

/**
 * Creates an empty window with primary slots for the current tracking mode.
 *
 * @param currentTrackingMode - task's current definition mode
 */
export function createProgressWindowAccumulator(
  currentTrackingMode: TrackingMode,
): ProgressWindowAccumulator {
  const primary = new Map<ProgressMetric, MetricAccumulator>();

  for (const metric of metricsForTrackingMode(currentTrackingMode)) {
    primary.set(metric, createMetricAccumulator());
  }

  return { primary, legacy: new Map() };
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

function goalForMetric(
  metric: ProgressMetric,
  goal: number | null,
  goalDuration: number | null,
): number | null {
  switch (metric) {
    case "completion":
      return null;
    case "count":
      return goal !== null && goal > 0 ? goal : null;
    case "duration":
      return goalDuration !== null && goalDuration > 0 ? goalDuration : null;
  }
}

function addPrimaryActual(
  accumulator: MetricAccumulator,
  actual: number,
  goal: number | null,
): void {
  accumulator.totalActual += actual;

  if (goal !== null) {
    accumulator.targetedActual += actual;
    accumulator.goalSum += goal;
    accumulator.hadGoal = true;
    return;
  }

  accumulator.unboundedActual += actual;
}

function addPrimaryGoalOnly(
  accumulator: MetricAccumulator,
  goal: number | null,
): void {
  if (goal === null) {
    return;
  }

  accumulator.goalSum += goal;
  accumulator.hadGoal = true;
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
 * Applies one historical record into a progress window.
 *
 * Snapshot metrics that match the current mode go to primary; others go to
 * legacy. Never converts between completion, count, and duration.
 *
 * @param window - mutable month or week accumulator
 * @param record - day record (values + snapshots)
 * @param currentTrackingMode - task's current definition mode
 */
export function accumulateRecordMetrics(
  window: ProgressWindowAccumulator,
  record: Pick<
    ActivityRecord,
    | "trackingModeSnapshot"
    | "goalSnapshot"
    | "goalDurationSnapshot"
    | "count"
    | "duration"
  >,
  currentTrackingMode: TrackingMode,
): void {
  const currentMetrics = new Set(metricsForTrackingMode(currentTrackingMode));

  for (const metric of metricsForTrackingMode(record.trackingModeSnapshot)) {
    const actual = actualForMetric(metric, record.count, record.duration);

    if (currentMetrics.has(metric)) {
      const primary = window.primary.get(metric);

      if (!primary) {
        continue;
      }

      addPrimaryActual(
        primary,
        actual,
        goalForMetric(metric, record.goalSnapshot, record.goalDurationSnapshot),
      );
      continue;
    }

    addLegacyActual(window.legacy, metric, actual);
  }
}

/**
 * Applies a projected due day from the current definition (no record).
 *
 * Adds current goals only — actuals stay zero so future targets do not invent
 * completed work.
 *
 * @param window - mutable month or week accumulator
 * @param activity - current task definition
 */
export function accumulateProjectedDayMetrics(
  window: ProgressWindowAccumulator,
  activity: Pick<Activity, "trackingMode" | "goal" | "goalDuration">,
): void {
  for (const metric of metricsForTrackingMode(activity.trackingMode)) {
    const primary = window.primary.get(metric);

    if (!primary) {
      continue;
    }

    addPrimaryGoalOnly(
      primary,
      goalForMetric(metric, activity.goal, activity.goalDuration),
    );
  }
}

/**
 * Applies one all-time value row into a legacy-style actual map.
 *
 * @param totals - mutable metric → actual map
 * @param count - recorded count
 * @param duration - recorded duration in minutes
 * @param trackingModeSnapshot - record mode at write time
 */
export function accumulateAllTimeActuals(
  totals: Map<ProgressMetric, number>,
  count: number,
  duration: number,
  trackingModeSnapshot: TrackingMode,
): void {
  for (const metric of metricsForTrackingMode(trackingModeSnapshot)) {
    const actual = actualForMetric(metric, count, duration);

    if (actual === 0) {
      continue;
    }

    totals.set(metric, (totals.get(metric) ?? 0) + actual);
  }
}

function finalizeMetric(
  metric: ProgressMetric,
  accumulator: MetricAccumulator,
): ProgressMetricValue {
  const goal = accumulator.hadGoal ? accumulator.goalSum : null;
  const percent =
    goal === null
      ? null
      : Math.min(
          100,
          Math.max(0, Math.round((accumulator.targetedActual / goal) * 100)),
        );

  return {
    metric,
    totalActual: accumulator.totalActual,
    targetedActual: accumulator.targetedActual,
    unboundedActual: accumulator.unboundedActual,
    goal,
    percent,
  };
}

/**
 * Headline percent from primary metrics.
 *
 * Caps each dimension first (via finalized `percent`), then averages non-null
 * percentages. Unlike units are never added.
 *
 * @param metrics - finalized primary metric values
 */
export function combineMetricPercents(
  metrics: ProgressMetricValue[],
): number | null {
  const percents = metrics
    .map((metric) => metric.percent)
    .filter((percent): percent is number => percent !== null);

  if (percents.length === 0) {
    return null;
  }

  const sum = percents.reduce((total, percent) => total + percent, 0);

  return Math.round(sum / percents.length);
}

/**
 * Finalizes a window into primary metrics, legacy metrics, and headline percent.
 *
 * @param window - filled accumulator
 * @param currentTrackingMode - controls primary metric order
 */
export function finalizeProgressWindow(
  window: ProgressWindowAccumulator,
  currentTrackingMode: TrackingMode,
): {
  metrics: ProgressMetricValue[];
  legacyMetrics: ProgressLegacyMetric[];
  percent: number | null;
} {
  const metrics = metricsForTrackingMode(currentTrackingMode).map((metric) => {
    const accumulator = window.primary.get(metric) ?? createMetricAccumulator();

    return finalizeMetric(metric, accumulator);
  });

  const legacyMetrics: ProgressLegacyMetric[] = [];

  for (const metric of ["completion", "count", "duration"] as const) {
    const actual = window.legacy.get(metric);

    if (actual !== undefined && actual > 0) {
      legacyMetrics.push({ metric, actual });
    }
  }

  return {
    metrics,
    legacyMetrics,
    percent: combineMetricPercents(metrics),
  };
}

/**
 * Orders all-time metric totals: current-mode metrics first, then earlier ones.
 *
 * @param totals - aggregated all-time actuals by metric
 * @param currentTrackingMode - task's current definition mode
 */
export function finalizeAllTimeMetrics(
  totals: Map<ProgressMetric, number>,
  currentTrackingMode: TrackingMode,
): ProgressLegacyMetric[] {
  const current = new Set(metricsForTrackingMode(currentTrackingMode));
  const ordered: ProgressLegacyMetric[] = [];

  for (const metric of metricsForTrackingMode(currentTrackingMode)) {
    const actual = totals.get(metric);

    if (actual !== undefined && actual > 0) {
      ordered.push({ metric, actual });
    }
  }

  for (const metric of ["completion", "count", "duration"] as const) {
    if (current.has(metric)) {
      continue;
    }

    const actual = totals.get(metric);

    if (actual !== undefined && actual > 0) {
      ordered.push({ metric, actual });
    }
  }

  return ordered;
}
