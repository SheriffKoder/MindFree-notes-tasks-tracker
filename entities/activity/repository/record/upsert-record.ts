/**
 * @file entities/activity/repository/record/upsert-record.ts
 * Upserts a day's completion record by the natural key `(task_id, date)`.
 */

import { mapActivityRecordRow } from "@/entities/activity/lib/mapping/map-row";
import type {
  ActivityRecord,
  ActivityRecordRow,
} from "@/entities/activity/model/types";
import type { UpsertActivityRecordBody } from "@/entities/activity/schema/record/upsert-activity-record.schema";
import { ACTIVITY_RECORDS_TABLE } from "@/shared/config/supabase-tables";
import { createClient } from "@/shared/lib/supabase/server";

/**
 * Writes or updates exactly one record per `(taskId, date)` (RLS-scoped).
 *
 * Values are absolute — the row is replaced with the payload's totals. The
 * write resolves against the `mf_task_record_task_date_unique` constraint.
 *
 * @param userId - authenticated user id
 * @param payload - validated absolute record body
 * @returns the upserted domain record
 */
export async function upsertRecord(
  userId: string,
  payload: UpsertActivityRecordBody,
): Promise<ActivityRecord> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from(ACTIVITY_RECORDS_TABLE)
    .upsert(
      {
        user_id: userId,
        task_id: payload.taskId,
        date: payload.date,
        count: payload.count,
        duration: payload.duration,
        description: payload.description ?? null,
      },
      { onConflict: "task_id,date" },
    )
    .select("*")
    .single();

  if (error) {
    throw new Error(`Failed to upsert activity record: ${error.message}`);
  }

  return mapActivityRecordRow(data as ActivityRecordRow);
}
