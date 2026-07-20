/**
 * @file entities/activity/lib/progress/tracking-mode-metrics.ts
 * Maps tracking modes to Progress semantic metric families.
 *
 * Purpose: Translate `TrackingMode` into the metric vocabulary Progress uses
 *          (`completion`, `count`, `duration`). Boolean contributes completion,
 *          not count quantity.
 * Used in: `entities/activity/lib/progress/accumulate-record-metrics.ts`,
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
 * Semantic metrics carried by a tracking mode (definition or snapshot).
 *
 * Boolean contributes `completion`, never count quantity.
 *
 * @param trackingMode - definition or record snapshot mode
 * @returns ordered metric families for that mode
 */
export function metricsForTrackingMode(
  trackingMode: TrackingMode,
): readonly ProgressMetric[] {
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
 */
export function isCurrentMetric(
  trackingMode: TrackingMode,
  metric: ProgressMetric,
): boolean {
  return metricsForTrackingMode(trackingMode).includes(metric);
}
