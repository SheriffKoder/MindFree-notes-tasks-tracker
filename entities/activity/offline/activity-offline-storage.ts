/**
 * @file entities/activity/offline/activity-offline-storage.ts
 * Activity definition + record form ↔ localStorage ↔ TanStack cache ↔ API.
 */

import type { QueryClient } from "@tanstack/react-query";

import {
  findActivityByIdInCache,
  findActivityInEitherKind,
} from "@/entities/activity/cache/find-activity-in-cache";
import { findRecordInCache } from "@/entities/activity/cache/find-record-in-cache";
import { synchronizeActivityCaches } from "@/entities/activity/cache/synchronize-activity-caches";
import { fetchDeleteActivity } from "@/entities/activity/client/delete-activity";
import { fetchPatchActivity } from "@/entities/activity/client/patch-activity";
import { fetchPostActivity } from "@/entities/activity/client/post-activity";
import {
  fetchDeleteActivityRecord,
  fetchUpsertActivityRecord,
} from "@/entities/activity/client/record";
import type { ActivityFormValues } from "@/entities/activity/editor/model/types";
import {
  buildOptimisticActivity,
  pinnedDraftActivityId,
} from "@/entities/activity/hooks/build-optimistic-activity";
import { mergeFormValuesIntoActivity } from "@/entities/activity/hooks/merge-form-values-into-activity";
import { buildOptimisticActivityRecord } from "@/entities/activity/hooks/record/build-optimistic-activity-record";
import { normalizeActivityDefinition } from "@/entities/activity/lib/definition";
import type {
  Activity,
  ActivityKind,
  ActivityRecord,
  TrackingMode,
} from "@/entities/activity/model/types";
import type { OfflineEntityAdapter, OfflineWrite } from "@/shared/offline-queue";
import {
  removeOfflineWrite,
  saveOfflineWrite,
} from "@/shared/offline-queue";

import { activityChangeFromOfflineFlush } from "./activity-change-from-offline";

export const ACTIVITY_OFFLINE_ENTITY = "activity";

export type ActivityOfflineOperation =
  | "create"
  | "patch"
  | "archive"
  | "restore"
  | "delete"
  | "record-upsert"
  | "record-delete";

export interface ActivityOfflinePayload {
  operation: ActivityOfflineOperation;
  savedAt: string;
  /** Definition kind for definition ops; null for record-only ops. */
  kind: ActivityKind | null;
  /** Definition id (pinned draft or persisted). */
  activityId: string | null;
  /** Form snapshot for create/patch. */
  values: ActivityFormValues | null;
  /** Record natural key + absolute totals. */
  taskId: string | null;
  date: string | null;
  count: number | null;
  duration: number | null;
  description: string | null;
  trackingMode: TrackingMode | null;
  goal: number | null;
  goalDuration: number | null;
}

export type ActivityOfflinePendingInput =
  | {
      kind: "create";
      activityKind: ActivityKind;
      values: ActivityFormValues;
    }
  | {
      kind: "patch";
      activity: Activity;
      values: ActivityFormValues;
    }
  | {
      kind: "archive" | "restore" | "delete";
      activity: Activity;
    }
  | {
      kind: "record-upsert";
      taskId: string;
      date: string;
      count: number;
      duration: number;
      description?: string | null;
      trackingMode: TrackingMode;
      goal: number | null;
      goalDuration: number | null;
    }
  | {
      kind: "record-delete";
      record: ActivityRecord;
    };

/**
 * Builds a stable storage key — one slot per resource (last-win).
 */
export function buildActivityOfflineKey(
  input: ActivityOfflinePendingInput,
): string {
  switch (input.kind) {
    case "create":
      return `activity:draft:${input.activityKind}`;
    case "patch":
    case "archive":
    case "restore":
    case "delete":
      return `activity:${input.activity.id}`;
    case "record-upsert":
      return `record:${input.taskId}:${input.date}`;
    case "record-delete":
      return `record:${input.record.taskId}:${input.record.date}`;
  }
}

