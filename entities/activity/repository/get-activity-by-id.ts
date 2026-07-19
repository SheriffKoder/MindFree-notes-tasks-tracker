/**
 * @file entities/activity/repository/get-activity-by-id.ts
 * Reads one activity definition by id (RLS-scoped).
 */

import { mapActivityRow } from "@/entities/activity/lib/mapping/map-row";
import type { Activity, ActivityRow } from "@/entities/activity/model/types";
import { ACTIVITIES_TABLE } from "@/shared/config/supabase-tables";
import { createClient } from "@/shared/lib/supabase/server";

/**
 * Fetches one owned definition by id.
 *
 * @param userId - authenticated user id
 * @param id - activity row id
 * @returns the activity, or `null` when no row matches
 */
export async function getActivityById(
  userId: string,
  id: string,
): Promise<Activity | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from(ACTIVITIES_TABLE)
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch activity: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  return mapActivityRow(data as ActivityRow);
}
