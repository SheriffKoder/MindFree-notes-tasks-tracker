/**
 * @file entities/activity/mutations/create-activity.ts
 * Server use-case for POST /api/activities (create a definition).
 *
 * Purpose: Validate the raw HTTP body, then insert via the repository.
 * Used in: app/api/activities/route.ts via entities/activity/server.ts
 */

import type { Activity } from "@/entities/activity/model/types";
import { createActivity as createActivityRow } from "@/entities/activity/repository";
import { createActivityBodySchema } from "@/entities/activity/schema/create-activity.schema";

/**
 * Creates an activity definition for the authenticated user (RLS-scoped).
 *
 * @param userId - authenticated user id
 * @param body - raw request body (validated here)
 * @returns created domain activity
 * @throws when the body is invalid
 */
export async function createActivity(
  userId: string,
  body: unknown,
): Promise<Activity> {
  const parsed = createActivityBodySchema.safeParse(body);

  if (!parsed.success) {
    throw new Error("Invalid activity create payload.");
  }

  return createActivityRow(userId, parsed.data);
}
