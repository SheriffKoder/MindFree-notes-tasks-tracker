/**
 * @file features/activity/activity-calendar-cell/lib/format-pill-progress.test.ts
 * Locks compact calendar pill progress labels.
 */

import { describe, expect, it } from "vitest";

import {
  deriveTodayProgress,
  type TodayProgressDimension,
} from "@/entities/activity";
import type {
  Activity,
  ActivityRecord,
} from "@/entities/activity/model/types";
import { formatPillProgress } from "@/features/activity/activity-calendar-cell/lib/format-pill-progress";

function count(
  overrides: Partial<TodayProgressDimension> = {},
): TodayProgressDimension {
  return {
    kind: "count",
    label: "Count",
    value: 0,
    goal: null,
    remaining: null,
    percent: null,
    ...overrides,
  };
}

function duration(
  overrides: Partial<TodayProgressDimension> = {},
): TodayProgressDimension {
  return {
    kind: "duration",
    label: "Minutes",
    value: 0,
    goal: null,
    remaining: null,
    percent: null,
    ...overrides,
  };
}

describe("formatPillProgress", () => {
  it("returns null for a single unbounded count (boolean / goal-less)", () => {
    expect(formatPillProgress([count({ value: 1 })])).toBeNull();
  });

  it("formats bounded count as value/goal", () => {
    expect(
      formatPillProgress([
        count({ value: 1, goal: 2, remaining: 1, percent: 50 }),
      ]),
    ).toBe("1/2");
  });

  it("formats bounded duration with m suffixes", () => {
    expect(
      formatPillProgress([
        duration({ value: 5, goal: 5, remaining: 0, percent: 100 }),
      ]),
    ).toBe("5m/5m");
  });

  it("formats unbounded duration as value with m", () => {
    expect(formatPillProgress([duration({ value: 12 })])).toBe("12m");
  });

  it("joins count+duration dimensions", () => {
    expect(
      formatPillProgress([
        count({ value: 1, goal: 2, remaining: 1, percent: 50 }),
        duration({ value: 5, goal: 5, remaining: 0, percent: 100 }),
      ]),
    ).toBe("1/2 · 5m/5m");
  });

  it("keeps historical pill labels when activity goals later change", () => {
    const activity = {
      id: "task-1",
      kind: "task",
      title: "Task",
      description: null,
      color: null,
      trackingMode: "count",
      scheduleType: "daily",
      scheduleConfig: null,
      goal: 10,
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
    } satisfies Activity;

    const record = {
      id: "record-1",
      taskId: "task-1",
      date: "2026-07-15",
      trackingModeSnapshot: "count",
      goalSnapshot: 2,
      goalDurationSnapshot: null,
      count: 1,
      duration: 0,
      description: null,
      createdAt: "2026-07-15T00:00:00.000Z",
      updatedAt: "2026-07-15T00:00:00.000Z",
    } satisfies ActivityRecord;

    const progress = deriveTodayProgress(activity, record);

    expect(formatPillProgress(progress.dimensions)).toBe("1/2");
  });
});
