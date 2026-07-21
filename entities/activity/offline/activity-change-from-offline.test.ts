/**
 * @file entities/activity/offline/activity-change-from-offline.test.ts
 * Locks flush → ActivityChange mapping and optimistic create reconcile.
 */

import { QueryClient } from "@tanstack/react-query";
import { beforeEach, describe, expect, it } from "vitest";

import {
  activitiesQueryKey,
  activityRecordsQueryKey,
} from "@/entities/activity/client/query-keys";
import { pinnedDraftActivityId } from "@/entities/activity/hooks/build-optimistic-activity";
import {
  activityChangeFromOfflineFlush,
  reconcileOptimisticCreateInCache,
} from "@/entities/activity/offline/activity-change-from-offline";
import type { ActivityOfflinePayload } from "@/entities/activity/offline/activity-offline-storage";
import type { Activity, ActivityRecord } from "@/entities/activity/model/types";

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

function buildPayload(
  overrides: Partial<ActivityOfflinePayload> = {},
): ActivityOfflinePayload {
  return {
    operation: "patch",
    savedAt: "2024-06-02T12:00:00.000Z",
    kind: "task",
    activityId: "activity-1",
    values: null,
    taskId: null,
    date: null,
    count: null,
    duration: null,
    description: null,
    trackingMode: null,
    goal: null,
    goalDuration: null,
    ...overrides,
  };
}

const emptyFlushOptions = {
  previousActivity: null as Activity | null,
  previousRecord: null as ActivityRecord | null,
  serverActivity: null as Activity | null,
  serverRecord: null as ActivityRecord | null,
};

