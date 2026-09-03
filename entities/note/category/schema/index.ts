/**
 * @file entities/note/category/schema/index.ts
 * Public schema surface for note category validation.
 */

export {
  createNoteCategoryBodySchema,
  type CreateNoteCategoryBody,
} from "@/entities/note/category/schema/create-category.schema";
export {
  updateNoteCategoryBodySchema,
  type UpdateNoteCategoryBody,
} from "@/entities/note/category/schema/update-category.schema";
