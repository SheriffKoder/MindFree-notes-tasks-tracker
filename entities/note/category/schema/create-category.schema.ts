/**
 * @file entities/note/category/schema/create-category.schema.ts
 * Zod schema for creating a note category.
 */

import { z } from "zod";

export const createNoteCategoryBodySchema = z.object({
  name: z.string().trim().min(1).max(80),
  showOnHome: z.boolean().optional().default(true),
  sortOrder: z.number().int().optional(),
});

export type CreateNoteCategoryBody = z.infer<typeof createNoteCategoryBodySchema>;
