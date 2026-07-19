/**
 * @file features/activity/activity-today-card/ui/today-card-identity.tsx
 * Identity cell for the Home Today row: one progress donut + activity title.
 *
 * For `count+duration` with both goals, the donut shows the average of the
 * bounded percents. Unbounded dimensions contribute no donut.
 */

"use client";

import { memo } from "react";

import DonutChart from "@/components/donut-chart";
import type { TodayProgressDimension } from "@/entities/activity";

export interface TodayCardIdentityProps {
  /** Activity title (single line, truncates). */
  title: string;
  /** Resolved task color (caller applies the fallback). */
  color: string;
  /** Entity-derived dimensions; bounded percents feed a single donut. */
  dimensions: TodayProgressDimension[];
}

/**
 * Average of bounded dimension percents, or `null` when none are goal-aware.
 */
function averageBoundedPercent(
  dimensions: TodayProgressDimension[],
): number | null {
  const percents = dimensions
    .map((dimension) => dimension.percent)
    .filter((percent): percent is number => percent !== null);

  if (percents.length === 0) {
    return null;
  }

  return Math.round(
    percents.reduce((sum, percent) => sum + percent, 0) / percents.length,
  );
}

/** Single donut (before title) + title. Truncates within its grid cell. */
export const TodayCardIdentity = memo(function TodayCardIdentity({
  title,
  color,
  dimensions,
}: TodayCardIdentityProps) {
  const percent = averageBoundedPercent(dimensions);

  return (
    <div className="flex min-w-0 items-center gap-1.5">
      {percent !== null ? (
        <span aria-hidden className="h-6 w-6 shrink-0">
          <DonutChart
            color={color}
            percentage={percent}
            radius={22}
            showLabel={false}
            trackColor={`color-mix(in srgb, ${color} 20%, transparent)`}
          />
        </span>
      ) : null}
      <span className="min-w-0 truncate text-sm font-semibold [color:var(--today-card-title)]">
        {title}
      </span>
    </div>
  );
});
