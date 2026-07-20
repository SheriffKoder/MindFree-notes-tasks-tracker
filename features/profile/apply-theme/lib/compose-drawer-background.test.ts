/**
 * @file features/profile/apply-theme/lib/compose-drawer-background.test.ts
 * Unit tests for drawer opacity composition.
 */

import { describe, expect, it } from "vitest";

import { composeDrawerBackground } from "@/features/profile/apply-theme/lib/apply-custom-theme-vars";

describe("composeDrawerBackground", () => {
  it("returns the solid color when opacity is null", () => {
    expect(composeDrawerBackground("#112233", null)).toBe("#112233");
  });

  it("returns the solid color when opacity is 1", () => {
    expect(composeDrawerBackground("#112233", 1)).toBe("#112233");
  });

  it("uses color-mix when opacity is between 0 and 1", () => {
    expect(composeDrawerBackground("#112233", 0.5)).toBe(
      "color-mix(in srgb, #112233 50%, transparent)",
    );
  });
});
