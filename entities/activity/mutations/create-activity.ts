/**
 * @file entities/activity/mutations/create-activity.ts
 * Server use-case for POST /api/activities (create a definition).
 *
 * Purpose: Validate the raw HTTP body, normalize kind-specific fields, then
 *          insert via the repository.
 * Used in: app/api/activities/route.ts via entities/activity/server.ts
 */

import { normalizeActivityDefinition } from "@/entities/activity/lib/definition";
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
  // The route passes an unknown HTTP body; validation establishes the full
  // create contract, including the page-owned `kind`.
  const parsed = createActivityBodySchema.safeParse(body);

  if (!parsed.success) {
    throw new Error("Invalid activity create payload.");
  }

  const payload = parsed.data;

  // Do not rely on the current form presentation for domain invariants.
  // Reminder callers may submit stale task-like values, so the server forces
  // boolean tracking and null color/goals before persistence. Tasks retain
  // their selected mode while incompatible goal dimensions are cleared.
  const normalized = normalizeActivityDefinition(payload.kind, payload);

  // Spread normalized fields last so they cannot be overwritten by the raw,
  // schema-valid payload.
  return createActivityRow(userId, {
    ...payload,
    ...normalized,
  });
}
