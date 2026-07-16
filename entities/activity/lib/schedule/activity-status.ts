/**
 * @file entities/activity/lib/activity-status.ts
 * Derives an activity's lifecycle status at a point in time (afterthoughts §10).
 *
 * Purpose: single source for list grouping (active/upcoming vs expired/archived)
 *          and the config form's "Starts …" / "Expired …" banner. Status is
 *          never stored; extending `endsAt` or clearing `archivedAt` re-activates
 *          with no migration.
 * Used in: features/activity/activity-groups, entities/activity/ui form banner.
 *
 * Function index:
 * - getActivityStatus: archived → upcoming → expired → active
 * - resolveWindowBounds: effective window bounds (folds `once` into its date)
 */

import type { Activity, ActivityStatus } from "@/entities/activity/model/types";

/**
 * Effective validity bounds for status. A `once` activity has no window
 * columns, so its single config date acts as both bounds.
 *
 * @param activity - activity definition
 * @returns inclusive `start`/`end` bounds (`null` = open-ended)
 */
function resolveWindowBounds(activity: Activity): {
  start: string | null;
  end: string | null;
} {
  if (activity.scheduleType === "once" && typeof activity.scheduleConfig === "string") {
    return { start: activity.scheduleConfig, end: activity.scheduleConfig };
  }

  return { start: activity.startsAt, end: activity.endsAt };
}

/**
 * Derives the status of an activity relative to a reference day.
 * `archived` (manual intent) wins over the window-derived states.
 *
 * @param activity - activity definition
 * @param today - reference day as `YYYY-MM-DD`
 * @returns derived status
 */
export function getActivityStatus(activity: Activity, today: string): ActivityStatus {
  if (activity.archivedAt) {
    return "archived";
  }

  const { start, end } = resolveWindowBounds(activity);

  if (start && today < start) {
    return "upcoming";
  }

  if (end && today > end) {
    return "expired";
  }

  return "active";
}
