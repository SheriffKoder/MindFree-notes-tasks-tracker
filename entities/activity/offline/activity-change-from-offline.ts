/**
 * @file entities/activity/offline/activity-change-from-offline.ts
 * Maps flushed offline activity payloads to normalized {@link ActivityChange} values.
 *
 * Create flush reconciles a pinned optimistic id → server id (definition swap
 * without record purge, then remaps warm records by `taskId`).
 */

import type { QueryClient } from "@tanstack/react-query";

import {
  removeActivityFromCache,
  upsertActivityInCache,
} from "@/entities/activity/cache/activity-cache-mutations";
import { findActivityInEitherKind } from "@/entities/activity/cache/find-activity-in-cache";
import { findRecordInCache } from "@/entities/activity/cache/find-record-in-cache";
import type { ActivityChange } from "@/entities/activity/cache/synchronize-activity-caches";
import { activitiesQueryKey } from "@/entities/activity/client/query-keys";
import type {
  ActivitiesResponse,
  ActivityRecordsResponse,
} from "@/entities/activity/model/read-models";
import type { Activity, ActivityRecord } from "@/entities/activity/model/types";

import type { ActivityOfflinePayload } from "./activity-offline-storage";

function remapRecordsTaskId(
  queryClient: QueryClient,
  fromTaskId: string,
  toTaskId: string,
): void {
  const recordQueries = queryClient.getQueriesData<ActivityRecordsResponse>({
    queryKey: ["activityRecords"],
  });

  for (const [queryKey, data] of recordQueries) {
    if (!data?.records.some((record) => record.taskId === fromTaskId)) {
      continue;
    }

    queryClient.setQueryData<ActivityRecordsResponse>(queryKey, {
      month: data.month,
      records: data.records.map((record) =>
        record.taskId === fromTaskId
          ? { ...record, taskId: toTaskId }
          : record,
      ),
    });
  }
}

/**
 * Replaces a pinned optimistic definition with the server row without purging
 * records, then remaps any warm records that still point at the optimistic id.
 */
export function reconcileOptimisticCreateInCache(
  queryClient: QueryClient,
  optimistic: Activity,
  serverActivity: Activity,
): void {
  const queryKey = activitiesQueryKey(optimistic.kind);

  queryClient.setQueryData<ActivitiesResponse>(queryKey, (current) => {
    if (!current) {
      return current;
    }

    let next = removeActivityFromCache(current, optimistic.id);
    next = upsertActivityInCache(next, serverActivity);
    return next;
  });

  if (optimistic.id !== serverActivity.id) {
    remapRecordsTaskId(queryClient, optimistic.id, serverActivity.id);
  }
}

/**
 * Converts one successful offline flush into a hub-ready activity change.
 *
 * For `create` with an id swap, reconciles the cache directly and returns
 * `null` (caller still removes the offline key).
 */
export function activityChangeFromOfflineFlush(
  queryClient: QueryClient,
  payload: ActivityOfflinePayload,
  options: {
    previousActivity: Activity | null;
    previousRecord: ActivityRecord | null;
    serverActivity: Activity | null;
    serverRecord: ActivityRecord | null;
  },
): ActivityChange | null {
  switch (payload.operation) {
    case "create": {
      if (!options.serverActivity) {
        return null;
      }

      if (
        options.previousActivity &&
        options.previousActivity.id !== options.serverActivity.id
      ) {
        reconcileOptimisticCreateInCache(
          queryClient,
          options.previousActivity,
          options.serverActivity,
        );
        return null;
      }

      return { type: "create", activity: options.serverActivity };
    }
    case "patch": {
      if (!options.serverActivity) {
        return null;
      }

      return { type: "update", activity: options.serverActivity };
    }
    case "archive": {
      if (!options.serverActivity) {
        return null;
      }

      return { type: "archive", activity: options.serverActivity };
    }
    case "restore": {
      if (!options.serverActivity) {
        return null;
      }

      return { type: "restore", activity: options.serverActivity };
    }
    case "delete": {
      const activity =
        options.previousActivity ??
        (payload.activityId
          ? (findActivityInEitherKind(queryClient, payload.activityId) ?? null)
          : null);

      if (!activity) {
        return null;
      }

      return { type: "delete", activity };
    }
    case "record-upsert": {
      if (!options.serverRecord) {
        return null;
      }

      return { type: "record-upsert", record: options.serverRecord };
    }
    case "record-delete": {
      const record =
        options.previousRecord ??
        (payload.taskId && payload.date
          ? (findRecordInCache(queryClient, payload.taskId, payload.date) ??
            null)
          : null);

      if (!record) {
        return null;
      }

      return { type: "record-delete", record };
    }
  }

  return null;
}
