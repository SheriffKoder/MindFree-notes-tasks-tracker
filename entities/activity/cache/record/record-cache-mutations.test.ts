/**
 * @file entities/activity/cache/record/record-cache-mutations.test.ts
 * Locks the pure natural-key cache operations used by optimistic record writes.
 */

import { describe, expect, it } from "vitest";

import {
  recordMonthKey,
  removeRecordFromCache,
  upsertRecordInCache,
} from "@/entities/activity/cache/record";
import type { ActivityRecordsResponse } from "@/entities/activity/model/read-models";
import type { ActivityRecord } from "@/entities/activity/model/types";

function buildRecord(
  overrides: Partial<ActivityRecord> = {},
): ActivityRecord {
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
    createdAt: "2026-07-15T08:00:00.000Z",
    updatedAt: "2026-07-15T08:00:00.000Z",
    ...overrides,
  };
}

function buildMonth(records: ActivityRecord[]): ActivityRecordsResponse {
  return { month: "2026-07", records };
}

describe("activity record cache mutations", () => {
  it("replaces by (taskId, date), not row id, while preserving position", () => {
    const first = buildRecord();
    const second = buildRecord({
      id: "record-2",
      taskId: "task-2",
      date: "2026-07-16",
    });
    const current = buildMonth([first, second]);
    const serverRecord = buildRecord({
      id: "server-record",
      count: 4,
      updatedAt: "2026-07-15T09:00:00.000Z",
    });

    const next = upsertRecordInCache(current, serverRecord);

    expect(next).toEqual(buildMonth([serverRecord, second]));
    expect(current.records).toEqual([first, second]);
  });

  it("appends when the natural key is absent", () => {
    const existing = buildRecord();
    const added = buildRecord({
      id: "record-2",
      date: "2026-07-16",
    });

    expect(upsertRecordInCache(buildMonth([existing]), added)).toEqual(
      buildMonth([existing, added]),
    );
  });

  it("removes only the matching natural key", () => {
    const target = buildRecord();
    const sameTaskOtherDate = buildRecord({
      id: "record-2",
      date: "2026-07-16",
    });
    const sameDateOtherTask = buildRecord({
      id: "record-3",
      taskId: "task-2",
    });

    const next = removeRecordFromCache(
      buildMonth([target, sameTaskOtherDate, sameDateOtherTask]),
      target.taskId,
      target.date,
    );

    expect(next).toEqual(buildMonth([sameTaskOtherDate, sameDateOtherTask]));
  });

  it("leaves records unchanged when the removal key is absent", () => {
    const existing = buildRecord();

    expect(
      removeRecordFromCache(
        buildMonth([existing]),
        "missing-task",
        "2026-07-15",
      ),
    ).toEqual(buildMonth([existing]));
  });

  it("derives the owning month cache key from an ISO record date", () => {
    expect(recordMonthKey("2026-07-15")).toBe("2026-07");
  });
});
