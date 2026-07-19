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
};

describe("normalizeActivityDefinition", () => {
  it("forces boolean and clears color/goals for reminders", () => {
    expect(normalizeActivityDefinition("reminder", DIRTY_VALUES)).toEqual({
      trackingMode: "boolean",
      color: null,
      goal: null,
      goalDuration: null,
    });
  });

  it("keeps tracking mode and color for tasks, normalizing goals", () => {
    expect(normalizeActivityDefinition("task", DIRTY_VALUES)).toEqual({
      trackingMode: "count+duration",
      color: "#ff0000",
      goal: 5,
      goalDuration: 30,
    });
  });

  it("clears unused goals for task count mode", () => {
    expect(
      normalizeActivityDefinition("task", {
        trackingMode: "count",
        color: null,
        goal: 3,
        goalDuration: 20,
      }),
    ).toEqual({
      trackingMode: "count",
      color: null,
      goal: 3,
      goalDuration: null,
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
    });
  });
});
