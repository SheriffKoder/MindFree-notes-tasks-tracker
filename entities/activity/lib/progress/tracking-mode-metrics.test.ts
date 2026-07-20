/**
 * @file entities/activity/lib/progress/tracking-mode-metrics.test.ts
 * Unit tests for tracking-mode → Progress metric mapping.
 *
 * Purpose: Verify boolean/count/duration/count+duration map to the expected
 *          `ProgressMetric` families.
 * Used in: Vitest (Step 3 verification).
 * Used for: Regression guard on `tracking-mode-metrics.ts`.
 */

import { describe, expect, it } from "vitest";

import {
  isCurrentMetric,
  metricsForTrackingMode,
} from "@/entities/activity/lib/progress/tracking-mode-metrics";

describe("metricsForTrackingMode", () => {
  it("maps each tracking mode to semantic metrics", () => {
    expect(metricsForTrackingMode("boolean")).toEqual(["completion"]);
    expect(metricsForTrackingMode("count")).toEqual(["count"]);
    expect(metricsForTrackingMode("duration")).toEqual(["duration"]);
    expect(metricsForTrackingMode("count+duration")).toEqual([
      "count",
      "duration",
    ]);
  });
});

describe("isCurrentMetric", () => {
  it("treats completion as current only for boolean", () => {
    expect(isCurrentMetric("boolean", "completion")).toBe(true);
    expect(isCurrentMetric("count", "completion")).toBe(false);
  });
});
