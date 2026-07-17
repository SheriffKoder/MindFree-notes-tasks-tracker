/**
 * @file entities/activity/cache/synchronize-activity-caches.ts
 * Source-agnostic TanStack cache synchronization hub for activity read models.
 *
 * Purpose: Apply one normalized activity change to the definition cache (and,
 *          on delete, every cached month-records bucket), or one record change
 *          to its single month-records bucket.
 * Used in: mutation hooks (Step 12.4), later realtime/offline adapters.
 *
 * Fan-out is intentionally small: Home/Progress derive from the same two caches
 * (`activities` + `activityRecords`), so a record write touches only its month
 * bucket and both views recompute automatically — no separate patch branch.
 */

import type { QueryClient } from "@tanstack/react-query";

import {
  removeActivityFromCache,
  upsertActivityInCache,
} from "@/entities/activity/cache/activity-cache-mutations";
import { purgeActivityRecordsInCache } from "@/entities/activity/cache/purge-activity-records-in-cache";
import {
  recordMonthKey,
  removeRecordFromCache,
  upsertRecordInCache,
} from "@/entities/activity/cache/record";
import {
  activitiesQueryKey,
  activityRecordsQueryKey,
} from "@/entities/activity/client/query-keys";
import type {
  ActivitiesResponse,
  ActivityRecordsResponse,
} from "@/entities/activity/model/read-models";
import type { Activity, ActivityRecord } from "@/entities/activity/model/types";

/**
 * Normalized activity write — sources map HTTP/realtime/offline payloads here.
 *
 * `archive` / `restore` are explicit for callers; both upsert the definition
 * (with `archivedAt` set or cleared) the same way as `update`. `record-upsert`
 * / `record-delete` carry a full record so the hub can locate its month bucket
 * by `(taskId, date)`.
 */
export type ActivityChange =
  | { type: "create"; activity: Activity }
  | { type: "update"; activity: Activity }
  | { type: "archive"; activity: Activity }
  | { type: "restore"; activity: Activity }
  | { type: "delete"; activity: Activity }
  | { type: "record-upsert"; record: ActivityRecord }
  | { type: "record-delete"; record: ActivityRecord };

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

function upsertRecordBucket(
  queryClient: QueryClient,
  record: ActivityRecord,
): void {
  queryClient.setQueryData<ActivityRecordsResponse>(
    activityRecordsQueryKey(recordMonthKey(record.date)),
    (current) => (current ? upsertRecordInCache(current, record) : current),
  );
}

function removeRecordBucket(
  queryClient: QueryClient,
  record: ActivityRecord,
): void {
  queryClient.setQueryData<ActivityRecordsResponse>(
    activityRecordsQueryKey(recordMonthKey(record.date)),
    (current) =>
      current
        ? removeRecordFromCache(current, record.taskId, record.date)
        : current,
  );
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
    case "record-upsert":
      upsertRecordBucket(queryClient, change.record);
      break;
    case "record-delete":
      removeRecordBucket(queryClient, change.record);
      break;
  }
}
