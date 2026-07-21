/**
 * @file entities/activity/cache/apply-realtime-activity-record-change.test.ts
 * Covers upsert, delete, pending skip, stale skip, and missing-month no-op.
 */

import { QueryClient } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { applyRealtimeActivityRecordChange } from "@/entities/activity/cache/apply-realtime-activity-record-change";
import { activityRecordsQueryKey } from "@/entities/activity/client/query-keys";
import {
  clearRecordMutationPending,
  markRecordMutationPending,
} from "@/entities/activity/hooks/record/record-mutation-pending";
import type {
  ActivityRecord,
  ActivityRecordRow,
} from "@/entities/activity/model/types";

function buildRecord(overrides: Partial<ActivityRecord> = {}): ActivityRecord {
  return {
    id: "record-1",
    taskId: "activity-1",
    date: "2024-06-10",
    trackingModeSnapshot: "boolean",
    goalSnapshot: null,
    goalDurationSnapshot: null,
    count: 1,
    duration: 0,
    description: null,
    createdAt: "2024-06-10T12:00:00.000Z",
    updatedAt: "2024-06-10T12:00:00.000Z",
    ...overrides,
  };
}

function buildRow(
  overrides: Partial<ActivityRecordRow> &
    Pick<ActivityRecordRow, "task_id" | "date">,
): Record<string, unknown> {
  return {
    id: "record-1",
    user_id: "user-1",
    tracking_mode_snapshot: "boolean",
    goal_snapshot: null,
    goal_duration_snapshot: null,
    count: 1,
    duration: 0,
    description: null,
    created_at: "2024-06-10T12:00:00.000Z",
    updated_at: "2024-06-10T12:00:00.000Z",
    ...overrides,
  };
}

describe("applyRealtimeActivityRecordChange", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
  });

  afterEach(() => {
    clearRecordMutationPending("activity-1", "2024-06-10");
  });

  it("INSERT upserts into a warm month bucket", () => {
    queryClient.setQueryData(activityRecordsQueryKey("2024-06"), {
      month: "2024-06",
      records: [],
    });

    const result = applyRealtimeActivityRecordChange(
      queryClient,
      "INSERT",
      buildRow({ task_id: "activity-1", date: "2024-06-10", count: 2 }),
      null,
    );

    expect(result.applied).toBe(true);

    const cached = queryClient.getQueryData<{ records: ActivityRecord[] }>(
      activityRecordsQueryKey("2024-06"),
    );

    expect(cached?.records).toHaveLength(1);
    expect(cached?.records[0]?.count).toBe(2);
  });

  it("UPDATE patches when remote is newer", () => {
    queryClient.setQueryData(activityRecordsQueryKey("2024-06"), {
      month: "2024-06",
      records: [buildRecord()],
    });

    const result = applyRealtimeActivityRecordChange(
      queryClient,
      "UPDATE",
      buildRow({
        task_id: "activity-1",
        date: "2024-06-10",
        count: 5,
        updated_at: "2024-06-11T12:00:00.000Z",
      }),
      null,
    );

    expect(result.applied).toBe(true);

    const cached = queryClient.getQueryData<{ records: ActivityRecord[] }>(
      activityRecordsQueryKey("2024-06"),
    );

    expect(cached?.records[0]?.count).toBe(5);
  });

  it("UPDATE skips when remote is stale", () => {
    queryClient.setQueryData(activityRecordsQueryKey("2024-06"), {
      month: "2024-06",
      records: [
        buildRecord({
          count: 9,
          updatedAt: "2024-06-11T12:00:00.000Z",
        }),
      ],
    });

    const result = applyRealtimeActivityRecordChange(
      queryClient,
      "UPDATE",
      buildRow({
        task_id: "activity-1",
        date: "2024-06-10",
        count: 1,
        updated_at: "2024-06-10T12:00:00.000Z",
      }),
      null,
    );

    expect(result.applied).toBe(false);

    const cached = queryClient.getQueryData<{ records: ActivityRecord[] }>(
      activityRecordsQueryKey("2024-06"),
    );

    expect(cached?.records[0]?.count).toBe(9);
  });

  it("DELETE removes from a warm month bucket", () => {
    queryClient.setQueryData(activityRecordsQueryKey("2024-06"), {
      month: "2024-06",
      records: [buildRecord()],
    });

    const result = applyRealtimeActivityRecordChange(
      queryClient,
      "DELETE",
      null,
      buildRow({ task_id: "activity-1", date: "2024-06-10" }),
    );

    expect(result.applied).toBe(true);

    const cached = queryClient.getQueryData<{ records: ActivityRecord[] }>(
      activityRecordsQueryKey("2024-06"),
    );

    expect(cached?.records).toHaveLength(0);
  });

  it("skips while a record mutation is pending", () => {
    queryClient.setQueryData(activityRecordsQueryKey("2024-06"), {
      month: "2024-06",
      records: [buildRecord()],
    });
    markRecordMutationPending("activity-1", "2024-06-10");

    const result = applyRealtimeActivityRecordChange(
      queryClient,
      "UPDATE",
      buildRow({
        task_id: "activity-1",
        date: "2024-06-10",
        count: 99,
        updated_at: "2024-06-12T12:00:00.000Z",
      }),
      null,
    );

    expect(result.applied).toBe(false);

    const cached = queryClient.getQueryData<{ records: ActivityRecord[] }>(
      activityRecordsQueryKey("2024-06"),
    );

    expect(cached?.records[0]?.count).toBe(1);
  });

  it("no-ops when the target month bucket is not warm", () => {
    const result = applyRealtimeActivityRecordChange(
      queryClient,
      "INSERT",
      buildRow({ task_id: "activity-1", date: "2024-06-10" }),
      null,
    );

    expect(result.applied).toBe(false);
    expect(
      queryClient.getQueryData(activityRecordsQueryKey("2024-06")),
    ).toBeUndefined();
  });
});
