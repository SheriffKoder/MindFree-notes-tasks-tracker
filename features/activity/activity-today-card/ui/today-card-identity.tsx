/**
 * @file features/activity/activity-today-card/ui/today-card-identity.tsx
 * Identity cell for the Home Today row: one progress donut + activity title.
 *
 * For `count+duration` with both goals, the donut shows the average of the
 * bounded percents. Unbounded dimensions contribute no donut. Reminders show a
 * leading icon before the title (Bell placeholder while `icon` is null).
 */

"use client";

import { Bell } from "lucide-react";
import { memo } from "react";

import DonutChart from "@/components/donut-chart";
import type {
  ActivityKind,
  TodayProgressDimension,
} from "@/entities/activity";

export interface TodayCardIdentityProps {
  /** Activity title (single line, truncates). */
  title: string;
  /** Definition kind — reminders get a leading icon before the title. */
  kind: ActivityKind;
  /**
   * Reserved semantic icon id. Reminders use Bell as the placeholder while
   * this is null / unmapped.
   */
  icon: string | null;
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

/** Single donut (before title) + optional reminder icon + title. */
export const TodayCardIdentity = memo(function TodayCardIdentity({
  title,
  kind,
  icon,
  color,
  dimensions,
}: TodayCardIdentityProps) {
  const percent = averageBoundedPercent(dimensions);
  // Icons sit before the title. Bell is the placeholder while `icon` is null
  // / unmapped; when icon selection ships, map `icon` here instead.
  const showReminderPlaceholder = kind === "reminder" && icon === null;

  return (
    <div className="flex min-w-0 items-center gap-1.5">
      {percent !== null ? (
        <span
          aria-hidden
          className="flex h-6 w-6 shrink-0 items-center justify-center"
        >
          <DonutChart
            color={color}
            percentage={percent}
            radius={22}
            showLabel={false}
            trackColor={`color-mix(in srgb, ${color} 20%, transparent)`}
          />
        </span>
      ) : showReminderPlaceholder ? (
        <span
          aria-hidden
          className="flex h-6 w-6 shrink-0 items-center justify-center"
        >
          <Bell className="h-4 w-4 [color:var(--today-card-dim)]" />
        </span>
      ) : null}
      <span className="min-w-0 truncate text-sm font-semibold [color:var(--today-card-title)]">
        {title}
      </span>
    </div>
  );
});
