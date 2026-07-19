/**
 * @file entities/activity/hooks/record/build-optimistic-activity-record.test.ts
 * Locks card-owned snapshot submission for optimistic record writes.
 */

import { describe, expect, it } from "vitest";

import { buildOptimisticActivityRecord } from "@/entities/activity/hooks/record/build-optimistic-activity-record";
import type { ActivityRecord } from "@/entities/activity/model/types";

function buildExisting(
  overrides: Partial<ActivityRecord> = {},
): ActivityRecord {
  return {
    id: "record-1",
    taskId: "task-1",
    date: "2026-07-15",
    trackingModeSnapshot: "count",
    goalSnapshot: 4,
    goalDurationSnapshot: null,
    count: 1,
    duration: 0,
    description: "note",
    createdAt: "2026-07-15T08:00:00.000Z",
    updatedAt: "2026-07-15T08:00:00.000Z",
    ...overrides,
  };
}

describe("buildOptimisticActivityRecord", () => {
  it("seeds snapshots from the current activity when creating a record", () => {
    const record = buildOptimisticActivityRecord(
      {
        taskId: "task-1",
        date: "2026-07-15",
        count: 2,
        duration: 10,
        trackingMode: "count+duration",
        goal: 5,
        goalDuration: 30,
      },
      undefined,
    );

    expect(record).toMatchObject({
      taskId: "task-1",
      date: "2026-07-15",
      trackingModeSnapshot: "count+duration",
      goalSnapshot: 5,
      goalDurationSnapshot: 30,
      count: 2,
      duration: 10,
    });
    expect(record.id).toMatch(/^optimistic-/);
  });

  it("applies submitted goal edits on later natural-key upserts", () => {
    const existing = buildExisting();
    const record = buildOptimisticActivityRecord(
      {
        taskId: "task-1",
        date: "2026-07-15",
        count: 3,
        duration: 0,
        description: "updated",
        trackingMode: "duration",
        goal: null,
        goalDuration: 90,
      },
      existing,
    );

    expect(record).toMatchObject({
      id: "record-1",
      trackingModeSnapshot: "duration",
      goalSnapshot: null,
      goalDurationSnapshot: 90,
      count: 3,
      duration: 0,
      description: "updated",
      createdAt: "2026-07-15T08:00:00.000Z",
    });
  });

  it("captures new task configuration after delete then recreate", () => {
    const recreated = buildOptimisticActivityRecord(
      {
        taskId: "task-1",
        date: "2026-07-15",
        count: 0,
        duration: 15,
        trackingMode: "duration",
        goal: null,
        goalDuration: 45,
      },
      undefined,
    );

    expect(recreated).toMatchObject({
      trackingModeSnapshot: "duration",
      goalSnapshot: null,
      goalDurationSnapshot: 45,
      count: 0,
      duration: 15,
    });
    expect(recreated.id).toMatch(/^optimistic-/);
  });
});
