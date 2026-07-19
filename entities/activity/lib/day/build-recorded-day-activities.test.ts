/**
 * @file entities/activity/lib/day/build-recorded-day-activities.test.ts
 * Locks the selected-day records join: records only, archived included,
 * schedule ignored, definition order preserved.
 */

import { describe, expect, it } from "vitest";

import { buildRecordedDayActivities } from "@/entities/activity/lib/day/build-recorded-day-activities";
import { buildRecordLookup } from "@/entities/activity/lib/record/build-record-lookup";
import type {
  Activity,
  ActivityRecord,
} from "@/entities/activity/model/types";

const DAY = "2026-07-15";

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
    date: DAY,
    trackingModeSnapshot: "boolean",
    goalSnapshot: null,
    goalDurationSnapshot: null,
    count: 1,
    duration: 0,
    description: null,
    createdAt: `${DAY}T00:00:00.000Z`,
    updatedAt: `${DAY}T00:00:00.000Z`,
    ...overrides,
  };
}

describe("buildRecordedDayActivities", () => {
  it("returns only activities with a record for the day", () => {
    const recorded = buildActivity({ id: "recorded" });
    const scheduledOnly = buildActivity({ id: "scheduled" });

    const day = buildRecordedDayActivities(
      [recorded, scheduledOnly],
      buildRecordLookup([buildRecord({ taskId: "recorded" })]),
      DAY,
    );

    expect(day).toHaveLength(1);
    expect(day[0]?.activity.id).toBe("recorded");
    expect(day[0]?.record?.taskId).toBe("recorded");
  });

  it("ignores schedule membership for empty slots", () => {
    const daily = buildActivity({ scheduleType: "daily" });

    const day = buildRecordedDayActivities(
      [daily],
      buildRecordLookup([]),
      DAY,
    );

    expect(day).toEqual([]);
  });

  it("includes archived activities that still have a record", () => {
    const archived = buildActivity({
      id: "archived",
      archivedAt: "2026-07-01T00:00:00.000Z",
    });

    const day = buildRecordedDayActivities(
      [archived],
      buildRecordLookup([
        buildRecord({ id: "r-archived", taskId: "archived" }),
      ]),
      DAY,
    );

    expect(day).toHaveLength(1);
    expect(day[0]?.activity.id).toBe("archived");
  });

  it("preserves activity definition order", () => {
    const first = buildActivity({ id: "first", title: "First" });
    const second = buildActivity({ id: "second", title: "Second" });

    const day = buildRecordedDayActivities(
      [first, second],
      buildRecordLookup([
        buildRecord({ id: "r2", taskId: "second" }),
        buildRecord({ id: "r1", taskId: "first" }),
      ]),
      DAY,
    );

    expect(day.map((row) => row.activity.id)).toEqual(["first", "second"]);
  });

  it("uses record snapshots for progress when they diverge from the task", () => {
    const activity = buildActivity({
      trackingMode: "count",
      goal: 10,
    });
    const record = buildRecord({
      trackingModeSnapshot: "count",
      goalSnapshot: 2,
      count: 2,
    });

    const day = buildRecordedDayActivities(
      [activity],
      buildRecordLookup([record]),
      DAY,
    );

    expect(day[0]?.done).toBe(true);
    expect(day[0]?.progress.dimensions[0]).toMatchObject({
      value: 2,
      goal: 2,
      percent: 100,
    });
  });
});
