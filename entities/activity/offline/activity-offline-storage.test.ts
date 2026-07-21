/**
 * @file entities/activity/offline/activity-offline-storage.test.ts
 * Locks offline keys, optimistic apply, and merge newer-wins gates.
 */

import { QueryClient } from "@tanstack/react-query";
import { beforeEach, describe, expect, it } from "vitest";

import {
  activitiesQueryKey,
  activityRecordsQueryKey,
} from "@/entities/activity/client/query-keys";
import type { ActivityFormValues } from "@/entities/activity/editor/model/types";
import { pinnedDraftActivityId } from "@/entities/activity/hooks/build-optimistic-activity";
import {
  ACTIVITY_OFFLINE_ENTITY,
  applyActivityOfflinePending,
  buildActivityOfflineKey,
  createActivityOfflineSyncAdapter,
  toActivityOfflineWrite,
  type ActivityOfflinePayload,
} from "@/entities/activity/offline/activity-offline-storage";
import type { Activity, ActivityRecord } from "@/entities/activity/model/types";
import type { OfflineWrite } from "@/shared/offline-queue";

function buildFormValues(
  overrides: Partial<ActivityFormValues> = {},
): ActivityFormValues {
  return {
    title: "Offline title",
    description: null,
    color: null,
    trackingMode: "boolean",
    scheduleType: "daily",
    scheduleConfig: null,
    goal: null,
    goalDuration: null,
    goalPeriod: null,
    periodGoal: null,
    periodGoalDuration: null,
    priority: null,
    startsAt: null,
    endsAt: null,
    ...overrides,
  };
}

function buildActivity(overrides: Partial<Activity> = {}): Activity {
  return {
    id: "activity-1",
    kind: "task",
    title: "Title",
    description: null,
    color: null,
    trackingMode: "boolean",
    scheduleType: "daily",
    scheduleConfig: null,
    goal: null,
    goalDuration: null,
    icon: null,
    goalPeriod: null,
    periodGoal: null,
    periodGoalDuration: null,
    priority: null,
    startsAt: null,
    endsAt: null,
    archivedAt: null,
    createdAt: "2024-06-01T12:00:00.000Z",
    updatedAt: "2024-06-01T12:00:00.000Z",
    ...overrides,
  };
}

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

function buildWrite(
  payload: ActivityOfflinePayload,
  overrides: Partial<OfflineWrite<ActivityOfflinePayload>> = {},
): OfflineWrite<ActivityOfflinePayload> {
  return {
    userId: "user-1",
    entity: ACTIVITY_OFFLINE_ENTITY,
    key: "activity:activity-1",
    savedAt: payload.savedAt,
    payload,
    ...overrides,
  };
}

describe("buildActivityOfflineKey", () => {
  it("uses one draft key per kind and one definition key per id", () => {
    const values = buildFormValues();
    const activity = buildActivity();

    expect(
      buildActivityOfflineKey({
        kind: "create",
        activityKind: "task",
        values,
      }),
    ).toBe("activity:draft:task");

    expect(
      buildActivityOfflineKey({
        kind: "create",
        activityKind: "reminder",
        values,
      }),
    ).toBe("activity:draft:reminder");

    expect(
      buildActivityOfflineKey({ kind: "patch", activity, values }),
    ).toBe("activity:activity-1");
    expect(
      buildActivityOfflineKey({ kind: "archive", activity }),
    ).toBe("activity:activity-1");
    expect(
      buildActivityOfflineKey({ kind: "delete", activity }),
    ).toBe("activity:activity-1");
  });

  it("collides record upsert and delete on the same natural key", () => {
    const record = buildRecord();

    expect(
      buildActivityOfflineKey({
        kind: "record-upsert",
        taskId: record.taskId,
        date: record.date,
        count: 2,
        duration: 0,
        trackingMode: "boolean",
        goal: null,
        goalDuration: null,
      }),
    ).toBe("record:activity-1:2024-06-10");

    expect(
      buildActivityOfflineKey({ kind: "record-delete", record }),
    ).toBe("record:activity-1:2024-06-10");
  });
});

describe("toActivityOfflineWrite", () => {
  it("pins draft create id and stamps the shared entity string", () => {
    const values = buildFormValues({ title: "New task" });
    const write = toActivityOfflineWrite("user-1", {
      kind: "create",
      activityKind: "task",
      values,
    });

    expect(write.entity).toBe(ACTIVITY_OFFLINE_ENTITY);
    expect(write.key).toBe("activity:draft:task");
    expect(write.payload.operation).toBe("create");
    expect(write.payload.activityId).toBe(pinnedDraftActivityId("task"));
    expect(write.payload.values).toEqual(values);
  });
});

