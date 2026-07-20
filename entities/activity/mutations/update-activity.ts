/**
 * @file entities/activity/mutations/update-activity.ts
 * Server use-case for PATCH /api/activities/:id (edit / archive / restore).
 *
 * Purpose: Validate the raw HTTP body, load the owned row for `kind`, normalize
 *          tracking/color/goals, then patch via the repository.
 * Used in: app/api/activities/[id]/route.ts via entities/activity/server.ts
 *
 * Archive/restore are ordinary field writes (`archivedAt`); there is no
 * conflict gate or cache relocation — simpler than Notes' updateNote.
 */

import { normalizeActivityDefinition } from "@/entities/activity/lib/definition";
import type { Activity } from "@/entities/activity/model/types";
import {
  getActivityById,
  updateActivityById,
} from "@/entities/activity/repository";
import {
  updateActivityBodySchema,
  type UpdateActivityBody,
} from "@/entities/activity/schema/update-activity.schema";

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
  // PATCH accepts only known editable fields, but intentionally does not accept
  // `kind`: an activity cannot move between the Tasks and Reminders surfaces.
  const parsed = updateActivityBodySchema.safeParse(body);

  if (!parsed.success) {
    throw new Error("Invalid activity update payload.");
  }

  // Load the owned row before writing because its stored `kind` determines the
  // normalization policy. The user id keeps this lookup within the RLS owner.
  const existing = await getActivityById(userId, id);

  if (!existing) {
    throw new Error("Activity not found.");
  }

  // Merge partial definition fields with existing values before normalization;
  // this prevents a one-field PATCH from accidentally clearing an omitted goal.
  const patch = applyDefinitionNormalization(existing, parsed.data);
  const activity = await updateActivityById(userId, id, patch);

  // The row could disappear between the read and update. Preserve the same
  // not-found behavior for that race as for the initial lookup.
  if (!activity) {
    throw new Error("Activity not found.");
  }

  return activity;
}

/**
 * Merges kind-safe tracking/color/goal fields into the PATCH when needed.
 * Reminders always re-assert the canonical quartet; tasks normalize when any
 * of those fields appear in the patch.
 */
function applyDefinitionNormalization(
  existing: Activity,
  patch: UpdateActivityBody,
): UpdateActivityBody {
  const touchesDefinitionFields =
    patch.trackingMode !== undefined ||
    patch.color !== undefined ||
    patch.goal !== undefined ||
    patch.goalDuration !== undefined ||
    patch.goalPeriod !== undefined ||
    patch.periodGoal !== undefined ||
    patch.periodGoalDuration !== undefined ||
    patch.priority !== undefined;

  // A task-only archive/title/schedule PATCH cannot violate mode/goal rules,
  // so leave it partial and avoid writing unrelated columns.
  if (existing.kind !== "reminder" && !touchesDefinitionFields) {
    return patch;
  }

  // Reminders always pass through this branch, even for an unrelated edit.
  // Re-asserting the canonical quartet repairs any legacy/stale reminder row
  // the next time it is changed.
  const normalized = normalizeActivityDefinition(existing.kind, {
    trackingMode: patch.trackingMode ?? existing.trackingMode,
    color: patch.color !== undefined ? patch.color : existing.color,
    goal: patch.goal !== undefined ? patch.goal : existing.goal,
    goalDuration:
      patch.goalDuration !== undefined
        ? patch.goalDuration
        : existing.goalDuration,
    goalPeriod:
      patch.goalPeriod !== undefined ? patch.goalPeriod : existing.goalPeriod,
    periodGoal:
      patch.periodGoal !== undefined ? patch.periodGoal : existing.periodGoal,
    periodGoalDuration:
      patch.periodGoalDuration !== undefined
        ? patch.periodGoalDuration
        : existing.periodGoalDuration,
    priority: patch.priority !== undefined ? patch.priority : existing.priority,
  });

  // Normalized fields win over any conflicting values supplied by the PATCH.
  return {
    ...patch,
    ...normalized,
  };
}
