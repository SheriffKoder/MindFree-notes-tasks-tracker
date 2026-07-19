/**
 * @file entities/activity/cache/find-activity-in-cache.ts
 * Looks up one activity definition inside the TanStack activities cache.
 */

import type { QueryClient } from "@tanstack/react-query";

import { activitiesQueryKey } from "@/entities/activity/client/query-keys";
import type { ActivitiesResponse } from "@/entities/activity/model/read-models";
import type { Activity, ActivityKind } from "@/entities/activity/model/types";

/**
 * Finds one activity by id inside `["activities", kind]`.
 *
 * @returns the cached activity, or `undefined` when missing / cache empty
 */
export function findActivityByIdInCache(
  queryClient: QueryClient,
  kind: ActivityKind,
  activityId: string,
): Activity | undefined {
  const data = queryClient.getQueryData<ActivitiesResponse>(
    activitiesQueryKey(kind),
  );

  return data?.activities.find((entry) => entry.id === activityId);
}
