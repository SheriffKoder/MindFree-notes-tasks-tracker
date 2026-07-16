import { describe, expect, it } from "vitest";

import { isCssColor } from "@/shared/color-picker/lib/is-css-color";

describe("isCssColor", () => {
  it("accepts common hex forms", () => {
    expect(isCssColor("#fff")).toBe(true);
    expect(isCssColor("#ffffff")).toBe(true);
    expect(isCssColor("#ffffffff")).toBe(true);
    expect(isCssColor("  #3b82f6  ")).toBe(true);
  });

  it("rejects empty and non-color strings", () => {
    expect(isCssColor("")).toBe(false);
    expect(isCssColor("   ")).toBe(false);
    expect(isCssColor("not-a-color")).toBe(false);
    expect(isCssColor("#gg")).toBe(false);
  });
});
