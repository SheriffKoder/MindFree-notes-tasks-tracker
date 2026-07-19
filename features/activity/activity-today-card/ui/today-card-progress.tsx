/**
 * @file features/activity/activity-today-card/ui/today-card-progress.tsx
 * Progress cell for the Home Today row: stacked value lines, with Count/Minutes
 * labels only when both dimensions are present (`count+duration`).
 */

"use client";

import { memo } from "react";

import type { TodayProgressDimension } from "@/entities/activity";

export interface TodayCardProgressProps {
  /** Entity-derived dimensions in display order. */
  dimensions: TodayProgressDimension[];
}

function formatValue(dimension: TodayProgressDimension): string {
  const unit = dimension.kind === "duration" ? "m" : "";

  return dimension.goal === null
    ? `${dimension.value}${unit}`
    : `${dimension.value}${unit}/${dimension.goal}${unit}`;
}

/**
 * Renders progress values. Labels appear only for `count+duration`
 * (`Count: 2/2` / `Minutes: 0m/60m`); single-dimension modes show the value alone.
 */
export const TodayCardProgress = memo(function TodayCardProgress({
  dimensions,
}: TodayCardProgressProps) {
  const showLabels = dimensions.length > 1;

  return (
    <div className="flex shrink-0 flex-col leading-tight">
      {dimensions.map((dimension) => (
        <span
          key={dimension.kind}
          className="whitespace-nowrap text-xs tabular-nums [color:var(--today-card-progress)]"
        >
          {showLabels ? (
            <>
              <span className="[color:var(--today-card-dim)]">
                {dimension.label}:
              </span>{" "}
            </>
          ) : null}
          {formatValue(dimension)}
        </span>
      ))}
    </div>
  );
});
