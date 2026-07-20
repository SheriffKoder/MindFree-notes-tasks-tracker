/**
 * @file entities/activity/lib/progress/tracking-mode-metrics.ts
 * Maps tracking modes to Progress semantic metric families.
 *
 * Purpose: Translate `TrackingMode` into the metric vocabulary Progress uses
 *          (`completion`, `count`, `duration`). Boolean contributes completion
 *          on the due-day path; period-goal boolean uses count quantity.
 * Used in: `entities/activity/lib/progress/accumulate-record-metrics.ts`,
 *          `entities/activity/lib/progress/accumulate-period-goal-metrics.ts`,
 *          `entities/activity/lib/progress/index.ts` (re-exported for tests).
 * Used for: Choosing primary card metrics and splitting current vs legacy totals.
 *
 * Function index:
 * - metricsForTrackingMode: mode → ordered `ProgressMetric[]`
 * - isCurrentMetric: whether a metric belongs to the task's current mode
 */

import type { ProgressMetric } from "@/entities/activity/model/progress-read-models";
import type { TrackingMode } from "@/entities/activity/model/types";

/**
 * Options for Progress metric vocabulary.
 *
 * When `periodGoal` is true, boolean grades as `count` (completions-per-period)
 * instead of `completion` (decision 3 in the period-goals plan).
 */
export interface ProgressMetricOptions {
  periodGoal?: boolean;
}

/**
 * Semantic metrics carried by a tracking mode (definition or snapshot).
 *
 * Boolean contributes `completion` on the due-day path. Period-goal boolean
 * contributes `count` so `periodGoal` can express "N times per week/month."
 *
 * @param trackingMode - definition or record snapshot mode
 * @param options - pass `{ periodGoal: true }` for the period-goal path
 * @returns ordered metric families for that mode
 */
export function metricsForTrackingMode(
  trackingMode: TrackingMode,
  options?: ProgressMetricOptions,
): readonly ProgressMetric[] {
  if (options?.periodGoal && trackingMode === "boolean") {
    return ["count"];
  }

  switch (trackingMode) {
    case "boolean":
      return ["completion"];
    case "count":
      return ["count"];
    case "duration":
      return ["duration"];
    case "count+duration":
      return ["count", "duration"];
  }
}

/**
 * Whether a metric is part of the task's current primary card metrics.
 *
 * @param trackingMode - current definition tracking mode
 * @param metric - candidate metric family
 * @param options - same options as {@link metricsForTrackingMode}
 */
export function isCurrentMetric(
  trackingMode: TrackingMode,
  metric: ProgressMetric,
  options?: ProgressMetricOptions,
): boolean {
  return metricsForTrackingMode(trackingMode, options).includes(metric);
}
