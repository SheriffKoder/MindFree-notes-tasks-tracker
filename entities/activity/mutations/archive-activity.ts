/**
 * @file entities/activity/mutations/archive-activity.ts
 * Server use-case for soft-archiving a definition (stamps `archivedAt`).
 *
 * Purpose: Thin wrapper over `archiveActivityById` — no body to parse.
 * Used in: entities/activity/server.ts (archive convenience; PATCH also
 *          archives via `updateActivity` + `archivedAt` in the body).
 */

import type { Activity } from "@/entities/activity/model/types";
import { archiveActivityById } from "@/entities/activity/repository";

/**
 * Soft-archives one activity definition owned by the authenticated user.
 *
 * @param userId - authenticated user id
 * @param id - activity row id
 * @returns archived domain activity
 * @throws when the activity is not found
 */
export async function archiveActivity(
  userId: string,
  id: string,
): Promise<Activity> {
  const activity = await archiveActivityById(userId, id);

  if (!activity) {
    throw new Error("Activity not found.");
  }

  return activity;
}
