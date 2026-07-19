/**
 * @file entities/activity/hooks/record/use-upsert-activity-record-mutation.ts
 * TanStack mutation for POST upsert of a day's record with optimistic cache.
 *
 * Purpose: Wire fetchUpsertActivityRecord to TanStack with rollback +
 *          newer-wins reconciliation. Values are absolute (the day's totals).
 * Used in: features/activity/quick-record (Step 10 orchestrator).
 *
 * The caller decides *when* to record (debounced); this hook only performs one
 * absolute upsert for `(taskId, date)` and keeps the cache consistent.
 */

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { recordMonthKey } from "@/entities/activity/cache/record";
import { synchronizeActivityCaches } from "@/entities/activity/cache/synchronize-activity-caches";
import { fetchUpsertActivityRecord } from "@/entities/activity/client/record";
import { activityRecordsQueryKey } from "@/entities/activity/client/query-keys";
import {
  buildOptimisticActivityRecord,
  type OptimisticRecordConfiguration,
} from "@/entities/activity/hooks/record/build-optimistic-activity-record";
import {
  clearRecordMutationPending,
  markRecordMutationPending,
} from "@/entities/activity/hooks/record/record-mutation-pending";
import { isRemoteRecordNewer } from "@/entities/activity/lib/record/is-remote-record-newer";
import type { ActivityRecordsResponse } from "@/entities/activity/model/read-models";
import type { ActivityRecord } from "@/entities/activity/model/types";

export interface UpsertActivityRecordMutationInput
  extends OptimisticRecordConfiguration {
  /** Owning activity id. */
  taskId: string;
  /** Record day (`YYYY-MM-DD`). */
  date: string;
  /** Absolute count total for the day. */
  count: number;
  /** Absolute duration total (minutes) for the day. */
  duration: number;
  /** Optional note attached to the record. */
  description?: string | null;
}

interface UpsertActivityRecordMutationContext {
  queryKey: readonly unknown[];
  previous: ActivityRecordsResponse | undefined;
}

function findCachedRecord(
  data: ActivityRecordsResponse | undefined,
  taskId: string,
  date: string,
): ActivityRecord | undefined {
  return data?.records.find(
    (record) => record.taskId === taskId && record.date === date,
  );
}

/**
 * POST upsert record — optimistically writes `["activityRecords", month]`.
 *
 * HTTP stays totals-only. `trackingMode` / `goal` / `goalDuration` seed the
 * optimistic cache row on first create and are ignored once a cached record
 * already holds snapshots. The server response replaces optimistic snapshots
 * with database-authoritative values via newer-wins.
 */
export function useUpsertActivityRecordMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpsertActivityRecordMutationInput) => {
      const response = await fetchUpsertActivityRecord({
        taskId: input.taskId,
        date: input.date,
        count: input.count,
        duration: input.duration,
        description: input.description ?? null,
      });
      return response.record;
    },
    onMutate: async (input) => {
      const queryKey = activityRecordsQueryKey(recordMonthKey(input.date));
      markRecordMutationPending(input.taskId, input.date);
      await queryClient.cancelQueries({ queryKey });

      const previous =
        queryClient.getQueryData<ActivityRecordsResponse>(queryKey);
      const existing = findCachedRecord(previous, input.taskId, input.date);

      synchronizeActivityCaches(queryClient, {
        type: "record-upsert",
        record: buildOptimisticActivityRecord(input, existing),
      });

      return {
        queryKey,
        previous,
      } satisfies UpsertActivityRecordMutationContext;
    },
    onSettled: (_data, _error, input) => {
      clearRecordMutationPending(input.taskId, input.date);
    },
    onError: (_error, _input, context) => {
      if (!context) {
        return;
      }

      queryClient.setQueryData(context.queryKey, context.previous);
    },
    onSuccess: (serverRecord) => {
      const queryKey = activityRecordsQueryKey(
        recordMonthKey(serverRecord.date),
      );
      const cached = findCachedRecord(
        queryClient.getQueryData<ActivityRecordsResponse>(queryKey),
        serverRecord.taskId,
        serverRecord.date,
      );

      if (!isRemoteRecordNewer(serverRecord, cached)) {
        return;
      }

      synchronizeActivityCaches(queryClient, {
        type: "record-upsert",
        record: serverRecord,
      });
    },
  });
}
