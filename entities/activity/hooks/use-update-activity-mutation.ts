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
  return {
    ...activity,
    title: values.title,
    description: values.description ?? null,
    color: values.color ?? null,
    trackingMode: values.trackingMode,
    scheduleType: values.scheduleType,
    scheduleConfig: values.scheduleConfig,
    goal: values.goal ?? null,
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
      const response = await fetchPatchActivity(activity.id, values);
      return response.activity;
    },
    onMutate: async ({ activity, values }) => {
      markActivityMutationPending(activity.id);

      const queryKey = activitiesQueryKey(activity.kind);
      await queryClient.cancelQueries({ queryKey });

      const previousSnapshots: CacheSnapshot[] = [
        {
          queryKey,
          data: queryClient.getQueryData<ActivitiesResponse>(queryKey),
        },
      ];

      synchronizeActivityCaches(queryClient, {
        type: "update",
        activity: mergeFormValuesIntoActivity(activity, values),
      });

      return { previousSnapshots } satisfies UpdateActivityMutationContext;
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
    onSuccess: (serverActivity, { activity }) => {
      const cached = findActivityByIdInCache(
        queryClient,
        activity.kind,
        activity.id,
      );

      if (!isRemoteActivityNewer(serverActivity, cached)) {
        return;
      }

      synchronizeActivityCaches(queryClient, {
        type: "update",
        activity: serverActivity,
      });
    },
  });
}
