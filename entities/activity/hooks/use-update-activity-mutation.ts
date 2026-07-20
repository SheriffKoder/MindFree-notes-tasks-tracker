/**
 * @file entities/activity/hooks/use-update-activity-mutation.ts
 * TanStack mutation for PATCH autosave with optimistic cache updates.
 *
 * Purpose: Wire fetchPatchActivity to TanStack with rollback + newer-wins.
 * Used in: features/activity/activity-drawer (Step 13 orchestrator).
 *
 * No date-relocation branch — definitions stay in `["activities", kind]`.
 */

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { findActivityByIdInCache } from "@/entities/activity/cache/find-activity-in-cache";
import { synchronizeActivityCaches } from "@/entities/activity/cache/synchronize-activity-caches";
import { fetchPatchActivity } from "@/entities/activity/client/patch-activity";
import { activitiesQueryKey } from "@/entities/activity/client/query-keys";
import type { ActivityFormValues } from "@/entities/activity/editor/model/types";
import {
  clearActivityMutationPending,
  markActivityMutationPending,
} from "@/entities/activity/hooks/activity-mutation-pending";
import { normalizeActivityDefinition } from "@/entities/activity/lib/definition";
import { isRemoteActivityNewer } from "@/entities/activity/lib/is-remote-activity-newer";
import type { ActivitiesResponse } from "@/entities/activity/model/read-models";
import type { Activity } from "@/entities/activity/model/types";

export interface UpdateActivityMutationInput {
  /** Existing activity row being edited. */
  activity: Activity;
  /** Full editable form snapshot sent to the API. */
  values: ActivityFormValues;
}

interface CacheSnapshot {
  queryKey: readonly unknown[];
  data: ActivitiesResponse | undefined;
}

interface UpdateActivityMutationContext {
  previousSnapshots: CacheSnapshot[];
}

function mergeFormValuesIntoActivity(
  activity: Activity,
  values: ActivityFormValues,
): Activity {
  // Build the optimistic row from the same kind-safe values sent to the API.
  // This keeps the cache from briefly exposing invalid reminder presentation.
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
    updatedAt: new Date().toISOString(),
  };
}

/**
 * PATCH autosave mutation — optimistically updates `["activities", kind]`.
 */
export function useUpdateActivityMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ activity, values }: UpdateActivityMutationInput) => {
      // Canonicalize before transport for cache/server parity. The server
      // independently loads `kind` and normalizes again as the trust boundary.
      const normalized = normalizeActivityDefinition(activity.kind, values);
      const response = await fetchPatchActivity(activity.id, {
        ...values,
        ...normalized,
      });
      return response.activity;
    },
    onMutate: async ({ activity, values }) => {
      // Pending ids provide the seam for suppressing a future realtime echo of
      // our own mutation.
      markActivityMutationPending(activity.id);

      // Definitions never move between kind buckets, so only the owning cache
      // must be canceled and snapshotted.
      const queryKey = activitiesQueryKey(activity.kind);
      await queryClient.cancelQueries({ queryKey });

      // Save the old bucket before publishing the optimistic update.
      const previousSnapshots: CacheSnapshot[] = [
        {
          queryKey,
          data: queryClient.getQueryData<ActivitiesResponse>(queryKey),
        },
      ];

      // Publish through the same synchronization hub used by all activity
      // definition change sources.
      synchronizeActivityCaches(queryClient, {
        type: "update",
        activity: mergeFormValuesIntoActivity(activity, values),
      });

      return { previousSnapshots } satisfies UpdateActivityMutationContext;
    },
    onSettled: (_data, _error, variables) => {
      // Clear pending state regardless of mutation outcome.
      clearActivityMutationPending(variables.activity.id);
    },
    onError: (_error, _variables, context) => {
      if (!context) {
        return;
      }

      // Restore the exact pre-edit cache when the PATCH fails.
      for (const snapshot of context.previousSnapshots) {
        queryClient.setQueryData(snapshot.queryKey, snapshot.data);
      }
    },
    onSuccess: (serverActivity, { activity }) => {
      // Read after the optimistic write: another response or future realtime
      // event may already have installed a newer row.
      const cached = findActivityByIdInCache(
        queryClient,
        activity.kind,
        activity.id,
      );

      // Never let a delayed PATCH response replace a newer cache revision.
      if (!isRemoteActivityNewer(serverActivity, cached)) {
        return;
      }

      // Reconcile the authoritative row through the shared cache hub.
      synchronizeActivityCaches(queryClient, {
        type: "update",
        activity: serverActivity,
      });
    },
  });
}
