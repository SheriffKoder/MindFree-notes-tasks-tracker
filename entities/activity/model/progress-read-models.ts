/**
 * @file entities/activity/model/progress-read-models.ts
 * Server-to-view contract for the Progress page monthly report.
 *
 * Purpose: Define the typed read model returned by `getProgressPageData` — month
 *          totals, weekly breakdowns, all-time totals, and legacy metrics. Not
 *          an API payload and not TanStack-hydrated.
 * Used in: `entities/activity/lib/progress/*` (pure builders),
 *          `entities/activity/queries/progress/get-progress-page-data.ts`,
 *          `features/activity/activity-progress-card` (Step 5),
 *          `views/progress` (Step 6).
 * Used for: Progress card UI, month navigator, and any consumer that needs the
 *           assembled monthly report shape.
 *
 * Type index:
 * - ProgressMetric, ProgressMetricValue — semantic metric families and totals
 * - ProgressLegacyMetric — historical metrics no longer in the current mode
 * - TaskWeekProgress, TaskMonthProgress, TaskAllTimeProgress — aggregations
 * - ProgressTask — one card row
 * - ProgressPageData — full page payload for one month
 */

import type { TrackingMode } from "@/entities/activity/model/types";

/**
 * Semantic metric family used by Progress aggregations.
 *
 * Boolean records contribute `completion` (not historical count quantity).
 */
export type ProgressMetric = "completion" | "count" | "duration";

/**
 * One primary metric total for a week or month window.
 *
 * `totalActual` may exceed `targetedActual` when some recorded work had no
 * matching snapshot/current goal. `percent` is capped display percent, or
 * `null` when the metric is unbounded.
 */
export interface ProgressMetricValue {
  /** Metric family represented by this total. */
  metric: ProgressMetric;
  /** Every compatible recorded value in the window. */
  totalActual: number;
  /** Compatible actuals whose matching goal was non-null. */
  targetedActual: number;
  /** Compatible actuals recorded without a matching goal. */
  unboundedActual: number;
  /** Comparable target total for the window, or `null` when unbounded. */
  goal: number | null;
  /** Capped whole-number attainment percent (0–100), or `null` when unbounded. */
  percent: number | null;
}

/**
 * Historical metric that is not part of the task's current tracking mode.
 */
export interface ProgressLegacyMetric {
  /** Metric family retained as earlier-tracking history. */
  metric: ProgressMetric;
  /** Aggregated actual for that metric in the window. */
  actual: number;
}

/**
 * Progress for one ISO week clipped to the selected month.
 */
export interface TaskWeekProgress {
  /** 1-based week index (`W1`, `W2`, …) within the month. */
  weekNumber: number;
  /** Inclusive ISO start, clipped to the month. */
  rangeStart: string;
  /** Inclusive ISO end, clipped to the month. */
  rangeEnd: string;
  /**
   * Headline week percent from current metrics (averaged for
   * `count+duration`), or `null` when unbounded.
   */
  percent: number | null;
  /** Primary metrics for the task's current tracking mode. */
  metrics: ProgressMetricValue[];
  /** Snapshot metrics that are no longer current. */
  legacyMetrics: ProgressLegacyMetric[];
}

/**
 * Aggregated Progress for the selected month.
 */
export interface TaskMonthProgress {
  /**
   * Month headline percent from month dimension totals (not an average of
   * weekly percents), or `null` when unbounded.
   */
  percent: number | null;
  /** Primary metrics for the task's current tracking mode. */
  metrics: ProgressMetricValue[];
  /** Snapshot metrics that are no longer current. */
  legacyMetrics: ProgressLegacyMetric[];
}

/**
 * All-time totals across every record for the task.
 *
 * Uses the legacy-metric shape (actual only) because all-time has no single
 * comparable goal window.
 */
export interface TaskAllTimeProgress {
  /** Semantic metric totals across all records for the task. */
  metrics: ProgressLegacyMetric[];
}

/**
 * One task card on the Progress page.
 */
export interface ProgressTask {
  /** Activity definition id. */
  id: string;
  /** Display title. */
  title: string;
  /** Task color accent, or `null`. */
  color: string | null;
  /** Optional icon key, or `null`. */
  icon: string | null;
  /** Current tracking mode selecting primary card metrics. */
  trackingMode: TrackingMode;
  /** Archive timestamp when archived; `null` when active. */
  archivedAt: string | null;
  /** Selected-month aggregation. */
  month: TaskMonthProgress;
  /** All-time aggregation. */
  allTime: TaskAllTimeProgress;
  /** Every clipped ISO week overlapping the month, including empty weeks. */
  weeks: TaskWeekProgress[];
}

/**
 * Full Progress page payload for one selected month.
 */
export interface ProgressPageData {
  /** Month key (`YYYY-MM`). */
  month: string;
  /** Task cards included for the month (active + archived-with-records). */
  tasks: ProgressTask[];
}
