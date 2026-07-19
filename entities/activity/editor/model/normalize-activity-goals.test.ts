/**
 * @file entities/activity/editor/model/normalize-activity-goals.test.ts
 * Locks goal cleanup and retention when tracking mode changes.
 */

import { describe, expect, it } from "vitest";

import { normalizeActivityGoals } from "@/entities/activity/editor/model/normalize-activity-goals";

const BOTH_GOALS = { goal: 5, goalDuration: 30 };

describe("normalizeActivityGoals", () => {
  it("clears both goals for boolean mode", () => {
    expect(normalizeActivityGoals("boolean", BOTH_GOALS)).toEqual({
      goal: null,
      goalDuration: null,
    });
  });

  it("retains count and clears duration for count mode", () => {
    expect(normalizeActivityGoals("count", BOTH_GOALS)).toEqual({
      goal: 5,
      goalDuration: null,
    });
  });

  it("clears count and retains duration for duration mode", () => {
    expect(normalizeActivityGoals("duration", BOTH_GOALS)).toEqual({
      goal: null,
      goalDuration: 30,
    });
  });

  it("retains both goals for count+duration mode", () => {
    expect(normalizeActivityGoals("count+duration", BOTH_GOALS)).toEqual(
      BOTH_GOALS,
    );
  });

  it("normalizes omitted goal values to null", () => {
    expect(
      normalizeActivityGoals("count+duration", {
        goal: undefined,
        goalDuration: undefined,
      }),
    ).toEqual({ goal: null, goalDuration: null });
  });
});
