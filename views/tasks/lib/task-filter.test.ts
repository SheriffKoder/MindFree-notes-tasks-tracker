/**
 * @file views/tasks/lib/task-filter.test.ts
 * Locks task-id visibility and incomplete day-entry gating.
 */

import { describe, expect, it } from "vitest";

import type { Activity, ActivityRecord } from "@/entities/activity";
import {
  isDayActivityShown,
  isTaskShown,
  toggleHiddenTask,
} from "@/views/tasks/lib/task-filter";

function buildActivity(
  overrides: Partial<Activity> = {},
): Pick<Activity, "trackingMode"> & Partial<Activity> {
  return {
    trackingMode: "boolean",
    ...overrides,
  };
}

function buildRecord(overrides: Partial<ActivityRecord> = {}): ActivityRecord {
  return {
    id: "rec-1",
    taskId: "task-1",
    date: "2026-07-15",
    count: 0,
    duration: 0,
    description: null,
    createdAt: "2026-07-15T00:00:00.000Z",
    updatedAt: "2026-07-15T00:00:00.000Z",
    ...overrides,
  };
}

describe("isTaskShown", () => {
  it("shows every task when the hidden set is empty", () => {
    expect(isTaskShown(new Set(), "task-1")).toBe(true);
  });

  it("hides only members of the hidden set", () => {
    const hidden = new Set(["task-1"]);

    expect(isTaskShown(hidden, "task-1")).toBe(false);
    expect(isTaskShown(hidden, "task-2")).toBe(true);
  });
});

describe("toggleHiddenTask", () => {
  it("adds and removes without mutating the input", () => {
    const empty = new Set<string>();
    const withOne = toggleHiddenTask(empty, "task-1");

    expect(empty.size).toBe(0);
    expect(withOne.has("task-1")).toBe(true);
    expect(toggleHiddenTask(withOne, "task-1").has("task-1")).toBe(false);
  });
});

describe("isDayActivityShown", () => {
  it("hides incomplete entries by default", () => {
    const activity = buildActivity();

    expect(isDayActivityShown(activity, null, false)).toBe(false);
    expect(isDayActivityShown(activity, buildRecord({ count: 0 }), false)).toBe(
      false,
    );
  });

  it("shows meaningful records when incomplete are hidden", () => {
    const activity = buildActivity();

    expect(
      isDayActivityShown(activity, buildRecord({ count: 1 }), false),
    ).toBe(true);
  });

  it("shows incomplete entries when showIncomplete is true", () => {
    const activity = buildActivity();

    expect(isDayActivityShown(activity, null, true)).toBe(true);
    expect(isDayActivityShown(activity, buildRecord({ count: 0 }), true)).toBe(
      true,
    );
  });
});
