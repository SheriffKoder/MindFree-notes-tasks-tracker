/**
 * @file entities/activity/queries/get-activity-page-initial-data.ts
 * Read use-case: SSR initial payloads for a kind-scoped activity page.
 *
 * Assembles the two canonical caches — definitions for one kind (stable) and
 * current-month records (shared) — in parallel.
 */

import { parseMonthParam } from "@/entities/activity/lib/month/parse-month";
import type { ActivityPageData } from "@/entities/activity/model/read-models";
import type { ActivityKind } from "@/entities/activity/model/types";
import { getActivitiesResponse } from "@/entities/activity/queries/get-activities-response";
import { getActivityRecordsResponse } from "@/entities/activity/queries/get-activity-records-response";

/**
 * Fetches kind definitions and the resolved month's records in parallel for SSR.
 *
 * @param userId - authenticated user id
 * @param monthParam - raw `month` search param (defaults to current month)
 * @param kind - definition kind to seed (`task` | `reminder`)
 * @returns both initial payloads plus the resolved month and kind
 */
export async function getActivityPageInitialData(
  userId: string,
  monthParam: string | null | undefined,
  kind: ActivityKind,
): Promise<ActivityPageData> {
  const month = parseMonthParam(monthParam);

  const [activities, records] = await Promise.all([
    getActivitiesResponse(userId, kind),
    getActivityRecordsResponse(userId, month),
  ]);

  return {
    kind,
    month,
    activities,
    records,
  };
}
