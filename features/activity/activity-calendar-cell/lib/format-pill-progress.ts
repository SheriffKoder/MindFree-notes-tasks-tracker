/**
 * @file features/activity/activity-calendar-cell/lib/format-pill-progress.ts
 * Compact day-progress label for a calendar task pill (`1/2`, `5m/5m`).
 */

import type { TodayProgressDimension } from "@/entities/activity";

function formatDimension(dimension: TodayProgressDimension): string {
  const unit = dimension.kind === "duration" ? "m" : "";

  return dimension.goal === null
    ? `${dimension.value}${unit}`
    : `${dimension.value}${unit}/${dimension.goal}${unit}`;
}

/**
 * Formats entity-derived day dimensions for the pill's trailing cue.
 *
 * Returns `null` for a single unbounded count dimension (boolean / goal-less
 * count) so the pill can show a check instead of a bare `0`/`1`. Bounded
 * dimensions and duration always produce a numeric label; `count+duration`
 * joins with ` · `.
 *
 * @param dimensions - `deriveTodayProgress(...).dimensions`
 * @returns compact label, or `null` when a check/empty cue is preferred
 */
export function formatPillProgress(
  dimensions: TodayProgressDimension[],
): string | null {
  if (dimensions.length === 0) {
    return null;
  }

  const [only] = dimensions;
  if (
    dimensions.length === 1 &&
    only.kind === "count" &&
    only.goal === null
  ) {
    return null;
  }

  return dimensions.map(formatDimension).join(" · ");
}
