/**
 * @file entities/activity/lib/record/derive-today-progress.test.ts
 * Locks single-day progress derivation: primary-value selection per mode,
 * goal-aware `done`, and `remaining`/`percent` (null when unbounded).
 */

import { describe, expect, it } from "vitest";

import { deriveTodayProgress } from "@/entities/activity/lib/record/derive-today-progress";
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
    count: 0,
    duration: 0,
    description: null,
    createdAt: "2026-07-15T00:00:00.000Z",
    updatedAt: "2026-07-15T00:00:00.000Z",
    ...overrides,
  };
}

describe("deriveTodayProgress", () => {
  it("returns a zeroed, not-done shape when there is no record", () => {
    const activity = buildActivity({ trackingMode: "count", goal: 5 });

    expect(deriveTodayProgress(activity, null)).toEqual({
      done: false,
      value: 0,
      goal: 5,
      remaining: 5,
      percent: 0,
    });
  });

  it("leaves remaining/percent null for unbounded activities", () => {
    const activity = buildActivity({ trackingMode: "count", goal: null });
    const record = buildRecord({ count: 3 });

    expect(deriveTodayProgress(activity, record)).toEqual({
      done: true,
      value: 3,
      goal: null,
      remaining: null,
      percent: null,
    });
  });

  it("uses count as the primary value for count/boolean modes", () => {
    const activity = buildActivity({ trackingMode: "count", goal: 5 });
    const record = buildRecord({ count: 3, duration: 99 });

    expect(deriveTodayProgress(activity, record)).toMatchObject({
      value: 3,
      remaining: 2,
      percent: 60,
      done: false,
    });
  });

  it("uses duration as the primary value for duration mode", () => {
    const activity = buildActivity({ trackingMode: "duration", goal: 60 });
    const record = buildRecord({ count: 99, duration: 25 });

    expect(deriveTodayProgress(activity, record)).toMatchObject({
      value: 25,
      remaining: 35,
      percent: 42,
    });
  });

  it("uses count as the primary value for count+duration mode", () => {
    const activity = buildActivity({ trackingMode: "count+duration", goal: 4 });
    const record = buildRecord({ count: 2, duration: 30 });

    expect(deriveTodayProgress(activity, record)).toMatchObject({
      value: 2,
      remaining: 2,
      percent: 50,
    });
  });

  it("marks done when a goal is reached and clamps percent/remaining", () => {
    const activity = buildActivity({ trackingMode: "count", goal: 5 });
    const record = buildRecord({ count: 7 });

    expect(deriveTodayProgress(activity, record)).toEqual({
      done: true,
      value: 7,
      goal: 5,
      remaining: 0,
      percent: 100,
    });
  });

  it("falls back to isMeaningfulRecord for done when unbounded", () => {
    const activity = buildActivity({ trackingMode: "boolean", goal: null });

    expect(deriveTodayProgress(activity, buildRecord({ count: 0 })).done).toBe(
      false,
    );
    expect(deriveTodayProgress(activity, buildRecord({ count: 1 })).done).toBe(
      true,
    );
  });
});
