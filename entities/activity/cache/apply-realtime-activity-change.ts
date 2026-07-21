/**
 * @file entities/activity/cache/apply-realtime-activity-change.ts
 * Applies Supabase realtime `mf_task` events to TanStack activity caches.
 *
 * Purpose: Framework-free adapter — one postgres_changes payload → gated hub call.
 * Used in: entities/activity/hooks/use-activity-realtime-sync.ts (Step 4)
 * Used for: INSERT/UPDATE/DELETE on mf_task with pending + updatedAt gating.
 */

import type { QueryClient } from "@tanstack/react-query";

import { findActivityByIdInCache } from "@/entities/activity/cache/find-activity-in-cache";
import { synchronizeActivityCaches } from "@/entities/activity/cache/synchronize-activity-caches";
import { isActivityMutationPending } from "@/entities/activity/hooks/activity-mutation-pending";
import { isRemoteActivityNewer } from "@/entities/activity/lib/is-remote-activity-newer";
import { mapActivityRow } from "@/entities/activity/lib/mapping/map-row";
import type {
  Activity,
  ActivityKind,
  ActivityRow,
} from "@/entities/activity/model/types";

export type RealtimeActivityChangeEvent = "INSERT" | "UPDATE" | "DELETE";

export interface ApplyRealtimeActivityChangeResult {
  applied: boolean;
  activity: Activity | null;
  event: RealtimeActivityChangeEvent;
}

function isActivityKind(value: unknown): value is ActivityKind {
  return value === "task" || value === "reminder";
}

/**
 * Maps a realtime payload row when it has at least `id` + `kind`.
 * Thin DELETE payloads without `kind` return null (caller probes cache).
 */
function mapRealtimeRow(row: Record<string, unknown>): Activity | null {
  if (typeof row.id !== "string" || !isActivityKind(row.kind)) {
    return null;
  }

  return mapActivityRow(row as unknown as ActivityRow);
}

function findActivityInEitherKind(
  queryClient: QueryClient,
  activityId: string,
): Activity | undefined {
  return (
    findActivityByIdInCache(queryClient, "task", activityId) ??
    findActivityByIdInCache(queryClient, "reminder", activityId)
  );
}

/** Minimal activity for DELETE when only id + kind are known (hub uses those). */
function stubActivityForDelete(id: string, kind: ActivityKind): Activity {
  return {
    id,
    kind,
    title: "",
    description: null,
    color: null,
    trackingMode: "boolean",
    scheduleType: "daily",
    scheduleConfig: null,
    goal: null,
    goalDuration: null,
    goalPeriod: null,
    periodGoal: null,
    periodGoalDuration: null,
    priority: null,
    icon: null,
    startsAt: null,
    endsAt: null,
    archivedAt: null,
    createdAt: "",
    updatedAt: "",
  };
}

/**
 * Resolves the activity to delete from old/new payload or either kind cache.
 */
function resolveDeleteActivity(
  queryClient: QueryClient,
  oldRecord: Record<string, unknown> | null,
  newRecord: Record<string, unknown> | null,
): Activity | null {
  const mappedOld = oldRecord ? mapRealtimeRow(oldRecord) : null;

  if (mappedOld) {
    return mappedOld;
  }

  const activityId =
    (typeof oldRecord?.id === "string" ? oldRecord.id : undefined) ??
    (typeof newRecord?.id === "string" ? newRecord.id : undefined);

  if (!activityId) {
    return null;
  }

  const cached = findActivityInEitherKind(queryClient, activityId);

  if (cached) {
    return cached;
  }

  // Thin payload with kind but incomplete columns — enough for removeDefinition.
  const kindCandidate = oldRecord?.kind ?? newRecord?.kind;

  if (!isActivityKind(kindCandidate)) {
    return null;
  }

  return stubActivityForDelete(activityId, kindCandidate);
}

/**
 * Patches TanStack caches from one realtime postgres_changes payload on `mf_task`.
 */
export function applyRealtimeActivityChange(
  queryClient: QueryClient,
  event: RealtimeActivityChangeEvent,
  newRecord: Record<string, unknown> | null,
  oldRecord: Record<string, unknown> | null,
): ApplyRealtimeActivityChangeResult {
  if (event === "DELETE") {
    const activity = resolveDeleteActivity(queryClient, oldRecord, newRecord);

    if (!activity) {
      return { applied: false, activity: null, event };
    }

    if (isActivityMutationPending(activity.id)) {
      return { applied: false, activity, event };
    }

    synchronizeActivityCaches(queryClient, {
      type: "delete",
      activity,
    });

    return { applied: true, activity, event };
  }

  if (!newRecord) {
    return { applied: false, activity: null, event };
  }

  const activity = mapRealtimeRow(newRecord);

  if (!activity) {
    return { applied: false, activity: null, event };
  }

  if (isActivityMutationPending(activity.id)) {
    return { applied: false, activity, event };
  }

  const cached = findActivityByIdInCache(
    queryClient,
    activity.kind,
    activity.id,
  );

  if (event === "UPDATE" && !isRemoteActivityNewer(activity, cached)) {
    return { applied: false, activity, event };
  }

  if (event === "INSERT") {
    synchronizeActivityCaches(queryClient, { type: "create", activity });
    return { applied: true, activity, event };
  }

  // UPDATE (including orphan with no cached previous): hub upsert is enough.
  synchronizeActivityCaches(queryClient, { type: "update", activity });
  return { applied: true, activity, event };
}
