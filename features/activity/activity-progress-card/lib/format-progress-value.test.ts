/**
 * @file features/activity/activity-progress-card/lib/format-progress-value.test.ts
 * Unit tests for Progress card presentation formatters.
 *
 * Purpose: Lock duration hour/minute formatting and metric label strings.
 * Used in: Vitest (Step 5 verification).
 * Used for: Regression guard on `format-progress-value.ts`.
 */

import { describe, expect, it } from "vitest";

import {
  formatProgressActualGoal,
  formatProgressDuration,
  formatProgressLegacyLine,
  formatProgressMetricList,
  formatProgressMetricValue,
} from "@/features/activity/activity-progress-card/lib/format-progress-value";

describe("formatProgressDuration", () => {
  it("formats minutes under one hour", () => {
    expect(formatProgressDuration(0)).toBe("0m");
    expect(formatProgressDuration(45)).toBe("45m");
  });

  it("formats whole hours and mixed hours/minutes", () => {
    expect(formatProgressDuration(60)).toBe("1h");
    expect(formatProgressDuration(90)).toBe("1h 30m");
    expect(formatProgressDuration(750)).toBe("12h 30m");
  });
});

describe("formatProgressMetricValue", () => {
  it("labels count and completion plurals", () => {
    expect(formatProgressMetricValue("count", 1)).toBe("1 count");
    expect(formatProgressMetricValue("count", 18)).toBe("18 counts");
    expect(formatProgressMetricValue("completion", 1)).toBe("1 completion");
    expect(formatProgressMetricValue("completion", 3)).toBe("3 completions");
  });

  it("formats duration without a counts-style label", () => {
    expect(formatProgressMetricValue("duration", 550)).toBe("9h 10m");
  });
});

describe("formatProgressActualGoal", () => {
  it("formats duration actual/goal with hour strings", () => {
    expect(formatProgressActualGoal("duration", 480, 600)).toBe("8h / 10h");
  });

  it("formats count actual/goal compactly", () => {
    expect(formatProgressActualGoal("count", 5, 8)).toBe("5 / 8");
  });

  it("falls back to labeled value when unbounded", () => {
    expect(formatProgressActualGoal("count", 5, null)).toBe("5 counts");
  });
});

describe("formatProgressMetricList", () => {
  it("joins with a middle dot", () => {
    expect(formatProgressMetricList(["18 counts", "9h 10m"])).toBe(
      "18 counts · 9h 10m",
    );
  });
});

describe("formatProgressLegacyLine", () => {
  it("prefixes historical metrics", () => {
    expect(formatProgressLegacyLine("count", 14)).toBe("+ 14 counts");
  });
});
