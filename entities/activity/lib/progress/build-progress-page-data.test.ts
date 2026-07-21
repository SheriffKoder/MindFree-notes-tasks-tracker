/**
 * @file entities/activity/lib/progress/build-progress-page-data.test.ts
 * Integration tests for the pure Progress page reducer.
 *
 * Purpose: Exercise card membership, projection (Option B stability), legacy
 *          metrics, archived tasks, and week/month totals end-to-end without
 *          Supabase. Also covers `build-task-progress` branches indirectly.
 * Used in: Vitest (Steps 3–4 verification).
 * Used for: Regression guard on `build-progress-page-data.ts` and
 *           `build-task-progress.ts`.
 */

import { describe, expect, it } from "vitest";

import { buildProgressPageData } from "@/entities/activity/lib/progress/build-progress-page-data";
import type {
  Activity,
  ActivityRecord,
} from "@/entities/activity/model/types";

const TODAY = "2026-07-15"; // Wednesday
const CURRENT_MONTH = "2026-07";
const PAST_MONTH = "2026-06";
const FUTURE_MONTH = "2026-08";

function buildActivity(overrides: Partial<Activity> = {}): Activity {
  return {
    id: "task-1",
    kind: "task",
    title: "Task",
    description: null,
    color: "#111111",
    trackingMode: "count",
    scheduleType: "daily",
    scheduleConfig: null,
    goal: 5,
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
    ...overrides,
  };
}

function buildRecord(overrides: Partial<ActivityRecord> = {}): ActivityRecord {
  return {
    id: "record-1",
    taskId: "task-1",
    date: "2026-07-10",
    trackingModeSnapshot: "count",
    goalSnapshot: 5,
    goalDurationSnapshot: null,
    count: 3,
    duration: 0,
    description: null,
    createdAt: "2026-07-10T00:00:00.000Z",
    updatedAt: "2026-07-10T00:00:00.000Z",
    ...overrides,
  };
}

