/**
 * @file entities/note/category/schema/update-category.schema.ts
 * Zod schema for partial note category updates.
 */

import { z } from "zod";

export const updateNoteCategoryBodySchema = z
  .object({
    name: z.string().trim().min(1).max(80).optional(),
    showOnHome: z.boolean().optional(),
    sortOrder: z.number().int().optional(),
  })
  .refine((body) => Object.keys(body).length > 0, {
    message: "At least one field is required.",
  });

export type UpdateNoteCategoryBody = z.infer<typeof updateNoteCategoryBodySchema>;
