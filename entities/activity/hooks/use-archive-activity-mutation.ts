/**
 * @file entities/activity/hooks/use-archive-activity-mutation.ts
 * TanStack mutations for soft-archive and restore via PATCH `archivedAt`.
 *
 * Purpose: Optimistic archive/restore with rollback + newer-wins.
 * Used in: features/activity/activity-drawer (Step 13 orchestrator).
 *
 * Function index:
 * - useArchiveActivityMutation
 * - useRestoreActivityMutation
 */

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { findActivityByIdInCache } from "@/entities/activity/cache/find-activity-in-cache";
import { synchronizeActivityCaches } from "@/entities/activity/cache/synchronize-activity-caches";
import { fetchPatchActivity } from "@/entities/activity/client/patch-activity";
import { activitiesQueryKey } from "@/entities/activity/client/query-keys";
import {
  clearActivityMutationPending,
  markActivityMutationPending,
} from "@/entities/activity/hooks/activity-mutation-pending";
import { isRemoteActivityNewer } from "@/entities/activity/lib/is-remote-activity-newer";
import type { ActivitiesResponse } from "@/entities/activity/model/read-models";
import type { Activity } from "@/entities/activity/model/types";

export interface ArchiveActivityMutationInput {
  /** Existing activity row to archive or restore. */
  activity: Activity;
}

interface CacheSnapshot {
  queryKey: readonly unknown[];
  data: ActivitiesResponse | undefined;
}

interface ArchiveActivityMutationContext {
  previousSnapshots: CacheSnapshot[];
}

function snapshotDefinitionCache(
  queryClient: ReturnType<typeof useQueryClient>,
  activity: Activity,
): CacheSnapshot[] {
  const queryKey = activitiesQueryKey(activity.kind);

  return [
    {
      queryKey,
      data: queryClient.getQueryData<ActivitiesResponse>(queryKey),
    },
  ];
}

function restoreSnapshots(
  queryClient: ReturnType<typeof useQueryClient>,
  context: ArchiveActivityMutationContext | undefined,
): void {
  if (!context) {
    return;
  }

  for (const snapshot of context.previousSnapshots) {
    queryClient.setQueryData(snapshot.queryKey, snapshot.data);
  }
}

function reconcileIfNewer(
  queryClient: ReturnType<typeof useQueryClient>,
  activity: Activity,
  serverActivity: Activity,
  changeType: "archive" | "restore",
): void {
  const cached = findActivityByIdInCache(
    queryClient,
    activity.kind,
    activity.id,
  );

  if (!isRemoteActivityNewer(serverActivity, cached)) {
    return;
  }

  synchronizeActivityCaches(queryClient, {
    type: changeType,
    activity: serverActivity,
  });
}

/**
 * Soft-archive — stamps `archivedAt` via PATCH.
 */
export function useArchiveActivityMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ activity }: ArchiveActivityMutationInput) => {
      const response = await fetchPatchActivity(activity.id, {
        archivedAt: new Date().toISOString(),
      });
      return response.activity;
    },
    onMutate: async ({ activity }) => {
      markActivityMutationPending(activity.id);

      const queryKey = activitiesQueryKey(activity.kind);
      await queryClient.cancelQueries({ queryKey });

      const previousSnapshots = snapshotDefinitionCache(queryClient, activity);
      const now = new Date().toISOString();

      synchronizeActivityCaches(queryClient, {
        type: "archive",
        activity: {
          ...activity,
          archivedAt: now,
          updatedAt: now,
        },
      });

      return { previousSnapshots } satisfies ArchiveActivityMutationContext;
    },
    onSettled: (_data, _error, variables) => {
      clearActivityMutationPending(variables.activity.id);
    },
    onError: (_error, _variables, context) => {
      restoreSnapshots(queryClient, context);
    },
    onSuccess: (serverActivity, { activity }) => {
      reconcileIfNewer(queryClient, activity, serverActivity, "archive");
    },
  });
}

/**
 * Restore — clears `archivedAt` via PATCH.
 */
export function useRestoreActivityMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ activity }: ArchiveActivityMutationInput) => {
      const response = await fetchPatchActivity(activity.id, {
        archivedAt: null,
      });
      return response.activity;
    },
    onMutate: async ({ activity }) => {
      markActivityMutationPending(activity.id);

      const queryKey = activitiesQueryKey(activity.kind);
      await queryClient.cancelQueries({ queryKey });

      const previousSnapshots = snapshotDefinitionCache(queryClient, activity);
      const now = new Date().toISOString();

      synchronizeActivityCaches(queryClient, {
        type: "restore",
        activity: {
          ...activity,
          archivedAt: null,
          updatedAt: now,
        },
      });

      return { previousSnapshots } satisfies ArchiveActivityMutationContext;
    },
    onSettled: (_data, _error, variables) => {
      clearActivityMutationPending(variables.activity.id);
    },
    onError: (_error, _variables, context) => {
      restoreSnapshots(queryClient, context);
    },
    onSuccess: (serverActivity, { activity }) => {
      reconcileIfNewer(queryClient, activity, serverActivity, "restore");
    },
  });
}
