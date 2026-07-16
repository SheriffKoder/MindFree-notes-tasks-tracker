/**
 * @file entities/activity/queries/get-activity-records-response.ts
 * Read use-case: completion records for one month.
 *
 * Records travel flat; client-side lookup maps are derived separately
 * (entities/activity/lib/record/build-record-lookup).
 */

import { parseMonthParam } from "@/entities/activity/lib/month/parse-month";
import type { ActivityRecordsResponse } from "@/entities/activity/model/read-models";
import { getRecordsForMonth } from "@/entities/activity/repository";
import { buildActivityRecordsResponse } from "@/entities/activity/transform/aggregate-month-records";

/**
 * Fetches and shapes the records whose `date` falls in a month.
 *
 * Used by `GET /api/activity-records` and any server code needing the payload.
 *
 * @param userId - authenticated user id
 * @param monthParam - raw `month` query param (defaults to current month)
 * @returns read-ready records response
 */
export async function getActivityRecordsResponse(
  userId: string,
  monthParam: string | null | undefined,
): Promise<ActivityRecordsResponse> {
  const month = parseMonthParam(monthParam);
  const records = await getRecordsForMonth(userId, month);

  return buildActivityRecordsResponse(month, records);
}
