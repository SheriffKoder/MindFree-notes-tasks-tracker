/**
 * @file features/profile/apply-theme/lib/theme-storage.test.ts
 * Unit tests for theme snapshot helpers.
 */

import { describe, expect, it } from "vitest";

import { resolveBaseThemeClass } from "@/features/profile/apply-theme/lib/theme-storage";

describe("resolveBaseThemeClass", () => {
  it("returns the mode for light and dark", () => {
    expect(resolveBaseThemeClass("light", "dark")).toBe("light");
    expect(resolveBaseThemeClass("dark", "light")).toBe("dark");
  });

  it("uses text contrast under custom mode", () => {
    expect(resolveBaseThemeClass("custom", "light")).toBe("light");
    expect(resolveBaseThemeClass("custom", "dark")).toBe("dark");
  });
});
