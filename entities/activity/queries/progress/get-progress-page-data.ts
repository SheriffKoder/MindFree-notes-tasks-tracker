/**
 * @file entities/activity/queries/progress/get-progress-page-data.ts
 * Server read use-case: assemble ProgressPageData for one month.
 *
 * Purpose: Auth-scoped Progress boundary — parallel repository reads, filter
 *          month records to task IDs, then pure derivation. No TanStack cache.
 * Used in: `entities/activity/server.ts` → `views/progress` (Step 6).
 * Used for: SSR Progress page data for one `?month=YYYY-MM` selection.
 *
 * Function index:
 * - getProgressPageData: `(userId, month, todayIso)` → `ProgressPageData`
 *
 * Steps:
 * 1. Parallel fetch: task definitions + selected-month records.
 * 2. Early-return empty payload when there are no tasks.
 * 3. Filter month records to task IDs (drops reminder rows).
 * 4. Fetch all-time value rows for those task IDs.
 * 5. Call `buildProgressPageData`.
 */

import { buildProgressPageData } from "@/entities/activity/lib/progress";
import type { ProgressPageData } from "@/entities/activity/model/progress-read-models";
import {
  getActivities,
  getAllTimeTaskRecordValues,
  getRecordsForMonth,
} from "@/entities/activity/repository";

/**
 * Builds the Progress page read model for a user and month.
 *
 * @param userId - authenticated user id
 * @param month - resolved month key (`YYYY-MM`)
 * @param todayIso - injected today (`YYYY-MM-DD`); resolve once at the boundary
 * @returns complete Progress page payload
 */
export async function getProgressPageData(
  userId: string,
  month: string,
  todayIso: string,
): Promise<ProgressPageData> {
  const [tasks, monthRecords] = await Promise.all([
    getActivities(userId, "task"),
    getRecordsForMonth(userId, month),
  ]);

  if (tasks.length === 0) {
    return { month, tasks: [] };
  }

  const taskIds = tasks.map((task) => task.id);
  const taskIdSet = new Set(taskIds);
  const taskMonthRecords = monthRecords.filter((record) =>
    taskIdSet.has(record.taskId),
  );

  const allTimeValues = await getAllTimeTaskRecordValues(userId, taskIds);

  return buildProgressPageData({
    month,
    todayIso,
    tasks,
    monthRecords: taskMonthRecords,
    allTimeValues,
  });
}
