/**
 * @file entities/activity/cache/find-record-in-cache.ts
 * Looks up one activity record inside a warm month-records TanStack cache.
 */

import type { QueryClient } from "@tanstack/react-query";

import { recordMonthKey } from "@/entities/activity/cache/record/record-month-key";
import { activityRecordsQueryKey } from "@/entities/activity/client/query-keys";
import type { ActivityRecordsResponse } from "@/entities/activity/model/read-models";
import type { ActivityRecord } from "@/entities/activity/model/types";

/**
 * Whether `["activityRecords", month]` for the record's date is already seeded.
 *
 * Realtime must not create empty month buckets — only patch warm caches.
 */
export function hasRecordMonthCache(
  queryClient: QueryClient,
  date: string,
): boolean {
  return (
    queryClient.getQueryData<ActivityRecordsResponse>(
      activityRecordsQueryKey(recordMonthKey(date)),
    ) !== undefined
  );
}

/**
 * Finds one record by natural key `(taskId, date)` in its month bucket.
 *
 * @returns the cached record, or `undefined` when missing / month not warm
 */
export function findRecordInCache(
  queryClient: QueryClient,
  taskId: string,
  date: string,
): ActivityRecord | undefined {
  const data = queryClient.getQueryData<ActivityRecordsResponse>(
    activityRecordsQueryKey(recordMonthKey(date)),
  );

  return data?.records.find(
    (entry) => entry.taskId === taskId && entry.date === date,
  );
}
