/**
 * @file entities/activity/lib/record/resolve-record-configuration.test.ts
 * Locks snapshot-vs-current configuration fallback for one activity-day.
 */

import { describe, expect, it } from "vitest";

import { resolveRecordConfiguration } from "@/entities/activity/lib/record/resolve-record-configuration";
import type {
  Activity,
  ActivityRecord,
} from "@/entities/activity/model/types";

function buildActivity(
  overrides: Partial<
    Pick<Activity, "trackingMode" | "goal" | "goalDuration">
  > = {},
): Pick<Activity, "trackingMode" | "goal" | "goalDuration"> {
  return {
    trackingMode: "count",
    goal: 5,
    goalDuration: null,
    ...overrides,
  };
}

function buildRecord(
  overrides: Partial<ActivityRecord> = {},
): ActivityRecord {
  return {
    id: "record-1",
    taskId: "task-1",
    date: "2026-07-15",
    trackingModeSnapshot: "count",
    goalSnapshot: 5,
    goalDurationSnapshot: null,
    count: 1,
    duration: 0,
    description: null,
    createdAt: "2026-07-15T00:00:00.000Z",
    updatedAt: "2026-07-15T00:00:00.000Z",
    ...overrides,
  };
}

describe("resolveRecordConfiguration", () => {
  it("returns the activity's current configuration when there is no record", () => {
    const activity = buildActivity({
      trackingMode: "count+duration",
      goal: 4,
      goalDuration: 60,
    });

    expect(resolveRecordConfiguration(activity, null)).toEqual({
      trackingMode: "count+duration",
      goal: 4,
      goalDuration: 60,
    });
  });

  it("returns the record snapshots when a record exists", () => {
    const activity = buildActivity({
      trackingMode: "duration",
      goal: null,
      goalDuration: 90,
    });
    const record = buildRecord({
      trackingModeSnapshot: "count",
      goalSnapshot: 3,
      goalDurationSnapshot: null,
    });

    expect(resolveRecordConfiguration(activity, record)).toEqual({
      trackingMode: "count",
      goal: 3,
      goalDuration: null,
    });
  });

  it("prefers snapshots even when they diverge from the current activity", () => {
    const activity = buildActivity({
      trackingMode: "count+duration",
      goal: 10,
      goalDuration: 120,
    });
    const record = buildRecord({
      trackingModeSnapshot: "duration",
      goalSnapshot: null,
      goalDurationSnapshot: 30,
    });

    expect(resolveRecordConfiguration(activity, record)).toEqual({
      trackingMode: "duration",
      goal: null,
      goalDuration: 30,
    });
  });
});
