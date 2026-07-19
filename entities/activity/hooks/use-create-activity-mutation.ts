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

  return {
    id: `optimistic-${kind}-${now}`,
    kind,
    title: values.title,
    description: values.description ?? null,
    color: values.color ?? null,
    trackingMode: values.trackingMode,
    scheduleType: values.scheduleType,
    scheduleConfig: values.scheduleConfig,
    goal: values.goal ?? null,
    goalDuration: values.goalDuration ?? null,
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
      const response = await fetchPostActivity({ kind, ...values });
      return response.activity;
    },
    onMutate: async ({ kind, values }) => {
      const queryKey = activitiesQueryKey(kind);
      const optimistic = buildOptimisticActivity(kind, values);

      markActivityMutationPending(optimistic.id);
      await queryClient.cancelQueries({ queryKey });

      const previousSnapshots: CacheSnapshot[] = [
        {
          queryKey,
          data: queryClient.getQueryData<ActivitiesResponse>(queryKey),
        },
      ];

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
      if (context?.optimisticId) {
        clearActivityMutationPending(context.optimisticId);
      }
    },
    onError: (_error, _variables, context) => {
      if (!context) {
        return;
      }

      for (const snapshot of context.previousSnapshots) {
        queryClient.setQueryData(snapshot.queryKey, snapshot.data);
      }
    },
    onSuccess: (serverActivity, { kind }, context) => {
      const queryKey = activitiesQueryKey(kind);

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
