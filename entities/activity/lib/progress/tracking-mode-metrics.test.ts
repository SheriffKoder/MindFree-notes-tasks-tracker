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
