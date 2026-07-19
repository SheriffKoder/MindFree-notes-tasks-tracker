/**
 * @file entities/activity/cache/activity-cache-mutations.ts
 * Pure TanStack cache updaters for activity definition writes.
 *
 * Purpose: Upsert/remove one definition inside an `ActivitiesResponse`.
 * Used in: entities/activity/cache/synchronize-activity-caches.ts,
 *          entities/activity/hooks/use-*-activity-mutation.ts
 *
 * No QueryClient dependency — the hub loops these over cache entries.
 *
 * Function index:
 * - upsertActivityInCache
 * - removeActivityFromCache
 */

import type { Activity } from "@/entities/activity/model/types";
import type { ActivitiesResponse } from "@/entities/activity/model/read-models";

/**
 * Inserts or replaces one activity by `id`, preserving list order on update
 * and appending on create (matches repository `created_at` ascending).
 *
 * @param data - cached definitions payload
 * @param activity - definition to upsert
 * @returns updated definitions payload
 */
export function upsertActivityInCache(
  data: ActivitiesResponse,
  activity: Activity,
): ActivitiesResponse {
  const index = data.activities.findIndex((entry) => entry.id === activity.id);

  if (index === -1) {
    return { activities: [...data.activities, activity] };
  }

  const activities = [...data.activities];
  activities[index] = activity;

  return { activities };
}

/**
 * Removes one activity definition by id.
 *
 * @param data - cached definitions payload
 * @param activityId - row id to remove
 * @returns updated definitions payload
 */
export function removeActivityFromCache(
  data: ActivitiesResponse,
  activityId: string,
): ActivitiesResponse {
  return {
    activities: data.activities.filter((entry) => entry.id !== activityId),
  };
}
