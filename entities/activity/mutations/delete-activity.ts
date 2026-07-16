/**
 * @file entities/activity/mutations/delete-activity.ts
 * Server use-case for hard-deleting a definition (+ cascaded records).
 *
 * Purpose: Delete via the repository; throw when no row matches.
 * Used in: app/api/activities/[id]/route.ts via entities/activity/server.ts
 */

import { deleteActivityById } from "@/entities/activity/repository";

/**
 * Hard-deletes one activity definition owned by the authenticated user.
 * Records cascade via the FK.
 *
 * @param userId - authenticated user id
 * @param id - activity row id
 * @throws when the activity is not found
 */
export async function deleteActivity(
  userId: string,
  id: string,
): Promise<void> {
  const deleted = await deleteActivityById(userId, id);

  if (!deleted) {
    throw new Error("Activity not found.");
  }
}
