/**
 * @file entities/activity/lib/progress/accumulate-period-goal-metrics.test.ts
 * Unit tests for period-goal Progress seeding and record accumulation.
 *
 * Purpose: Cover week-day proration, window goal seeding, unconditional
 *          actual routing, and boolean → count grading in isolation.
 * Used in: Vitest (period-goals plan Step 5).
 * Used for: Regression guard on `accumulate-period-goal-metrics.ts`.
 */

import { describe, expect, it } from "vitest";

import {
  accumulatePeriodRecordMetrics,
  availableDaysInWeek,
  prorateWeekPeriodGoal,
  seedPeriodGoal,
  seedPeriodGoalsForActivity,
} from "@/entities/activity/lib/progress/accumulate-period-goal-metrics";
import {
  createProgressWindowAccumulator,
  finalizeProgressWindow,
} from "@/entities/activity/lib/progress/accumulate-record-metrics";

const PERIOD_OPTIONS = { periodGoal: true } as const;

describe("availableDaysInWeek", () => {
  it("counts clipped week days and intersects the validity window", () => {
    expect(
      availableDaysInWeek(
        {
          weekNumber: 1,
          rangeStart: "2026-07-01",
          rangeEnd: "2026-07-05",
        },
        { startsAt: null, endsAt: null },
      ),
    ).toBe(5);

    expect(
      availableDaysInWeek(
        {
          weekNumber: 1,
          rangeStart: "2026-07-01",
          rangeEnd: "2026-07-05",
        },
        { startsAt: "2026-07-03", endsAt: null },
      ),
    ).toBe(3);

    expect(
      availableDaysInWeek(
        {
          weekNumber: 1,
          rangeStart: "2026-07-01",
          rangeEnd: "2026-07-05",
        },
        { startsAt: "2026-07-10", endsAt: null },
      ),
    ).toBe(0);
  });
});

describe("prorateWeekPeriodGoal", () => {
  it("keeps the full goal for 7+ days and scales partial weeks", () => {
    expect(prorateWeekPeriodGoal(60, 7)).toBe(60);
    expect(prorateWeekPeriodGoal(60, 5)).toBeCloseTo((60 * 5) / 7);
    expect(prorateWeekPeriodGoal(60, 0)).toBe(0);
  });
});

describe("seedPeriodGoal", () => {
  it("seeds count and duration dimensions independently", () => {
    const window = createProgressWindowAccumulator(
      "count+duration",
      PERIOD_OPTIONS,
    );

    seedPeriodGoal(
      window,
      { periodGoal: 4, periodGoalDuration: 150 },
      "count",
    );
    seedPeriodGoal(
      window,
      { periodGoal: 4, periodGoalDuration: 150 },
      "duration",
    );

    const finalized = finalizeProgressWindow(
      window,
      "count+duration",
      PERIOD_OPTIONS,
    );

    expect(finalized.metrics[0]).toMatchObject({
      metric: "count",
      goal: 4,
      percent: 0,
    });
    expect(finalized.metrics[1]).toMatchObject({
      metric: "duration",
      goal: 150,
      percent: 0,
    });
  });

  it("prorates a partial week's target by available days", () => {
    const window = createProgressWindowAccumulator("duration", PERIOD_OPTIONS);

    seedPeriodGoal(
      window,
      { periodGoal: null, periodGoalDuration: 60 },
      "duration",
      5,
    );

    const finalized = finalizeProgressWindow(
      window,
      "duration",
      PERIOD_OPTIONS,
    );

    expect(finalized.metrics[0].goal).toBeCloseTo((60 * 5) / 7);
  });

  it("ignores null goals", () => {
    const window = createProgressWindowAccumulator("count", PERIOD_OPTIONS);

    seedPeriodGoal(window, { periodGoal: null, periodGoalDuration: null }, "count");

    const finalized = finalizeProgressWindow(window, "count", PERIOD_OPTIONS);

    expect(finalized.metrics[0].goal).toBeNull();
    expect(finalized.percent).toBeNull();
  });
});

describe("seedPeriodGoalsForActivity", () => {
  it("maps boolean period goals onto the count slot", () => {
    const window = createProgressWindowAccumulator("boolean", PERIOD_OPTIONS);

    seedPeriodGoalsForActivity(window, {
      trackingMode: "boolean",
      periodGoal: 4,
      periodGoalDuration: 99,
    });

    const finalized = finalizeProgressWindow(
      window,
      "boolean",
      PERIOD_OPTIONS,
    );

    expect(finalized.metrics).toEqual([
      expect.objectContaining({
        metric: "count",
        goal: 4,
        percent: 0,
      }),
    ]);
  });
});

describe("accumulatePeriodRecordMetrics", () => {
  it("routes current-metric actuals to total and targeted without a snapshot goal", () => {
    const window = createProgressWindowAccumulator("count", PERIOD_OPTIONS);

    seedPeriodGoal(
      window,
      { periodGoal: 10, periodGoalDuration: null },
      "count",
    );

    accumulatePeriodRecordMetrics(
      window,
      {
        trackingModeSnapshot: "count",
        count: 3,
        duration: 0,
      },
      "count",
    );

    const finalized = finalizeProgressWindow(window, "count", PERIOD_OPTIONS);

    expect(finalized.metrics[0]).toMatchObject({
      totalActual: 3,
      targetedActual: 3,
      goal: 10,
      percent: 30,
    });
  });

  it("grades boolean records as count quantity under a period goal", () => {
    const window = createProgressWindowAccumulator("boolean", PERIOD_OPTIONS);

    seedPeriodGoal(
      window,
      { periodGoal: 4, periodGoalDuration: null },
      "count",
    );

    accumulatePeriodRecordMetrics(
      window,
      {
        trackingModeSnapshot: "boolean",
        count: 1,
        duration: 0,
      },
      "boolean",
    );
    accumulatePeriodRecordMetrics(
      window,
      {
        trackingModeSnapshot: "boolean",
        count: 1,
        duration: 0,
      },
      "boolean",
    );
    accumulatePeriodRecordMetrics(
      window,
      {
        trackingModeSnapshot: "boolean",
        count: 1,
        duration: 0,
      },
      "boolean",
    );

    const finalized = finalizeProgressWindow(
      window,
      "boolean",
      PERIOD_OPTIONS,
    );

    expect(finalized.metrics[0]).toMatchObject({
      metric: "count",
      totalActual: 3,
      targetedActual: 3,
      goal: 4,
      percent: 75,
    });
    expect(finalized.legacyMetrics).toEqual([]);
  });

  it("sends mismatched snapshot metrics to legacy", () => {
    const window = createProgressWindowAccumulator("duration", PERIOD_OPTIONS);

    accumulatePeriodRecordMetrics(
      window,
      {
        trackingModeSnapshot: "count",
        count: 5,
        duration: 0,
      },
      "duration",
    );

    const finalized = finalizeProgressWindow(
      window,
      "duration",
      PERIOD_OPTIONS,
    );

    expect(finalized.metrics[0].totalActual).toBe(0);
    expect(finalized.legacyMetrics).toEqual([{ metric: "count", actual: 5 }]);
  });
});
