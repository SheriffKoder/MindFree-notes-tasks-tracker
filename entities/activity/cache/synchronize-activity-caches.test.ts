/**
 * @file entities/activity/cache/synchronize-activity-caches.test.ts
 * QueryClient-seeded assertions for the activity cache sync hub.
 */

import { QueryClient } from "@tanstack/react-query";
import { beforeEach, describe, expect, it } from "vitest";

import { synchronizeActivityCaches } from "@/entities/activity/cache/synchronize-activity-caches";
import {
  activitiesQueryKey,
  activityRecordsQueryKey,
} from "@/entities/activity/client/query-keys";
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
    startsAt: null,
    endsAt: null,
    archivedAt: null,
    createdAt: "2024-06-01T12:00:00.000Z",
    updatedAt: "2024-06-01T12:00:00.000Z",
    ...overrides,
  };
}

function buildRecord(
  overrides: Partial<ActivityRecord> = {},
): ActivityRecord {
  return {
    id: "record-1",
    taskId: "activity-1",
    date: "2024-06-10",
    count: 1,
    duration: 0,
    description: null,
    createdAt: "2024-06-10T12:00:00.000Z",
    updatedAt: "2024-06-10T12:00:00.000Z",
    ...overrides,
  };
}

describe("synchronizeActivityCaches", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
  });

  it("appends a created activity to the kind cache", () => {
    const activity = buildActivity();

    queryClient.setQueryData(activitiesQueryKey("task"), {
      activities: [],
    });

    synchronizeActivityCaches(queryClient, { type: "create", activity });

    const cached = queryClient.getQueryData<{ activities: Activity[] }>(
      activitiesQueryKey("task"),
    );

    expect(cached?.activities).toHaveLength(1);
    expect(cached?.activities[0]?.id).toBe("activity-1");
  });

  it("patches an existing activity in place on update", () => {
    const previous = buildActivity();
    const next = buildActivity({
      title: "Updated",
      updatedAt: "2024-06-02T12:00:00.000Z",
    });

    queryClient.setQueryData(activitiesQueryKey("task"), {
      activities: [previous],
    });

    synchronizeActivityCaches(queryClient, { type: "update", activity: next });

    const cached = queryClient.getQueryData<{ activities: Activity[] }>(
      activitiesQueryKey("task"),
    );

    expect(cached?.activities).toHaveLength(1);
    expect(cached?.activities[0]?.title).toBe("Updated");
  });

  it("upserts archivedAt on archive and restore", () => {
    const active = buildActivity();
    const archived = buildActivity({
      archivedAt: "2024-06-03T12:00:00.000Z",
      updatedAt: "2024-06-03T12:00:00.000Z",
    });

    queryClient.setQueryData(activitiesQueryKey("task"), {
      activities: [active],
    });

    synchronizeActivityCaches(queryClient, {
      type: "archive",
      activity: archived,
    });

    let cached = queryClient.getQueryData<{ activities: Activity[] }>(
      activitiesQueryKey("task"),
    );
    expect(cached?.activities[0]?.archivedAt).toBe("2024-06-03T12:00:00.000Z");

    const restored = buildActivity({
      archivedAt: null,
      updatedAt: "2024-06-04T12:00:00.000Z",
    });

    synchronizeActivityCaches(queryClient, {
      type: "restore",
      activity: restored,
    });

    cached = queryClient.getQueryData<{ activities: Activity[] }>(
      activitiesQueryKey("task"),
    );
    expect(cached?.activities[0]?.archivedAt).toBeNull();
  });

  it("removes the definition and purges records from every month bucket on delete", () => {
    const activity = buildActivity();
    const juneOwn = buildRecord({ id: "r-june-own", date: "2024-06-10" });
    const juneOther = buildRecord({
      id: "r-june-other",
      taskId: "activity-2",
      date: "2024-06-11",
    });
    const julyOwn = buildRecord({
      id: "r-july-own",
      date: "2024-07-01",
    });

    queryClient.setQueryData(activitiesQueryKey("task"), {
      activities: [activity, buildActivity({ id: "activity-2" })],
    });
    queryClient.setQueryData(activityRecordsQueryKey("2024-06"), {
      month: "2024-06",
      records: [juneOwn, juneOther],
    });
    queryClient.setQueryData(activityRecordsQueryKey("2024-07"), {
      month: "2024-07",
      records: [julyOwn],
    });

    synchronizeActivityCaches(queryClient, { type: "delete", activity });

    const definitions = queryClient.getQueryData<{ activities: Activity[] }>(
      activitiesQueryKey("task"),
    );
    expect(definitions?.activities).toHaveLength(1);
    expect(definitions?.activities[0]?.id).toBe("activity-2");

    const june = queryClient.getQueryData<{ records: ActivityRecord[] }>(
      activityRecordsQueryKey("2024-06"),
    );
    expect(june?.records).toHaveLength(1);
    expect(june?.records[0]?.taskId).toBe("activity-2");

    const july = queryClient.getQueryData<{ records: ActivityRecord[] }>(
      activityRecordsQueryKey("2024-07"),
    );
    expect(july?.records).toHaveLength(0);
  });

  it("upserts a record into its month bucket by (taskId, date)", () => {
    const existing = buildRecord({ id: "record-1", count: 1 });

    queryClient.setQueryData(activityRecordsQueryKey("2024-06"), {
      month: "2024-06",
      records: [existing],
    });

    const updated = buildRecord({ id: "record-server", count: 3 });

    synchronizeActivityCaches(queryClient, {
      type: "record-upsert",
      record: updated,
    });

    const june = queryClient.getQueryData<{ records: ActivityRecord[] }>(
      activityRecordsQueryKey("2024-06"),
    );

    expect(june?.records).toHaveLength(1);
    expect(june?.records[0]?.count).toBe(3);
    expect(june?.records[0]?.id).toBe("record-server");
  });

  it("appends a record when its (taskId, date) is not yet cached", () => {
    queryClient.setQueryData(activityRecordsQueryKey("2024-06"), {
      month: "2024-06",
      records: [],
    });

    const record = buildRecord({ date: "2024-06-15" });

    synchronizeActivityCaches(queryClient, {
      type: "record-upsert",
      record,
    });

    const june = queryClient.getQueryData<{ records: ActivityRecord[] }>(
      activityRecordsQueryKey("2024-06"),
    );

    expect(june?.records).toHaveLength(1);
    expect(june?.records[0]?.date).toBe("2024-06-15");
  });

  it("removes a record from its month bucket on record-delete", () => {
    const target = buildRecord({ id: "r-target", date: "2024-06-10" });
    const keep = buildRecord({
      id: "r-keep",
      taskId: "activity-2",
      date: "2024-06-10",
    });

    queryClient.setQueryData(activityRecordsQueryKey("2024-06"), {
      month: "2024-06",
      records: [target, keep],
    });

    synchronizeActivityCaches(queryClient, {
      type: "record-delete",
      record: target,
    });

    const june = queryClient.getQueryData<{ records: ActivityRecord[] }>(
      activityRecordsQueryKey("2024-06"),
    );

    expect(june?.records).toHaveLength(1);
    expect(june?.records[0]?.id).toBe("r-keep");
  });

  it("leaves an unseeded month bucket untouched on record write", () => {
    synchronizeActivityCaches(queryClient, {
      type: "record-upsert",
      record: buildRecord({ date: "2024-09-01" }),
    });

    const september = queryClient.getQueryData(
      activityRecordsQueryKey("2024-09"),
    );

    expect(september).toBeUndefined();
  });

  it("does not touch a different kind cache", () => {
    const task = buildActivity({ kind: "task" });
    const reminder = buildActivity({
      id: "reminder-1",
      kind: "reminder",
      title: "Reminder",
    });

    queryClient.setQueryData(activitiesQueryKey("task"), {
      activities: [],
    });
    queryClient.setQueryData(activitiesQueryKey("reminder"), {
      activities: [reminder],
    });

    synchronizeActivityCaches(queryClient, { type: "create", activity: task });

    const tasks = queryClient.getQueryData<{ activities: Activity[] }>(
      activitiesQueryKey("task"),
    );
    const reminders = queryClient.getQueryData<{ activities: Activity[] }>(
      activitiesQueryKey("reminder"),
    );

    expect(tasks?.activities).toHaveLength(1);
    expect(reminders?.activities).toHaveLength(1);
    expect(reminders?.activities[0]?.id).toBe("reminder-1");
  });
});
