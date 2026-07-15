/**
 * @file entities/activity/lib/build-record-lookup.test.ts
 * Locks lookup derivation: `recordKey` natural-key formatting, the `byTaskDate`
 * `${taskId}:${date}` map, `byTaskId` grouping in insertion order, and empty
 * maps for no records.
 */

import { describe, expect, it } from "vitest";

import {
  buildRecordLookup,
  recordKey,
} from "@/entities/activity/lib/build-record-lookup";
import type { ActivityRecord } from "@/entities/activity/model/types";

function buildRecord(overrides: Partial<ActivityRecord> = {}): ActivityRecord {
  return {
    id: "record-1",
    taskId: "task-1",
    date: "2026-07-15",
    count: 1,
    duration: 0,
    description: null,
    createdAt: "2026-07-15T00:00:00.000Z",
    updatedAt: "2026-07-15T00:00:00.000Z",
    ...overrides,
  };
}

describe("recordKey", () => {
  it("joins taskId and date into the natural key", () => {
    expect(recordKey("task-1", "2026-07-15")).toBe("task-1:2026-07-15");
  });
});

describe("buildRecordLookup", () => {
  it("indexes records by natural key", () => {
    const record = buildRecord();
    const { byTaskDate } = buildRecordLookup([record]);

    expect(byTaskDate.get("task-1:2026-07-15")).toBe(record);
    expect(byTaskDate.size).toBe(1);
  });

  it("groups records by taskId preserving order", () => {
    const first = buildRecord({ id: "r1", date: "2026-07-14" });
    const second = buildRecord({ id: "r2", date: "2026-07-15" });
    const other = buildRecord({ id: "r3", taskId: "task-2", date: "2026-07-15" });

    const { byTaskId } = buildRecordLookup([first, second, other]);

    expect(byTaskId.get("task-1")).toEqual([first, second]);
    expect(byTaskId.get("task-2")).toEqual([other]);
  });

  it("returns empty maps for no records", () => {
    const { byTaskDate, byTaskId } = buildRecordLookup([]);

    expect(byTaskDate.size).toBe(0);
    expect(byTaskId.size).toBe(0);
  });
});
