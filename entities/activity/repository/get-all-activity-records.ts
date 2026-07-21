/**
 * @file entities/activity/repository/get-all-activity-records.ts
 * Fetches every activity completion record for a user (export).
 */

import { mapActivityRecordRow } from "@/entities/activity/lib/mapping/map-row";
import type {
  ActivityRecord,
  ActivityRecordRow,
} from "@/entities/activity/model/types";
import { ACTIVITY_RECORDS_TABLE } from "@/shared/config/supabase-tables";
import { createClient } from "@/shared/lib/supabase/server";

/**
 * Fetches all completion records for the user, oldest date first.
 */
export async function getAllActivityRecords(
  userId: string,
): Promise<ActivityRecord[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from(ACTIVITY_RECORDS_TABLE)
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: true });

  if (error) {
    throw new Error(
      `Failed to fetch activity records for export: ${error.message}`,
    );
  }

  return (data as ActivityRecordRow[] | null)?.map(mapActivityRecordRow) ?? [];
}
