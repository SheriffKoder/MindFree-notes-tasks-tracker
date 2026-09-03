/**
 * @file entities/note/category/server.ts
 * Server-side barrel for the note category nest.
 */

export {
  getNoteCategoriesResponse,
  type NoteCategoriesResponse,
} from "@/entities/note/category/queries";
export {
  createNoteCategory,
  updateNoteCategory,
  softDeleteNoteCategory,
  restoreNoteCategory,
  hardDeleteNoteCategory,
} from "@/entities/note/category/mutations";
export { ensureDefaultCategory } from "@/entities/note/category/repository";
export type { NoteCategory } from "@/entities/note/category/model/types";
export {
  DefaultCategoryProtectedError,
  CategoryNameConflictError,
} from "@/entities/note/category/errors";
export {
  createNoteCategoryBodySchema,
  updateNoteCategoryBodySchema,
  type CreateNoteCategoryBody,
  type UpdateNoteCategoryBody,
} from "@/entities/note/category/schema";
