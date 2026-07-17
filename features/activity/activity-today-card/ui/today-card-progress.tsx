/**
 * @file features/activity/activity-today-card/ui/today-card-progress.tsx
 * Progress cell for the Home Today row: current value over goal per tracked
 * dimension. Minutes carry an `m` suffix, and `count+duration` activities show
 * two segments — count and minutes — separated by a dot.
 */

"use client";

import { Fragment, memo } from "react";

import type { Activity, ActivityRecord } from "@/entities/activity";
import { buildTodayProgressSegments } from "@/features/activity/activity-today-card/lib/today-progress-segments";
import type { TodayProgressSegment } from "@/features/activity/activity-today-card/lib/today-progress-segments";

export interface TodayCardProgressProps {
  /** Activity whose tracking mode + goal select the segments. */
  activity: Activity;
  /** Today's record, or `null` when nothing is recorded. */
  record: ActivityRecord | null;
}

/** Formats a segment as `value / goal`, or `value` alone when unbounded. */
function formatSegment({ value, goal, unit }: TodayProgressSegment): string {
  return goal !== null ? `${value}${unit} / ${goal}${unit}` : `${value}${unit}`;
}

/** Renders one or two `value / goal` segments with minute suffixes. */
export const TodayCardProgress = memo(function TodayCardProgress({
  activity,
  record,
}: TodayCardProgressProps) {
  const segments = buildTodayProgressSegments(activity, record);

  return (
    <span className="shrink-0 whitespace-nowrap text-xs tabular-nums [color:var(--today-card-progress)]">
      {segments.map((segment, index) => (
        <Fragment key={segment.unit || "count"}>
          {index > 0 ? (
            <span aria-hidden className="mx-1 opacity-50">
              ·
            </span>
          ) : null}
          {formatSegment(segment)}
        </Fragment>
      ))}
    </span>
  );
});
