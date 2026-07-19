/**
 * @file entities/activity/cache/record/upsert-record-in-cache.ts
 * Pure TanStack cache updater: put one record into a month payload.
 *
 * Purpose: Insert or replace one record inside an `ActivityRecordsResponse`,
 *          identified by the natural key `(taskId, date)` — not the row `id`,
 *          so an optimistic record reconciles with the server row on success.
 * Used in: entities/activity/cache/synchronize-activity-caches.ts,
 *          entities/activity/hooks/record/* (Step 9).
 *
 * No QueryClient dependency — the hub selects the right month bucket.
 */

import type { ActivityRecordsResponse } from "@/entities/activity/model/read-models";
import type { ActivityRecord } from "@/entities/activity/model/types";

/**
 * Inserts or replaces one record by its `(taskId, date)` natural key,
 * appending when absent and preserving order otherwise.
 *
 * @param data - cached month records payload
 * @param record - record to upsert
 * @returns updated month payload (same `month`)
 */
export function upsertRecordInCache(
  data: ActivityRecordsResponse,
  record: ActivityRecord,
): ActivityRecordsResponse {
  const index = data.records.findIndex(
    (entry) => entry.taskId === record.taskId && entry.date === record.date,
  );

  if (index === -1) {
    return { month: data.month, records: [...data.records, record] };
  }

  const records = [...data.records];
  records[index] = record;

  return { month: data.month, records };
}
