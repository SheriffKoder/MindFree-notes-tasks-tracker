/**
 * @file entities/activity/mutations/record/upsert-activity-record.ts
 * Server use-case for POST /api/activity-records (upsert today's record).
 *
 * Purpose: Validate the raw HTTP body, then upsert via the repository by the
 *          natural key `(taskId, date)`.
 * Used in: app/api/activity-records/route.ts via entities/activity/server.ts
 */

import type { ActivityRecord } from "@/entities/activity/model/types";
import { upsertRecord } from "@/entities/activity/repository";
import { upsertActivityRecordBodySchema } from "@/entities/activity/schema/record";

/**
 * Upserts a day's completion record for the authenticated user (RLS-scoped).
 *
 * Validates mutable totals only. Snapshot fields are absent from the body;
 * the repository response includes the database-authoritative snapshots.
 *
 * @param userId - authenticated user id
 * @param body - raw request body (validated here)
 * @returns the upserted domain record
 * @throws when the body is invalid
 */
export async function upsertActivityRecord(
  userId: string,
  body: unknown,
): Promise<ActivityRecord> {
  const parsed = upsertActivityRecordBodySchema.safeParse(body);

  if (!parsed.success) {
    throw new Error("Invalid activity record payload.");
  }

  return upsertRecord(userId, parsed.data);
}
