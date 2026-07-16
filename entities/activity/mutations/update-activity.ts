/**
 * @file entities/activity/mutations/update-activity.ts
 * Server use-case for PATCH /api/activities/:id (edit / archive / restore).
 *
 * Purpose: Validate the raw HTTP body, then patch via the repository.
 * Used in: app/api/activities/[id]/route.ts via entities/activity/server.ts
 *
 * Archive/restore are ordinary field writes (`archivedAt`); there is no
 * conflict gate or cache relocation — simpler than Notes' updateNote.
 */

import type { Activity } from "@/entities/activity/model/types";
import { updateActivityById } from "@/entities/activity/repository";
import { updateActivityBodySchema } from "@/entities/activity/schema/update-activity.schema";

/**
 * Partially updates one activity definition for the authenticated user.
 *
 * @param userId - authenticated user id
 * @param id - activity row id
 * @param body - raw request body (validated here)
 * @returns updated domain activity
 * @throws when the body is invalid or the activity is not found
 */
export async function updateActivity(
  userId: string,
  id: string,
  body: unknown,
): Promise<Activity> {
  const parsed = updateActivityBodySchema.safeParse(body);

  if (!parsed.success) {
    throw new Error("Invalid activity update payload.");
  }

  const activity = await updateActivityById(userId, id, parsed.data);

  if (!activity) {
    throw new Error("Activity not found.");
  }

  return activity;
}
