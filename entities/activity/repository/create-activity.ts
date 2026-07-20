/**
 * @file entities/activity/repository/create-activity.ts
 * Inserts a new activity definition (`kind` supplied by the calling page).
 */

import { mapActivityRow } from "@/entities/activity/lib/mapping/map-row";
import type { Activity, ActivityRow } from "@/entities/activity/model/types";
import type { CreateActivityBody } from "@/entities/activity/schema/create-activity.schema";
import { ACTIVITIES_TABLE } from "@/shared/config/supabase-tables";
import { createClient } from "@/shared/lib/supabase/server";

/**
 * Inserts a new activity definition.
 *
 * @param userId - authenticated user id
 * @param payload - validated create body (includes page-provided `kind`)
 * @returns created activity
 */
export async function createActivity(
  userId: string,
  payload: CreateActivityBody,
): Promise<Activity> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from(ACTIVITIES_TABLE)
    .insert({
      user_id: userId,
      kind: payload.kind,
      title: payload.title,
      description: payload.description ?? null,
      color: payload.color ?? null,
      tracking_mode: payload.trackingMode,
      schedule_type: payload.scheduleType,
      schedule_config: payload.scheduleConfig,
      goal: payload.goal ?? null,
      goal_duration: payload.goalDuration ?? null,
      goal_period: payload.goalPeriod ?? null,
      period_goal: payload.periodGoal ?? null,
      period_goal_duration: payload.periodGoalDuration ?? null,
      priority: payload.priority ?? null,
      starts_at: payload.startsAt ?? null,
      ends_at: payload.endsAt ?? null,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(`Failed to create activity: ${error.message}`);
  }

  return mapActivityRow(data as ActivityRow);
}