/**
 * Maps an orchestrator / quick-record payload to a user-scoped offline write.
 */
export function toActivityOfflineWrite(
  userId: string,
  input: ActivityOfflinePendingInput,
): OfflineWrite<ActivityOfflinePayload> {
  const savedAt = new Date().toISOString();
  const key = buildActivityOfflineKey(input);

  const base = {
    userId,
    entity: ACTIVITY_OFFLINE_ENTITY,
    key,
    savedAt,
  };

  switch (input.kind) {
    case "create":
      return {
        ...base,
        payload: {
          operation: "create",
          savedAt,
          kind: input.activityKind,
          activityId: pinnedDraftActivityId(input.activityKind),
          values: input.values,
          taskId: null,
          date: null,
          count: null,
          duration: null,
          description: null,
          trackingMode: null,
          goal: null,
          goalDuration: null,
        },
      };
    case "patch":
      return {
        ...base,
        payload: {
          operation: "patch",
          savedAt,
          kind: input.activity.kind,
          activityId: input.activity.id,
          values: input.values,
          taskId: null,
          date: null,
          count: null,
          duration: null,
          description: null,
          trackingMode: null,
          goal: null,
          goalDuration: null,
        },
      };
    case "archive":
    case "restore":
    case "delete":
      return {
        ...base,
        payload: {
          operation: input.kind,
          savedAt,
          kind: input.activity.kind,
          activityId: input.activity.id,
          values: null,
          taskId: null,
          date: null,
          count: null,
          duration: null,
          description: null,
          trackingMode: null,
          goal: null,
          goalDuration: null,
        },
      };
    case "record-upsert":
      return {
        ...base,
        payload: {
          operation: "record-upsert",
          savedAt,
          kind: null,
          activityId: null,
          values: null,
          taskId: input.taskId,
          date: input.date,
          count: input.count,
          duration: input.duration,
          description: input.description ?? null,
          trackingMode: input.trackingMode,
          goal: input.goal,
          goalDuration: input.goalDuration,
        },
      };
    case "record-delete":
      return {
        ...base,
        payload: {
          operation: "record-delete",
          savedAt,
          kind: null,
          activityId: null,
          values: null,
          taskId: input.record.taskId,
          date: input.record.date,
          count: null,
          duration: null,
          description: null,
          trackingMode: null,
          goal: null,
          goalDuration: null,
        },
      };
  }
}

function resolvePendingFromPayload(
  queryClient: QueryClient,
  payload: ActivityOfflinePayload,
): ActivityOfflinePendingInput | null {
  switch (payload.operation) {
    case "create": {
      if (!payload.kind || !payload.values) {
        return null;
      }

      return {
        kind: "create",
        activityKind: payload.kind,
        values: payload.values,
      };
    }
    case "patch": {
      if (!payload.activityId || !payload.values) {
        return null;
      }

      const activity =
        (payload.kind
          ? findActivityByIdInCache(
              queryClient,
              payload.kind,
              payload.activityId,
            )
          : undefined) ??
        findActivityInEitherKind(queryClient, payload.activityId);

      if (!activity) {
        return null;
      }

      return {
        kind: "patch",
        activity,
        values: payload.values,
      };
    }
    case "archive":
    case "restore":
    case "delete": {
      if (!payload.activityId) {
        return null;
      }

      const activity =
        (payload.kind
          ? findActivityByIdInCache(
              queryClient,
              payload.kind,
              payload.activityId,
            )
          : undefined) ??
        findActivityInEitherKind(queryClient, payload.activityId);

      if (!activity) {
        return null;
      }

      return {
        kind: payload.operation,
        activity,
      };
    }
    case "record-upsert": {
      if (
        !payload.taskId ||
        !payload.date ||
        payload.count === null ||
        payload.duration === null ||
        !payload.trackingMode
      ) {
        return null;
      }

      return {
        kind: "record-upsert",
        taskId: payload.taskId,
        date: payload.date,
        count: payload.count,
        duration: payload.duration,
        description: payload.description,
        trackingMode: payload.trackingMode,
        goal: payload.goal,
        goalDuration: payload.goalDuration,
      };
    }
    case "record-delete": {
      if (!payload.taskId || !payload.date) {
        return null;
      }

      const record = findRecordInCache(
        queryClient,
        payload.taskId,
        payload.date,
      );

      if (!record) {
        return null;
      }

      return {
        kind: "record-delete",
        record,
      };
    }
  }
}

