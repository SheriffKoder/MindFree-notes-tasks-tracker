/**
 * @file entities/activity/cache/purge-activity-records-in-cache.ts
 * Pure helper: strip one activity's records from a single month cache entry.
 *
 * Purpose: Shared by the sync hub when delete must purge `taskId` from every
 *          cached `["activityRecords"]` month bucket.
 * Used in: entities/activity/cache/synchronize-activity-caches.ts
 */

import type { ActivityRecordsResponse } from "@/entities/activity/model/read-models";

/**
 * Removes all records for one `taskId` from a month records payload.
 *
 * @param data - cached month records payload
 * @param taskId - activity id whose records should be dropped
 * @returns updated month payload (same `month`, filtered `records`)
 */
export function purgeActivityRecordsInCache(
  data: ActivityRecordsResponse,
  taskId: string,
): ActivityRecordsResponse {
  return {
    month: data.month,
    records: data.records.filter((record) => record.taskId !== taskId),
  };
}
