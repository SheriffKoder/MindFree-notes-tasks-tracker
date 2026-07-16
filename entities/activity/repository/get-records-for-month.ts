/**
 * @file entities/activity/repository/get-records-for-month.ts
 * Reads completion records whose `date` falls in a given month.
 */

import { mapActivityRecordRow } from "@/entities/activity/lib/mapping/map-row";
import { getMonthRange } from "@/entities/activity/lib/month/parse-month";
import type {
  ActivityRecord,
  ActivityRecordRow,
} from "@/entities/activity/model/types";
import { ACTIVITY_RECORDS_TABLE } from "@/shared/config/supabase-tables";
import { createClient } from "@/shared/lib/supabase/server";

/**
 * Fetches all completion records whose `date` falls in the given month.
 *
 * @param userId - authenticated user id
 * @param month - `YYYY-MM` month key
 * @returns records in the month, ordered by date ascending
 */
export async function getRecordsForMonth(
  userId: string,
  month: string,
): Promise<ActivityRecord[]> {
  const { monthStart, monthEnd } = getMonthRange(month);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from(ACTIVITY_RECORDS_TABLE)
    .select("*")
    .eq("user_id", userId)
    .gte("date", monthStart)
    .lt("date", monthEnd)
    .order("date", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch activity records: ${error.message}`);
  }

  return (data as ActivityRecordRow[] | null)?.map(mapActivityRecordRow) ?? [];
}
