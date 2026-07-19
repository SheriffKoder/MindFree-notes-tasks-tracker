/**
 * @file entities/activity/lib/compute-task-month-progress.test.ts
 * Locks month progress: scheduled-day denominator via `isActiveOnDay`,
 * meaningful-record numerator, whole-number percent, and zero when unscheduled.
 */

import { describe, expect, it } from "vitest";

import { buildRecordLookup } from "@/entities/activity/lib/record/build-record-lookup";
import { computeTaskMonthProgress } from "@/entities/activity/transform/compute-task-month-progress";
import type {
  Activity,
  ActivityRecord,
} from "@/entities/activity/model/types";

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

describe("computeTaskMonthProgress", () => {
  it("returns 0% when a task has no scheduled days in the month", () => {
    const activity = buildActivity({
      scheduleType: "once",
      scheduleConfig: "2026-08-01",
    });

    const progress = computeTaskMonthProgress(
      "2026-07",
      [activity],
      buildRecordLookup([]),
    );

    expect(progress.get("task-1")).toBe(0);
  });

  it("counts only meaningful records on scheduled days", () => {
    const activity = buildActivity({
      id: "task-1",
      scheduleType: "once",
      scheduleConfig: "2026-07-10",
    });
    const lookup = buildRecordLookup([
      buildRecord({ taskId: "task-1", date: "2026-07-10", count: 1 }),
    ]);

    const progress = computeTaskMonthProgress("2026-07", [activity], lookup);

    expect(progress.get("task-1")).toBe(100);
  });

  it("rounds completed / scheduled days to a whole percent", () => {
    const activity = buildActivity({ id: "task-1", scheduleType: "daily" });
    const records = ["2026-07-01", "2026-07-02", "2026-07-03"].map(
      (date, index) =>
        buildRecord({
          id: `record-${index}`,
          taskId: "task-1",
          date,
          count: 1,
        }),
    );

    const progress = computeTaskMonthProgress(
      "2026-07",
      [activity],
      buildRecordLookup(records),
    );

    expect(progress.get("task-1")).toBe(10);
  });

  it("ignores records on days the task is not active", () => {
    const activity = buildActivity({
      id: "task-1",
      scheduleType: "once",
      scheduleConfig: "2026-07-10",
    });
    const lookup = buildRecordLookup([
      buildRecord({ taskId: "task-1", date: "2026-07-11", count: 1 }),
    ]);

    const progress = computeTaskMonthProgress("2026-07", [activity], lookup);

    expect(progress.get("task-1")).toBe(0);
  });

  it("computes one entry per activity", () => {
    const daily = buildActivity({ id: "daily" });
    const once = buildActivity({
      id: "once",
      scheduleType: "once",
      scheduleConfig: "2026-07-20",
    });

    const progress = computeTaskMonthProgress(
      "2026-07",
      [daily, once],
      buildRecordLookup([
        buildRecord({ taskId: "once", date: "2026-07-20", count: 1 }),
      ]),
    );

    expect(progress.get("daily")).toBe(0);
    expect(progress.get("once")).toBe(100);
    expect(progress.size).toBe(2);
  });

  it("interprets each record with its own tracking-mode snapshot", () => {
    const activity = buildActivity({
      id: "task-1",
      trackingMode: "duration",
      goalDuration: 30,
      scheduleType: "once",
      scheduleConfig: "2026-07-10",
    });
    const lookup = buildRecordLookup([
      buildRecord({
        taskId: "task-1",
        date: "2026-07-10",
        trackingModeSnapshot: "count",
        goalSnapshot: 5,
        count: 1,
        duration: 0,
      }),
    ]);

    expect(computeTaskMonthProgress("2026-07", [activity], lookup).get("task-1")).toBe(
      100,
    );
  });
});
