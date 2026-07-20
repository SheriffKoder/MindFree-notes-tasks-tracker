/**
 * @file entities/profile/schema/css-color.ts
 * Shared Zod helper for nullable CSS color preference fields.
 */

import { z } from "zod";

import { isCssColor } from "@/shared/color-picker";

/**
 * Nullable CSS color string. Empty/null allowed; non-empty must pass `isCssColor`.
 */
export const nullableCssColorSchema = z
  .string()
  .trim()
  .max(64, "Color must be 64 characters or fewer.")
  .nullable()
  .refine(
    function validateNullableCssColor(value) {
      return value === null || value === "" || isCssColor(value);
    },
    { message: "Invalid CSS color." },
  )
  .transform(function normalizeEmptyColor(value) {
    return value === "" ? null : value;
  });
