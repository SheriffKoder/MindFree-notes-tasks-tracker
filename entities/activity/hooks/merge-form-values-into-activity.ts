/**
 * @file entities/activity/hooks/merge-form-values-into-activity.ts
 * Pure merge of editable form values into an existing activity definition.
 *
 * Purpose: Shared optimistic patch shape for online mutations and offline apply.
 * Used in: use-update-activity-mutation, entities/activity/offline/*
 */

import type { ActivityFormValues } from "@/entities/activity/editor/model/types";
import { normalizeActivityDefinition } from "@/entities/activity/lib/definition";
import type { Activity } from "@/entities/activity/model/types";

/**
 * Builds the optimistic row from the same kind-safe values sent to the API.
 *
 * @param activity - existing definition
 * @param values - editable form snapshot
 * @param options - optional `updatedAt` override (offline uses pending `savedAt`)
 */
export function mergeFormValuesIntoActivity(
  activity: Activity,
  values: ActivityFormValues,
  options?: { updatedAt?: string },
): Activity {
  const normalized = normalizeActivityDefinition(activity.kind, values);

  return {
    ...activity,
    title: values.title,
    description: values.description ?? null,
    color: normalized.color,
    trackingMode: normalized.trackingMode,
    scheduleType: values.scheduleType,
    scheduleConfig: values.scheduleConfig,
    goal: normalized.goal,
    goalDuration: normalized.goalDuration,
    goalPeriod: normalized.goalPeriod,
    periodGoal: normalized.periodGoal,
    periodGoalDuration: normalized.periodGoalDuration,
    priority: normalized.priority,
    icon: activity.icon,
    startsAt: values.startsAt ?? null,
    endsAt: values.endsAt ?? null,
    updatedAt: options?.updatedAt ?? new Date().toISOString(),
  };
}
