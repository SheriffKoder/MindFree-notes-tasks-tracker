/**
 * @file entities/activity/editor/model/normalize-period-goals.test.ts
 * Locks period-goal cleanup when tracking mode or toggle changes.
 */

import { describe, expect, it } from "vitest";

import { normalizePeriodGoals } from "@/entities/activity/editor/model/normalize-period-goals";

const BOTH_ACTIVE = {
  goalPeriod: "week" as const,
  periodGoal: 4,
  periodGoalDuration: 150,
};

describe("normalizePeriodGoals", () => {
  it("clears everything when the period toggle is Off", () => {
    expect(
      normalizePeriodGoals("count+duration", {
        ...BOTH_ACTIVE,
        goalPeriod: null,
      }),
    ).toEqual({
      goalPeriod: null,
      periodGoal: null,
      periodGoalDuration: null,
    });
  });

  it("keeps count and clears duration for boolean mode", () => {
    expect(normalizePeriodGoals("boolean", BOTH_ACTIVE)).toEqual({
      goalPeriod: "week",
      periodGoal: 4,
      periodGoalDuration: null,
    });
  });

  it("keeps count and clears duration for count mode", () => {
    expect(normalizePeriodGoals("count", BOTH_ACTIVE)).toEqual({
      goalPeriod: "week",
      periodGoal: 4,
      periodGoalDuration: null,
    });
  });

  it("clears count and keeps duration for duration mode", () => {
    expect(normalizePeriodGoals("duration", BOTH_ACTIVE)).toEqual({
      goalPeriod: "week",
      periodGoal: null,
      periodGoalDuration: 150,
    });
  });

  it("retains both dimensions for count+duration mode", () => {
    expect(normalizePeriodGoals("count+duration", BOTH_ACTIVE)).toEqual(
      BOTH_ACTIVE,
    );
  });

  it("normalizes omitted period values to null while keeping the period", () => {
    expect(
      normalizePeriodGoals("count", {
        goalPeriod: "month",
        periodGoal: undefined,
        periodGoalDuration: undefined,
      }),
    ).toEqual({
      goalPeriod: "month",
      periodGoal: null,
      periodGoalDuration: null,
    });
  });
});
