/**
 * @file entities/activity/lib/today/build-today-activities.test.ts
 * Locks the Home Today join: unarchived + (scheduled today OR recorded today),
 * record pairing, derived progress, and preserved input order.
 */

import { describe, expect, it } from "vitest";

import { buildRecordLookup } from "@/entities/activity/lib/record/build-record-lookup";
import { buildTodayActivities } from "@/entities/activity/lib/today/build-today-activities";
import type {
  Activity,
  ActivityRecord,
} from "@/entities/activity/model/types";

const TODAY = "2026-07-15"; // a Wednesday

function buildActivity(overrides: Partial<Activity> = {}): Activity {
  return {
    id: "task-1",
    kind: "task",
    title: "Task",
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
    taskId: "task-1",
    date: TODAY,
    trackingModeSnapshot: "boolean",
    goalSnapshot: null,
    goalDurationSnapshot: null,
    count: 1,
    duration: 0,
    description: null,
    createdAt: `${TODAY}T00:00:00.000Z`,
    updatedAt: `${TODAY}T00:00:00.000Z`,
    ...overrides,
  };
}

describe("buildTodayActivities", () => {
  it("includes activities scheduled today, paired with null when unrecorded", () => {
    const daily = buildActivity({ id: "daily", scheduleType: "daily" });

    const today = buildTodayActivities([daily], buildRecordLookup([]), TODAY);

    expect(today).toHaveLength(1);
    expect(today[0]).toMatchObject({ activity: daily, record: null, done: false });
  });

  it("excludes activities not scheduled today with no record", () => {
    const monday = buildActivity({
      id: "monday",
      scheduleType: "weekly",
      scheduleConfig: ["mon"],
    });

    const today = buildTodayActivities([monday], buildRecordLookup([]), TODAY);

    expect(today).toEqual([]);
  });

  it("excludes archived activities even when scheduled today", () => {
    const archived = buildActivity({
      id: "archived",
      archivedAt: "2026-07-01T00:00:00.000Z",
    });

    const today = buildTodayActivities([archived], buildRecordLookup([]), TODAY);

    expect(today).toEqual([]);
  });

  it("keeps a recorded activity today even when the schedule no longer matches", () => {
    const monday = buildActivity({
      id: "task-1",
      scheduleType: "weekly",
      scheduleConfig: ["mon"],
    });
    const record = buildRecord({ taskId: "task-1", date: TODAY });

    const today = buildTodayActivities(
      [monday],
      buildRecordLookup([record]),
      TODAY,
    );

    expect(today).toHaveLength(1);
    expect(today[0]).toMatchObject({ activity: monday, record });
  });

  it("pairs today's record and derives progress", () => {
    const counted = buildActivity({
      id: "task-1",
      trackingMode: "count",
      goal: 5,
    });
    const record = buildRecord({
      taskId: "task-1",
      trackingModeSnapshot: "count",
      goalSnapshot: 5,
      count: 3,
    });

    const today = buildTodayActivities(
      [counted],
      buildRecordLookup([record]),
      TODAY,
    );

    expect(today[0].record).toBe(record);
    expect(today[0].progress).toMatchObject({
      done: false,
      dimensions: [
        {
          kind: "count",
          value: 3,
          goal: 5,
          remaining: 2,
          percent: 60,
        },
      ],
    });
    expect(today[0].done).toBe(false);
  });

  it("derives independent count and duration dimensions for combined mode", () => {
    const combined = buildActivity({
      id: "task-1",
      trackingMode: "count+duration",
      goal: 4,
      goalDuration: 60,
    });
    const record = buildRecord({
      taskId: "task-1",
      trackingModeSnapshot: "count+duration",
      goalSnapshot: 4,
      goalDurationSnapshot: 60,
      count: 2,
      duration: 30,
    });

    const today = buildTodayActivities(
      [combined],
      buildRecordLookup([record]),
      TODAY,
    );

    expect(today[0].progress).toEqual({
      done: false,
      dimensions: [
        {
          kind: "count",
          label: "Count",
          value: 2,
          goal: 4,
          remaining: 2,
          percent: 50,
        },
        {
          kind: "duration",
          label: "Minutes",
          value: 30,
          goal: 60,
          remaining: 30,
          percent: 50,
        },
      ],
    });
  });

  it("keeps both snapshotted goals when the activity later changes", () => {
    const combined = buildActivity({
      id: "task-1",
      trackingMode: "duration",
      goal: null,
      goalDuration: 120,
    });
    const record = buildRecord({
      taskId: "task-1",
      trackingModeSnapshot: "count+duration",
      goalSnapshot: 4,
      goalDurationSnapshot: 60,
      count: 2,
      duration: 30,
    });

    const today = buildTodayActivities(
      [combined],
      buildRecordLookup([record]),
      TODAY,
    );

    expect(today[0].progress.dimensions).toEqual([
      {
        kind: "count",
        label: "Count",
        value: 2,
        goal: 4,
        remaining: 2,
        percent: 50,
      },
      {
        kind: "duration",
        label: "Minutes",
        value: 30,
        goal: 60,
        remaining: 30,
        percent: 50,
      },
    ]);
  });

  it("ignores records for other dates when pairing", () => {
    const daily = buildActivity({ id: "task-1", scheduleType: "daily" });
    const yesterday = buildRecord({ taskId: "task-1", date: "2026-07-14" });

    const today = buildTodayActivities(
      [daily],
      buildRecordLookup([yesterday]),
      TODAY,
    );

    expect(today[0].record).toBeNull();
  });

  it("preserves input order", () => {
    const first = buildActivity({ id: "first" });
    const second = buildActivity({ id: "second" });

    const today = buildTodayActivities(
      [first, second],
      buildRecordLookup([]),
      TODAY,
    );

    expect(today.map((entry) => entry.activity.id)).toEqual(["first", "second"]);
  });

  it("treats reminder completion as record existence (boolean count)", () => {
    const reminder = buildActivity({
      id: "reminder-1",
      kind: "reminder",
      title: "Reminder",
      trackingMode: "boolean",
      color: null,
      goal: null,
      goalDuration: null,
    });
    const unchecked = buildTodayActivities(
      [reminder],
      buildRecordLookup([]),
      TODAY,
    );

    expect(unchecked).toHaveLength(1);
    expect(unchecked[0]).toMatchObject({
      activity: reminder,
      record: null,
      done: false,
    });

    const record = buildRecord({
      id: "record-reminder",
      taskId: "reminder-1",
      trackingModeSnapshot: "boolean",
      count: 1,
    });
    const checked = buildTodayActivities(
      [reminder],
      buildRecordLookup([record]),
      TODAY,
    );

    expect(checked[0]).toMatchObject({
      record,
      done: true,
      progress: {
        done: true,
        dimensions: [
          {
            kind: "count",
            label: "Count",
            value: 1,
            goal: null,
            remaining: null,
            percent: null,
          },
        ],
      },
    });
  });
});
