/**
 * @file entities/activity/lib/progress/accumulate-record-metrics.test.ts
 * Unit tests for Progress metric accumulation and finalization.
 *
 * Purpose: Cover targeted vs unbounded actuals, projected days, legacy metrics,
 *          `combineMetricPercents`, and all-time rollup in isolation.
 * Used in: Vitest (Step 3 verification).
 * Used for: Regression guard on `accumulate-record-metrics.ts`.
 */

import { describe, expect, it } from "vitest";

import {
  accumulateProjectedDayMetrics,
  accumulateRecordMetrics,
  combineMetricPercents,
  createProgressWindowAccumulator,
  finalizeAllTimeMetrics,
  finalizeProgressWindow,
  accumulateAllTimeActuals,
} from "@/entities/activity/lib/progress/accumulate-record-metrics";
import type { ProgressMetric } from "@/entities/activity/model/progress-read-models";

describe("accumulateRecordMetrics", () => {
  it("routes historical count to legacy when current mode is duration", () => {
    const window = createProgressWindowAccumulator("duration");

    accumulateRecordMetrics(
      window,
      {
        trackingModeSnapshot: "count",
        goalSnapshot: 5,
        goalDurationSnapshot: null,
        count: 3,
        duration: 0,
      },
      "duration",
    );

    const finalized = finalizeProgressWindow(window, "duration");

    expect(finalized.metrics[0]).toMatchObject({
      metric: "duration",
      totalActual: 0,
      goal: null,
      percent: null,
    });
    expect(finalized.legacyMetrics).toEqual([{ metric: "count", actual: 3 }]);
  });

  it("splits count+duration snapshot into primary duration and legacy count", () => {
    const window = createProgressWindowAccumulator("duration");

    accumulateRecordMetrics(
      window,
      {
        trackingModeSnapshot: "count+duration",
        goalSnapshot: 4,
        goalDurationSnapshot: 30,
        count: 2,
        duration: 20,
      },
      "duration",
    );

    const finalized = finalizeProgressWindow(window, "duration");

    expect(finalized.metrics[0]).toMatchObject({
      metric: "duration",
      totalActual: 20,
      targetedActual: 20,
      goal: 30,
      percent: 67,
    });
    expect(finalized.legacyMetrics).toEqual([{ metric: "count", actual: 2 }]);
  });

  it("keeps historical count primary under count+duration without inventing duration", () => {
    const window = createProgressWindowAccumulator("count+duration");

    accumulateRecordMetrics(
      window,
      {
        trackingModeSnapshot: "count",
        goalSnapshot: 5,
        goalDurationSnapshot: null,
        count: 4,
        duration: 0,
      },
      "count+duration",
    );

    const finalized = finalizeProgressWindow(window, "count+duration");

    expect(finalized.metrics).toEqual([
      {
        metric: "count",
        totalActual: 4,
        targetedActual: 4,
        unboundedActual: 0,
        goal: 5,
        percent: 80,
      },
      {
        metric: "duration",
        totalActual: 0,
        targetedActual: 0,
        unboundedActual: 0,
        goal: null,
        percent: null,
      },
    ]);
    expect(finalized.legacyMetrics).toEqual([]);
    expect(finalized.percent).toBe(80);
  });

  it("treats historical boolean as completion, never count quantity", () => {
    const window = createProgressWindowAccumulator("count");

    accumulateRecordMetrics(
      window,
      {
        trackingModeSnapshot: "boolean",
        goalSnapshot: null,
        goalDurationSnapshot: null,
        count: 1,
        duration: 0,
      },
      "count",
    );

    const finalized = finalizeProgressWindow(window, "count");

    expect(finalized.metrics[0].totalActual).toBe(0);
    expect(finalized.legacyMetrics).toEqual([
      { metric: "completion", actual: 1 },
    ]);
  });

  it("excludes unbounded actual from targeted attainment", () => {
    const window = createProgressWindowAccumulator("count");

    accumulateRecordMetrics(
      window,
      {
        trackingModeSnapshot: "count",
        goalSnapshot: null,
        goalDurationSnapshot: null,
        count: 7,
        duration: 0,
      },
      "count",
    );
    accumulateRecordMetrics(
      window,
      {
        trackingModeSnapshot: "count",
        goalSnapshot: 10,
        goalDurationSnapshot: null,
        count: 4,
        duration: 0,
      },
      "count",
    );

    const finalized = finalizeProgressWindow(window, "count");

    expect(finalized.metrics[0]).toMatchObject({
      totalActual: 11,
      targetedActual: 4,
      unboundedActual: 7,
      goal: 10,
      percent: 40,
    });
  });

  it("caps over-target percent at 100 while keeping uncapped actuals", () => {
    const window = createProgressWindowAccumulator("duration");

    accumulateRecordMetrics(
      window,
      {
        trackingModeSnapshot: "duration",
        goalSnapshot: null,
        goalDurationSnapshot: 30,
        count: 0,
        duration: 60,
      },
      "duration",
    );

    const finalized = finalizeProgressWindow(window, "duration");

    expect(finalized.metrics[0]).toMatchObject({
      totalActual: 60,
      targetedActual: 60,
      goal: 30,
      percent: 100,
    });
  });
});

describe("accumulateProjectedDayMetrics", () => {
  it("adds current goals without inventing actuals", () => {
    const window = createProgressWindowAccumulator("count");

    accumulateProjectedDayMetrics(window, {
      trackingMode: "count",
      goal: 5,
      goalDuration: null,
    });

    const finalized = finalizeProgressWindow(window, "count");

    expect(finalized.metrics[0]).toMatchObject({
      totalActual: 0,
      targetedActual: 0,
      goal: 5,
      percent: 0,
    });
  });
});

describe("combineMetricPercents", () => {
  it("averages capped dimension percents for count+duration", () => {
    expect(
      combineMetricPercents([
        {
          metric: "count",
          totalActual: 20,
          targetedActual: 20,
          unboundedActual: 0,
          goal: 10,
          percent: 100,
        },
        {
          metric: "duration",
          totalActual: 15,
          targetedActual: 15,
          unboundedActual: 0,
          goal: 30,
          percent: 50,
        },
      ]),
    ).toBe(75);
  });
});

describe("finalizeAllTimeMetrics", () => {
  it("lists current metrics before earlier-tracking history", () => {
    const totals = new Map<ProgressMetric, number>();

    accumulateAllTimeActuals(totals, 3, 0, "count");
    accumulateAllTimeActuals(totals, 0, 40, "duration");

    expect(finalizeAllTimeMetrics(totals, "duration")).toEqual([
      { metric: "duration", actual: 40 },
      { metric: "count", actual: 3 },
    ]);
  });
});
