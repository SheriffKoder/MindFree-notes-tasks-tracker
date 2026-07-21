/**
 * @file entities/activity/cache/apply-realtime-activity-record-change.ts
 * Applies Supabase realtime `mf_task_record` events to TanStack record caches.
 *
 * Purpose: Framework-free adapter — one postgres_changes payload → gated hub call.
 * Used in: entities/activity/hooks/use-activity-realtime-sync.ts (Step 4)
 * Used for: INSERT/UPDATE/DELETE on mf_task_record with pending + updatedAt gating.
 */

import type { QueryClient } from "@tanstack/react-query";

import {
  findRecordInCache,
  hasRecordMonthCache,
} from "@/entities/activity/cache/find-record-in-cache";
import { synchronizeActivityCaches } from "@/entities/activity/cache/synchronize-activity-caches";
import { isRecordMutationPending } from "@/entities/activity/hooks/record/record-mutation-pending";
import { mapActivityRecordRow } from "@/entities/activity/lib/mapping/map-row";
import { isRemoteRecordNewer } from "@/entities/activity/lib/record/is-remote-record-newer";
import type {
  ActivityRecord,
  ActivityRecordRow,
} from "@/entities/activity/model/types";

export type RealtimeActivityRecordChangeEvent =
  | "INSERT"
  | "UPDATE"
  | "DELETE";

export interface ApplyRealtimeActivityRecordChangeResult {
  applied: boolean;
  record: ActivityRecord | null;
  event: RealtimeActivityRecordChangeEvent;
}

/**
 * Maps a realtime payload row when it has at least `task_id` + `date`.
 */
function mapRealtimeRecordRow(
  row: Record<string, unknown>,
): ActivityRecord | null {
  if (typeof row.task_id !== "string" || typeof row.date !== "string") {
    return null;
  }

  return mapActivityRecordRow(row as unknown as ActivityRecordRow);
}

/** Minimal record for DELETE when only natural key fields are known. */
function stubRecordForDelete(taskId: string, date: string): ActivityRecord {
  return {
    id: "",
    taskId,
    date,
    trackingModeSnapshot: "boolean",
    goalSnapshot: null,
    goalDurationSnapshot: null,
    count: 0,
    duration: 0,
    description: null,
    createdAt: "",
    updatedAt: "",
  };
}

/**
 * Resolves the record to delete from old/new payload or the warm month cache.
 */
function resolveDeleteRecord(
  queryClient: QueryClient,
  oldRecord: Record<string, unknown> | null,
  newRecord: Record<string, unknown> | null,
): ActivityRecord | null {
  const mappedOld = oldRecord ? mapRealtimeRecordRow(oldRecord) : null;

  if (mappedOld) {
    return mappedOld;
  }

  const taskId =
    (typeof oldRecord?.task_id === "string" ? oldRecord.task_id : undefined) ??
    (typeof newRecord?.task_id === "string" ? newRecord.task_id : undefined);
  const date =
    (typeof oldRecord?.date === "string" ? oldRecord.date : undefined) ??
    (typeof newRecord?.date === "string" ? newRecord.date : undefined);

  if (!taskId || !date) {
    return null;
  }

  return (
    findRecordInCache(queryClient, taskId, date) ??
    stubRecordForDelete(taskId, date)
  );
}

/**
 * Patches TanStack caches from one realtime postgres_changes payload on
 * `mf_task_record`. Skips when the target month bucket is not warm.
 */
export function applyRealtimeActivityRecordChange(
  queryClient: QueryClient,
  event: RealtimeActivityRecordChangeEvent,
  newRecord: Record<string, unknown> | null,
  oldRecord: Record<string, unknown> | null,
): ApplyRealtimeActivityRecordChangeResult {
  if (event === "DELETE") {
    const record = resolveDeleteRecord(queryClient, oldRecord, newRecord);

    if (!record) {
      return { applied: false, record: null, event };
    }

    if (isRecordMutationPending(record.taskId, record.date)) {
      return { applied: false, record, event };
    }

    if (!hasRecordMonthCache(queryClient, record.date)) {
      return { applied: false, record, event };
    }

    synchronizeActivityCaches(queryClient, {
      type: "record-delete",
      record,
    });

    return { applied: true, record, event };
  }

  if (!newRecord) {
    return { applied: false, record: null, event };
  }

  const record = mapRealtimeRecordRow(newRecord);

  if (!record) {
    return { applied: false, record: null, event };
  }

  if (isRecordMutationPending(record.taskId, record.date)) {
    return { applied: false, record, event };
  }

  if (!hasRecordMonthCache(queryClient, record.date)) {
    return { applied: false, record, event };
  }

  const cached = findRecordInCache(queryClient, record.taskId, record.date);

  if (event === "UPDATE" && !isRemoteRecordNewer(record, cached)) {
    return { applied: false, record, event };
  }

  synchronizeActivityCaches(queryClient, {
    type: "record-upsert",
    record,
  });

  return { applied: true, record, event };
}
