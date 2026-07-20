/**
 * @file features/activity/activity-progress-card/lib/format-progress-value.ts
 * Presentation-only formatters for Progress card numbers.
 *
 * Purpose: Convert Progress metric minutes/counts into display strings. Domain
 *          math stays in `entities/activity/lib/progress`; this file only formats.
 * Used in: `features/activity/activity-progress-card/ui/*`.
 * Used for: Month/all-time summary lines and weekly actual/goal text.
 *
 * Function index:
 * - formatProgressDuration: minutes → `12h 30m`
 * - formatProgressMetricValue: metric + value → labeled quantity
 * - formatProgressActualGoal: actual [/ goal] for week columns
 * - formatProgressMetricList: join several metric values with ` · `
 * - formatProgressLegacyLine: muted historical metric line
 */

import type { ProgressMetric } from "@/entities/activity";

/**
 * Formats stored minutes as hours and leftover minutes.
 *
 * @param minutes - duration in minutes (may be fractional; rounded)
 */
export function formatProgressDuration(minutes: number): string {
  const total = Math.max(0, Math.round(minutes));
  const hours = Math.floor(total / 60);
  const mins = total % 60;

  if (hours === 0) {
    return `${mins}m`;
  }

  if (mins === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${mins}m`;
}

/**
 * Formats one metric quantity for summary / legacy lines.
 *
 * @param metric - semantic Progress metric
 * @param value - raw actual (minutes for duration)
 */
export function formatProgressMetricValue(
  metric: ProgressMetric,
  value: number,
): string {
  switch (metric) {
    case "duration":
      return formatProgressDuration(value);
    case "count":
      return value === 1 ? "1 count" : `${value} counts`;
    case "completion":
      return value === 1 ? "1 completion" : `${value} completions`;
  }
}

/**
 * Formats actual vs optional goal for a week column primary line.
 *
 * Duration uses hour/minute strings on both sides. Count and completion use
 * bare numbers so the column stays compact (`5 / 8`).
 *
 * @param metric - semantic Progress metric
 * @param actual - total actual in the window
 * @param goal - comparable goal, or `null` when unbounded
 */
export function formatProgressActualGoal(
  metric: ProgressMetric,
  actual: number,
  goal: number | null,
): string {
  if (goal === null) {
    return formatProgressMetricValue(metric, actual);
  }

  if (metric === "duration") {
    return `${formatProgressDuration(actual)} / ${formatProgressDuration(goal)}`;
  }

  return `${actual} / ${goal}`;
}

/**
 * Joins formatted metric values with a middle dot (` · `).
 *
 * @param parts - already-formatted metric strings
 */
export function formatProgressMetricList(parts: string[]): string {
  return parts.filter((part) => part.length > 0).join(" · ");
}

/**
 * Formats a legacy/historical metric as a muted secondary line.
 *
 * @param metric - non-current metric family
 * @param actual - aggregated actual
 */
export function formatProgressLegacyLine(
  metric: ProgressMetric,
  actual: number,
): string {
  return `+ ${formatProgressMetricValue(metric, actual)}`;
}
