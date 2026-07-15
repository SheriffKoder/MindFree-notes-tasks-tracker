/**
 * @file entities/activity/queries/get-tasks-page-initial-data.ts
 * Read use-case: SSR initial payloads for the Tasks page.
 *
 * Assembles the two canonical caches — task definitions (stable) and
 * current-month records — in parallel; Home derives on top (afterthoughts §5).
 */

import { parseMonthParam } from "@/entities/activity/lib/parse-month";
import type { TasksPageData } from "@/entities/activity/model/read-models";
import { getActivitiesResponse } from "@/entities/activity/queries/get-activities-response";
import { getActivityRecordsResponse } from "@/entities/activity/queries/get-activity-records-response";

/**
 * Fetches task definitions and the resolved month's records in parallel for SSR.
 *
 * @param userId - authenticated user id
 * @param monthParam - raw `month` search param (defaults to current month)
 * @returns both initial payloads plus the resolved month
 */
export async function getTasksPageInitialData(
  userId: string,
  monthParam: string | null | undefined,
): Promise<TasksPageData> {
  const month = parseMonthParam(monthParam);

  const [activities, records] = await Promise.all([
    getActivitiesResponse(userId, "task"),
    getActivityRecordsResponse(userId, month),
  ]);

  return {
    month,
    activities,
    records,
  };
}
