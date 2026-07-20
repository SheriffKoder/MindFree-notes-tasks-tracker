/**
 * @file features/activity/activity-progress-card/ui/progress-card-summary.tsx
 * Month and all-time summary lines for a Progress card.
 *
 * Purpose: Format current-metric totals for “This month” and “All time”, plus
 *          muted earlier-tracking / unbounded lines. No domain calculation.
 * Used in: `features/activity/activity-progress-card/ui/activity-progress-card.tsx`.
 * Used for: Middle section of each Progress card.
 */

import type {
  ProgressLegacyMetric,
  ProgressMetricValue,
  TaskAllTimeProgress,
  TaskMonthProgress,
} from "@/entities/activity";
import {
  formatProgressMetricList,
  formatProgressMetricValue,
} from "@/features/activity/activity-progress-card/lib/format-progress-value";

export interface ProgressCardSummaryProps {
  /** Selected-month aggregation. */
  month: TaskMonthProgress;
  /** All-time aggregation. */
  allTime: TaskAllTimeProgress;
}

function formatPrimaryMetrics(metrics: ProgressMetricValue[]): string {
  return formatProgressMetricList(
    metrics.map((metric) =>
      formatProgressMetricValue(metric.metric, metric.totalActual),
    ),
  );
}

function formatAllTimeMetrics(metrics: ProgressLegacyMetric[]): string {
  return formatProgressMetricList(
    metrics.map((metric) =>
      formatProgressMetricValue(metric.metric, metric.actual),
    ),
  );
}

/**
 * Renders this-month, all-time, and secondary history lines.
 */
export function ProgressCardSummary({
  month,
  allTime,
}: ProgressCardSummaryProps) {
  const monthPrimary = formatPrimaryMetrics(month.metrics);
  const allTimePrimary = formatAllTimeMetrics(allTime.metrics);
  const unboundedLines = month.metrics.filter(
    (metric) => metric.unboundedActual > 0 && metric.goal !== null,
  );

  return (
    <div className="flex flex-col gap-1 text-sm">
      <p className="[color:var(--color-fg)]">
        <span className="[color:var(--color-fg-muted)]">This month:</span>{" "}
        <span className="tabular-nums">
          {monthPrimary.length > 0 ? monthPrimary : "—"}
        </span>
      </p>
      <p className="[color:var(--color-fg)]">
        <span className="[color:var(--color-fg-muted)]">All time:</span>{" "}
        <span className="tabular-nums">
          {allTimePrimary.length > 0 ? allTimePrimary : "—"}
        </span>
      </p>
      {unboundedLines.map((metric) => (
        <p
          key={`unbounded-${metric.metric}`}
          className="text-caption [color:var(--color-fg-hint)]"
        >
          + {formatProgressMetricValue(metric.metric, metric.unboundedActual)}{" "}
          without target
        </p>
      ))}
      {month.legacyMetrics.map((legacy) => (
        <p
          key={`legacy-${legacy.metric}`}
          className="text-caption [color:var(--color-fg-hint)]"
        >
          Earlier tracking:{" "}
          {formatProgressMetricValue(legacy.metric, legacy.actual)}
        </p>
      ))}
    </div>
  );
}
