/**
 * @file features/activity/activity-calendar-cell/lib/format-pill-progress.test.ts
 * Locks compact calendar pill progress labels.
 */

import { describe, expect, it } from "vitest";

import type { TodayProgressDimension } from "@/entities/activity";
import { formatPillProgress } from "@/features/activity/activity-calendar-cell/lib/format-pill-progress";

function count(
  overrides: Partial<TodayProgressDimension> = {},
): TodayProgressDimension {
  return {
    kind: "count",
    label: "Count",
    value: 0,
    goal: null,
    remaining: null,
    percent: null,
    ...overrides,
  };
}

function duration(
  overrides: Partial<TodayProgressDimension> = {},
): TodayProgressDimension {
  return {
    kind: "duration",
    label: "Minutes",
    value: 0,
    goal: null,
    remaining: null,
    percent: null,
    ...overrides,
  };
}

describe("formatPillProgress", () => {
  it("returns null for a single unbounded count (boolean / goal-less)", () => {
    expect(formatPillProgress([count({ value: 1 })])).toBeNull();
  });

  it("formats bounded count as value/goal", () => {
    expect(formatPillProgress([count({ value: 1, goal: 2, remaining: 1, percent: 50 })])).toBe(
      "1/2",
    );
  });

  it("formats bounded duration with m suffixes", () => {
    expect(
      formatPillProgress([
        duration({ value: 5, goal: 5, remaining: 0, percent: 100 }),
      ]),
    ).toBe("5m/5m");
  });

  it("formats unbounded duration as value with m", () => {
    expect(formatPillProgress([duration({ value: 12 })])).toBe("12m");
  });

  it("joins count+duration dimensions", () => {
    expect(
      formatPillProgress([
        count({ value: 1, goal: 2, remaining: 1, percent: 50 }),
        duration({ value: 5, goal: 5, remaining: 0, percent: 100 }),
      ]),
    ).toBe("1/2 · 5m/5m");
  });
});
