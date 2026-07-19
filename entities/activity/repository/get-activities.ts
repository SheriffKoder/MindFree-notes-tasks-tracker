/**
 * @file entities/activity/repository/get-activities.ts
 * Reads activity definitions for a kind (active and archived; filter client-side).
 */

import { mapActivityRow } from "@/entities/activity/lib/mapping/map-row";
import type {
  Activity,
  ActivityKind,
  ActivityRow,
} from "@/entities/activity/model/types";
import { ACTIVITIES_TABLE } from "@/shared/config/supabase-tables";
import { createClient } from "@/shared/lib/supabase/server";

/**
 * Fetches all definitions for a kind (active and archived; filtering is client-side).
 *
 * @param userId - authenticated user id
 * @param kind - task or reminder
 * @returns definitions ordered by creation time ascending
 */
export async function getActivities(
  userId: string,
  kind: ActivityKind,
): Promise<Activity[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from(ACTIVITIES_TABLE)
    .select("*")
    .eq("user_id", userId)
    .eq("kind", kind)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch activities: ${error.message}`);
  }

  return (data as ActivityRow[] | null)?.map(mapActivityRow) ?? [];
}
