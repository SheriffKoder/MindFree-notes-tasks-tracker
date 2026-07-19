/**
 * @file entities/activity/queries/get-activities-response.ts
 * Read use-case: activity definitions for one kind (task or reminder).
 *
 * Definitions are stable (not month-scoped); filtering by status is client-side,
 * so both active and archived rows are returned.
 */

import type { ActivitiesResponse } from "@/entities/activity/model/read-models";
import type { ActivityKind } from "@/entities/activity/model/types";
import { getActivities } from "@/entities/activity/repository";

/**
 * Fetches every definition for a kind (active and archived).
 *
 * Used by `GET /api/activities` and any server code needing the same payload.
 *
 * @param userId - authenticated user id
 * @param kind - task or reminder
 * @returns definitions response
 */
export async function getActivitiesResponse(
  userId: string,
  kind: ActivityKind,
): Promise<ActivitiesResponse> {
  const activities = await getActivities(userId, kind);

  return { activities };
}
