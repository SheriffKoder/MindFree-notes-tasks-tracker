/**
 * @file features/activity/activity-progress-card/ui/progress-card-summary.tsx
 * Month and all-time summary lines for a Progress card.
 *
 * Purpose: Format current-metric totals for the month line and “All time”, plus
 *          muted earlier-tracking / unbounded lines. No domain calculation.
 * Used in: `features/activity/activity-progress-card/ui/activity-progress-card.tsx`.
 * Used for: Middle section of each Progress card.
 */

import type {
  GoalPeriod,
  ProgressLegacyMetric,
  ProgressMetricValue,
  TaskAllTimeProgress,
  TaskMonthProgress,
} from "@/entities/activity";
import {
  formatProgressDuration,
  formatProgressMetricList,
  formatProgressMetricValue,
} from "@/features/activity/activity-progress-card/lib/format-progress-value";

export interface ProgressCardSummaryProps {
  /** Selected-month aggregation. */
  month: TaskMonthProgress;
  /** All-time aggregation. */
  allTime: TaskAllTimeProgress;
  /**
   * When set, the month line is labeled as period done (“Weekly done” /
   * “Monthly done”) instead of “This month”.
   */
  goalPeriod?: GoalPeriod | null;
}

function monthCaption(goalPeriod: GoalPeriod | null | undefined): string {
  switch (goalPeriod) {
    case "week":
      return "Weekly done";
    case "month":
      return "Monthly done";
    default:
      return "This month";
  }
}

function formatActualPart(metric: ProgressMetricValue): string {
  if (metric.metric === "duration") {
    return formatProgressDuration(metric.totalActual);
  }

  if (metric.goal !== null) {
    // Compact beside `/ goal` (week-column style): bare numbers for count.
    return String(metric.totalActual);
  }

  return formatProgressMetricValue(metric.metric, metric.totalActual);
}

function formatGoalPart(metric: ProgressMetricValue): string | null {
  if (metric.goal === null) {
    return null;
  }

  if (metric.metric === "duration") {
    return formatProgressDuration(metric.goal);
  }

  return String(metric.goal);
}

function formatAllTimeMetrics(metrics: ProgressLegacyMetric[]): string {
  return formatProgressMetricList(
    metrics.map((metric) =>
      formatProgressMetricValue(metric.metric, metric.actual),
    ),
  );
}

/**
 * Renders this-month (or period done), all-time, and secondary history lines.
 */
export function ProgressCardSummary({
  month,
  allTime,
  goalPeriod = null,
}: ProgressCardSummaryProps) {
  const allTimePrimary = formatAllTimeMetrics(allTime.metrics);
  const unboundedLines = month.metrics.filter(
    (metric) => metric.unboundedActual > 0 && metric.goal !== null,
  );

  return (
    <div className="flex flex-col gap-1 text-sm">
      <p className="[color:var(--color-fg)]">
        <span className="[color:var(--color-fg-muted)]">
          {monthCaption(goalPeriod)}:
        </span>{" "}
        {month.metrics.length === 0 ? (
          <span className="tabular-nums">—</span>
        ) : (
          month.metrics.map((metric, index) => {
            const goalPart = formatGoalPart(metric);

            return (
              <span key={metric.metric} className="tabular-nums">
                {index > 0 ? (
                  <span className="[color:var(--color-fg-muted)]"> · </span>
                ) : null}
                <span>{formatActualPart(metric)}</span>
                {goalPart !== null ? (
                  <span className="[color:var(--color-fg-muted)]">
                    {" "}
                    / {goalPart}
                  </span>
                ) : null}
              </span>
            );
          })
        )}
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
