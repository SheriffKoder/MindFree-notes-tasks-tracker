/**
 * @file entities/profile/schema/update-preferences.schema.ts
 * Zod contracts for PATCH /api/profile/preferences.
 */

import { z } from "zod";

import { nullableCssColorSchema } from "@/entities/profile/schema/css-color";

const themeModeSchema = z.enum(["light", "dark", "custom"]);
const textContrastModeSchema = z.enum(["light", "dark"]);

/**
 * Partial PATCH body for theme + export preferences.
 * Only provided fields are updated.
 */
export const updatePreferencesBodySchema = z
  .object({
    themeMode: themeModeSchema.optional(),
    backgroundColor: nullableCssColorSchema.optional(),
    backgroundImageUrl: z
      .string()
      .trim()
      .max(2048, "Background image URL must be 2,048 characters or fewer.")
      .nullable()
      .optional()
      .transform(function normalizeEmptyUrl(value) {
        if (value === undefined) {
          return undefined;
        }
        return value === "" ? null : value;
      }),
    drawerBackgroundColor: nullableCssColorSchema.optional(),
    drawerBackgroundOpacity: z
      .number()
      .min(0, "Opacity must be between 0 and 1.")
      .max(1, "Opacity must be between 0 and 1.")
      .nullable()
      .optional(),
    textContrastMode: textContrastModeSchema.optional(),
    accentColor: nullableCssColorSchema.optional(),
    exportEmail: z
      .string()
      .trim()
      .email("Export email must be a valid email address.")
      .max(320, "Export email must be 320 characters or fewer.")
      .optional(),
  })
  .refine(
    function hasAtLeastOnePreferenceField(body) {
      return Object.keys(body).length > 0;
    },
    { message: "At least one preference field is required." },
  );

export type UpdatePreferencesBody = z.infer<typeof updatePreferencesBodySchema>;
