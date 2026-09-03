/**
 * @file features/notes/note-category-drawer/lib/map-category-api-error.test.ts
 * Locks manage-drawer error copy for name conflict (409) and Diary protection (403).
 */

import { describe, expect, it } from "vitest";

import { mapCategoryApiError } from "@/features/notes/note-category-drawer/lib/map-category-api-error";

describe("mapCategoryApiError", () => {
  it("maps CATEGORY_NAME_CONFLICT and 409 to the duplicate-name message", () => {
    const coded = Object.assign(new Error("duplicate"), {
      code: "CATEGORY_NAME_CONFLICT",
    });
    const statusOnly = Object.assign(new Error("conflict"), { status: 409 });

    expect(mapCategoryApiError(coded)).toBe(
      "A category with this name already exists",
    );
    expect(mapCategoryApiError(statusOnly)).toBe(
      "A category with this name already exists",
    );
  });

  it("maps DEFAULT_CATEGORY_PROTECTED and 403 to the server or fallback message", () => {
    const coded = Object.assign(
      new Error("The default Diary category cannot be permanently deleted."),
      { code: "DEFAULT_CATEGORY_PROTECTED" },
    );

    expect(mapCategoryApiError(coded)).toBe(
      "The default Diary category cannot be permanently deleted.",
    );
    expect(mapCategoryApiError(Object.assign(new Error("blocked"), { status: 403 }))).toBe(
      "blocked",
    );
  });
});
