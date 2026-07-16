/**
 * @file entities/activity/cache/synchronize-activity-caches.ts
 * Source-agnostic TanStack cache synchronization hub for activity read models.
 *
 * Purpose: Apply one normalized activity change to the definition cache (and,
 *          on delete, every cached month-records bucket).
 * Used in: mutation hooks (Step 12.4), later realtime/offline adapters.
 *
 * Fan-out is intentionally small: Home/Progress derive from the same two caches
 * (`activities` + `activityRecords`), so there is no separate Home patch branch.
 */

import type { QueryClient } from "@tanstack/react-query";

import {
  removeActivityFromCache,
  upsertActivityInCache,
} from "@/entities/activity/cache/activity-cache-mutations";
import { purgeActivityRecordsInCache } from "@/entities/activity/cache/purge-activity-records-in-cache";
import { activitiesQueryKey } from "@/entities/activity/client/query-keys";
import type {
  ActivitiesResponse,
  ActivityRecordsResponse,
} from "@/entities/activity/model/read-models";
import type { Activity } from "@/entities/activity/model/types";

/**
 * Normalized activity write — sources map HTTP/realtime/offline payloads here.
 *
 * `archive` / `restore` are explicit for callers; both upsert the definition
 * (with `archivedAt` set or cleared) the same way as `update`.
 */
export type ActivityChange =
  | { type: "create"; activity: Activity }
  | { type: "update"; activity: Activity }
  | { type: "archive"; activity: Activity }
  | { type: "restore"; activity: Activity }
  | { type: "delete"; activity: Activity };

function upsertDefinition(queryClient: QueryClient, activity: Activity): void {
  queryClient.setQueryData<ActivitiesResponse>(
    activitiesQueryKey(activity.kind),
    (current) =>
      current ? upsertActivityInCache(current, activity) : current,
  );
}

function removeDefinition(queryClient: QueryClient, activity: Activity): void {
  queryClient.setQueryData<ActivitiesResponse>(
    activitiesQueryKey(activity.kind),
    (current) =>
      current ? removeActivityFromCache(current, activity.id) : current,
  );
}

function purgeRecordsAcrossMonths(
  queryClient: QueryClient,
  taskId: string,
): void {
  const recordQueries = queryClient.getQueriesData<ActivityRecordsResponse>({
    queryKey: ["activityRecords"],
  });

  for (const [queryKey] of recordQueries) {
    queryClient.setQueryData<ActivityRecordsResponse>(queryKey, (current) =>
      current ? purgeActivityRecordsInCache(current, taskId) : current,
    );
  }
}

/**
 * Applies one normalized activity change to every TanStack read model that cares.
 */
export function synchronizeActivityCaches(
  queryClient: QueryClient,
  change: ActivityChange,
): void {
  switch (change.type) {
    case "create":
    case "update":
    case "archive":
    case "restore":
      upsertDefinition(queryClient, change.activity);
      break;
    case "delete":
      removeDefinition(queryClient, change.activity);
      purgeRecordsAcrossMonths(queryClient, change.activity.id);
      break;
  }
}