describe("applyActivityOfflinePending", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
  });

  it("creates a pinned draft definition in the kind cache", () => {
    queryClient.setQueryData(activitiesQueryKey("task"), { activities: [] });

    applyActivityOfflinePending(
      queryClient,
      {
        kind: "create",
        activityKind: "task",
        values: buildFormValues({ title: "Draft" }),
      },
      "2024-06-02T12:00:00.000Z",
    );

    const cached = queryClient.getQueryData<{ activities: Activity[] }>(
      activitiesQueryKey("task"),
    );
    expect(cached?.activities).toEqual([
      expect.objectContaining({
        id: pinnedDraftActivityId("task"),
        title: "Draft",
        kind: "task",
        updatedAt: "2024-06-02T12:00:00.000Z",
      }),
    ]);
  });

  it("patches an existing definition title via the hub", () => {
    const activity = buildActivity({ title: "Before" });
    queryClient.setQueryData(activitiesQueryKey("task"), {
      activities: [activity],
    });

    applyActivityOfflinePending(
      queryClient,
      {
        kind: "patch",
        activity,
        values: buildFormValues({ title: "After" }),
      },
      "2024-06-03T12:00:00.000Z",
    );

    expect(
      queryClient.getQueryData<{ activities: Activity[] }>(
        activitiesQueryKey("task"),
      )?.activities,
    ).toEqual([
      expect.objectContaining({
        id: "activity-1",
        title: "After",
        updatedAt: "2024-06-03T12:00:00.000Z",
      }),
    ]);
  });

  it("archives, restores, and deletes definitions", () => {
    const activity = buildActivity();
    queryClient.setQueryData(activitiesQueryKey("task"), {
      activities: [activity],
    });

    applyActivityOfflinePending(
      queryClient,
      { kind: "archive", activity },
      "2024-06-04T12:00:00.000Z",
    );

    expect(
      queryClient.getQueryData<{ activities: Activity[] }>(
        activitiesQueryKey("task"),
      )?.activities[0],
    ).toEqual(
      expect.objectContaining({
        archivedAt: "2024-06-04T12:00:00.000Z",
        updatedAt: "2024-06-04T12:00:00.000Z",
      }),
    );

    const archived = queryClient.getQueryData<{ activities: Activity[] }>(
      activitiesQueryKey("task"),
    )!.activities[0]!;

    applyActivityOfflinePending(
      queryClient,
      { kind: "restore", activity: archived },
      "2024-06-05T12:00:00.000Z",
    );

    expect(
      queryClient.getQueryData<{ activities: Activity[] }>(
        activitiesQueryKey("task"),
      )?.activities[0],
    ).toEqual(
      expect.objectContaining({
        archivedAt: null,
        updatedAt: "2024-06-05T12:00:00.000Z",
      }),
    );

    applyActivityOfflinePending(queryClient, {
      kind: "delete",
      activity: buildActivity(),
    });

    expect(
      queryClient.getQueryData<{ activities: Activity[] }>(
        activitiesQueryKey("task"),
      )?.activities,
    ).toEqual([]);
  });

  it("upserts and deletes records in the month bucket", () => {
    queryClient.setQueryData(activityRecordsQueryKey("2024-06"), {
      month: "2024-06",
      records: [],
    });

    applyActivityOfflinePending(queryClient, {
      kind: "record-upsert",
      taskId: "activity-1",
      date: "2024-06-10",
      count: 3,
      duration: 0,
      trackingMode: "boolean",
      goal: null,
      goalDuration: null,
    });

    const afterUpsert = queryClient.getQueryData<{
      records: ActivityRecord[];
    }>(activityRecordsQueryKey("2024-06"));
    expect(afterUpsert?.records).toEqual([
      expect.objectContaining({
        taskId: "activity-1",
        date: "2024-06-10",
        count: 3,
      }),
    ]);

    const record = afterUpsert!.records[0]!;
    applyActivityOfflinePending(queryClient, {
      kind: "record-delete",
      record,
    });

    expect(
      queryClient.getQueryData<{ records: ActivityRecord[] }>(
        activityRecordsQueryKey("2024-06"),
      )?.records,
    ).toEqual([]);
  });
});