/**
 * Applies optimistic cache updates for one pending activity write.
 */
export function applyActivityOfflinePending(
  queryClient: QueryClient,
  input: ActivityOfflinePendingInput,
  savedAt?: string,
): void {
  const now = savedAt ?? new Date().toISOString();

  switch (input.kind) {
    case "create": {
      const activity = buildOptimisticActivity(input.activityKind, input.values, {
        id: pinnedDraftActivityId(input.activityKind),
        now,
      });

      synchronizeActivityCaches(queryClient, {
        type: "create",
        activity,
      });
      return;
    }
    case "patch": {
      synchronizeActivityCaches(queryClient, {
        type: "update",
        activity: mergeFormValuesIntoActivity(input.activity, input.values, {
          updatedAt: now,
        }),
      });
      return;
    }
    case "archive": {
      synchronizeActivityCaches(queryClient, {
        type: "archive",
        activity: {
          ...input.activity,
          archivedAt: now,
          updatedAt: now,
        },
      });
      return;
    }
    case "restore": {
      synchronizeActivityCaches(queryClient, {
        type: "restore",
        activity: {
          ...input.activity,
          archivedAt: null,
          updatedAt: now,
        },
      });
      return;
    }
    case "delete": {
      synchronizeActivityCaches(queryClient, {
        type: "delete",
        activity: input.activity,
      });
      return;
    }
    case "record-upsert": {
      const existing = findRecordInCache(
        queryClient,
        input.taskId,
        input.date,
      );

      synchronizeActivityCaches(queryClient, {
        type: "record-upsert",
        record: buildOptimisticActivityRecord(
          {
            taskId: input.taskId,
            date: input.date,
            count: input.count,
            duration: input.duration,
            description: input.description,
            trackingMode: input.trackingMode,
            goal: input.goal,
            goalDuration: input.goalDuration,
          },
          existing,
        ),
      });
      return;
    }
    case "record-delete": {
      synchronizeActivityCaches(queryClient, {
        type: "record-delete",
        record: input.record,
      });
    }
  }
}

function resolveCachedActivityForPayload(
  queryClient: QueryClient,
  payload: ActivityOfflinePayload,
): Activity | null {
  if (payload.operation === "create" && payload.kind) {
    const draftId = payload.activityId ?? pinnedDraftActivityId(payload.kind);
    return (
      findActivityByIdInCache(queryClient, payload.kind, draftId) ?? null
    );
  }

  if (!payload.activityId) {
    return null;
  }

  if (payload.kind) {
    return (
      findActivityByIdInCache(
        queryClient,
        payload.kind,
        payload.activityId,
      ) ?? null
    );
  }

  return findActivityInEitherKind(queryClient, payload.activityId) ?? null;
}

function resolveCachedRecordForPayload(
  queryClient: QueryClient,
  payload: ActivityOfflinePayload,
): ActivityRecord | null {
  if (!payload.taskId || !payload.date) {
    return null;
  }

  return findRecordInCache(queryClient, payload.taskId, payload.date) ?? null;
}

