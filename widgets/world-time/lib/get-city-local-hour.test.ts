import { describe, expect, it } from "vitest";

import { getCityLocalHour } from "@/widgets/world-time/lib/get-city-local-hour";

/** Fixed UTC instant: 2024-01-15T20:00:00.000Z */
const INSTANT = new Date("2024-01-15T20:00:00.000Z");

describe("getCityLocalHour", () => {
  it("returns the LA local hour for a known UTC instant", () => {
    // January → PST (UTC-8) → 12:00
    expect(getCityLocalHour(INSTANT, "America/Los_Angeles")).toBe(12);
  });

  it("returns the London local hour for a known UTC instant", () => {
    // January → GMT → 20:00
    expect(getCityLocalHour(INSTANT, "Europe/London")).toBe(20);
  });

  it("returns 0 at midnight in Dubai for a known UTC instant", () => {
    // Dubai is UTC+4 → 00:00 next calendar day
    expect(getCityLocalHour(INSTANT, "Asia/Dubai")).toBe(0);
  });
});
