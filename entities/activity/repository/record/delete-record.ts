/**
 * @file entities/activity/repository/record/delete-record.ts
 * Deletes a day's completion record by the natural key `(task_id, date)`.
 */

import { ACTIVITY_RECORDS_TABLE } from "@/shared/config/supabase-tables";
import { createClient } from "@/shared/lib/supabase/server";

/**
 * Removes the record for one `(taskId, date)` owned by the current user (RLS).
 * Used by delete-on-empty when a day's totals fall back to zero.
 *
 * @param userId - authenticated user id
 * @param taskId - owning activity id
 * @param date - record day (`YYYY-MM-DD`)
 * @returns whether a row was removed
 */
export async function deleteRecord(
  userId: string,
  taskId: string,
  date: string,
): Promise<boolean> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from(ACTIVITY_RECORDS_TABLE)
    .delete()
    .eq("user_id", userId)
    .eq("task_id", taskId)
    .eq("date", date)
    .select("id")
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to delete activity record: ${error.message}`);
  }

  return Boolean(data);
}