function shouldApplyOfflinePayload(
  queryClient: QueryClient,
  payload: ActivityOfflinePayload,
): boolean {
  if (
    payload.operation === "record-upsert" ||
    payload.operation === "record-delete"
  ) {
    if (payload.operation === "record-delete") {
      const cached = resolveCachedRecordForPayload(queryClient, payload);
      return cached !== null && payload.savedAt > cached.updatedAt;
    }

    const cached = resolveCachedRecordForPayload(queryClient, payload);

    if (!cached) {
      return true;
    }

    return payload.savedAt > cached.updatedAt;
  }

  if (payload.operation === "delete") {
    const cached = resolveCachedActivityForPayload(queryClient, payload);
    return cached !== null && payload.savedAt > cached.updatedAt;
  }

  if (payload.operation === "create") {
    const cached = resolveCachedActivityForPayload(queryClient, payload);

    if (!cached) {
      return true;
    }

    return payload.savedAt > cached.updatedAt;
  }

  const cached = resolveCachedActivityForPayload(queryClient, payload);

  if (!cached) {
    return true;
  }

  return payload.savedAt > cached.updatedAt;
}

interface ExecuteOfflineResult {
  serverActivity: Activity | null;
  serverRecord: ActivityRecord | null;
}

async function executeActivityOfflinePayload(
  payload: ActivityOfflinePayload,
): Promise<ExecuteOfflineResult> {
  switch (payload.operation) {
    case "create": {
      if (!payload.kind || !payload.values) {
        return { serverActivity: null, serverRecord: null };
      }

      const normalized = normalizeActivityDefinition(
        payload.kind,
        payload.values,
      );
      const response = await fetchPostActivity({
        kind: payload.kind,
        ...payload.values,
        ...normalized,
      });

      return { serverActivity: response.activity, serverRecord: null };
    }
    case "patch": {
      if (!payload.activityId || !payload.values || !payload.kind) {
        return { serverActivity: null, serverRecord: null };
      }

      const normalized = normalizeActivityDefinition(
        payload.kind,
        payload.values,
      );
      const response = await fetchPatchActivity(payload.activityId, {
        ...payload.values,
        ...normalized,
      });

      return { serverActivity: response.activity, serverRecord: null };
    }
    case "archive": {
      if (!payload.activityId) {
        return { serverActivity: null, serverRecord: null };
      }

      const response = await fetchPatchActivity(payload.activityId, {
        archivedAt: new Date().toISOString(),
      });

      return { serverActivity: response.activity, serverRecord: null };
    }
    case "restore": {
      if (!payload.activityId) {
        return { serverActivity: null, serverRecord: null };
      }

      const response = await fetchPatchActivity(payload.activityId, {
        archivedAt: null,
      });

      return { serverActivity: response.activity, serverRecord: null };
    }
    case "delete": {
      if (!payload.activityId) {
        return { serverActivity: null, serverRecord: null };
      }

      await fetchDeleteActivity(payload.activityId);
      return { serverActivity: null, serverRecord: null };
    }
    case "record-upsert": {
      if (
        !payload.taskId ||
        !payload.date ||
        payload.count === null ||
        payload.duration === null ||
        !payload.trackingMode
      ) {
        return { serverActivity: null, serverRecord: null };
      }

      const response = await fetchUpsertActivityRecord({
        taskId: payload.taskId,
        date: payload.date,
        trackingModeSnapshot: payload.trackingMode,
        goalSnapshot: payload.goal,
        goalDurationSnapshot: payload.goalDuration,
        count: payload.count,
        duration: payload.duration,
        description: payload.description,
      });

      return { serverActivity: null, serverRecord: response.record };
    }
    case "record-delete": {
      if (!payload.taskId || !payload.date) {
        return { serverActivity: null, serverRecord: null };
      }

      await fetchDeleteActivityRecord({
        taskId: payload.taskId,
        date: payload.date,
      });

      return { serverActivity: null, serverRecord: null };
    }
  }
}

/**
 * Folds draft-create + later patch-on-pinned-id into one create write.
 * Prefer collapse so flush does not PATCH an optimistic id after POST.
 */
