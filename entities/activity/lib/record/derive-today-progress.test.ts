/**
 * @file entities/activity/lib/record/derive-today-progress.test.ts
 * Locks per-dimension Today progress and goal-aware completion for every mode.
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

describe("deriveTodayProgress", () => {
  it("returns zeroed count progress and not-done when there is no record", () => {
    const activity = buildActivity({ trackingMode: "count", goal: 5 });

    expect(deriveTodayProgress(activity, null)).toEqual({
      done: false,
      dimensions: [
        {
          kind: "count",
          label: "Count",
          value: 0,
          goal: 5,
          remaining: 5,
          percent: 0,
        },
      ],
    });
  });

  it("derives an unbounded count dimension and falls back to meaningful completion", () => {
    const activity = buildActivity({ trackingMode: "count", goal: null });
    const record = buildRecord({
      trackingModeSnapshot: "count",
      goalSnapshot: null,
      count: 3,
    });

    expect(deriveTodayProgress(activity, record)).toEqual({
      done: true,
      dimensions: [
        {
          kind: "count",
          label: "Count",
          value: 3,
          goal: null,
          remaining: null,
          percent: null,
        },
      ],
    });
  });

  it("represents boolean mode as one unbounded count dimension", () => {
    const activity = buildActivity({ trackingMode: "boolean" });

    expect(deriveTodayProgress(activity, buildRecord({ count: 1 }))).toEqual({
      done: true,
      dimensions: [
        {
          kind: "count",
          label: "Count",
          value: 1,
          goal: null,
          remaining: null,
          percent: null,
        },
      ],
    });
  });

  it("uses goalDuration for duration progress", () => {
    const activity = buildActivity({
      trackingMode: "duration",
      goalDuration: 60,
    });
    const record = buildRecord({
      trackingModeSnapshot: "duration",
      goalDurationSnapshot: 60,
      count: 99,
      duration: 25,
    });

    expect(deriveTodayProgress(activity, record)).toEqual({
      done: false,
      dimensions: [
        {
          kind: "duration",
          label: "Minutes",
          value: 25,
          goal: 60,
          remaining: 35,
          percent: 42,
        },
      ],
    });
  });

  it("derives count and duration independently for count+duration", () => {
    const activity = buildActivity({
      trackingMode: "count+duration",
      goal: 4,
      goalDuration: 60,
    });
    const record = buildRecord({
      trackingModeSnapshot: "count+duration",
      goalSnapshot: 4,
      goalDurationSnapshot: 60,
      count: 2,
      duration: 30,
    });

    expect(deriveTodayProgress(activity, record)).toEqual({
      done: false,
      dimensions: [
        {
          kind: "count",
          label: "Count",
          value: 2,
          goal: 4,
          remaining: 2,
          percent: 50,
        },
        {
          kind: "duration",
          label: "Minutes",
          value: 30,
          goal: 60,
          remaining: 30,
          percent: 50,
        },
      ],
    });
  });

  it("requires every configured count+duration goal to be reached", () => {
    const activity = buildActivity({
      trackingMode: "count+duration",
      goal: 4,
      goalDuration: 30,
    });
    const snapshots = {
      trackingModeSnapshot: "count+duration" as const,
      goalSnapshot: 4,
      goalDurationSnapshot: 30,
    };

    expect(
      deriveTodayProgress(
        activity,
        buildRecord({ ...snapshots, count: 4, duration: 29 }),
      ).done,
    ).toBe(false);
    expect(
      deriveTodayProgress(
        activity,
        buildRecord({ ...snapshots, count: 4, duration: 30 }),
      ).done,
    ).toBe(true);
  });

  it("only gates on configured dimensions when one combined goal is absent", () => {
    const activity = buildActivity({
      trackingMode: "count+duration",
      goal: null,
      goalDuration: 30,
    });

    expect(
      deriveTodayProgress(
        activity,
        buildRecord({
          trackingModeSnapshot: "count+duration",
          goalSnapshot: null,
          goalDurationSnapshot: 30,
          count: 0,
          duration: 30,
        }),
      ).done,
    ).toBe(true);
  });

  it("falls back to meaningful combined progress when neither goal is configured", () => {
    const activity = buildActivity({
      trackingMode: "count+duration",
      goal: null,
      goalDuration: null,
    });
    const snapshots = {
      trackingModeSnapshot: "count+duration" as const,
      goalSnapshot: null,
      goalDurationSnapshot: null,
    };

    expect(
      deriveTodayProgress(
        activity,
        buildRecord({ ...snapshots, count: 0, duration: 0 }),
      ).done,
    ).toBe(false);
    expect(
      deriveTodayProgress(
        activity,
        buildRecord({ ...snapshots, count: 0, duration: 1 }),
      ).done,
    ).toBe(true);
  });

  it("clamps each bounded dimension at 100 percent and zero remaining", () => {
    const activity = buildActivity({
      trackingMode: "count+duration",
      goal: 5,
      goalDuration: 30,
    });
    const progress = deriveTodayProgress(
      activity,
      buildRecord({
        trackingModeSnapshot: "count+duration",
        goalSnapshot: 5,
        goalDurationSnapshot: 30,
        count: 7,
        duration: 45,
      }),
    );

    expect(progress.done).toBe(true);
    expect(progress.dimensions).toMatchObject([
      { kind: "count", remaining: 0, percent: 100 },
      { kind: "duration", remaining: 0, percent: 100 },
    ]);
  });

  it("keeps recorded progress when the activity mode and goals later change", () => {
    const activity = buildActivity({
      trackingMode: "duration",
      goal: null,
      goalDuration: 90,
    });
    const record = buildRecord({
      trackingModeSnapshot: "count",
      goalSnapshot: 4,
      goalDurationSnapshot: null,
      count: 2,
      duration: 99,
    });

    expect(deriveTodayProgress(activity, record)).toEqual({
      done: false,
      dimensions: [
        {
          kind: "count",
          label: "Count",
          value: 2,
          goal: 4,
          remaining: 2,
          percent: 50,
        },
      ],
    });
  });
});
