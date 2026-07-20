/**
 * @file entities/activity/repository/progress/get-all-time-task-record-values.ts
 * Reads minimal all-time record values for Progress aggregation.
 *
 * Purpose: Fetch only the columns needed for all-time Progress totals — no
 *          goals, dates, or presentation fields. Caller supplies task IDs so
 *          reminder rows never enter the result set.
 * Used in: `entities/activity/queries/progress/get-progress-page-data.ts` via
 *          `entities/activity/repository/index.ts`.
 * Used for: "Total hours/counts all time" on each Progress card.
 *
 * Function index:
 * - getAllTimeTaskRecordValues: `(userId, taskIds)` → minimal value rows
 */

import type { TrackingMode } from "@/entities/activity/model/types";
import { ACTIVITY_RECORDS_TABLE } from "@/shared/config/supabase-tables";
import { createClient } from "@/shared/lib/supabase/server";

/**
 * Minimal record values used by Progress all-time aggregation.
 */
export interface AllTimeTaskRecordValue {
  /** Owning task definition id. */
  taskId: string;
  /** Record-owned tracking mode at write time. */
  trackingModeSnapshot: TrackingMode;
  /** Recorded count (0 when duration-only / unused). */
  count: number;
  /** Recorded duration in minutes (0 when count-only / unused). */
  duration: number;
}

interface AllTimeTaskRecordValueRow {
  task_id: string;
  tracking_mode_snapshot: TrackingMode;
  count: number;
  duration: number;
}

function mapAllTimeTaskRecordValueRow(
  row: AllTimeTaskRecordValueRow,
): AllTimeTaskRecordValue {
  return {
    taskId: row.task_id,
    trackingModeSnapshot: row.tracking_mode_snapshot,
    count: row.count,
    duration: row.duration,
  };
}

/**
 * Fetches all-time record values for the given task IDs.
 *
 * Empty `taskIds` returns immediately without querying — Supabase `.in()` with
 * an empty array is invalid.
 *
 * @param userId - authenticated user id
 * @param taskIds - task definition ids to include (reminders excluded by caller)
 * @returns minimal record rows ordered by task id
 */
export async function getAllTimeTaskRecordValues(
  userId: string,
  taskIds: string[],
): Promise<AllTimeTaskRecordValue[]> {
  if (taskIds.length === 0) {
    return [];
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from(ACTIVITY_RECORDS_TABLE)
    .select("task_id, tracking_mode_snapshot, count, duration")
    .eq("user_id", userId)
    .in("task_id", taskIds)
    .order("task_id", { ascending: true });

  if (error) {
    throw new Error(
      `Failed to fetch all-time task record values: ${error.message}`,
    );
  }

  return (
    (data as AllTimeTaskRecordValueRow[] | null)?.map(
      mapAllTimeTaskRecordValueRow,
    ) ?? []
  );
}
