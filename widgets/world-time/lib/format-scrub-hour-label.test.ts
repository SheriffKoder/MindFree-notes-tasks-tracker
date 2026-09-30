import { describe, expect, it } from "vitest";

import {
  formatScrubHourLabel,
  SCRUB_HOUR_LABEL_HOURS,
} from "@/widgets/world-time/lib/format-scrub-hour-label";

describe("formatScrubHourLabel", () => {
  it("formats midnight and noon", () => {
    expect(formatScrubHourLabel(0)).toMatch(/12/i);
    expect(formatScrubHourLabel(12)).toMatch(/12/i);
  });

  it("formats a typical afternoon hour", () => {
    expect(formatScrubHourLabel(15)).toMatch(/3/i);
  });
});

describe("SCRUB_HOUR_LABEL_HOURS", () => {
  it("marks every third hour across the day", () => {
    expect([...SCRUB_HOUR_LABEL_HOURS]).toEqual([0, 3, 6, 9, 12, 15, 18, 21]);
  });
});
