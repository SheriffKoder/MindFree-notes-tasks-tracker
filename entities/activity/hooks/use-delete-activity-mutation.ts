/**
 * @file entities/activity/hooks/use-delete-activity-mutation.ts
 * TanStack mutation for hard-delete with optimistic cache purge.
 *
 * Purpose: Remove the definition and purge its records from every cached month.
 * Used in: features/activity/activity-drawer (Step 13 orchestrator).
 */

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { synchronizeActivityCaches } from "@/entities/activity/cache/synchronize-activity-caches";
import { fetchDeleteActivity } from "@/entities/activity/client/delete-activity";
import { activitiesQueryKey } from "@/entities/activity/client/query-keys";
import {
  clearActivityMutationPending,
  markActivityMutationPending,
} from "@/entities/activity/hooks/activity-mutation-pending";
import type {
  ActivitiesResponse,
  ActivityRecordsResponse,
} from "@/entities/activity/model/read-models";
import type { Activity } from "@/entities/activity/model/types";

export interface DeleteActivityMutationInput {
  /** Existing activity row to hard-delete. */
  activity: Activity;
}

interface CacheSnapshot {
  queryKey: readonly unknown[];
  data: ActivitiesResponse | ActivityRecordsResponse | undefined;
}

interface DeleteActivityMutationContext {
  previousSnapshots: CacheSnapshot[];
}

/**
 * DELETE activity — optimistically removes definition + month records.
 */
export function useDeleteActivityMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ activity }: DeleteActivityMutationInput) => {
      await fetchDeleteActivity(activity.id);
      return activity;
    },
    onMutate: async ({ activity }) => {
      markActivityMutationPending(activity.id);

      const definitionKey = activitiesQueryKey(activity.kind);
      await queryClient.cancelQueries({ queryKey: definitionKey });
      await queryClient.cancelQueries({ queryKey: ["activityRecords"] });

      const previousSnapshots: CacheSnapshot[] = [
        {
          queryKey: definitionKey,
          data: queryClient.getQueryData<ActivitiesResponse>(definitionKey),
        },
      ];

      const recordQueries =
        queryClient.getQueriesData<ActivityRecordsResponse>({
          queryKey: ["activityRecords"],
        });

      for (const [queryKey, data] of recordQueries) {
        previousSnapshots.push({ queryKey, data });
      }

      synchronizeActivityCaches(queryClient, {
        type: "delete",
        activity,
      });

      return { previousSnapshots } satisfies DeleteActivityMutationContext;
    },
    onSettled: (_data, _error, variables) => {
      clearActivityMutationPending(variables.activity.id);
    },
    onError: (_error, _variables, context) => {
      if (!context) {
        return;
      }

      for (const snapshot of context.previousSnapshots) {
        queryClient.setQueryData(snapshot.queryKey, snapshot.data);
      }
    },
  });
}