describe("buildProgressPageData", () => {
  it("uses records only for a past month (no current-schedule reconstruction)", () => {
    const task = buildActivity({ scheduleType: "daily", goal: 5 });
    const page = buildProgressPageData({
      month: PAST_MONTH,
      todayIso: TODAY,
      tasks: [task],
      monthRecords: [
        buildRecord({
          date: "2026-06-02",
          count: 2,
          goalSnapshot: 5,
        }),
      ],
      allTimeValues: [],
    });

    expect(page.tasks).toHaveLength(1);
    expect(page.tasks[0].month.metrics[0]).toMatchObject({
      totalActual: 2,
      targetedActual: 2,
      goal: 5,
      percent: 40,
    });
  });

  it("omits active tasks with no records in a past month", () => {
    const page = buildProgressPageData({
      month: PAST_MONTH,
      todayIso: TODAY,
      tasks: [buildActivity()],
      monthRecords: [],
      allTimeValues: [],
    });

    expect(page.tasks).toEqual([]);
  });

  it("contributes nothing for a missing day in an already-closed past month", () => {
    const page = buildProgressPageData({
      month: PAST_MONTH,
      todayIso: TODAY,
      tasks: [buildActivity({ scheduleType: "daily", goal: 5 })],
      monthRecords: [
        buildRecord({ date: "2026-06-10", count: 5, goalSnapshot: 5 }),
      ],
      allTimeValues: [],
    });

    // Closed month: only the recorded day contributes; no schedule fallback.
    const metric = page.tasks[0].month.metrics[0];
    expect(metric.goal).toBe(5);
    expect(metric.totalActual).toBe(5);
  });

  it("counts a missing due day earlier in the currently-open month as a missed target", () => {
    const page = buildProgressPageData({
      month: CURRENT_MONTH,
      todayIso: TODAY,
      tasks: [buildActivity({ scheduleType: "daily", goal: 5 })],
      monthRecords: [
        buildRecord({ date: "2026-07-10", count: 5, goalSnapshot: 5 }),
      ],
      allTimeValues: [],
    });

    // Stability fix: every other due day in July (30 days) projects goal 5,
    // whether before or after today — the target no longer shrinks as
    // unlogged past days pass by.
    const metric = page.tasks[0].month.metrics[0];
    expect(metric.goal).toBe(5 + 30 * 5);
    expect(metric.totalActual).toBe(5);
  });

  it("floors projection at the task's createdAt so it never appears due before it existed", () => {
    const page = buildProgressPageData({
      month: CURRENT_MONTH,
      todayIso: TODAY,
      tasks: [
        buildActivity({
          scheduleType: "daily",
          goal: 5,
          createdAt: "2026-07-10T00:00:00.000Z",
        }),
      ],
      monthRecords: [],
      allTimeValues: [],
    });

    // Only July 10–31 (22 days) can be due; July 1–9 predate the task.
    expect(page.tasks[0].month.metrics[0].goal).toBe(22 * 5);
  });

  it("includes a task whose only due day this month already passed, with no record", () => {
    const page = buildProgressPageData({
      month: CURRENT_MONTH,
      todayIso: TODAY,
      tasks: [
        buildActivity({
          scheduleType: "once",
          scheduleConfig: "2026-07-05",
          goal: 3,
        }),
      ],
      monthRecords: [],
      allTimeValues: [],
    });

    // Previously invisible: no record and no remaining due day, but the
    // currently-open month still projects its one past due day as missed.
    expect(page.tasks).toHaveLength(1);
    expect(page.tasks[0].month.metrics[0]).toMatchObject({
      goal: 3,
      totalActual: 0,
    });
  });

  it("does not double-add the current target when today has a record", () => {
    const page = buildProgressPageData({
      month: CURRENT_MONTH,
      todayIso: TODAY,
      tasks: [buildActivity({ scheduleType: "daily", goal: 10 })],
      monthRecords: [
        buildRecord({
          date: TODAY,
          count: 4,
          goalSnapshot: 10,
          trackingModeSnapshot: "count",
        }),
      ],
      allTimeValues: [],
    });

    const metric = page.tasks[0].month.metrics[0];
    // Today uses the snapshot goal once; the other 30 days of July each
    // project goal 10 (stability fix), so 30 + today's own goal.
    expect(metric.goal).toBe(10 + 30 * 10);
    expect(metric.totalActual).toBe(4);
  });

  it("projects every due day in the currently-open month, past or future", () => {
    const page = buildProgressPageData({
      month: CURRENT_MONTH,
      todayIso: TODAY,
      tasks: [
        buildActivity({
          scheduleType: "weekly",
          scheduleConfig: ["fri"],
          goal: 8,
        }),
      ],
      monthRecords: [],
      allTimeValues: [],
    });

    // All Fridays in July 2026: 3, 10, 17, 24, 31 → 5 projected goals.
    expect(page.tasks[0].month.metrics[0].goal).toBe(40);
    expect(page.tasks[0].month.metrics[0].totalActual).toBe(0);
  });

  it("adds nothing on a future non-due day", () => {
    const page = buildProgressPageData({
      month: FUTURE_MONTH,
      todayIso: TODAY,
      tasks: [
        buildActivity({
          scheduleType: "weekly",
          scheduleConfig: ["mon"],
          goal: 5,
        }),
      ],
      monthRecords: [],
      allTimeValues: [],
    });

    // Mondays in Aug 2026: 3, 10, 17, 24, 31 → 5
    expect(page.tasks[0].month.metrics[0].goal).toBe(25);
  });

  it("includes archived tasks with month records and skips projection", () => {
    const archived = buildActivity({
      id: "archived",
      archivedAt: "2026-07-01T00:00:00.000Z",
      scheduleType: "daily",
      goal: 5,
    });
    const page = buildProgressPageData({
      month: CURRENT_MONTH,
      todayIso: TODAY,
      tasks: [archived],
      monthRecords: [
        buildRecord({
          taskId: "archived",
          date: "2026-07-02",
          count: 3,
          goalSnapshot: 5,
        }),
      ],
      allTimeValues: [],
    });

    expect(page.tasks).toHaveLength(1);
    expect(page.tasks[0].month.metrics[0]).toMatchObject({
      totalActual: 3,
      goal: 5,
      percent: 60,
    });
  });

  it("excludes archived tasks without month records", () => {
    const page = buildProgressPageData({
      month: CURRENT_MONTH,
      todayIso: TODAY,
      tasks: [
        buildActivity({
          archivedAt: "2026-07-01T00:00:00.000Z",
          scheduleType: "daily",
        }),
      ],
      monthRecords: [],
      allTimeValues: [],
    });

    expect(page.tasks).toEqual([]);
  });

  it("includes active current/future tasks with a due day and no record", () => {
    const page = buildProgressPageData({
      month: FUTURE_MONTH,
      todayIso: TODAY,
      tasks: [buildActivity({ scheduleType: "daily", goal: 2 })],
      monthRecords: [],
      allTimeValues: [],
    });

    expect(page.tasks).toHaveLength(1);
    expect(page.tasks[0].month.metrics[0].goal).toBe(31 * 2);
  });

  it("orders active tasks before archived-history tasks", () => {
    const active = buildActivity({
      id: "active",
      createdAt: "2026-01-02T00:00:00.000Z",
    });
    const archived = buildActivity({
      id: "archived",
      createdAt: "2026-01-01T00:00:00.000Z",
      archivedAt: "2026-07-01T00:00:00.000Z",
    });
    const page = buildProgressPageData({
      month: CURRENT_MONTH,
      todayIso: TODAY,
      tasks: [archived, active],
      monthRecords: [
        buildRecord({ taskId: "archived", date: "2026-07-02" }),
        buildRecord({ taskId: "active", date: "2026-07-03" }),
      ],
      allTimeValues: [],
    });

    expect(page.tasks.map((task) => task.id)).toEqual(["active", "archived"]);
  });

  it("filters month records to known task ids", () => {
    const page = buildProgressPageData({
      month: PAST_MONTH,
      todayIso: TODAY,
      tasks: [buildActivity({ id: "task-1" })],
      monthRecords: [
        buildRecord({
          taskId: "reminder-1",
          date: "2026-06-02",
          count: 9,
        }),
      ],
      allTimeValues: [],
    });

    expect(page.tasks).toEqual([]);
  });

  it("aggregates all-time values with current metrics first", () => {
    const page = buildProgressPageData({
      month: PAST_MONTH,
      todayIso: TODAY,
      tasks: [buildActivity({ trackingMode: "duration", goalDuration: 30 })],
      monthRecords: [
        buildRecord({
          date: "2026-06-02",
          trackingModeSnapshot: "duration",
          goalSnapshot: null,
          goalDurationSnapshot: 30,
          count: 0,
          duration: 20,
        }),
      ],
      allTimeValues: [
        {
          taskId: "task-1",
          trackingModeSnapshot: "duration",
          count: 0,
          duration: 90,
        },
        {
          taskId: "task-1",
          trackingModeSnapshot: "count",
          count: 12,
          duration: 0,
        },
      ],
    });

    expect(page.tasks[0].allTime.metrics).toEqual([
      { metric: "duration", actual: 90 },
      { metric: "count", actual: 12 },
    ]);
  });

  it("emits every clipped week including empty ones", () => {
    const page = buildProgressPageData({
      month: "2026-08",
      todayIso: TODAY,
      tasks: [
        buildActivity({
          scheduleType: "once",
          scheduleConfig: "2026-08-15",
          goal: 1,
        }),
      ],
      monthRecords: [],
      allTimeValues: [],
    });

    expect(page.tasks[0].weeks).toHaveLength(6);
    expect(page.tasks[0].weeks[2].metrics[0].goal).toBe(1);
    expect(
      page.tasks[0].weeks.filter((week) => week.metrics[0].goal === null),
    ).toHaveLength(5);
  });
});

