/**
 * @file entities/activity/lib/definition/normalize-activity-definition.test.ts
 * Locks reminder canonicalization and task goal pass-through.
 */

import { describe, expect, it } from "vitest";

import { normalizeActivityDefinition } from "@/entities/activity/lib/definition/normalize-activity-definition";

const DIRTY_VALUES = {
  trackingMode: "count+duration" as const,
  color: "#ff0000",
  goal: 5,
  goalDuration: 30,
  goalPeriod: "week" as const,
  periodGoal: 4,
  periodGoalDuration: 150,
  priority: "high" as const,
};

const CLEARED_PERIOD_AND_PRIORITY = {
  goalPeriod: null,
  periodGoal: null,
  periodGoalDuration: null,
  priority: null,
};

describe("normalizeActivityDefinition", () => {
  it("forces boolean and clears color/goals/period/priority for reminders", () => {
    expect(normalizeActivityDefinition("reminder", DIRTY_VALUES)).toEqual({
      trackingMode: "boolean",
      color: null,
      goal: null,
      goalDuration: null,
      ...CLEARED_PERIOD_AND_PRIORITY,
    });
  });

  it("keeps tracking mode, color, period goals, and priority for tasks", () => {
    expect(normalizeActivityDefinition("task", DIRTY_VALUES)).toEqual({
      trackingMode: "count+duration",
      color: "#ff0000",
      goal: 5,
      goalDuration: 30,
      goalPeriod: "week",
      periodGoal: 4,
      periodGoalDuration: 150,
      priority: "high",
    });
  });

  it("clears unused goals for task count mode", () => {
    expect(
      normalizeActivityDefinition("task", {
        trackingMode: "count",
        color: null,
        goal: 3,
        goalDuration: 20,
        goalPeriod: "month",
        periodGoal: 10,
      }),
    ).toEqual({
      trackingMode: "count",
      color: null,
      goal: 3,
      goalDuration: null,
      goalPeriod: "month",
      periodGoal: 10,
      periodGoalDuration: null,
      priority: null,
    });
  });

  it("clears both goals for task boolean mode", () => {
    expect(
      normalizeActivityDefinition("task", {
        trackingMode: "boolean",
        color: "#abc",
        goal: 1,
        goalDuration: 10,
      }),
    ).toEqual({
      trackingMode: "boolean",
      color: "#abc",
      goal: null,
      goalDuration: null,
      ...CLEARED_PERIOD_AND_PRIORITY,
    });
  });

  it("normalizes omitted color to null for tasks", () => {
    expect(
      normalizeActivityDefinition("task", {
        trackingMode: "duration",
        goal: 2,
        goalDuration: 15,
      }),
    ).toEqual({
      trackingMode: "duration",
      color: null,
      goal: null,
      goalDuration: 15,
      ...CLEARED_PERIOD_AND_PRIORITY,
    });
  });
});
