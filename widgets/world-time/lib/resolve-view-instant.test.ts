import { describe, expect, it } from "vitest";

import { resolveViewInstant } from "@/widgets/world-time/lib/resolve-view-instant";

const REAL_NOW = new Date("2024-01-15T20:15:30.000Z");

describe("resolveViewInstant", () => {
  it("returns the same instant when offset is 0", () => {
    const view = resolveViewInstant(REAL_NOW, 0);
    expect(view.getTime()).toBe(REAL_NOW.getTime());
  });

  it("advances by whole hours for a positive offset", () => {
    const view = resolveViewInstant(REAL_NOW, 3);
    expect(view.toISOString()).toBe("2024-01-15T23:15:30.000Z");
  });

  it("rewinds by whole hours for a negative offset", () => {
    const view = resolveViewInstant(REAL_NOW, -2);
    expect(view.toISOString()).toBe("2024-01-15T18:15:30.000Z");
  });

  it("truncates fractional offsets toward zero", () => {
    const view = resolveViewInstant(REAL_NOW, 2.9);
    expect(view.toISOString()).toBe("2024-01-15T22:15:30.000Z");
  });
});