describe("buildProgressPageData period goals", () => {
  it("grades full weeks at 100% and prorates partial edge weeks", () => {
    // July 2026: W1 = Jul 1–5 (5 days), W2 = Jul 6–12 (full).
    // Record 4 counts in W2 (= full periodGoal) and nothing in W1.
    const page = buildProgressPageData({
      month: CURRENT_MONTH,
      todayIso: TODAY,
      tasks: [
        buildActivity({
          goal: null,
          goalPeriod: "week",
          periodGoal: 4,
        }),
      ],
      monthRecords: [
        buildRecord({ date: "2026-07-06", count: 1, goalSnapshot: null }),
        buildRecord({
          id: "r2",
          date: "2026-07-07",
          count: 1,
          goalSnapshot: null,
        }),
        buildRecord({
          id: "r3",
          date: "2026-07-08",
          count: 1,
          goalSnapshot: null,
        }),
        buildRecord({
          id: "r4",
          date: "2026-07-09",
          count: 1,
          goalSnapshot: null,
        }),
      ],
      allTimeValues: [],
    });

    const w2 = page.tasks[0].weeks.find((week) => week.weekNumber === 2);
    const w1 = page.tasks[0].weeks.find((week) => week.weekNumber === 1);

    expect(w2?.metrics[0]).toMatchObject({
      totalActual: 4,
      goal: 4,
      percent: 100,
    });
    expect(w1?.metrics[0]?.goal).toBeCloseTo((4 * 5) / 7);
    expect(w1?.metrics[0]).toMatchObject({
      totalActual: 0,
      percent: 0,
    });
  });

  it("includes prorated edge weeks in the month donut denominator", () => {
    // 60m/week; W1 (5d) + W5 (5d) + 3 full weeks.
    // Actual: 60m in W1 + 60m in W4 + 20m in W5 = 140m.
    // Goal: 60*(5/7) + 60*3 + 60*(5/7) = 60*(3 + 10/7) ≈ 265.71m → ~53%.
    const page = buildProgressPageData({
      month: CURRENT_MONTH,
      todayIso: TODAY,
      tasks: [
        buildActivity({
          trackingMode: "duration",
          goal: null,
          goalDuration: null,
          goalPeriod: "week",
          periodGoalDuration: 60,
        }),
      ],
      monthRecords: [
        buildRecord({
          date: "2026-07-01",
          trackingModeSnapshot: "duration",
          goalSnapshot: null,
          goalDurationSnapshot: null,
          count: 0,
          duration: 60,
        }),
        buildRecord({
          id: "r2",
          date: "2026-07-20",
          trackingModeSnapshot: "duration",
          goalSnapshot: null,
          goalDurationSnapshot: null,
          count: 0,
          duration: 60,
        }),
        buildRecord({
          id: "r3",
          date: "2026-07-27",
          trackingModeSnapshot: "duration",
          goalSnapshot: null,
          goalDurationSnapshot: null,
          count: 0,
          duration: 20,
        }),
      ],
      allTimeValues: [],
    });

    const monthMetric = page.tasks[0].month.metrics[0];
    const expectedGoal = 60 * (3 + 10 / 7);

    expect(monthMetric.totalActual).toBe(140);
    expect(monthMetric.goal).toBeCloseTo(expectedGoal);
    expect(monthMetric.percent).toBe(
      Math.round((140 / expectedGoal) * 100),
    );

    const w1 = page.tasks[0].weeks.find((week) => week.weekNumber === 1);
    const w5 = page.tasks[0].weeks.find((week) => week.weekNumber === 5);

    expect(w1?.percent).not.toBeNull();
    expect(w5?.percent).not.toBeNull();
    expect(w1?.metrics[0].goal).toBeCloseTo((60 * 5) / 7);
    expect(w5?.metrics[0].goal).toBeCloseTo((60 * 5) / 7);
  });

  it("shows a month-level percent and actual-only weeks for a month period goal", () => {
    const page = buildProgressPageData({
      month: CURRENT_MONTH,
      todayIso: TODAY,
      tasks: [
        buildActivity({
          trackingMode: "duration",
          goal: null,
          goalDuration: null,
          goalPeriod: "month",
          periodGoalDuration: 100,
        }),
      ],
      monthRecords: [
        buildRecord({
          date: "2026-07-10",
          trackingModeSnapshot: "duration",
          goalSnapshot: null,
          goalDurationSnapshot: null,
          count: 0,
          duration: 40,
        }),
      ],
      allTimeValues: [],
    });

    expect(page.tasks[0].month.metrics[0]).toMatchObject({
      metric: "duration",
      totalActual: 40,
      goal: 100,
      percent: 40,
    });
    expect(
      page.tasks[0].weeks.every(
        (week) => week.metrics[0].goal === null && week.percent === null,
      ),
    ).toBe(true);
  });

  it("grades boolean period goals as count (not completion)", () => {
    const page = buildProgressPageData({
      month: CURRENT_MONTH,
      todayIso: TODAY,
      tasks: [
        buildActivity({
          trackingMode: "boolean",
          goal: null,
          goalPeriod: "week",
          periodGoal: 4,
        }),
      ],
      monthRecords: [
        buildRecord({
          date: "2026-07-06",
          trackingModeSnapshot: "boolean",
          goalSnapshot: null,
          count: 1,
        }),
        buildRecord({
          id: "r2",
          date: "2026-07-07",
          trackingModeSnapshot: "boolean",
          goalSnapshot: null,
          count: 1,
        }),
        buildRecord({
          id: "r3",
          date: "2026-07-08",
          trackingModeSnapshot: "boolean",
          goalSnapshot: null,
          count: 1,
        }),
      ],
      allTimeValues: [],
    });

    const w2 = page.tasks[0].weeks.find((week) => week.weekNumber === 2);

    expect(w2?.metrics).toEqual([
      expect.objectContaining({
        metric: "count",
        totalActual: 3,
        goal: 4,
        percent: 75,
      }),
    ]);
  });

  it("keeps an unset count dimension goal-less under count+duration", () => {
    const page = buildProgressPageData({
      month: CURRENT_MONTH,
      todayIso: TODAY,
      tasks: [
        buildActivity({
          trackingMode: "count+duration",
          goal: null,
          goalDuration: null,
          goalPeriod: "week",
          periodGoal: null,
          periodGoalDuration: 60,
        }),
      ],
      monthRecords: [
        buildRecord({
          date: "2026-07-06",
          trackingModeSnapshot: "count+duration",
          goalSnapshot: null,
          goalDurationSnapshot: null,
          count: 2,
          duration: 30,
        }),
      ],
      allTimeValues: [],
    });

    const w2 = page.tasks[0].weeks.find((week) => week.weekNumber === 2);

    expect(w2?.metrics[0]).toMatchObject({
      metric: "count",
      totalActual: 2,
      goal: null,
      percent: null,
    });
    expect(w2?.metrics[1]).toMatchObject({
      metric: "duration",
      totalActual: 30,
      goal: 60,
      percent: 50,
    });
    expect(w2?.percent).toBe(50);
  });

  it("includes a non-archived period-goal task with zero month records", () => {
    const page = buildProgressPageData({
      month: CURRENT_MONTH,
      todayIso: TODAY,
      tasks: [
        buildActivity({
          goal: null,
          goalPeriod: "week",
          periodGoal: 4,
        }),
      ],
      monthRecords: [],
      allTimeValues: [],
    });

    expect(page.tasks).toHaveLength(1);

    const weeksWithGoals = page.tasks[0].weeks.filter(
      (week) => week.metrics[0].goal !== null,
    );

    expect(weeksWithGoals.length).toBeGreaterThan(0);
    expect(weeksWithGoals.every((week) => week.percent === 0)).toBe(true);
  });

  it("excludes an archived period-goal task with no month records", () => {
    const page = buildProgressPageData({
      month: CURRENT_MONTH,
      todayIso: TODAY,
      tasks: [
        buildActivity({
          archivedAt: "2026-07-01T00:00:00.000Z",
          goalPeriod: "week",
          periodGoal: 4,
        }),
      ],
      monthRecords: [],
      allTimeValues: [],
    });

    expect(page.tasks).toEqual([]);
  });

  it("excludes a period-goal task from months before startsAt", () => {
    const page = buildProgressPageData({
      month: PAST_MONTH,
      todayIso: TODAY,
      tasks: [
        buildActivity({
          startsAt: "2026-07-01",
          goalPeriod: "week",
          periodGoal: 4,
        }),
      ],
      monthRecords: [],
      allTimeValues: [],
    });

    expect(page.tasks).toEqual([]);
  });

  it("excludes a period-goal task from months after endsAt", () => {
    const page = buildProgressPageData({
      month: FUTURE_MONTH,
      todayIso: TODAY,
      tasks: [
        buildActivity({
          endsAt: "2026-07-31",
          goalPeriod: "month",
          periodGoal: 10,
        }),
      ],
      monthRecords: [],
      allTimeValues: [],
    });

    expect(page.tasks).toEqual([]);
  });

  it("includes a period-goal task in the month that contains startsAt", () => {
    const page = buildProgressPageData({
      month: CURRENT_MONTH,
      todayIso: TODAY,
      tasks: [
        buildActivity({
          startsAt: "2026-07-01",
          goalPeriod: "week",
          periodGoal: 4,
        }),
      ],
      monthRecords: [],
      allTimeValues: [],
    });

    expect(page.tasks).toHaveLength(1);
  });

  it("uses the period-goal path when both due-day and period goals are set", () => {
    const page = buildProgressPageData({
      month: CURRENT_MONTH,
      todayIso: TODAY,
      tasks: [
        buildActivity({
          scheduleType: "daily",
          goal: 5,
          goalPeriod: "month",
          periodGoal: 20,
        }),
      ],
      monthRecords: [
        buildRecord({
          date: "2026-07-10",
          count: 4,
          goalSnapshot: 5,
        }),
      ],
      allTimeValues: [],
    });

    // Period path: month goal is periodGoal (20), not 31 × day goal (5).
    // No projection of missing due days.
    expect(page.tasks[0].month.metrics[0]).toMatchObject({
      totalActual: 4,
      goal: 20,
      percent: 20,
    });
  });
});