describe("createActivityOfflineSyncAdapter.merge", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
  });

  it("skips patch when savedAt is not newer than cached updatedAt", () => {
    const activity = buildActivity({
      title: "Cached",
      updatedAt: "2024-06-10T12:00:00.000Z",
    });
    queryClient.setQueryData(activitiesQueryKey("task"), {
      activities: [activity],
    });

    const adapter = createActivityOfflineSyncAdapter(queryClient);
    adapter.merge([
      buildWrite({
        operation: "patch",
        savedAt: "2024-06-09T12:00:00.000Z",
        kind: "task",
        activityId: "activity-1",
        values: buildFormValues({ title: "Stale offline" }),
        taskId: null,
        date: null,
        count: null,
        duration: null,
        description: null,
        trackingMode: null,
        goal: null,
        goalDuration: null,
      }),
    ]);

    expect(
      queryClient.getQueryData<{ activities: Activity[] }>(
        activitiesQueryKey("task"),
      )?.activities[0]?.title,
    ).toBe("Cached");
  });

  it("applies patch when savedAt is newer than cached updatedAt", () => {
    const activity = buildActivity({
      title: "Cached",
      updatedAt: "2024-06-01T12:00:00.000Z",
    });
    queryClient.setQueryData(activitiesQueryKey("task"), {
      activities: [activity],
    });

    const adapter = createActivityOfflineSyncAdapter(queryClient);
    adapter.merge([
      buildWrite({
        operation: "patch",
        savedAt: "2024-06-09T12:00:00.000Z",
        kind: "task",
        activityId: "activity-1",
        values: buildFormValues({ title: "Newer offline" }),
        taskId: null,
        date: null,
        count: null,
        duration: null,
        description: null,
        trackingMode: null,
        goal: null,
        goalDuration: null,
      }),
    ]);

    expect(
      queryClient.getQueryData<{ activities: Activity[] }>(
        activitiesQueryKey("task"),
      )?.activities[0],
    ).toEqual(
      expect.objectContaining({
        title: "Newer offline",
        updatedAt: "2024-06-09T12:00:00.000Z",
      }),
    );
  });

  it("skips record-delete when the row is missing or write is stale", () => {
    queryClient.setQueryData(activityRecordsQueryKey("2024-06"), {
      month: "2024-06",
      records: [
        buildRecord({ updatedAt: "2024-06-10T12:00:00.000Z" }),
      ],
    });

    const adapter = createActivityOfflineSyncAdapter(queryClient);
    const payload: ActivityOfflinePayload = {
      operation: "record-delete",
      savedAt: "2024-06-09T12:00:00.000Z",
      kind: null,
      activityId: null,
      values: null,
      taskId: "activity-1",
      date: "2024-06-10",
      count: null,
      duration: null,
      description: null,
      trackingMode: null,
      goal: null,
      goalDuration: null,
    };

    adapter.merge([
      buildWrite(payload, { key: "record:activity-1:2024-06-10" }),
    ]);

    expect(
      queryClient.getQueryData<{ records: ActivityRecord[] }>(
        activityRecordsQueryKey("2024-06"),
      )?.records,
    ).toHaveLength(1);

    adapter.merge([
      buildWrite(
        { ...payload, taskId: "missing", date: "2024-06-11" },
        { key: "record:missing:2024-06-11" },
      ),
    ]);

    expect(
      queryClient.getQueryData<{ records: ActivityRecord[] }>(
        activityRecordsQueryKey("2024-06"),
      )?.records,
    ).toHaveLength(1);
  });

  it("applies newer record-delete from pending storage", () => {
    queryClient.setQueryData(activityRecordsQueryKey("2024-06"), {
      month: "2024-06",
      records: [
        buildRecord({ updatedAt: "2024-06-01T12:00:00.000Z" }),
      ],
    });

    const adapter = createActivityOfflineSyncAdapter(queryClient);
    adapter.merge([
      buildWrite(
        {
          operation: "record-delete",
          savedAt: "2024-06-09T12:00:00.000Z",
          kind: null,
          activityId: null,
          values: null,
          taskId: "activity-1",
          date: "2024-06-10",
          count: null,
          duration: null,
          description: null,
          trackingMode: null,
          goal: null,
          goalDuration: null,
        },
        { key: "record:activity-1:2024-06-10" },
      ),
    ]);

    expect(
      queryClient.getQueryData<{ records: ActivityRecord[] }>(
        activityRecordsQueryKey("2024-06"),
      )?.records,
    ).toEqual([]);
  });
});
