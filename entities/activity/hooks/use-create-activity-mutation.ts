/**
 * @file entities/activity/hooks/use-create-activity-mutation.ts
 * TanStack mutation for POST create with optimistic cache insert.
 *
 * Purpose: Wire fetchPostActivity to TanStack with rollback + server reconcile.
 * Used in: features/activity/activity-drawer (Step 13 orchestrator).
 */

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  removeActivityFromCache,
  upsertActivityInCache,
} from "@/entities/activity/cache/activity-cache-mutations";
import { synchronizeActivityCaches } from "@/entities/activity/cache/synchronize-activity-caches";
import { fetchPostActivity } from "@/entities/activity/client/post-activity";
import { activitiesQueryKey } from "@/entities/activity/client/query-keys";
import type { ActivityFormValues } from "@/entities/activity/editor/model/types";
import {
  clearActivityMutationPending,
  markActivityMutationPending,
} from "@/entities/activity/hooks/activity-mutation-pending";
import { normalizeActivityDefinition } from "@/entities/activity/lib/definition";
import type { ActivitiesResponse } from "@/entities/activity/model/read-models";
import type { Activity, ActivityKind } from "@/entities/activity/model/types";

export interface CreateActivityMutationInput {
  /** Page-provided kind (`task` | `reminder`). */
  kind: ActivityKind;
  /** Editable form snapshot sent to the API. */
  values: ActivityFormValues;
}

interface CacheSnapshot {
  queryKey: readonly unknown[];
  data: ActivitiesResponse | undefined;
}

interface CreateActivityMutationContext {
  previousSnapshots: CacheSnapshot[];
  optimisticId: string;
}

function buildOptimisticActivity(
  kind: ActivityKind,
  values: ActivityFormValues,
): Activity {
  const now = new Date().toISOString();

  // Match the server's kind policy before the optimistic row reaches any
  // consumer. This prevents a reminder from briefly rendering task colors,
  // goals, or numeric controls while the request is in flight.
  const normalized = normalizeActivityDefinition(kind, values);

  return {
    id: `optimistic-${kind}-${now}`,
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

/**
 * POST activity — optimistically inserts into `["activities", kind]`.
 */
export function useCreateActivityMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ kind, values }: CreateActivityMutationInput) => {
      // Send the same canonical definition shown optimistically. The server
      // normalizes again as the authoritative boundary.
      const normalized = normalizeActivityDefinition(kind, values);
      const response = await fetchPostActivity({
        kind,
        ...values,
        ...normalized,
      });
      return response.activity;
    },
    onMutate: async ({ kind, values }) => {
      // Definitions have one cache bucket per kind; record caches are not
      // involved in definition creation.
      const queryKey = activitiesQueryKey(kind);
      const optimistic = buildOptimisticActivity(kind, values);

      // Mark the temporary row pending for future realtime echo suppression.
      // Canceling reads prevents an in-flight response from overwriting it.
      markActivityMutationPending(optimistic.id);
      await queryClient.cancelQueries({ queryKey });

      // Capture the exact pre-mutation bucket before publishing the optimistic
      // row so a failed request can restore it without another network read.
      const previousSnapshots: CacheSnapshot[] = [
        {
          queryKey,
          data: queryClient.getQueryData<ActivitiesResponse>(queryKey),
        },
      ];

      // Route the optimistic create through the shared synchronization hub,
      // just like a server or future realtime change.
      synchronizeActivityCaches(queryClient, {
        type: "create",
        activity: optimistic,
      });

      return {
        previousSnapshots,
        optimisticId: optimistic.id,
      } satisfies CreateActivityMutationContext;
    },
    onSettled: (_data, _error, _variables, context) => {
      // Clear pending state on both success and failure.
      if (context?.optimisticId) {
        clearActivityMutationPending(context.optimisticId);
      }
    },
    onError: (_error, _variables, context) => {
      if (!context) {
        return;
      }

      // Roll back every cache bucket captured by onMutate.
      for (const snapshot of context.previousSnapshots) {
        queryClient.setQueryData(snapshot.queryKey, snapshot.data);
      }
    },
    onSuccess: (serverActivity, { kind }, context) => {
      const queryKey = activitiesQueryKey(kind);

      // Reconcile the temporary optimistic id with the database id. Doing both
      // operations in one cache updater avoids a transient duplicate row.
      queryClient.setQueryData<ActivitiesResponse>(queryKey, (current) => {
        if (!current) {
          return current;
        }

        let next = current;

        if (context?.optimisticId) {
          next = removeActivityFromCache(next, context.optimisticId);
        }

        return upsertActivityInCache(next, serverActivity);
      });
    },
  });
}
