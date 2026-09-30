import { describe, expect, it } from "vitest";

import { floorToCityLocalHour } from "@/widgets/world-time/lib/floor-to-city-local-hour";
import { getCityLocalHour } from "@/widgets/world-time/lib/get-city-local-hour";

/** 2024-01-15T20:33:45.123Z → 12:33:45 PST in Los Angeles */
const INSTANT = new Date("2024-01-15T20:33:45.123Z");

describe("floorToCityLocalHour", () => {
  it("clears minutes in the locked city zone", () => {
    const floored = floorToCityLocalHour(INSTANT, "America/Los_Angeles");

    expect(getCityLocalHour(floored, "America/Los_Angeles")).toBe(12);
    // Same UTC calendar path: 20:33 → 20:00 UTC when flooring LA's 12:33 → 12:00
    expect(floored.toISOString()).toBe("2024-01-15T20:00:00.000Z");
  });

  it("is a no-op when already on the hour", () => {
    const onTheHour = new Date("2024-01-15T20:00:00.000Z");
    const floored = floorToCityLocalHour(onTheHour, "America/Los_Angeles");

    expect(floored.getTime()).toBe(onTheHour.getTime());
  });
});
