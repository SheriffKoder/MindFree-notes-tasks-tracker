/**
 * @file entities/activity/cache/record/remove-record-from-cache.ts
 * Pure TanStack cache updater: drop one record from a month payload.
 *
 * Purpose: Remove the record for one `(taskId, date)` from an
 *          `ActivityRecordsResponse` (delete-on-empty).
 * Used in: entities/activity/cache/synchronize-activity-caches.ts,
 *          entities/activity/hooks/record/* (Step 9).
 */

import type { ActivityRecordsResponse } from "@/entities/activity/model/read-models";

/**
 * Removes the record matching one `(taskId, date)` natural key.
 *
 * @param data - cached month records payload
 * @param taskId - owning activity id
 * @param date - record day (`YYYY-MM-DD`)
 * @returns updated month payload (same `month`, filtered `records`)
 */
export function removeRecordFromCache(
  data: ActivityRecordsResponse,
  taskId: string,
  date: string,
): ActivityRecordsResponse {
  return {
    month: data.month,
    records: data.records.filter(
      (record) => !(record.taskId === taskId && record.date === date),
    ),
  };
}
