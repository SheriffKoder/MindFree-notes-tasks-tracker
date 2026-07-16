/**
 * @file features/activity/activity-groups/lib/group-activities.ts
 * Partitions activities into page list groups (afterthoughts §10).
 */

import type { Activity } from "@/entities/activity";
import { getActivityStatus } from "@/entities/activity";

export interface GroupedActivities {
  /** `active` and `upcoming` activities. */
  active: Activity[];
  /** `expired` and `archived` activities. */
  inactive: Activity[];
}

/**
 * Splits activities into the Tasks page's top (active) and bottom (inactive) groups.
 *
 * @param activities - task definitions
 * @param today - reference day as `YYYY-MM-DD`
 * @returns grouped activities preserving input order within each bucket
 */
export function groupActivities(
  activities: Activity[],
  today: string,
): GroupedActivities {
  const active: Activity[] = [];
  const inactive: Activity[] = [];

  for (const activity of activities) {
    const status = getActivityStatus(activity, today);

    if (status === "active" || status === "upcoming") {
      active.push(activity);
    } else {
      inactive.push(activity);
    }
  }

  return { active, inactive };
}
