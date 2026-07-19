/**
 * @file features/activity/activity-page/lib/activity-filter.test.ts
 * Locks activity-id visibility and incomplete day-entry gating.
 */

import { describe, expect, it } from "vitest";

import type { Activity, ActivityRecord } from "@/entities/activity";
import {
  isActivityShown,
  isDayActivityShown,
  toggleHiddenActivity,
} from "@/features/activity/activity-page/lib/activity-filter";

function buildActivity(
  overrides: Partial<
    Pick<Activity, "trackingMode" | "goal" | "goalDuration">
  > = {},
): Pick<Activity, "trackingMode" | "goal" | "goalDuration"> {
  return {
    trackingMode: "boolean",
    goal: null,
    goalDuration: null,
    ...overrides,
  };
}

function buildRecord(overrides: Partial<ActivityRecord> = {}): ActivityRecord {
  return {
    id: "rec-1",
    taskId: "task-1",
    date: "2026-07-15",
    trackingModeSnapshot: "boolean",
    goalSnapshot: null,
    goalDurationSnapshot: null,
    count: 0,
    duration: 0,
    description: null,
    createdAt: "2026-07-15T00:00:00.000Z",
    updatedAt: "2026-07-15T00:00:00.000Z",
    ...overrides,
  };
}

describe("isActivityShown", () => {
  it("shows every activity when the hidden set is empty", () => {
    expect(isActivityShown(new Set(), "task-1")).toBe(true);
  });

  it("hides only members of the hidden set", () => {
    const hidden = new Set(["task-1"]);

    expect(isActivityShown(hidden, "task-1")).toBe(false);
    expect(isActivityShown(hidden, "task-2")).toBe(true);
  });
});

describe("toggleHiddenActivity", () => {
  it("adds and removes without mutating the input", () => {
    const empty = new Set<string>();
    const withOne = toggleHiddenActivity(empty, "task-1");

    expect(empty.size).toBe(0);
    expect(withOne.has("task-1")).toBe(true);
    expect(toggleHiddenActivity(withOne, "task-1").has("task-1")).toBe(false);
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

  it("uses the record tracking-mode snapshot when the activity mode later changes", () => {
    const activity = buildActivity({
      trackingMode: "duration",
      goal: null,
      goalDuration: 30,
    });
    const record = buildRecord({
      trackingModeSnapshot: "count",
      goalSnapshot: 5,
      count: 2,
      duration: 0,
    });

    expect(isDayActivityShown(activity, record, false)).toBe(true);
  });

  it("does not reinterpret a duration record as incomplete after a mode change", () => {
    const activity = buildActivity({
      trackingMode: "count",
      goal: 5,
      goalDuration: null,
    });
    const record = buildRecord({
      trackingModeSnapshot: "duration",
      goalDurationSnapshot: 30,
      count: 0,
      duration: 10,
    });

    expect(isDayActivityShown(activity, record, false)).toBe(true);
  });
});
