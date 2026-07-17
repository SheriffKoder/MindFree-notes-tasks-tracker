/**
 * @file entities/activity/mutations/record/delete-activity-record.ts
 * Server use-case for DELETE /api/activity-records (remove by natural key).
 *
 * Purpose: Validate the `(taskId, date)` key, then delete via the repository.
 *          Idempotent — deleting an already-absent record is a success, which
 *          matches the delete-on-empty debounce (a day may reach zero twice).
 * Used in: app/api/activity-records/route.ts via entities/activity/server.ts
 */

import { deleteRecord } from "@/entities/activity/repository";
import { upsertActivityRecordBodySchema } from "@/entities/activity/schema/record";

/**
 * Delete body: the natural key only, reused from the upsert contract.
 */
const deleteActivityRecordBodySchema = upsertActivityRecordBodySchema.pick({
  taskId: true,
  date: true,
});

/**
 * Removes the record for one `(taskId, date)` owned by the authenticated user.
 *
 * @param userId - authenticated user id
 * @param body - raw request body (validated here)
 * @throws when the body is invalid
 */
export async function deleteActivityRecord(
  userId: string,
  body: unknown,
): Promise<void> {
  const parsed = deleteActivityRecordBodySchema.safeParse(body);

  if (!parsed.success) {
    throw new Error("Invalid activity record delete payload.");
  }

  await deleteRecord(userId, parsed.data.taskId, parsed.data.date);
}
