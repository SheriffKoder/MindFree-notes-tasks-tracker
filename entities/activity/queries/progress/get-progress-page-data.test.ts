/**
 * @file entities/activity/queries/progress/get-progress-page-data.test.ts
 * Unit tests for the Progress server read use-case wiring.
 *
 * Purpose: Mock repository reads and verify `getProgressPageData` fetches in
 *          parallel, filters reminder rows, and delegates to `buildProgressPageData`.
 * Used in: Vitest (Step 4 verification).
 * Used for: Regression guard on `get-progress-page-data.ts`.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Activity, ActivityRecord } from "@/entities/activity/model/types";

const getActivities = vi.fn();
const getRecordsForMonth = vi.fn();
const getAllTimeTaskRecordValues = vi.fn();

vi.mock("@/entities/activity/repository", () => ({
  getActivities: (...args: unknown[]) => getActivities(...args),
  getRecordsForMonth: (...args: unknown[]) => getRecordsForMonth(...args),
  getAllTimeTaskRecordValues: (...args: unknown[]) =>
    getAllTimeTaskRecordValues(...args),
}));

import { getProgressPageData } from "@/entities/activity/queries/progress/get-progress-page-data";

const USER_ID = "user-1";
const MONTH = "2026-06";
const TODAY = "2026-07-15";

function buildActivity(overrides: Partial<Activity> = {}): Activity {
  return {
    id: "task-1",
    kind: "task",
    title: "Task",
    description: null,
    color: null,
    trackingMode: "count",
    scheduleType: "daily",
    scheduleConfig: null,
    goal: 5,
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
    date: "2026-06-02",
    trackingModeSnapshot: "count",
    goalSnapshot: 5,
    goalDurationSnapshot: null,
    count: 3,
    duration: 0,
    description: null,
    createdAt: "2026-06-02T00:00:00.000Z",
    updatedAt: "2026-06-02T00:00:00.000Z",
    ...overrides,
  };
}

describe("getProgressPageData", () => {
  beforeEach(() => {
    getActivities.mockReset();
    getRecordsForMonth.mockReset();
    getAllTimeTaskRecordValues.mockReset();
  });

  it("returns an empty task list without fetching all-time values", async () => {
    getActivities.mockResolvedValue([]);
    getRecordsForMonth.mockResolvedValue([
      buildRecord({ taskId: "orphan", count: 9 }),
    ]);

    const page = await getProgressPageData(USER_ID, MONTH, TODAY);

    expect(page).toEqual({ month: MONTH, tasks: [] });
    expect(getAllTimeTaskRecordValues).not.toHaveBeenCalled();
  });

  it("filters reminder month records before derivation", async () => {
    const task = buildActivity({ id: "task-1" });

    getActivities.mockResolvedValue([task]);
    getRecordsForMonth.mockResolvedValue([
      buildRecord({
        id: "task-record",
        taskId: "task-1",
        count: 2,
        goalSnapshot: 5,
      }),
      buildRecord({
        id: "reminder-record",
        taskId: "reminder-1",
        count: 99,
        goalSnapshot: 1,
      }),
    ]);
    getAllTimeTaskRecordValues.mockResolvedValue([
      {
        taskId: "task-1",
        trackingModeSnapshot: "count",
        count: 2,
        duration: 0,
      },
    ]);

    const page = await getProgressPageData(USER_ID, MONTH, TODAY);

    expect(getActivities).toHaveBeenCalledWith(USER_ID, "task");
    expect(getAllTimeTaskRecordValues).toHaveBeenCalledWith(USER_ID, [
      "task-1",
    ]);
    expect(page.tasks).toHaveLength(1);
    expect(page.tasks[0].month.metrics[0]).toMatchObject({
      totalActual: 2,
      targetedActual: 2,
      goal: 5,
    });
  });

  it("fetches definitions and month records in parallel before all-time", async () => {
    const order: string[] = [];

    getActivities.mockImplementation(async () => {
      order.push("activities");
      return [buildActivity()];
    });
    getRecordsForMonth.mockImplementation(async () => {
      order.push("records");
      return [buildRecord()];
    });
    getAllTimeTaskRecordValues.mockImplementation(async () => {
      order.push("all-time");
      return [];
    });

    await getProgressPageData(USER_ID, MONTH, TODAY);

    expect(order.slice(0, 2).sort()).toEqual(["activities", "records"]);
    expect(order[2]).toBe("all-time");
  });
});