describe("activityChangeFromOfflineFlush", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
  });

  it("maps a successful patch flush to update", () => {
    const previous = buildActivity();
    const serverActivity = buildActivity({
      title: "Updated offline",
      updatedAt: "2024-06-03T12:00:00.000Z",
    });

    const change = activityChangeFromOfflineFlush(
      queryClient,
      buildPayload({ operation: "patch" }),
      {
        ...emptyFlushOptions,
        previousActivity: previous,
        serverActivity,
      },
    );

    expect(change).toEqual({ type: "update", activity: serverActivity });
  });

  it("maps archive and restore flushes to matching hub types", () => {
    const archived = buildActivity({
      archivedAt: "2024-06-03T12:00:00.000Z",
      updatedAt: "2024-06-03T12:00:00.000Z",
    });
    const restored = buildActivity({
      archivedAt: null,
      updatedAt: "2024-06-04T12:00:00.000Z",
    });

    expect(
      activityChangeFromOfflineFlush(
        queryClient,
        buildPayload({ operation: "archive" }),
        { ...emptyFlushOptions, serverActivity: archived },
      ),
    ).toEqual({ type: "archive", activity: archived });

    expect(
      activityChangeFromOfflineFlush(
        queryClient,
        buildPayload({ operation: "restore" }),
        { ...emptyFlushOptions, serverActivity: restored },
      ),
    ).toEqual({ type: "restore", activity: restored });
  });

  it("maps a create flush without previous to create", () => {
    const serverActivity = buildActivity({ id: "server-1" });

    const change = activityChangeFromOfflineFlush(
      queryClient,
      buildPayload({
        operation: "create",
        activityId: pinnedDraftActivityId("task"),
        values: null,
      }),
      { ...emptyFlushOptions, serverActivity },
    );

    expect(change).toEqual({ type: "create", activity: serverActivity });
  });

  it("reconciles optimistic create id swap in cache and returns null", () => {
    const draftId = pinnedDraftActivityId("task");
    const previous = buildActivity({ id: draftId, title: "Draft" });
    const serverActivity = buildActivity({
      id: "server-1",
      title: "Draft",
      updatedAt: "2024-06-03T12:00:00.000Z",
    });

    queryClient.setQueryData(activitiesQueryKey("task"), {
      activities: [previous],
    });
    queryClient.setQueryData(activityRecordsQueryKey("2024-06"), {
      month: "2024-06",
      records: [
        buildRecord({
          id: "rec-opt",
          taskId: draftId,
          date: "2024-06-10",
        }),
      ],
    });

    const change = activityChangeFromOfflineFlush(
      queryClient,
      buildPayload({
        operation: "create",
        activityId: draftId,
      }),
      {
        ...emptyFlushOptions,
        previousActivity: previous,
        serverActivity,
      },
    );

    expect(change).toBeNull();

    const definitions = queryClient.getQueryData<{ activities: Activity[] }>(
      activitiesQueryKey("task"),
    );
    expect(definitions?.activities).toEqual([serverActivity]);
    expect(definitions?.activities.some((row) => row.id === draftId)).toBe(
      false,
    );

    const records = queryClient.getQueryData<{ records: ActivityRecord[] }>(
      activityRecordsQueryKey("2024-06"),
    );
    expect(records?.records).toEqual([
      expect.objectContaining({
        id: "rec-opt",
        taskId: "server-1",
        date: "2024-06-10",
      }),
    ]);
  });

  it("maps delete from previous, or probes cache when previous is null", () => {
    const previous = buildActivity({ id: "to-delete" });

    expect(
      activityChangeFromOfflineFlush(
        queryClient,
        buildPayload({ operation: "delete", activityId: "to-delete" }),
        { ...emptyFlushOptions, previousActivity: previous },
      ),
    ).toEqual({ type: "delete", activity: previous });

    queryClient.setQueryData(activitiesQueryKey("task"), {
      activities: [previous],
    });

    expect(
      activityChangeFromOfflineFlush(
        queryClient,
        buildPayload({ operation: "delete", activityId: "to-delete" }),
        emptyFlushOptions,
      ),
    ).toEqual({ type: "delete", activity: previous });
  });

  it("returns null for delete when the row is not in cache", () => {
    const change = activityChangeFromOfflineFlush(
      queryClient,
      buildPayload({ operation: "delete", activityId: "missing" }),
      emptyFlushOptions,
    );

    expect(change).toBeNull();
  });

  it("maps record-upsert and record-delete flushes", () => {
    const serverRecord = buildRecord({ count: 3 });
    const previousRecord = buildRecord({ count: 1 });

    expect(
      activityChangeFromOfflineFlush(
        queryClient,
        buildPayload({
          operation: "record-upsert",
          kind: null,
          activityId: null,
          taskId: "activity-1",
          date: "2024-06-10",
          count: 3,
          duration: 0,
          trackingMode: "boolean",
        }),
        { ...emptyFlushOptions, serverRecord },
      ),
    ).toEqual({ type: "record-upsert", record: serverRecord });

    expect(
      activityChangeFromOfflineFlush(
        queryClient,
        buildPayload({
          operation: "record-delete",
          kind: null,
          activityId: null,
          taskId: "activity-1",
          date: "2024-06-10",
        }),
        { ...emptyFlushOptions, previousRecord },
      ),
    ).toEqual({ type: "record-delete", record: previousRecord });
  });

  it("probes warm month cache for record-delete when previous is null", () => {
    const cached = buildRecord();

    queryClient.setQueryData(activityRecordsQueryKey("2024-06"), {
      month: "2024-06",
      records: [cached],
    });

    const change = activityChangeFromOfflineFlush(
      queryClient,
      buildPayload({
        operation: "record-delete",
        kind: null,
        activityId: null,
        taskId: "activity-1",
        date: "2024-06-10",
      }),
      emptyFlushOptions,
    );

    expect(change).toEqual({ type: "record-delete", record: cached });
  });
});

describe("reconcileOptimisticCreateInCache", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
  });

  it("swaps definition id without leaving the optimistic row", () => {
    const optimistic = buildActivity({ id: "optimistic-task-draft" });
    const server = buildActivity({ id: "server-99" });

    queryClient.setQueryData(activitiesQueryKey("task"), {
      activities: [optimistic],
    });

    reconcileOptimisticCreateInCache(queryClient, optimistic, server);

    expect(
      queryClient.getQueryData<{ activities: Activity[] }>(
        activitiesQueryKey("task"),
      )?.activities,
    ).toEqual([server]);
  });
});
