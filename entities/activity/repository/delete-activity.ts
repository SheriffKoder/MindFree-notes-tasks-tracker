/**
 * @file entities/activity/repository/delete-activity.ts
 * Hard-deletes a definition; its records cascade via the FK.
 */

import { ACTIVITIES_TABLE } from "@/shared/config/supabase-tables";
import { createClient } from "@/shared/lib/supabase/server";

/**
 * Hard-deletes one definition owned by the current user (RLS). Its records
 * cascade via the `mf_task_record.task_id` foreign key.
 *
 * @param userId - authenticated user id
 * @param id - activity row id
 * @returns whether a row was removed
 */
export async function deleteActivityById(
  userId: string,
  id: string,
): Promise<boolean> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from(ACTIVITIES_TABLE)
    .delete()
    .eq("id", id)
    .eq("user_id", userId)
    .select("id")
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to delete activity: ${error.message}`);
  }

  return Boolean(data);
}
