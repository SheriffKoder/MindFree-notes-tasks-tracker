/**
 * @file entities/activity/hydration/seed-activity-caches.test.ts
 * Locks SSR seeders writing the correct kind / month cache keys.
 */

import { QueryClient } from "@tanstack/react-query";
import { beforeEach, describe, expect, it } from "vitest";

import {
  activitiesQueryKey,
  activityRecordsQueryKey,
} from "@/entities/activity/client/query-keys";
import {
  seedActivityCaches,
  seedHomeActivityCaches,
} from "@/entities/activity/hydration/seed-activity-caches";
import type {
  ActivitiesResponse,
  ActivityPageData,
  ActivityRecordsResponse,
  HomeActivityData,
} from "@/entities/activity/model/read-models";
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
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function buildRecord(overrides: Partial<ActivityRecord> = {}): ActivityRecord {
  return {
    id: "record-1",
    taskId: "activity-1",
    date: "2026-07-15",
    trackingModeSnapshot: "boolean",
    goalSnapshot: null,
    goalDurationSnapshot: null,
    count: 1,
    duration: 0,
    description: null,
    createdAt: "2026-07-15T00:00:00.000Z",
    updatedAt: "2026-07-15T00:00:00.000Z",
    ...overrides,
  };
}

describe("seedActivityCaches", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
  });

  it("seeds one kind's definitions and the shared month records key", () => {
    const activities: ActivitiesResponse = {
      activities: [buildActivity({ id: "reminder-1", kind: "reminder" })],
    };
    const records: ActivityRecordsResponse = {
      month: "2026-07",
      records: [buildRecord({ taskId: "reminder-1" })],
    };
    const data: ActivityPageData = {
      kind: "reminder",
      month: "2026-07",
      activities,
      records,
    };

    seedActivityCaches(queryClient, data);

    expect(queryClient.getQueryData(activitiesQueryKey("reminder"))).toBe(
      activities,
    );
    expect(queryClient.getQueryData(activityRecordsQueryKey("2026-07"))).toBe(
      records,
    );
    expect(queryClient.getQueryData(activitiesQueryKey("task"))).toBeUndefined();
  });
});

describe("seedHomeActivityCaches", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
  });

  it("seeds both definition kinds and a single shared records month", () => {
    const tasks: ActivitiesResponse = {
      activities: [buildActivity({ id: "task-1", kind: "task" })],
    };
    const reminders: ActivitiesResponse = {
      activities: [
        buildActivity({
          id: "reminder-1",
          kind: "reminder",
          trackingMode: "boolean",
          color: null,
          goal: null,
          goalDuration: null,
        }),
      ],
    };
    const records: ActivityRecordsResponse = {
      month: "2026-07",
      records: [
        buildRecord({ taskId: "task-1" }),
        buildRecord({ id: "record-2", taskId: "reminder-1" }),
      ],
    };
    const data: HomeActivityData = {
      month: "2026-07",
      tasks,
      reminders,
      records,
    };

    seedHomeActivityCaches(queryClient, data);

    expect(queryClient.getQueryData(activitiesQueryKey("task"))).toBe(tasks);
    expect(queryClient.getQueryData(activitiesQueryKey("reminder"))).toBe(
      reminders,
    );
    expect(queryClient.getQueryData(activityRecordsQueryKey("2026-07"))).toBe(
      records,
    );
  });
});
