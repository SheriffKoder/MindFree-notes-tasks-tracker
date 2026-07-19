/**
 * @file entities/activity/hooks/record/use-delete-activity-record-mutation.ts
 * TanStack mutation for DELETE of a day's record with optimistic removal.
 *
 * Purpose: Wire fetchDeleteActivityRecord to TanStack with rollback. Used for
 *          delete-on-empty — the caller fires this after a debounced value
 *          returns to "empty" (see `isMeaningfulRecord`); this hook only
 *          performs the removal and keeps the cache consistent.
 * Used in: features/activity/quick-record (Step 10 orchestrator).
 */

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { recordMonthKey } from "@/entities/activity/cache/record";
import { synchronizeActivityCaches } from "@/entities/activity/cache/synchronize-activity-caches";
import { fetchDeleteActivityRecord } from "@/entities/activity/client/record";
import { activityRecordsQueryKey } from "@/entities/activity/client/query-keys";
import {
  clearRecordMutationPending,
  markRecordMutationPending,
} from "@/entities/activity/hooks/record/record-mutation-pending";
import type { ActivityRecordsResponse } from "@/entities/activity/model/read-models";
import type { ActivityRecord } from "@/entities/activity/model/types";

export interface DeleteActivityRecordMutationInput {
  /** Existing record being emptied/removed. */
  record: ActivityRecord;
}

interface DeleteActivityRecordMutationContext {
  queryKey: readonly unknown[];
  previous: ActivityRecordsResponse | undefined;
}

/**
 * DELETE record — optimistically removes it from its month bucket.
 */
export function useDeleteActivityRecordMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ record }: DeleteActivityRecordMutationInput) => {
      await fetchDeleteActivityRecord({
        taskId: record.taskId,
        date: record.date,
      });
    },
    onMutate: async ({ record }) => {
      const queryKey = activityRecordsQueryKey(recordMonthKey(record.date));
      markRecordMutationPending(record.taskId, record.date);
      await queryClient.cancelQueries({ queryKey });

      const previous =
        queryClient.getQueryData<ActivityRecordsResponse>(queryKey);

      synchronizeActivityCaches(queryClient, {
        type: "record-delete",
        record,
      });

      return {
        queryKey,
        previous,
      } satisfies DeleteActivityRecordMutationContext;
    },
    onSettled: (_data, _error, { record }) => {
      clearRecordMutationPending(record.taskId, record.date);
    },
    onError: (_error, _input, context) => {
      if (!context) {
        return;
      }

      queryClient.setQueryData(context.queryKey, context.previous);
    },
  });
}
