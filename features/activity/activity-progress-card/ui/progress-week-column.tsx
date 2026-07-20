/**
 * @file features/activity/activity-progress-card/ui/progress-week-column.tsx
 * One week column inside a Progress card (W1–W6).
 *
 * Purpose: Present week headline percent, primary actual/goal lines, and muted
 *          legacy/unbounded secondary lines. Formatting only — no Progress math.
 * Used in: `features/activity/activity-progress-card/ui/progress-card-weeks.tsx`.
 * Used for: Bottom row of each Progress card.
 */

import type { TaskWeekProgress } from "@/entities/activity";
import {
  formatProgressActualGoal,
  formatProgressLegacyLine,
  formatProgressMetricValue,
} from "@/features/activity/activity-progress-card/lib/format-progress-value";

export interface ProgressWeekColumnProps {
  /** One clipped ISO week from the Progress read model. */
  week: TaskWeekProgress;
}

/**
 * Renders a single week column: label, percent, actual/goal, secondary lines.
 */
export function ProgressWeekColumn({ week }: ProgressWeekColumnProps) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5 text-center">
      <p className="text-[11px] font-medium [color:var(--color-fg-muted)]">
        W{week.weekNumber}
      </p>
      <p className="text-sm font-semibold tabular-nums [color:var(--color-fg)]">
        {week.percent === null ? "—" : `${week.percent}%`}
      </p>
      <div className="flex flex-col gap-0.5">
        {week.metrics.map((metric) => (
          <p
            key={metric.metric}
            className="truncate text-[11px] tabular-nums leading-tight [color:var(--color-fg-muted)]"
          >
            {formatProgressActualGoal(
              metric.metric,
              metric.totalActual,
              metric.goal,
            )}
          </p>
        ))}
        {week.metrics
          .filter((metric) => metric.unboundedActual > 0 && metric.goal !== null)
          .map((metric) => (
            <p
              key={`${metric.metric}-unbounded`}
              className="truncate text-[10px] tabular-nums leading-tight [color:var(--color-fg-hint)]"
            >
              + {formatProgressMetricValue(metric.metric, metric.unboundedActual)}
            </p>
          ))}
        {week.legacyMetrics.map((legacy) => (
          <p
            key={`legacy-${legacy.metric}`}
            className="truncate text-[10px] leading-tight [color:var(--color-fg-hint)]"
          >
            {formatProgressLegacyLine(legacy.metric, legacy.actual)}
          </p>
        ))}
      </div>
    </div>
  );
}
