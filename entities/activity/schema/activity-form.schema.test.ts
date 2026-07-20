/**
 * @file entities/activity/schema/activity-form.schema.test.ts
 * Locks period-goal and priority validation on the shared activity form object.
 */

import { describe, expect, it } from "vitest";

import { activityFormObject } from "@/entities/activity/schema/activity-form.schema";

const BASE_VALUES = {
  title: "Read",
  trackingMode: "count" as const,
  scheduleType: "weekly" as const,
  scheduleConfig: ["mon", "wed"],
};

describe("activityFormObject period goals and priority", () => {
  it("accepts goalPeriod week with periodGoal", () => {
    const parsed = activityFormObject.safeParse({
      ...BASE_VALUES,
      goalPeriod: "week",
      periodGoal: 4,
    });

    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.goalPeriod).toBe("week");
      expect(parsed.data.periodGoal).toBe(4);
    }
  });

  it("accepts priority high", () => {
    const parsed = activityFormObject.safeParse({
      ...BASE_VALUES,
      priority: "high",
    });

    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.priority).toBe("high");
    }
  });

  it("rejects invalid goalPeriod", () => {
    const parsed = activityFormObject.safeParse({
      ...BASE_VALUES,
      goalPeriod: "biweekly",
    });

    expect(parsed.success).toBe(false);
  });

  it("rejects invalid priority", () => {
    const parsed = activityFormObject.safeParse({
      ...BASE_VALUES,
      priority: "urgent",
    });

    expect(parsed.success).toBe(false);
  });

  it("accepts null period and priority fields", () => {
    const parsed = activityFormObject.safeParse({
      ...BASE_VALUES,
      goalPeriod: null,
      periodGoal: null,
      periodGoalDuration: null,
      priority: null,
    });

    expect(parsed.success).toBe(true);
  });
});
