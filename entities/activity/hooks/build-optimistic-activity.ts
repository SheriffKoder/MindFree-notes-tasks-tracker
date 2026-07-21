/**
 * @file entities/activity/hooks/build-optimistic-activity.ts
 * Pure builder for optimistic activity definition rows.
 *
 * Purpose: Shared create-shape for online mutations and offline pending apply.
 * Used in: use-create-activity-mutation, entities/activity/offline/*
 */

import type { ActivityFormValues } from "@/entities/activity/editor/model/types";
import { normalizeActivityDefinition } from "@/entities/activity/lib/definition";
import type { Activity, ActivityKind } from "@/entities/activity/model/types";

/** Stable optimistic id for one offline/online draft create per kind. */
export function pinnedDraftActivityId(kind: ActivityKind): string {
  return `optimistic-${kind}-draft`;
}

export interface BuildOptimisticActivityOptions {
  /** Override id (offline draft uses {@link pinnedDraftActivityId}). */
  id?: string;
  /** Override timestamps (defaults to now). */
  now?: string;
}

/**
 * Builds an optimistic `Activity` matching server kind policy.
 *
 * @param kind - page-owned definition kind
 * @param values - editable form snapshot
 * @param options - optional id / timestamp overrides
 */
export function buildOptimisticActivity(
  kind: ActivityKind,
  values: ActivityFormValues,
  options?: BuildOptimisticActivityOptions,
): Activity {
  const now = options?.now ?? new Date().toISOString();
  const normalized = normalizeActivityDefinition(kind, values);

  return {
    id: options?.id ?? `optimistic-${kind}-${now}`,
    kind,
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
    icon: null,
    startsAt: values.startsAt ?? null,
    endsAt: values.endsAt ?? null,
    archivedAt: null,
    createdAt: now,
    updatedAt: now,
  };
}
