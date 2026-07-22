/**
 * @file entities/activity/queries/get-home-activity-initial-data.ts
 * Read use-case: SSR initial payloads for Home's activity islands.
 *
 * Fetches task definitions, reminder definitions, and **one** current-month
 * records response in parallel — Home must not double-fetch records.
 */

import {
  parseMonthParam,
  type ParseMonthParamOptions,
} from "@/entities/activity/lib/month/parse-month";
import type { HomeActivityData } from "@/entities/activity/model/read-models";
import { getActivitiesResponse } from "@/entities/activity/queries/get-activities-response";
import { getActivityRecordsResponse } from "@/entities/activity/queries/get-activity-records-response";

/**
 * Fetches both definition kinds plus the current month's records for Home SSR.
 *
 * @param userId - authenticated user id
 * @param parseOptions - optional demo-session flags for fallback resolution
 * @returns task defs, reminder defs, and one shared records payload
 */
export async function getHomeActivityInitialData(
  userId: string,
  parseOptions: ParseMonthParamOptions = {},
): Promise<HomeActivityData> {
  const month = parseMonthParam(null, parseOptions);

  const [tasks, reminders, records] = await Promise.all([
    getActivitiesResponse(userId, "task"),
    getActivitiesResponse(userId, "reminder"),
    getActivityRecordsResponse(userId, month),
  ]);

  return {
    month,
    tasks,
    reminders,
    records,
  };
}