function collapseDraftCreates(
  writes: OfflineWrite[],
): { writes: OfflineWrite[]; keysToDrop: string[] } {
  const keysToDrop: string[] = [];
  const byKey = new Map(writes.map((write) => [write.key, write]));
  const result: OfflineWrite[] = [];

  for (const write of writes) {
    const payload = write.payload as ActivityOfflinePayload;

    if (payload.operation !== "create" || !payload.kind) {
      continue;
    }

    const pinnedId = pinnedDraftActivityId(payload.kind);
    const patchKey = `activity:${pinnedId}`;
    const patchWrite = byKey.get(patchKey);
    const patchPayload = patchWrite?.payload as ActivityOfflinePayload | undefined;

    if (patchPayload?.operation === "patch" && patchPayload.values) {
      const collapsed: OfflineWrite<ActivityOfflinePayload> = {
        ...write,
        savedAt:
          patchWrite!.savedAt > write.savedAt
            ? patchWrite!.savedAt
            : write.savedAt,
        payload: {
          ...payload,
          values: patchPayload.values,
          savedAt:
            patchWrite!.savedAt > write.savedAt
              ? patchWrite!.savedAt
              : write.savedAt,
        },
      };

      result.push(collapsed);
      keysToDrop.push(patchKey);
      byKey.delete(write.key);
      byKey.delete(patchKey);
    }
  }

  for (const write of writes) {
    if (keysToDrop.includes(write.key)) {
      continue;
    }

    if (result.some((entry) => entry.key === write.key)) {
      continue;
    }

    result.push(write);
  }

  // Creates before other definition ops; records after definitions.
  result.sort((left, right) => {
    const leftOp = (left.payload as ActivityOfflinePayload).operation;
    const rightOp = (right.payload as ActivityOfflinePayload).operation;
    const rank = (operation: ActivityOfflineOperation): number => {
      if (operation === "create") {
        return 0;
      }

      if (
        operation === "patch" ||
        operation === "archive" ||
        operation === "restore" ||
        operation === "delete"
      ) {
        return 1;
      }

      return 2;
    };

    return rank(leftOp) - rank(rightOp);
  });

  return { writes: result, keysToDrop };
}

/**
 * Persists one pending activity write and updates the TanStack cache optimistically.
 */
export function saveActivityOfflinePending(
  userId: string,
  queryClient: QueryClient,
  input: ActivityOfflinePendingInput,
): void {
  const write = toActivityOfflineWrite(userId, input);
  saveOfflineWrite(write);
  applyActivityOfflinePending(queryClient, input, write.savedAt);
}

/**
 * Registers the activity entity adapter for page-level merge + flush.
 */
export function createActivityOfflineSyncAdapter(
  queryClient: QueryClient,
): OfflineEntityAdapter {
  return {
    entity: ACTIVITY_OFFLINE_ENTITY,

    merge(writes) {
      for (const write of writes) {
        const payload = write.payload as ActivityOfflinePayload;

        if (!shouldApplyOfflinePayload(queryClient, payload)) {
          continue;
        }

        const pending = resolvePendingFromPayload(queryClient, payload);

        if (pending) {
          applyActivityOfflinePending(queryClient, pending, payload.savedAt);
        }
      }
    },

    async flush(writes) {
      const { writes: ordered, keysToDrop } = collapseDraftCreates(writes);

      for (const key of keysToDrop) {
        const sample = writes[0];
        if (sample) {
          removeOfflineWrite(sample.userId, key);
        }
      }

      for (const write of ordered) {
        const payload = write.payload as ActivityOfflinePayload;

        try {
          const previousActivity = resolveCachedActivityForPayload(
            queryClient,
            payload,
          );
          const previousRecord = resolveCachedRecordForPayload(
            queryClient,
            payload,
          );
          const { serverActivity, serverRecord } =
            await executeActivityOfflinePayload(payload);
          const change = activityChangeFromOfflineFlush(queryClient, payload, {
            previousActivity,
            previousRecord,
            serverActivity,
            serverRecord,
          });

          if (change) {
            synchronizeActivityCaches(queryClient, change);
          }

          removeOfflineWrite(write.userId, write.key);
        } catch {
          // Keep in storage until the next reconnect or focus flush.
        }
      }
    },
  };
}
