/**
 * @file entities/activity/repository/update-activity.ts
 * Applies partial edits to a definition, plus archive (a timestamp write).
 *
 * Purpose: Edit and archive/restore one `mf_task` row (RLS-scoped).
 * Used in: entities/activity/mutations/update-activity.ts,
 *          entities/activity/mutations/archive-activity.ts
 *
 * Function index:
 * - updateActivityById: merge a validated partial patch (edit / archive / restore)
 * - archiveActivityById: stamp `archived_at = now()` via updateActivityById
 */

import { mapActivityRow } from "@/entities/activity/lib/mapping/map-row";
import type { Activity, ActivityRow } from "@/entities/activity/model/types";
import type { UpdateActivityBody } from "@/entities/activity/schema/update-activity.schema";
import { ACTIVITIES_TABLE } from "@/shared/config/supabase-tables";
import { createClient } from "@/shared/lib/supabase/server";

type ActivityRowPatch = Partial<
  Pick<
    ActivityRow,
    | "title"
    | "description"
    | "color"
    | "tracking_mode"
    | "schedule_type"
    | "schedule_config"
    | "goal"
    | "goal_duration"
    | "goal_period"
    | "period_goal"
    | "period_goal_duration"
    | "priority"
    | "starts_at"
    | "ends_at"
    | "archived_at"
  >
>;

/**
 * Applies a partial update to one definition owned by the current user (RLS).
 * Supports edit and archive/restore (via `archivedAt`).
 *
 * @param userId - authenticated user id
 * @param id - activity row id
 * @param patch - validated partial fields to merge
 * @returns updated activity, or `null` when no row matches
 */
export async function updateActivityById(
  userId: string,
  id: string,
  patch: UpdateActivityBody,
): Promise<Activity | null> {
  const supabase = await createClient();
  const dbPatch: ActivityRowPatch = {};

  if (patch.title !== undefined) {
    dbPatch.title = patch.title;
  }

  if (patch.description !== undefined) {
    dbPatch.description = patch.description ?? null;
  }

  if (patch.color !== undefined) {
    dbPatch.color = patch.color ?? null;
  }

  if (patch.trackingMode !== undefined) {
    dbPatch.tracking_mode = patch.trackingMode;
  }

  if (patch.scheduleType !== undefined) {
    dbPatch.schedule_type = patch.scheduleType;
  }

  if (patch.scheduleConfig !== undefined) {
    dbPatch.schedule_config = patch.scheduleConfig;
  }

  if (patch.goal !== undefined) {
    dbPatch.goal = patch.goal ?? null;
  }

  if (patch.goalDuration !== undefined) {
    dbPatch.goal_duration = patch.goalDuration ?? null;
  }

  if (patch.goalPeriod !== undefined) {
    dbPatch.goal_period = patch.goalPeriod ?? null;
  }

  if (patch.periodGoal !== undefined) {
    dbPatch.period_goal = patch.periodGoal ?? null;
  }

  if (patch.periodGoalDuration !== undefined) {
    dbPatch.period_goal_duration = patch.periodGoalDuration ?? null;
  }

  if (patch.priority !== undefined) {
    dbPatch.priority = patch.priority ?? null;
  }

  if (patch.startsAt !== undefined) {
    dbPatch.starts_at = patch.startsAt ?? null;
  }

  if (patch.endsAt !== undefined) {
    dbPatch.ends_at = patch.endsAt ?? null;
  }

  if (patch.archivedAt !== undefined) {
    dbPatch.archived_at = patch.archivedAt ?? null;
  }

  const { data, error } = await supabase
    .from(ACTIVITIES_TABLE)
    .update(dbPatch)
    .eq("id", id)
    .eq("user_id", userId)
    .select("*")
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to update activity: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  return mapActivityRow(data as ActivityRow);
}

/**
 * Archives one definition by stamping `archived_at` (reversible; records preserved).
 *
 * @param userId - authenticated user id
 * @param id - activity row id
 * @returns archived activity, or `null` when no row matches
 */
export async function archiveActivityById(
  userId: string,
  id: string,
): Promise<Activity | null> {
  return updateActivityById(userId, id, {
    archivedAt: new Date().toISOString(),
  });
}
